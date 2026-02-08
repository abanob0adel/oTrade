import 'dotenv/config';

console.log('🔍 BunnyCDN API Key Verification\n');

const apiKey = process.env.BUNNY_API_KEY;

console.log('API Key Details:');
console.log(`   Length: ${apiKey?.length || 0} characters`);
console.log(`   Format: ${apiKey}`);
console.log(`   First 20 chars: ${apiKey?.substring(0, 20)}...`);
console.log(`   Last 20 chars: ...${apiKey?.substring(apiKey.length - 20)}`);

console.log('\n📋 Expected Format:');
console.log('   Standard UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 chars)');
console.log('   Or longer format with hyphens');

console.log('\n✅ How to get the correct API Key:');
console.log('   1. Go to: https://dash.bunny.net/');
console.log('   2. Click "Account" → "Account Settings"');
console.log('   3. Find "API" section');
console.log('   4. Copy "Account API Key" or "Access Key"');
console.log('   5. Paste it in .env as BUNNY_API_KEY=your-key-here');

console.log('\n⚠️  Common Mistakes:');
console.log('   ❌ Using FTP Password instead of API Key');
console.log('   ❌ Using Storage Zone Password');
console.log('   ❌ Copying with extra spaces or characters');
console.log('   ✅ Use the Global Account API Key');

console.log('\n🔐 Storage Zone: ' + process.env.BUNNY_STORAGE_ZONE);
console.log('🌐 CDN URL: ' + process.env.BUNNY_CDN_URL);
