// ============================================================
// controllers/mandiController.js
// Controller layer for Mandi Price endpoints.
// Validates query params, delegates to agmarknetService, returns JSON.
// ============================================================

const { getLatestPrice, getPriceHistory } = require('../services/agmarknetService');

// Valid time ranges for history endpoint
const VALID_RANGES = ['7D', '1M', '6M', '1Y'];

/**
 * Validate required string param (non-empty after trim)
 */
const isValidParam = (val) => typeof val === 'string' && val.trim().length > 0;

/**
 * GET /api/mandi/latest?crop=Rice&state=Maharashtra&mandi=Nagpur
 *
 * Fetches latest mandi price from Agmarknet API.
 * Filters by commodity (crop), state, and market (mandi).
 */
const getLatest = async (req, res) => {
    try {
        const { crop, state, mandi } = req.query;

        if (!isValidParam(crop)) {
            return res.status(400).json({
                success: false,
                error: 'Missing or invalid query parameter: crop',
                example: '/api/mandi/latest?crop=Rice&state=Maharashtra&mandi=Nagpur',
            });
        }
        if (!isValidParam(state)) {
            return res.status(400).json({
                success: false,
                error: 'Missing or invalid query parameter: state',
                example: '/api/mandi/latest?crop=Rice&state=Maharashtra&mandi=Nagpur',
            });
        }
        if (!isValidParam(mandi)) {
            return res.status(400).json({
                success: false,
                error: 'Missing or invalid query parameter: mandi',
                example: '/api/mandi/latest?crop=Rice&state=Maharashtra&mandi=Nagpur',
            });
        }

        const data = await getLatestPrice(crop.trim(), state.trim(), mandi.trim());

        if (!data) {
            return res.status(404).json({
                success: false,
                error: `No price data found for crop="${crop}", state="${state}", mandi="${mandi}"`,
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Latest mandi price fetched successfully',
            data: {
                min_price: data.min_price,
                max_price: data.max_price,
                modal_price: data.modal_price,
                arrival_date: data.arrival_date,
                market: data.market,
                state: data.state,
            },
        });
    } catch (error) {
        console.error('[MandiController] getLatest error:', error.message);

        if (error.response) {
            const status = error.response.status;
            const msg = error.response.data?.message || error.response.statusText;

            if (status === 401) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid API key. Please check API_KEY in backend .env',
                });
            }
            if (status === 429) {
                return res.status(429).json({
                    success: false,
                    error: 'Data.gov.in API rate limit exceeded. Please try again later.',
                });
            }
            return res.status(status).json({
                success: false,
                error: `Agmarknet API error: ${msg}`,
            });
        }

        if (error.message?.includes('API_KEY')) {
            return res.status(500).json({
                success: false,
                error: 'API_KEY is not configured. Add API_KEY to backend .env file.',
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Internal server error while fetching mandi price.',
        });
    }
};

/**
 * GET /api/mandi/history?crop=Rice&state=Maharashtra&mandi=Nagpur&range=1M
 *
 * Fetches price history for graph.
 * Supports range: 7D, 1M, 6M, 1Y
 */
const getHistory = async (req, res) => {
    try {
        const { crop, state, mandi, range } = req.query;

        if (!isValidParam(crop)) {
            return res.status(400).json({
                success: false,
                error: 'Missing or invalid query parameter: crop',
                example: '/api/mandi/history?crop=Rice&state=Maharashtra&mandi=Nagpur&range=1M',
            });
        }
        if (!isValidParam(state)) {
            return res.status(400).json({
                success: false,
                error: 'Missing or invalid query parameter: state',
                example: '/api/mandi/history?crop=Rice&state=Maharashtra&mandi=Nagpur&range=1M',
            });
        }
        if (!isValidParam(mandi)) {
            return res.status(400).json({
                success: false,
                error: 'Missing or invalid query parameter: mandi',
                example: '/api/mandi/history?crop=Rice&state=Maharashtra&mandi=Nagpur&range=1M',
            });
        }

        const rangeParam = (range && String(range).trim()) || '1M';
        if (!VALID_RANGES.includes(rangeParam.toUpperCase())) {
            return res.status(400).json({
                success: false,
                error: `Invalid range. Must be one of: ${VALID_RANGES.join(', ')}`,
                example: '/api/mandi/history?crop=Rice&state=Maharashtra&mandi=Nagpur&range=1M',
            });
        }

        const data = await getPriceHistory(
            crop.trim(),
            state.trim(),
            mandi.trim(),
            rangeParam.toUpperCase()
        );

        if (!data?.history || data.history.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'No data available',
            });
        }

        // Frontend-ready format (sorted asc, duplicate dates removed in service)
        return res.status(200).json({
            success: true,
            history: data.history,
            highest_price: data.highest_price,
            lowest_price: data.lowest_price,
            trend: data.trend,
        });
    } catch (error) {
        console.error('[MandiController] getHistory error:', error.message);

        if (error.response) {
            const status = error.response.status;
            const msg = error.response.data?.message || error.response.statusText;

            if (status === 401) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid API key. Please check API_KEY in backend .env',
                });
            }
            if (status === 429) {
                return res.status(429).json({
                    success: false,
                    error: 'Data.gov.in API rate limit exceeded. Please try again later.',
                });
            }
            return res.status(status).json({
                success: false,
                error: `Agmarknet API error: ${msg}`,
            });
        }

        if (error.message?.includes('API_KEY')) {
            return res.status(500).json({
                success: false,
                error: 'API_KEY is not configured. Add API_KEY to backend .env file.',
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Internal server error while fetching price history.',
        });
    }
};

module.exports = { getLatest, getHistory };
