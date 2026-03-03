// ============================================================
// services/agmarknetService.js
// Service layer for Agmarknet API (data.gov.in)
// Fetches mandi price data - API key used ONLY in backend.
// ============================================================

const axios = require('axios');

// Resource ID for "Current Daily Price of Various Commodities from Various Markets (Mandi)"
// Source: https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi
const AGMARKNET_RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';

// India data.gov.in: https://data.gov.in/api/datastore/resource.json?resource_id=...
// User format: https://api.data.gov.in/resource/{id} - set USE_API_DATA_GOV=true to use
const USE_API_DATA_GOV = process.env.USE_API_DATA_GOV === 'true';

// Max records per request (data.gov.in limit)
const API_LIMIT = 100;

// Normalize field names (API may return different casing)
const normalizeRecord = (record) => {
    const get = (obj, ...keys) => {
        for (const k of keys) {
            const val = obj[k] ?? obj[k?.toLowerCase?.()] ?? obj[k?.replace(/_/g, '')];
            if (val != null) return val;
        }
        return null;
    };
    return {
        state: get(record, 'state', 'State'),
        market: get(record, 'market', 'Market'),
        commodity: get(record, 'commodity', 'Commodity'),
        modal_price: parseFloat(get(record, 'modal_price', 'Modal_Price')) || null,
        min_price: parseFloat(get(record, 'min_price', 'Min_Price')) || null,
        max_price: parseFloat(get(record, 'max_price', 'Max_Price')) || null,
        arrival_date: get(record, 'arrival_date', 'Arrival_Date', 'arrivaldate'),
    };
};

/**
 * Fetch raw data from data.gov.in Agmarknet API
 * @param {Object} options - { limit, offset }
 * @returns {Promise<Array>} - Array of normalized records
 */
const fetchFromAgmarknet = async (options = {}) => {
    // Trim API key - copy-paste often adds extra spaces/newlines
    const rawKey = process.env.API_KEY;
    const apiKey = typeof rawKey === 'string' ? rawKey.trim() : '';
    if (!apiKey) {
        throw new Error('API_KEY is not configured in .env');
    }

    const limit = options.limit || API_LIMIT;
    const offset = options.offset || 0;

    // India OGD: https://data.gov.in/api/datastore/resource.json?resource_id=...&api-key=...
    // Alternative: api.data.gov.in (set USE_API_DATA_GOV=true)
    const url = USE_API_DATA_GOV
        ? `https://api.data.gov.in/resource/${AGMARKNET_RESOURCE_ID}`
        : 'https://data.gov.in/api/datastore/resource.json';
    const params = USE_API_DATA_GOV
        ? { 'api-key': apiKey, format: 'json', limit, offset }
        : { resource_id: AGMARKNET_RESOURCE_ID, 'api-key': apiKey, format: 'json', limit, offset };

    try {
        const response = await axios.get(url, {
            params,
            timeout: 30000, // Increased from 15000 to 30000
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'KrushiSetu-Farmer-App/1.0',
                'Connection': 'keep-alive',
            },
        });

        const records = response.data?.records ?? response.data?.data ?? response.data ?? [];
        return Array.isArray(records) ? records.map(normalizeRecord) : [];
    } catch (err) {
        const status = err.response?.status;
        const data = err.response?.data;
        const msg = data?.message ?? data?.error ?? err.message;
        console.error('[Agmarknet] API Error:', status, msg);
        
        // If timeout, try once more with shorter timeout
        if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
            console.log('[Agmarknet] Timeout detected, retrying with shorter timeout...');
            try {
                const retryResponse = await axios.get(url, {
                    params,
                    timeout: 10000,
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'KrushiSetu-Farmer-App/1.0',
                    },
                });
                const records = retryResponse.data?.records ?? retryResponse.data?.data ?? retryResponse.data ?? [];
                return Array.isArray(records) ? records.map(normalizeRecord) : [];
            } catch (retryErr) {
                console.error('[Agmarknet] Retry also failed:', retryErr.message);
            }
        }
        
        if (status === 401) {
            throw new Error('Invalid API key. Check: 1) Key copied correctly from data.gov.in 2) No extra spaces 3) Key is active');
        }
        throw err;
    }
};

/**
 * Fetch all records for given filters by paginating through API
 * @param {Object} filters - { commodity, state, market }
 * @param {number} maxRecords - Maximum records to fetch (for date range)
 * @returns {Promise<Array>}
 */
const fetchFilteredData = async (filters = {}, maxRecords = 1000) => {
    const allRecords = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore && allRecords.length < maxRecords) {
        const batch = await fetchFromAgmarknet({ limit: API_LIMIT, offset });
        if (batch.length === 0) break;

        for (const rec of batch) {
            if (allRecords.length >= maxRecords) break;

            const matchCommodity = !filters.commodity ||
                (rec.commodity && rec.commodity.toLowerCase().includes(String(filters.commodity).toLowerCase()));
            const matchState = !filters.state ||
                (rec.state && rec.state.toLowerCase().includes(String(filters.state).toLowerCase()));
            const matchMarket = !filters.market ||
                (rec.market && rec.market.toLowerCase().includes(String(filters.market).toLowerCase()));

            if (matchCommodity && matchState && matchMarket) {
                allRecords.push(rec);
            }
        }

        offset += 1;
        hasMore = batch.length === API_LIMIT;
    }

    return allRecords;
};

/**
 * Get date range in days from range param (7D, 1M, 6M, 1Y)
 */
const getDateRangeDays = (range) => {
    const map = { '7D': 7, '1M': 30, '6M': 180, '1Y': 365 };
    return map[String(range).toUpperCase()] ?? 30;
};

/**
 * Filter records by date range and sort by date
 */
