/**
 * Test script to verify Mandi API & data.gov.in connection
 * Run: node test-mandi-api.js
 */

require('dotenv').config();

const API_KEY = process.env.API_KEY?.trim();
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';

console.log('=== Mandi API Test ===\n');

// 1. Check if API key exists
if (!API_KEY) {
    console.error('❌ ERROR: API_KEY not found in .env');
    console.log('\nSteps:');
    console.log('1. Open backend/.env');
    console.log('2. Add: API_KEY=your_key_from_data_gov_in');
    console.log('3. No spaces around =');
    console.log('4. Restart server');
    process.exit(1);
}

console.log('✅ API_KEY found (length:', API_KEY.length + ')');
if (API_KEY.includes(' ')) {
    console.warn('⚠️  WARNING: API key contains spaces - remove them!');
}

// 2. Try India data.gov.in format
async function testAPI() {
    const urls = [
        {
            name: 'India OGD (data.gov.in)',
            url: 'https://data.gov.in/api/datastore/resource.json',
            params: { resource_id: RESOURCE_ID, 'api-key': API_KEY, format: 'json', limit: 5 },
        },
        {
            name: 'api.data.gov.in',
            url: `https://api.data.gov.in/resource/${RESOURCE_ID}`,
            params: { 'api-key': API_KEY, format: 'json', limit: 5 },
        },
    ];

    for (const { name, url, params } of urls) {
        console.log('\n--- Trying:', name, '---');
        try {
            const axios = require('axios');
            const qs = new URLSearchParams(params).toString();
            const fullUrl = `${url}?${qs}`;
            console.log('URL:', fullUrl.replace(API_KEY, '***'));

            const res = await axios.get(url, { params, timeout: 10000 });
            const records = res.data?.records ?? res.data?.data ?? res.data;
            const count = Array.isArray(records) ? records.length : 0;

            console.log('✅ SUCCESS! Got', count, 'records');
            if (count > 0 && records[0]) {
                console.log('Sample fields:', Object.keys(records[0]).slice(0, 5).join(', '));
            }
            return;
        } catch (err) {
            const status = err.response?.status;
            const msg = err.response?.data?.message || err.response?.data?.error || err.message;
            console.log('❌ Failed:', status || 'Network error', '-', msg);
        }
    }

    console.log('\n❌ Both URL formats failed.');
    console.log('\nCheck:');
    console.log('1. API key from https://data.gov.in → Login → My Account → Generate API Key');
    console.log('2. Key copied completely (no cut-off)');
    console.log('3. No quotes around key in .env');
    console.log('4. .env file is in backend/ folder');
}

testAPI().catch((e) => {
    console.error(e);
    process.exit(1);
});
