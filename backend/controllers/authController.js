const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { isValidFullName, isValidEmail, isValidPassword } = require('../utils/validators');

// Helper: Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, full_name: user.full_name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// ==========================================
// POST /api/auth/signup
// ==========================================
const signup = async (req, res) => {
    try {
        const { full_name, email, password, confirm_password } = req.body;

        // 1. Validate all fields are present
        if (!full_name || !email || !password || !confirm_password) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required: full_name, email, password, confirm_password',
            });
        }

        // 2. Validate full_name (letters and spaces only, min 3 chars)
        if (!isValidFullName(full_name)) {
            return res.status(400).json({
                success: false,
                error: 'Full name must be at least 3 characters and contain only letters and spaces (no numbers or special characters)',
            });
        }

        // 3. Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid email address (e.g., example@gmail.com)',
            });
        }

        // 4. Validate password strength
        if (!isValidPassword(password)) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters and contain at least one letter and one special character (e.g., pass@123)',
            });
        }

        // 5. Validate password match
        if (password !== confirm_password) {
            return res.status(400).json({
                success: false,
                error: 'Passwords do not match',
            });
        }

        // 6. Check if email already exists in database
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase().trim()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'User already exists with this email',
            });
        }

        // 7. Hash the password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 8. Insert new user into PostgreSQL database
        const result = await pool.query(
            `INSERT INTO users (full_name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, email, created_at`,
            [full_name.trim(), email.toLowerCase().trim(), hashedPassword]
        );

        const newUser = result.rows[0];

        // 9. Generate JWT token
        const token = generateToken(newUser);

        // 10. Return success (NEVER return hashed password)
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: {
                id: newUser.id,
                full_name: newUser.full_name,
                email: newUser.email,
                created_at: newUser.created_at,
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during signup',
        });
    }
};

// ==========================================
// POST /api/auth/login
// ==========================================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate fields are present
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required',
            });
        }

        // 2. Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid email address',
            });
        }

        // 3. Check if email exists in database
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email.toLowerCase().trim()]
        );

        if (result.rows.length === 0) {
            // User NOT found in database → not registered
            return res.status(404).json({
                success: false,
                error: 'User not registered. Please sign up first.',
            });
        }

        const user = result.rows[0];

        // 4. Compare password using bcrypt.compare
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            // Password does NOT match
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials. Password is incorrect.',
            });
        }

        // 5. Generate JWT token
        const token = generateToken(user);

        // 6. Return success (NEVER return hashed password)
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                created_at: user.created_at,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during login',
        });
    }
};

// ==========================================
// GET /api/auth/dashboard (Protected)
// ==========================================
const getDashboard = async (req, res) => {
    try {
        // req.user is set by authMiddleware after JWT verification
        const result = await pool.query(
            'SELECT id, full_name, email, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        const user = result.rows[0];

        res.status(200).json({
            success: true,
            message: 'Welcome to the dashboard',
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                created_at: user.created_at,
            },
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

module.exports = { signup, login, getDashboard };
