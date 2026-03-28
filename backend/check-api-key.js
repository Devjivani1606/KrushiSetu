require('dotenv').config();

const key = process.env.API_KEY;

console.log('=== API Key Validation ===\n');
console.log('API Key Status:', key ? 'FOUND' : 'NOT FOUND');

if (key) {
    console.log('Length:', key.length);
    console.log('Has spaces:', key.includes(' '));
    console.log('Has quotes:', key.includes("'") || key.includes('"'));
    console.log('Has newlines:', key.includes('\n'));
    console.log('First 4 chars:', key.substring(0, 4) + '...');
    console.log('Last 4 chars:', '...' + key.substring(key.length - 4));
    
    // Check if it looks like a valid hex API key
    const isHex = /^[0-9a-f]+$/i.test(key);
    console.log('Is hex format:', isHex);
    
    if (key.length !== 56) {
        console.log('⚠️  WARNING: API key should be 56 characters');
    }
    
    if (key.includes(' ') || key.includes('\n')) {
        console.log('⚠️  WARNING: API key contains spaces or newlines');
    }
    
    if (!isHex) {
        console.log('⚠️  WARNING: API key should be hex format');
    }
} else {
    console.log('❌ ERROR: No API key found in .env file');
    console.log('\nTo fix:');
    console.log('1. Get API key from https://data.gov.in');
    console.log('2. Add to .env: API_KEY=your_key_here');
    console.log('3. No quotes around the key');
}

console.log('\n=== Configuration ===');
console.log('TRY_REAL_API:', process.env.TRY_REAL_API || 'NOT SET (will default to true)');
