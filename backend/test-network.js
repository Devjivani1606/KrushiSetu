// Test network connectivity to data.gov.in
const https = require('https');
const http = require('http');

async function testConnectivity() {
    console.log('=== Network Connectivity Test ===\n');
    
    const urls = [
        'https://data.gov.in',
        'https://api.data.gov.in',
        'http://data.gov.in'
    ];
    
    for (const url of urls) {
        console.log(`Testing: ${url}`);
        try {
            const startTime = Date.now();
            
            const protocol = url.startsWith('https') ? https : http;
            
            const response = await new Promise((resolve, reject) => {
                const req = protocol.request(url, (res) => {
                    resolve(res);
                });
                
                req.on('error', reject);
                req.setTimeout(10000, () => {
                    req.destroy();
                    reject(new Error('Request timeout'));
                });
                req.end();
            });
            
            const endTime = Date.now();
            console.log(`✅ Success: ${response.statusCode} (${endTime - startTime}ms)\n`);
            
        } catch (error) {
            console.log(`❌ Failed: ${error.message}\n`);
        }
    }
}

testConnectivity().catch(console.error);
