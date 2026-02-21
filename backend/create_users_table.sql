-- ==========================================
-- KrushiSetu - Users Table
-- Database: crop_monitoring (PostgreSQL)
-- ==========================================

-- CREATE TABLE
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DROP TABLE (use only if you need to reset)
-- DROP TABLE IF EXISTS users;
