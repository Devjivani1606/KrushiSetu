// ============================================================
//  weatherRoutes.js
//  Defines the Express router for weather-related endpoints.
//  Mounted at /api in server.js, so the full path is:
//    GET /api/weather?city=Anand
// ============================================================

const express = require('express');
const router = express.Router();

const { getWeatherByCity } = require('../controllers/weatherController');

// GET /api/weather?city=Anand
// Fetches current weather + 2-day forecast for the specified city
router.get('/weather', getWeatherByCity);

module.exports = router;
