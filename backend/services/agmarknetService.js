const axios = require('axios');
require('dotenv').config();

const AGMARKNET_RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';

// ✅ Safe ENV handling
const USE_REAL_API = String(process.env.TRY_REAL_API).trim() === 'true';
const API_KEY = String(process.env.API_KEY || '').trim();

// ✅ Debug logs
console.log("USE_REAL_API:", USE_REAL_API);
console.log("API_KEY EXISTS:", API_KEY ? "YES" : "NO");

// --------------------------------------------------
// Normalize API response
// --------------------------------------------------
const normalizeRecord = (r) => ({
    state: r.state || r.State,
    market: r.market || r.Market,
    commodity: r.commodity || r.Commodity,
    modal_price: Number(r.modal_price || r.Modal_Price) || null,
    min_price: Number(r.min_price || r.Min_Price) || null,
    max_price: Number(r.max_price || r.Max_Price) || null,
    arrival_date: r.arrival_date || r.Arrival_Date,
});

// --------------------------------------------------
// REAL API CALL
// --------------------------------------------------
const fetchFromAPI = async () => {
    try {
        if (!USE_REAL_API) {
            console.log("⚠️ Using MOCK (API disabled)");
            return [];
        }

        if (!API_KEY) {
            console.log("❌ API KEY missing");
            return [];
        }

        console.log("🌐 Calling Agmarknet API...");

        const res = await axios.get(
            'https://api.data.gov.in/resource/' + AGMARKNET_RESOURCE_ID,
            {
                params: {
                    'api-key': API_KEY,
                    format: 'json',
                    limit: 100,
                },
                timeout: 10000,
            }
        );

        const records = res.data?.records || [];

        console.log(`✅ API Success: ${records.length} records`);

        return records.map(normalizeRecord);

    } catch (err) {
        console.log("❌ API ERROR:", err.message);
        return [];
    }
};

// --------------------------------------------------
// FILTER DATA
// --------------------------------------------------
const filterData = (data, crop, state, mandi) => {
    return data.filter((r) =>
        (!crop || r.commodity?.toLowerCase().includes(crop.toLowerCase())) &&
        (!state || r.state?.toLowerCase().includes(state.toLowerCase())) &&
        (!mandi || r.market?.toLowerCase().includes(mandi.toLowerCase()))
    );
};

// --------------------------------------------------
// MOCK DATA (Fallback) - varies by crop for realism
// --------------------------------------------------
const CROP_BASE_PRICES = {
    Rice: 3100,
    Wheat: 2500,
    Onion: 1800,
    Cotton: 7200,
    Maize: 2100,
    Soybean: 4800,
    Tomato: 2200,
    Potato: 1500,
    Bajra: 2300,
    Sugarcane: 3500,
    'Chana (Gram)': 5200,
};

const getMockData = (crop, range) => {
    console.log("📊 Using MOCK DATA for", crop, "range:", range);

    const basePrice = CROP_BASE_PRICES[crop] || 3000;
    const today = new Date();
    const history = [];

    // Determine number of data points based on range
    let days;
    switch (range) {
        case '7D': days = 7; break;
        case '6M': days = 30; break;  // 30 data points sampled across 6M
        case '1Y': days = 24; break;  // 24 data points sampled across 1Y
        default: days = 11; break;    // 1M default
    }

    // Generate with a slight upward/downward trend + noise
    const trendDirection = Math.random() > 0.4 ? 1 : -1;
    const trendStrength = Math.random() * 5 + 1; // 1-6 per step

    for (let i = days; i >= 0; i--) {
        const date = new Date();
        const daysBack = range === '6M' ? i * 6 :
                         range === '1Y' ? i * 15 : i;
        date.setDate(today.getDate() - daysBack);

        const trendComponent = trendDirection * trendStrength * (days - i);
        const noise = Math.floor(Math.random() * 200) - 100;
        const price = Math.max(basePrice + trendComponent + noise, basePrice * 0.7);

        history.push({
            date: date.toISOString().split('T')[0],
            modal_price: Math.round(price),
        });
    }

    return history;
};

// --------------------------------------------------
// Compute stats from history
// --------------------------------------------------
const computeStats = (history) => {
    if (!history || history.length === 0) {
        return { highest_price: 0, lowest_price: 0, trend: '+0%' };
    }

    const prices = history.map(h => h.modal_price).filter(p => p != null && Number.isFinite(p));

    if (prices.length === 0) {
        return { highest_price: 0, lowest_price: 0, trend: '+0%' };
    }

    const highest_price = Math.max(...prices);
    const lowest_price = Math.min(...prices);

    // Trend = percentage change from first to last
    const first = prices[0];
    const last = prices[prices.length - 1];
    let trendPercent = 0;
    if (first > 0) {
        trendPercent = ((last - first) / first) * 100;
    }
    const sign = trendPercent >= 0 ? '+' : '';
    const trend = `${sign}${trendPercent.toFixed(1)}%`;

    return { highest_price, lowest_price, trend };
};

// --------------------------------------------------
// PUBLIC: Get Price History (for graphs)
// --------------------------------------------------
const getPriceHistory = async (crop, state, mandi, range = '1M') => {
    const data = await fetchFromAPI();

    let history;

    if (!data.length) {
        history = getMockData(crop, range);
    } else {
        const filtered = filterData(data, crop, state, mandi);

        if (!filtered.length) {
            console.log("⚠️ No matching data, using mock");
            history = getMockData(crop, range);
        } else {
            history = filtered.slice(0, 30).map((r) => ({
                date: r.arrival_date,
                modal_price: r.modal_price,
            }));
        }
    }

    const stats = computeStats(history);

    return {
        crop,
        mandi,
        history,
        highest_price: stats.highest_price,
        lowest_price: stats.lowest_price,
        trend: stats.trend,
    };
};

// --------------------------------------------------
// PUBLIC: Get Latest Price (single latest record)
// --------------------------------------------------
const getLatestPrice = async (crop, state, mandi) => {
    const data = await fetchFromAPI();

    if (!data.length) {
        // Return mock latest
        const basePrice = CROP_BASE_PRICES[crop] || 3000;
        const noise = Math.floor(Math.random() * 300);
        return {
            min_price: basePrice - 200 + noise,
            max_price: basePrice + 400 + noise,
            modal_price: basePrice + 100 + noise,
            arrival_date: new Date().toISOString().split('T')[0],
            market: mandi,
            state: state,
        };
    }

    const filtered = filterData(data, crop, state, mandi);

    if (!filtered.length) {
        return null;
    }

    // Return the first matching (most recent)
    const latest = filtered[0];
    return {
        min_price: latest.min_price,
        max_price: latest.max_price,
        modal_price: latest.modal_price,
        arrival_date: latest.arrival_date,
        market: latest.market,
        state: latest.state,
    };
};

module.exports = {
    getPriceHistory,
    getLatestPrice,
};
