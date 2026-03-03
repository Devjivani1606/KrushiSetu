// ============================================================
// config/index.js
// Centralized configuration file.
// Loads environment variables from .env using dotenv.
// All sensitive keys (like the OpenWeather API key) are read
// from process.env — they are NEVER hardcoded here.
// ============================================================

require('dotenv').config();

const config = {
    // ── Server ────────────────────────────────────────────────
    // Server port (defaults to 5000 if not set in .env)
    port: process.env.PORT || 5000,

    // ── OpenWeather API ───────────────────────────────────────
    // API key — loaded securely from .env file.
    // Set OPENWEATHER_API_KEY=your_api_key_here in your .env file.
    openWeatherApiKey: process.env.OPENWEATHER_API_KEY,

    // Current weather endpoint (returns real-time data for a city)
    openWeatherCurrentUrl: 'https://api.openweathermap.org/data/2.5/weather',

    // 5-day / 3-hour forecast endpoint (returns forecast list)
    openWeatherForecastUrl: 'https://api.openweathermap.org/data/2.5/forecast',

    // Units: 'metric' → temperature in °C, wind speed in m/s
    openWeatherUnits: 'metric',

    // ── Data.gov.in (Agmarknet) API ───────────────────────────
    // API key for mandi price data — set API_KEY=your_key in .env
    dataGovApiKey: process.env.API_KEY,

    // Use api.data.gov.in format (user format). Default uses data.gov.in India OGD.
    useApiDataGov: process.env.USE_API_DATA_GOV === 'true',
};

// Guard: warn loudly at startup if the API key is missing
if (!config.openWeatherApiKey) {
    console.warn(
        '⚠️  WARNING: OPENWEATHER_API_KEY is not set in .env. ' +
        'Weather API calls will fail until this is configured.'
    );
}
if (!config.dataGovApiKey) {
    console.warn(
        '⚠️  WARNING: API_KEY is not set in .env. ' +
        'Mandi price API calls will fail until this is configured.'
    );
}

module.exports = config;
