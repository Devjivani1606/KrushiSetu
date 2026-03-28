// Direct API test with redirect handling
require('dotenv').config();

const API_KEY = process.env.API_KEY?.trim();
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';

console.log('=== Direct API Test with Redirect Handling ===\n');

// Test with redirect following
async function testDirectAPI() {
    const url = `https://data.gov.in/api/datastore/resource.json?resource_id=${RESOURCE_ID}&api-key=${API_KEY}&format=json&limit=5`;
    
    console.log('Testing URL:', url.replace(API_KEY, '***'));
    
    try {
        const https = require('https');
        const { URL } = require('url');
        
        let currentUrl = url;
        let redirectCount = 0;
        const maxRedirects = 5;
        
        while (redirectCount < maxRedirects) {
            const response = await new Promise((resolve, reject) => {
                const parsedUrl = new URL(currentUrl);
                const options = {
                    hostname: parsedUrl.hostname,
                    port: parsedUrl.port,
                    path: parsedUrl.pathname + parsedUrl.search,
                    method: 'GET',
                    timeout: 30000,
                    headers: {
                        'User-Agent': 'KrushiSetu-Farmer-App/1.0',
                        'Accept': 'application/json',
                    }
                };
                
                const req = https.request(options, (res) => {
                    let data = '';
                    
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    
                    res.on('end', () => {
                        try {
                            const json = JSON.parse(data);
                            resolve({ statusCode: res.statusCode, data: json, headers: res.headers });
                        } catch (e) {
                            resolve({ statusCode: res.statusCode, data: data, headers: res.headers });
                        }
                    });
                });
                
                req.on('error', reject);
                req.setTimeout(30000, () => {
                    req.destroy();
                    reject(new Error('Request timeout'));
                });
                req.end();
            });
            
            console.log(`Request ${redirectCount + 1}: Status ${response.statusCode}`);
            
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                currentUrl = response.headers.location;
                redirectCount++;
                console.log(`Redirecting to: ${currentUrl}`);
                continue;
            }
            
            if (response.statusCode === 200) {
                const records = response.data?.records || response.data?.data || response.data || [];
                console.log('✅ Success! Records count:', Array.isArray(records) ? records.length : 'Not an array');
                
                if (Array.isArray(records) && records.length > 0) {
                    console.log('Sample record keys:', Object.keys(records[0]));
                    console.log('Sample record:', JSON.stringify(records[0], null, 2));
                }
                return;
            } else {
                console.log('❌ Failed with status:', response.statusCode);
                console.log('Response:', response.data);
                return;
            }
        }
        
        console.log('❌ Too many redirects');
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

testDirectAPI();
