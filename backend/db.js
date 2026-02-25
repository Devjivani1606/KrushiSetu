const { Pool } = require('pg');
require('dotenv').config();

// Validate that DATABASE_URL is set before attempting connection
if (!process.env.DATABASE_URL) {
  console.error('❌ FATAL: DATABASE_URL is not defined. Check your .env file.');
  process.exit(1);
}

console.log('🔗 Connecting to database...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon cloud PostgreSQL
  },
});

// ==========================================
const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table is ready');
  } catch (error) {
    console.error('❌ Error creating users table:', error.message);
  }
};

pool.connect()
  .then((client) => {
    console.log('✅ Database connected successfully');
    client.release(); // Always release the client back to the pool
    initializeDatabase();
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message);
  });

module.exports = pool;