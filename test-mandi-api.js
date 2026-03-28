// Simple test script for Mandi API
const http = require('http');
const https = require('https');

const BASE_URL = 'http://10.64.34.162:5000/api';

async function testMandiAPI() {
    console.log('=== Testing Mandi API ===\n');
    
    // Test 1: History API
    console.log('1. Testing History API...');
    try {
        const historyUrl = `${BASE_URL}/mandi/history?crop=Onion&state=Maharashtra&mandi=Nashik&range=7D`;
        console.log('URL:', historyUrl);
        
        const response = await makeRequest(historyUrl);
        const data = JSON.parse(response);
        
        console.log('Response:', JSON.stringify(data, null, 2));
        
        if (data.success && data.history) {
            console.log('✅ History API working! Got', data.history.length, 'records');
            console.log('Sample data:', data.history[0]);
        } else if (data.success === false) {
            console.log('ℹ️  History API returned no data (using mock)');
        } else {
            console.log('❌ History API failed');
        }
    } catch (error) {
        console.log('❌ History API error:', error.message);
    }
    
    console.log('\n');
    
    // Test 2: Latest Price API
    console.log('2. Testing Latest Price API...');
    try {
        const latestUrl = `${BASE_URL}/mandi/latest?crop=Onion&state=Maharashtra&mandi=Nashik`;
        console.log('URL:', latestUrl);
        
        const response = await makeRequest(latestUrl);
        const data = JSON.parse(response);
        
        console.log('Response:', JSON.stringify(data, null, 2));
        
        if (data.success && data.data) {
            console.log('✅ Latest Price API working!');
            console.log('Modal price:', data.data.modal_price);
        } else {
            console.log('❌ Latest Price API failed');
        }
    } catch (error) {
        console.log('❌ Latest Price API error:', error.message);
    }
}

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        
        const request = client.get(url, (response) => {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                resolve(data);
            });
        });
        
        request.on('error', (error) => {
            reject(error);
        });
        
        request.setTimeout(30000, () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

testMandiAPI().catch(console.error);
