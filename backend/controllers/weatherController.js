// ============================================================
//  weatherController.js
//  Handles incoming HTTP requests for the weather endpoint.
//  Validates input, calls the weather service, and sends
//  a clean JSON response back to the React Native frontend.
// ============================================================

const { getWeather } = require('../services/weatherService');

/**
 * GET /api/weather?city=Anand
 *
 * Query Parameters:
 *   city (required) - Name of the city to fetch weather for
 *
 * Response (200 OK):
 * {
 *   success: true,
 *   city: "Anand",
 *   country: "IN",
 *   current: {
 *     temperature: 32,
 *     feelsLike: 35,
 *     humidity: 65,
 *     windSpeed: 12,
 *     rainChance: 10,
 *     condition: "Clear",
 *     description: "clear sky"
 *   },
 *   forecast: {
 *     tomorrowMax: 33,
 *     tomorrowMin: 22,
 *     dayAfterMax: 28,
 *     dayAfterMin: 20
 *   }
 * }
 */
const getWeatherByCity = async (req, res) => {
    try {
        // ── Step 1: Read and validate the `city` query parameter ────────────
        const { city } = req.query;

        if (!city || city.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Missing required query parameter: city',
                hint: 'Usage: GET /api/weather?city=Anand',
            });
        }

        const cityName = city.trim();
        console.log(`[WeatherController] Fetching weather for city: "${cityName}"`);

        // ── Step 2: Call the weather service layer ──────────────────────────
        const weatherData = await getWeather(cityName);

        // ── Step 3: Send structured success response to frontend ────────────
        return res.status(200).json({
            success: true,
            ...weatherData,
        });

    } catch (err) {
        console.error(`[WeatherController] Error: ${err.message}`);

        // ── Handle city-not-found error (thrown from service) ───────────────
        if (err.status === 404) {
            return res.status(404).json({
                success: false,
                error: err.message,
            });
        }

        // ── Handle missing API key ───────────────────────────────────────────
        if (err.message.includes('WEATHER_API_KEY')) {
            return res.status(500).json({
                success: false,
                error: 'Weather API key is not configured. Add WEATHER_API_KEY to .env file.',
            });
        }

        // ── Generic server / external API failure ───────────────────────────
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch weather data. Please try again later.',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        });
    }
};

module.exports = { getWeatherByCity };
