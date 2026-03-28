// // ============================================================
// // services/agmarknetService.js
// // Service layer for Agmarknet API (data.gov.in)
// // Fetches mandi price data - API key used ONLY in backend.
// // ============================================================

// const axios = require('axios');
// const https = require('https');
// const http = require('http');
// require('dotenv').config();


// // Resource ID for "Current Daily Price of Various Commodities from Various Markets (Mandi)"
// // Source: https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi
// const AGMARKNET_RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';

// // Flag to control whether to try real API or use mock data directly
// // Set to 'false' to always use mock data (more reliable for demo)
// const TRY_REAL_API = process.env.TRY_REAL_API === 'true';

// // Max records per request (data.gov.in limit)
// const API_LIMIT = 100;

// // Normalize field names (API may return different casing)
// const normalizeRecord = (record) => {
//     const get = (obj, ...keys) => {
//         for (const k of keys) {
//             const val = obj[k] ?? obj[k?.toLowerCase?.()] ?? obj[k?.replace(/_/g, '')];
//             if (val != null) return val;
//         }
//         return null;
//     };
//     return {
//         state: get(record, 'state', 'State'),
//         market: get(record, 'market', 'Market'),
//         commodity: get(record, 'commodity', 'Commodity'),
//         modal_price: parseFloat(get(record, 'modal_price', 'Modal_Price')) || null,
//         min_price: parseFloat(get(record, 'min_price', 'Min_Price')) || null,
//         max_price: parseFloat(get(record, 'max_price', 'Max_Price')) || null,
//         arrival_date: get(record, 'arrival_date', 'Arrival_Date', 'arrivaldate'),
//     };
// };

// /**
//  * Fetch raw data from data.gov.in Agmarknet API
//  * @param {Object} options - { limit, offset }
//  * @returns {Promise<Array>} - Array of normalized records
//  */
// const fetchFromAgmarknet = async (options = {}) => {
//     // If TRY_REAL_API is false, return empty array to trigger mock data immediately
//     if (!TRY_REAL_API) {
//         console.log('[Agmarknet] Real API disabled, using mock data directly');
//         return [];
//     }

//     // Trim API key - copy-paste often adds extra spaces/newlines
//     const rawKey = process.env.API_KEY;
//     const apiKey = typeof rawKey === 'string' ? rawKey.trim() : '';
//     if (!apiKey) {
//         console.log('[Agmarknet] API_KEY not configured, using mock data');
//         return [];
//     }

//     const limit = options.limit || API_LIMIT;
//     const offset = options.offset || 0;

//     console.log('[Agmarknet] Attempting real API call...');
    
//     // Create custom HTTPS agent for better connectivity
// const httpsAgent = new https.Agent({
//     keepAlive: true,
//     maxSockets: 5,
//     maxFreeSockets: 2,
//     timeout: 20000,
//     rejectUnauthorized: false, // Only for development
// });

// // Try multiple endpoints for better reliability
//     const endpoints = [
//         // Primary: India OGD with custom agent
//         {
//             url: 'https://data.gov.in/api/datastore/resource.json',
//             params: { resource_id: AGMARKNET_RESOURCE_ID, 'api-key': apiKey, format: 'json', limit, offset },
//             agent: httpsAgent
//         },
//         // Alternative: api.data.gov.in with custom agent
//         {
//             url: `https://api.data.gov.in/resource/${AGMARKNET_RESOURCE_ID}`,
//             params: { 'api-key': apiKey, format: 'json', limit, offset },
//             agent: httpsAgent
//         },
//         // Fallback: HTTP instead of HTTPS
//         {
//             url: 'http://data.gov.in/api/datastore/resource.json',
//             params: { resource_id: AGMARKNET_RESOURCE_ID, 'api-key': apiKey, format: 'json', limit, offset },
//             agent: null
//         }
//     ];

//     for (const endpoint of endpoints) {
//         try {
//             const config = {
//                 params: endpoint.params,
//                 timeout: 20000,
//                 headers: {
//                     'Accept': 'application/json',
//                     'User-Agent': 'KrushiSetu-Farmer-App/1.0',
//                     'Connection': 'keep-alive',
//                     'Cache-Control': 'no-cache',
//                 },
//             };
            
//             if (endpoint.agent) {
//                 config.httpsAgent = endpoint.agent;
//             }

//             const response = await axios.get(endpoint.url, config);

//             const records = response.data?.records ?? response.data?.data ?? response.data ?? [];
//             const normalizedRecords = Array.isArray(records) ? records.map(normalizeRecord) : [];
            
//             if (normalizedRecords.length > 0) {
//                 console.log(`[Agmarknet] Success with endpoint: ${endpoint.url}`);
//                 return normalizedRecords;
//             } else {
//                 console.log(`[Agmarknet] No records from endpoint: ${endpoint.url}`);
//             }
//         } catch (err) {
//             console.log(`[Agmarknet] Endpoint ${endpoint.url} failed:`, err.message);
//             continue;
//         }
//     }
    
