const fs = require('fs');
require('dotenv').config();

const envPath = '.env';
let envContent = '';

// Read existing .env file
if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
}

// Add TRY_REAL_API if not present
if (!envContent.includes('TRY_REAL_API=')) {
    envContent += '\n# Set to false to use mock data directly (recommended for demo)\nTRY_REAL_API=false\n';
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Added TRY_REAL_API=false to .env file');
} else {
    console.log('ℹ️  TRY_REAL_API already exists in .env file');
}

// Verify the update
require('dotenv').config();
console.log('Updated TRY_REAL_API:', process.env.TRY_REAL_API);
