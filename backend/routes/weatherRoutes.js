// ============================================================
// routes/weatherRoutes.js
// Defines the Express router for all weather-related endpoints.
// Wires the URL path to the correct controller method.
// ============================================================

const express = require('express');
const { getWeather } = require('../controllers/weatherController');

const router = express.Router();

/**
 * @route   GET /api/weather
 * @desc    Get current weather + 2-day temperature forecast for a city
 * @access  Public
 *
 * Query Parameters:
 *   city {string} - City name (required)
 *                   e.g. "Anand", "Mumbai", "Delhi"
 *
 * Example Requests:
 *   GET /api/weather?city=Anand
 *   GET /api/weather?city=Mumbai
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "message": "Weather data fetched successfully",
 *   "data": {
 *     "city": "Anand",
 *     "current": {
 *       "temperature": "32°C",
 *       "windSpeed": "4.5 m/s",
 *       "humidity": "78%",
 *       "rainChance": "20%"
 *     },
 *     "forecast": {
 *       "tomorrowTemp": "30°C",
 *       "dayAfterTomorrowTemp": "29°C"
 *     }
 *   }
 * }
 *
 * Error Responses:
 *   400 - Missing or empty city parameter
 *   401 - Invalid OpenWeather API key
 *   404 - City not found
 *   429 - API rate limit exceeded
 *   500 - Internal server error
 */
router.get('/weather', getWeather);

module.exports = router;
