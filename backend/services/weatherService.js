// ============================================================
// services/weatherService.js
// Service layer — responsible for making calls to the external
// OpenWeatherMap API and transforming the raw response into
// clean, structured data ready for the controller.
//
// Strategy: Two parallel API calls using Promise.all()
//   1. Current Weather API  → real-time temp, wind, humidity
//   2. Forecast API (5-day) → rain probability + next 2 day temps
// ============================================================

const axios = require('axios');
const config = require('../config'); // Loads from backend/config/index.js

/**
 * Fetches current weather + 5-day forecast for a given city.
 *
 * Makes two simultaneous requests to OpenWeatherMap:
 *  - /weather  → current conditions
 *  - /forecast → 3-hour forecast list (up to 5 days)
 *
 * @param {string} city - City name (e.g. "Anand", "Mumbai")
 * @returns {Promise<Object>} - Clean structured weather object
 */
const getWeatherByCity = async (city) => {

    // -------------------------------------------------------
    // STEP 1: Define shared axios params (reused in both calls)
    // API key is read from config (sourced from .env) — never hardcoded.
    // -------------------------------------------------------
    const commonParams = {
        q: city,                             // City name query
        appid: config.openWeatherApiKey,     // API key from .env
        units: config.openWeatherUnits,      // 'metric' → °C and m/s
    };

    // -------------------------------------------------------
    // STEP 2: Fire both API calls simultaneously with Promise.all()
    // This is faster than two sequential awaits.
    // -------------------------------------------------------
    const [currentRes, forecastRes] = await Promise.all([
        // Call 1: Current real-time weather
        axios.get(config.openWeatherCurrentUrl, { params: commonParams }),

        // Call 2: 5-day / 3-hour forecast list
        axios.get(config.openWeatherForecastUrl, {
            params: { ...commonParams, cnt: 40 }, // cnt=40 → max entries (5 days)
        }),
    ]);

    // -------------------------------------------------------
    // STEP 3: Extract current weather fields from Call 1
    // -------------------------------------------------------
    const current = currentRes.data;

    const currentTemp = Math.round(current.main.temp);          // e.g. 32
    const windSpeed = current.wind.speed;                      // e.g. 4.5 (m/s)
    const humidity = current.main.humidity;                   // e.g. 78 (%)

    // -------------------------------------------------------
    // STEP 4: Extract rain probability from Call 2 (forecast list)
    //
    // `pop` = Probability Of Precipitation (0.0 – 1.0)
    // We take the MAXIMUM pop across the next 8 entries (~24 hrs)
    // to represent today's rain chance.
    // -------------------------------------------------------
    const forecastList = forecastRes.data.list; // Array of 3-hr interval entries

    // Grab up to 8 entries (covers ~24 hrs from now)
    const next24hrs = forecastList.slice(0, 8);

    // Find the highest rain probability across those entries
    const maxPop = Math.max(...next24hrs.map((entry) => entry.pop || 0));

    // Convert 0–1 float to readable percentage string
    const rainChance = `${Math.round(maxPop * 100)}%`;

    // -------------------------------------------------------
    // STEP 5: Extract tomorrow's and day-after-tomorrow's temperature
    //
    // Group forecast entries by calendar date (YYYY-MM-DD)
    // so we can pick one representative temperature per day.
    // -------------------------------------------------------
    const groupedByDate = {};

    forecastList.forEach((entry) => {
        // entry.dt_txt format: "2024-03-20 12:00:00"
        const date = entry.dt_txt.split(' ')[0]; // "YYYY-MM-DD"
        if (!groupedByDate[date]) groupedByDate[date] = [];
        groupedByDate[date].push(entry);
    });

    // Sort dates chronologically
    const sortedDates = Object.keys(groupedByDate).sort();

    /**
     * Helper: pick the midday (12:00) entry for a date,
     * or fall back to the first entry of that day.
     * Midday gives the most representative daytime temperature.
     */
    const pickTemp = (dateStr) => {
        if (!dateStr || !groupedByDate[dateStr]) return null;
        const entries = groupedByDate[dateStr];
        const midday = entries.find((e) => e.dt_txt.includes('12:00:00'));
        const entry = midday || entries[0];
        return `${Math.round(entry.main.temp)}°C`;
    };

    // sortedDates[0] = today (or partial today), [1] = tomorrow, [2] = day after
    const tomorrowTemp = pickTemp(sortedDates[1]);
    const dayAfterTomorrowTemp = pickTemp(sortedDates[2]);

    // -------------------------------------------------------
    // STEP 6: Build and return the clean structured response.
    // The shape matches exactly what the frontend expects.
    // -------------------------------------------------------
    return {
        city: current.name,              // Confirmed city name from API (e.g. "Anand")

        current: {
            temperature: `${currentTemp}°C`,  // e.g. "32°C"
            windSpeed: `${windSpeed} m/s`,  // e.g. "4.5 m/s"
            humidity: `${humidity}%`,       // e.g. "78%"
            rainChance,                        // e.g. "20%"
        },

        forecast: {
            tomorrowTemp,                     // e.g. "30°C"
            dayAfterTomorrowTemp,             // e.g. "29°C"
        },
    };
};

module.exports = { getWeatherByCity };

