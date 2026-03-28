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
// MOCK DATA (Fallback)
// --------------------------------------------------
const getMockData = (crop) => {
    console.log("📊 Using MOCK DATA");

    const today = new Date();
    const history = [];

    for (let i = 10; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);

        history.push({
            date: date.toISOString().split('T')[0],
            modal_price: 3000 + Math.floor(Math.random() * 500),
        });
    }

    return history;
};

// --------------------------------------------------
// PUBLIC FUNCTION
// --------------------------------------------------
const getPriceHistory = async (crop, state, mandi) => {
    const data = await fetchFromAPI();

    if (!data.length) {
        return {
            crop,
            mandi,
            history: getMockData(crop),
        };
    }

    const filtered = filterData(data, crop, state, mandi);

    if (!filtered.length) {
        console.log("⚠️ No matching data, using mock");
        return {
            crop,
            mandi,
            history: getMockData(crop),
        };
    }

    const history = filtered.slice(0, 10).map((r) => ({
        date: r.arrival_date,
        modal_price: r.modal_price,
    }));

    return {
        crop,
        mandi,
        history,
    };
};

module.exports = {
    getPriceHistory,
};
