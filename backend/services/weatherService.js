// ============================================================
//  weatherService.js
//  Responsible for calling the OpenWeatherMap API and
//  returning a clean, structured weather data object.
// ============================================================

const axios = require('axios');

// Base URL for OpenWeatherMap API v2.5
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Fetches current weather + 3-day forecast for a given city name.
 *
 * @param {string} city  - City name provided by the user (e.g. "Anand")
 * @returns {Object}     - Structured weather response
 * @throws {Error}       - Throws with a descriptive message if the API call fails
 */
const getWeather = async (city) => {
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
        throw new Error('WEATHER_API_KEY is not set in the .env file');
    }

    try {
        // ── Step 1: Fetch CURRENT weather data ─────────────────────────────
        // Endpoint: GET /weather?q={city}&appid={apiKey}&units=metric
        // units=metric returns temperature in °C, wind speed in m/s
        const currentResponse = await axios.get(`${BASE_URL}/weather`, {
            params: {
                q: city,
                appid: apiKey,
                units: 'metric', // Celsius
            },
        });

        const current = currentResponse.data;

        // ── Step 2: Fetch 5-day FORECAST data (3-hour intervals) ────────────
        // Endpoint: GET /forecast?q={city}&appid={apiKey}&units=metric&cnt=16
        // cnt=16 → gives us ~48 hours of data (enough for today+2 days)
        const forecastResponse = await axios.get(`${BASE_URL}/forecast`, {
            params: {
                q: city,
                appid: apiKey,
                units: 'metric',
                cnt: 16, // 16 × 3hr = 48hr window
            },
        });

        const forecastList = forecastResponse.data.list;

        // ── Step 3: Extract tomorrow's temperature ──────────────────────────
        // Get current date and advance by 1 day
        const now = new Date();
        const tomorrowDate = new Date(now);
        tomorrowDate.setDate(now.getDate() + 1);
        const tomorrowStr = tomorrowDate.toISOString().split('T')[0]; // "YYYY-MM-DD"

        const dayAfterDate = new Date(now);
        dayAfterDate.setDate(now.getDate() + 2);
        const dayAfterStr = dayAfterDate.toISOString().split('T')[0];

        // Filter forecast entries that belong to tomorrow
        const tomorrowEntries = forecastList.filter((entry) =>
            entry.dt_txt.startsWith(tomorrowStr)
        );

        // Filter forecast entries for the day after tomorrow
        const dayAfterEntries = forecastList.filter((entry) =>
            entry.dt_txt.startsWith(dayAfterStr)
        );

        // Helper: compute max & min temp from a set of forecast entries
        const getMaxMin = (entries) => {
            if (!entries.length) return { max: null, min: null };
            const temps = entries.map((e) => e.main.temp);
            return {
                max: Math.round(Math.max(...temps)),
                min: Math.round(Math.min(...temps)),
            };
        };

        const tomorrowTemps = getMaxMin(tomorrowEntries);
        const dayAfterTemps = getMaxMin(dayAfterEntries);

        // ── Step 4: Extract rain probability ───────────────────────────────
        // OpenWeatherMap "pop" (probability of precipitation) in the forecast list,
        // ranging from 0.0 to 1.0. We use the first entry's pop for current day.
        const rainChance =
            forecastList.length > 0
                ? Math.round(forecastList[0].pop * 100) // convert 0.0-1.0 → 0-100%
                : 0;

        // ── Step 5: Build and return the clean response object ─────────────
        return {
            city: current.name,          // Official city name from API
            country: current.sys.country, // e.g. "IN"
            current: {
                temperature: Math.round(current.main.temp),         // °C
                feelsLike: Math.round(current.main.feels_like),     // °C
                humidity: current.main.humidity,                    // %
                windSpeed: Math.round(current.wind.speed * 3.6),   // Convert m/s → km/h
                rainChance,                                         // %
                condition: current.weather[0].main,                 // e.g. "Clear", "Rain"
                description: current.weather[0].description,        // e.g. "clear sky"
            },
            forecast: {
                tomorrowMax: tomorrowTemps.max,
                tomorrowMin: tomorrowTemps.min,
                dayAfterMax: dayAfterTemps.max,
                dayAfterMin: dayAfterTemps.min,
            },
        };
    } catch (err) {
        // OpenWeatherMap returns 404 when the city is not found
        if (err.response && err.response.status === 404) {
            const notFound = new Error(`City "${city}" not found. Please check the city name.`);
            notFound.status = 404;
            throw notFound;
        }

        // Re-throw any other error (network issues, invalid API key, etc.)
        throw err;
    }
};

module.exports = { getWeather };
