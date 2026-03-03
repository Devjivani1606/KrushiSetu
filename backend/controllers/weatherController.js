// ============================================================
// controllers/weatherController.js
// Controller layer — receives the HTTP request, validates the
// [city] query parameter, delegates to the service, and sends
// back a clean JSON response (or a meaningful error message).
// ============================================================

const { getWeatherByCity } = require('../services/weatherService');

/**
 * GET /api/weather?city=Anand
 *
 * Main controller for the weather endpoint.
 * Validates the `city` query parameter, calls the service layer,
 * and returns a structured JSON response to the client.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getWeather = async (req, res) => {
    try {
        // -------------------------------------------------------
        // STEP 1: Extract and validate the `city` query parameter
        // Example URL: GET /api/weather?city=Anand
        // -------------------------------------------------------
        const { city } = req.query;

        // city is required — return 400 if missing
        if (!city) {
            return res.status(400).json({
                success: false,
                error: 'Missing required query parameter: city',
                example: '/api/weather?city=Anand',
            });
        }

        // Trim whitespace and check it's not an empty string
        const trimmedCity = city.trim();
        if (trimmedCity.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'City name cannot be empty',
                example: '/api/weather?city=Anand',
            });
        }

        // -------------------------------------------------------
        // STEP 2: Call the weather service with the city name.
        // The service handles all external API communication.
        // -------------------------------------------------------
        const weatherData = await getWeatherByCity(trimmedCity);

        // -------------------------------------------------------
        // STEP 3: Send a clean, structured JSON response (200 OK)
        // -------------------------------------------------------
        return res.status(200).json({
            success: true,
            message: 'Weather data fetched successfully',
            data: weatherData,
        });

    } catch (error) {
        // -------------------------------------------------------
        // Error Handling — Differentiate between API errors and
        // network/server errors for meaningful client messages.
        // -------------------------------------------------------
        console.error('[WeatherController] Error:', error.message);

        // error.response exists when OpenWeatherMap returned an HTTP error
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || 'OpenWeatherMap API error';

            // 401 → Bad API key
            if (status === 401) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid OpenWeather API key. Please check OPENWEATHER_API_KEY in .env',
                });
            }

            // 404 → City not found (OpenWeatherMap returns 404 for unknown cities)
            if (status === 404) {
                return res.status(404).json({
                    success: false,
                    error: `City not found: "${req.query.city}". Please check the city name and try again.`,
                });
            }

            // 429 → Rate limit exceeded
            if (status === 429) {
                return res.status(429).json({
                    success: false,
                    error: 'API rate limit exceeded. Please wait a moment and try again.',
                });
            }

            // Any other API error — pass through the status and message
            return res.status(status).json({
                success: false,
                error: `OpenWeatherMap API error: ${message}`,
            });
        }

        // Network error or unexpected server crash
        return res.status(500).json({
            success: false,
            error: 'Internal server error while fetching weather data. Please try again.',
        });
    }
};

module.exports = { getWeather };
