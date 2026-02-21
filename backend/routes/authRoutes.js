const express = require('express');
const router = express.Router();
const { signup, login, getDashboard } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/dashboard', authMiddleware, getDashboard);

module.exports = router;