//     console.log('[Agmarknet] All endpoints failed, falling back to mock data');
//     return []; // Return empty to trigger mock data
// };

// /**
//  * Fetch all records for given filters by paginating through API
//  * @param {Object} filters - { commodity, state, market }
//  * @param {number} maxRecords - Maximum records to fetch (for date range)
//  * @returns {Promise<Array>}
//  */
// const fetchFilteredData = async (filters = {}, maxRecords = 1000) => {
//     const allRecords = [];
//     let offset = 0;
//     let hasMore = true;

//     try {
//         while (hasMore && allRecords.length < maxRecords) {
//             const batch = await fetchFromAgmarknet({ limit: API_LIMIT, offset });
            
//             // If fetchFromAgmarknet returns empty array, break and use mock data
//             if (batch.length === 0) {
//                 console.log('[Agmarknet] No records from API, will use mock data');
//                 break;
//             }

//             for (const rec of batch) {
//                 if (allRecords.length >= maxRecords) break;

//                 const matchCommodity = !filters.commodity ||
//                     (rec.commodity && rec.commodity.toLowerCase().includes(String(filters.commodity).toLowerCase()));
//                 const matchState = !filters.state ||
//                     (rec.state && rec.state.toLowerCase().includes(String(filters.state).toLowerCase()));
//                 const matchMarket = !filters.market ||
//                     (rec.market && rec.market.toLowerCase().includes(String(filters.market).toLowerCase()));

//                 if (matchCommodity && matchState && matchMarket) {
//                     allRecords.push(rec);
//                 }
//             }

//             offset += 1;
//             hasMore = batch.length === API_LIMIT;
//         }

//         console.log(`[Agmarknet] Found ${allRecords.length} matching records`);
//         return allRecords;
        
//     } catch (error) {
//         console.log('[Agmarknet] Error in fetchFilteredData:', error.message);
//         return []; // Return empty to trigger mock data
//     }
// };

// /**
//  * Get date range in days from range param (7D, 1M, 6M, 1Y)
//  */
// const getDateRangeDays = (range) => {
//     const map = { '7D': 7, '1M': 30, '6M': 180, '1Y': 365 };
//     return map[String(range).toUpperCase()] ?? 30;
// };

// /**
//  * Filter records by date range and sort by date
//  */
// const filterByDateRange = (records, range) => {
//     const days = getDateRangeDays(range);
//     const cutoff = new Date();
//     cutoff.setDate(cutoff.getDate() - days);

//     const parseDate = (d) => {
//         if (!d) return null;
//         const parsed = new Date(d);
//         return isNaN(parsed.getTime()) ? null : parsed;
//     };

//     return records
//         .filter((r) => {
//             const d = parseDate(r.arrival_date);
//             return d && d >= cutoff;
//         })
//         .sort((a, b) => {
//             const da = parseDate(a.arrival_date)?.getTime() ?? 0;
//             const db = parseDate(b.arrival_date)?.getTime() ?? 0;
//             return da - db;
//         });
// };

// /**
//  * Remove duplicate entries (same date + market + commodity)
//  */
// const removeDuplicates = (records) => {
//     const seen = new Set();
//     return records.filter((r) => {
//         const key = `${r.arrival_date}|${r.market}|${r.commodity}`;
//         if (seen.has(key)) return false;
//         seen.add(key);
//         return true;
//     });
// };

// /**
//  * Calculate percentage change (first vs last modal price in series)
//  */
// const calculateTrend = (history) => {
//     if (!history || history.length < 2) return '+0%';
//     const first = history[0]?.modal_price;
//     const last = history[history.length - 1]?.modal_price;
//     if (!first || !last || first === 0) return '+0%';
//     const change = ((last - first) / first) * 100;
//     const sign = change >= 0 ? '+' : '';
//     return `${sign}${change.toFixed(1)}%`;
// };

// /**
//  * Remove duplicate dates from formatted history (YYYY-MM-DD).
//  * Keeps the last value for each date and returns date-ascending series.
//  */
// const dedupeHistoryByDate = (history) => {
//     if (!Array.isArray(history) || history.length === 0) return [];
//     const map = new Map();
//     for (const item of history) {
//         if (!item?.date) continue;
//         const val = Number(item.modal_price);
//         if (!Number.isFinite(val)) continue;
//         map.set(String(item.date), Math.round(val));
//     }
//     return Array.from(map.entries())
//         .sort(([a], [b]) => String(a).localeCompare(String(b)))
//         .map(([date, modal_price]) => ({ date, modal_price }));
// };

// /**
//  * Format date for response (YYYY-MM-DD)
//  */
// const formatDate = (d) => {
//     if (!d) return null;
//     const parsed = new Date(d);
//     if (isNaN(parsed.getTime())) return null;
//     return parsed.toISOString().split('T')[0];
// };

// /**
//  * Get latest mandi price for crop, state, mandi
//  */
// const getLatestPrice = async (crop, state, mandi) => {
//     try {
//         console.log(`[Agmarknet] Fetching latest price for ${crop}, ${state}, ${mandi}`);
//         const records = await fetchFilteredData(
//             { commodity: crop, state, market: mandi },
//             500
//         );

