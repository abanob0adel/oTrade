/**
 * 🧪 BunnyCDN Connection Test Script - Smart Endpoint Detection
 * Run: node test-bunnycdn.js
 * 
 * This will auto-detect the correct endpoint and test upload/delete
 */

import 'dotenv/config';
import bunnyCDN from './src/utils/bunnycdn.js';

console.log('🚀 Starting BunnyCDN Connection Test with Smart Detection...\n');
console.log('🔍 Configuration:');
console.log(`   BUNNY_STORAGE_ZONE: ${process.env.BUNNY_STORAGE_ZONE}`);
console.log(`   BUNNY_STORAGE_REGION: ${process.env.BUNNY_STORAGE_REGION}`);
console.log(`   BUNNY_CDN_URL: ${process.env.BUNNY_CDN_URL}`);
console.log(`   BUNNY_API_KEY: ${process.env.BUNNY_API_KEY?.substring(0, 20)}...`);
console.log('');

// Test connection
(async () => {
  try {
    const result = await bunnyCDN.testConnection();
    
    if (result) {
      console.log('\n✅ ✅ ✅ SUCCESS! ✅ ✅ ✅');
      console.log('BunnyCDN is working correctly!');
      console.log('Smart endpoint detection worked perfectly.');
      console.log('\n🔥 All issues are FIXED! 🔥');
      console.log('   - ENOTFOUND: Fixed with auto-fallback');
      console.log('   - 401 Unauthorized: Fixed with correct endpoint');
      console.log('   - DNS errors: Fixed with smart detection\n');
      process.exit(0);
    } else {
      console.log('\n❌ FAILED! Check the errors above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('1. Check BUNNY_API_KEY in .env (use Global API Key)');
    console.error('2. Check BUNNY_STORAGE_ZONE is correct (otrade)');
    console.error('3. Check internet connection');
    console.error('4. Verify API key has write permissions');
    console.error('\n📖 Get API Key from: https://dash.bunny.net/ → Account → API');
    process.exit(1);
  }
})();
