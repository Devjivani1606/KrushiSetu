// ============================================================
// routes/mandiRoutes.js
// Mandi Price API - Latest price & Price history for graphs.
// Rate limited, validated, API key used only in backend.
// ============================================================

const express = require('express');
const { getLatest, getHistory } = require('../controllers/mandiController');

const router = express.Router();

// Simple in-memory rate limiter (no extra dependency)
// 60 requests per minute per IP for mandi endpoints
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 60;

const rateLimitMiddleware = (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    let bucket = rateLimitMap.get(ip);

    if (!bucket) {
        bucket = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
        rateLimitMap.set(ip, bucket);
    }
    if (now > bucket.resetAt) {
        bucket.count = 0;
        bucket.resetAt = now + RATE_LIMIT_WINDOW_MS;
    }
    bucket.count += 1;

    if (bucket.count > RATE_LIMIT_MAX) {
        return res.status(429).json({
            success: false,
            error: 'Too many requests. Please try again later.',
        });
    }
    next();
};

router.use(rateLimitMiddleware);

/**
 * @route   GET /api/mandi/latest
 * @desc    Get latest mandi price for crop, state, mandi
 * @access  Public
 *
 * Query Parameters:
 *   crop   {string} - Commodity name (required) e.g. "Rice", "Wheat"
 *   state  {string} - State name (required) e.g. "Maharashtra"
 *   mandi  {string} - Market/Mandi name (required) e.g. "Nagpur"
 *
 * Example: GET /api/mandi/latest?crop=Rice&state=Maharashtra&mandi=Nagpur
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "message": "Latest mandi price fetched successfully",
 *   "data": {
 *     "min_price": 4100,
 *     "max_price": 4850,
 *     "modal_price": 4450,
 *     "arrival_date": "2026-02-28",
 *     "market": "Nagpur",
 *     "state": "Maharashtra"
 *   }
 * }
 */
router.get('/mandi/latest', getLatest);

/**
 * @route   GET /api/mandi/history
 * @desc    Get price history for graph (crop, state, mandi, range)
 * @access  Public
 *
 * Query Parameters:
 *   crop   {string} - Commodity name (required)
 *   state  {string} - State name (required)
 *   mandi  {string} - Market/Mandi name (required)
 *   range  {string} - Time range: 7D | 1M | 6M | 1Y (default: 1M)
 *
 * Example: GET /api/mandi/history?crop=Rice&state=Maharashtra&mandi=Nagpur&range=1M
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "message": "Price history fetched successfully",
 *   "data": {
 *     "crop": "Rice",
 *     "mandi": "Nagpur",
 *     "trend": "+4.2%",
 *     "highest_price": 4850,
 *     "lowest_price": 4100,
 *     "history": [
 *       { "date": "2026-01-01", "modal_price": 4200 },
 *       { "date": "2026-01-10", "modal_price": 4300 }
 *     ]
 *   }
 * }
 */
router.get('/mandi/history', getHistory);

module.exports = router;
