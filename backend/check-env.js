require('dotenv').config();

console.log('=== Current .env Configuration ===');
console.log('TRY_REAL_API:', process.env.TRY_REAL_API);
console.log('API_KEY:', process.env.API_KEY ? 'Present' : 'Missing');

if (process.env.TRY_REAL_API === 'false') {
    console.log('\n⚠️  ISSUE: Real API is disabled');
    console.log('SOLUTION: Change TRY_REAL_API=true in .env file');
} else {
    console.log('\n✅ Real API is enabled');
}