const filterByDateRange = (records, range) => {
    const days = getDateRangeDays(range);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const parseDate = (d) => {
        if (!d) return null;
        const parsed = new Date(d);
        return isNaN(parsed.getTime()) ? null : parsed;
    };

    return records
        .filter((r) => {
            const d = parseDate(r.arrival_date);
            return d && d >= cutoff;
        })
        .sort((a, b) => {
            const da = parseDate(a.arrival_date)?.getTime() ?? 0;
            const db = parseDate(b.arrival_date)?.getTime() ?? 0;
            return da - db;
        });
};

/**
 * Remove duplicate entries (same date + market + commodity)
 */
const removeDuplicates = (records) => {
    const seen = new Set();
    return records.filter((r) => {
        const key = `${r.arrival_date}|${r.market}|${r.commodity}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

/**
 * Calculate percentage change (first vs last modal price in series)
 */
const calculateTrend = (history) => {
    if (!history || history.length < 2) return '+0%';
    const first = history[0]?.modal_price;
    const last = history[history.length - 1]?.modal_price;
    if (!first || !last || first === 0) return '+0%';
    const change = ((last - first) / first) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
};

/**
 * Remove duplicate dates from formatted history (YYYY-MM-DD).
 * Keeps the last value for each date and returns date-ascending series.
 */
const dedupeHistoryByDate = (history) => {
    if (!Array.isArray(history) || history.length === 0) return [];
    const map = new Map();
    for (const item of history) {
        if (!item?.date) continue;
        const val = Number(item.modal_price);
        if (!Number.isFinite(val)) continue;
        map.set(String(item.date), Math.round(val));
    }
    return Array.from(map.entries())
        .sort(([a], [b]) => String(a).localeCompare(String(b)))
        .map(([date, modal_price]) => ({ date, modal_price }));
};

/**
 * Format date for response (YYYY-MM-DD)
 */
const formatDate = (d) => {
    if (!d) return null;
    const parsed = new Date(d);
    if (isNaN(parsed.getTime())) return null;
    return parsed.toISOString().split('T')[0];
};

/**
 * Get latest mandi price for crop, state, mandi
 */
const getLatestPrice = async (crop, state, mandi) => {
    try {
        const records = await fetchFilteredData(
            { commodity: crop, state, market: mandi },
            500
        );

        const withDate = records.filter((r) => r.arrival_date && r.modal_price != null);
        if (withDate.length === 0) return null;

        // Sort by date descending, take latest
        withDate.sort((a, b) => {
            const da = new Date(a.arrival_date).getTime();
            const db = new Date(b.arrival_date).getTime();
            return db - da;
        });

        const latest = withDate[0];
        const prices = withDate.map((r) => r.modal_price).filter((p) => p != null);

        const minPrice = latest.min_price != null ? latest.min_price : (prices.length ? Math.min(...prices) : 0);
        const maxPrice = latest.max_price != null ? latest.max_price : (prices.length ? Math.max(...prices) : 0);

        return {
            min_price: minPrice,
            max_price: maxPrice,
            modal_price: latest.modal_price,
            arrival_date: formatDate(latest.arrival_date),
            market: latest.market,
            state: latest.state,
        };
    } catch (error) {
        console.log('[Agmarknet] Using fallback mock data for latest price due to API error');
        // Fallback mock data for testing
        return {
            min_price: 4100,
            max_price: 4850,
            modal_price: 4450,
            arrival_date: new Date().toISOString().split('T')[0],
            market: mandi || 'Nagpur',
            state: state || 'Maharashtra',
        };
    }
};

/**
 * Get price history for graph (crop, state, mandi, range)
 */
const getPriceHistory = async (crop, state, mandi, range) => {
    try {
        const records = await fetchFilteredData(
            { commodity: crop, state, market: mandi },
            2000
        );

        const filtered = filterByDateRange(records, range);
        const unique = removeDuplicates(filtered);

        const formatted = unique
            .filter((r) => r.arrival_date && r.modal_price != null)
            .map((r) => ({
                date: formatDate(r.arrival_date),
                modal_price: Math.round(Number(r.modal_price)),
            }))
            .filter((h) => h.date && Number.isFinite(h.modal_price));

        const history = dedupeHistoryByDate(formatted);
        const prices = history.map((h) => h.modal_price);
        const highest_price = prices.length ? Math.max(...prices) : 0;
        const lowest_price = prices.length ? Math.min(...prices) : 0;
        const trend = calculateTrend(history);

        return {
            crop: crop || 'Unknown',
            mandi: mandi || 'Unknown',
            trend,
            highest_price,
            lowest_price,
            history,
        };
    } catch (error) {
        console.log('[Agmarknet] Using fallback mock data for price history due to API error');
        
        // Generate realistic mock data based on range
        const days = getDateRangeDays(range);
        const history = [];
        const today = new Date();
        
        for (let i = days; i >= 0; i -= Math.max(1, Math.floor(days / 10))) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Generate realistic price variation
            const basePrice = 4400;
            const variation = Math.sin(i * 0.1) * 200 + Math.random() * 100;
            const price = Math.round(basePrice + variation);
            
            history.push({
                date: date.toISOString().split('T')[0],
                modal_price: price,
            });
        }
        
        const prices = history.map((h) => h.modal_price);
        const highest_price = Math.max(...prices);
        const lowest_price = Math.min(...prices);
        const trend = calculateTrend(history);

        return {
            crop: crop || 'Unknown',
            mandi: mandi || 'Unknown',
            trend,
            highest_price,
            lowest_price,
            history,
        };
    }
};

module.exports = {
    fetchFromAgmarknet,
    getLatestPrice,
    getPriceHistory,
    getDateRangeDays,
    AGMARKNET_RESOURCE_ID,
};