//         const withDate = records.filter((r) => r.arrival_date && r.modal_price != null);
//         if (withDate.length === 0) {
//             console.log('[Agmarknet] No valid records found, using fallback');
//             throw new Error('No data found');
//         }

//         // Sort by date descending, take latest
//         withDate.sort((a, b) => {
//             const da = new Date(a.arrival_date).getTime();
//             const db = new Date(b.arrival_date).getTime();
//             return db - da;
//         });

//         const latest = withDate[0];
//         const prices = withDate.map((r) => r.modal_price).filter((p) => p != null);

//         const minPrice = latest.min_price != null ? latest.min_price : (prices.length ? Math.min(...prices) : 0);
//         const maxPrice = latest.max_price != null ? latest.max_price : (prices.length ? Math.max(...prices) : 0);

//         console.log(`[Agmarknet] Success: Latest price ${latest.modal_price} for ${crop}`);
//         return {
//             min_price: minPrice,
//             max_price: maxPrice,
//             modal_price: latest.modal_price,
//             arrival_date: formatDate(latest.arrival_date),
//             market: latest.market,
//             state: latest.state,
//         };
//     } catch (error) {
//         console.log('[Agmarknet] Using fallback mock data for latest price due to API error');
//         // Fallback mock data for testing
//         return {
//             min_price: 4100,
//             max_price: 4850,
//             modal_price: 4450,
//             arrival_date: new Date().toISOString().split('T')[0],
//             market: mandi || 'Nagpur',
//             state: state || 'Maharashtra',
//         };
//     }
// };

// /**
//  * Get price history for graph (crop, state, mandi, range)
//  */
// const getPriceHistory = async (crop, state, mandi, range) => {
//     try {
//         console.log(`[Agmarknet] Fetching price history for ${crop}, ${state}, ${mandi}, range: ${range}`);
//         const records = await fetchFilteredData(
//             { commodity: crop, state, market: mandi },
//             2000
//         );

//         const filtered = filterByDateRange(records, range);
//         const unique = removeDuplicates(filtered);

//         const formatted = unique
//             .filter((r) => r.arrival_date && r.modal_price != null)
//             .map((r) => ({
//                 date: formatDate(r.arrival_date),
//                 modal_price: Math.round(Number(r.modal_price)),
//             }))
//             .filter((h) => h.date && Number.isFinite(h.modal_price));

//         const history = dedupeHistoryByDate(formatted);
//         const prices = history.map((h) => h.modal_price);
//         const highest_price = prices.length ? Math.max(...prices) : 0;
//         const lowest_price = prices.length ? Math.min(...prices) : 0;
//         const trend = calculateTrend(history);

//         console.log(`[Agmarknet] Success: Got ${history.length} history points for ${crop}`);
//         return {
//             crop: crop || 'Unknown',
//             mandi: mandi || 'Unknown',
//             trend,
//             highest_price,
//             lowest_price,
//             history,
//         };
//     } catch (error) {
//         console.log('[Agmarknet] Using fallback mock data for price history due to API error');
        
//         // Generate realistic mock data based on range
//         const days = getDateRangeDays(range);
//         const history = [];
//         const today = new Date();
        
//         // Generate data points for better visualization
//         const dataPoints = Math.min(days, 20); // Max 20 points for cleaner graph
        
//         for (let i = dataPoints - 1; i >= 0; i--) {
//             const date = new Date(today);
//             date.setDate(date.getDate() - Math.floor((i * days) / dataPoints));
            
//             // Generate realistic price variation based on crop
//             let basePrice = 4400;
//             if (crop.toLowerCase().includes('onion')) basePrice = 4500;
//             else if (crop.toLowerCase().includes('wheat')) basePrice = 2800;
//             else if (crop.toLowerCase().includes('rice')) basePrice = 3500;
//             else if (crop.toLowerCase().includes('cotton')) basePrice = 6500;
            
//             const variation = Math.sin(i * 0.3) * 200 + Math.random() * 150 - 75;
//             const price = Math.round(basePrice + variation);
            
//             history.push({
//                 date: date.toISOString().split('T')[0],
//                 modal_price: price,
//             });
//         }
        
//         const prices = history.map((h) => h.modal_price);
//         const highest_price = Math.max(...prices);
//         const lowest_price = Math.min(...prices);
//         const trend = calculateTrend(history);

//         console.log(`[Agmarknet] Generated mock data: ${history.length} points for ${crop}`);
//         return {
//             crop: crop || 'Unknown',
//             mandi: mandi || 'Unknown',
//             trend,
//             highest_price,
//             lowest_price,
//             history,
//         };
//     }
// };

// module.exports = {
//     fetchFromAgmarknet,
//     getLatestPrice,
//     getPriceHistory,
//     getDateRangeDays,
//     AGMARKNET_RESOURCE_ID,
// };
