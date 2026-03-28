const fs = require('fs');

// Read current .env file
let envContent = '';
if (fs.existsSync('.env')) {
    envContent = fs.readFileSync('.env', 'utf8');
}

// Replace TRY_REAL_API=false with TRY_REAL_API=true
if (envContent.includes('TRY_REAL_API=false')) {
    envContent = envContent.replace('TRY_REAL_API=false', 'TRY_REAL_API=true');
    fs.writeFileSync('.env', envContent);
    console.log('✅ TRY_REAL_API has been set to true');
} else {
    console.log('ℹ️  TRY_REAL_API is already true or not found');
}

// Verify the change
require('dotenv').config();
console.log('Current TRY_REAL_API:', process.env.TRY_REAL_API);
