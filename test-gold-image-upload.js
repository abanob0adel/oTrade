/**
 * Test Gold Info Image Upload
 * 
 * This script tests the gold info system with image upload via BunnyCDN
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000/api';

// Replace with your admin token
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE';

/**
 * Test 1: Create/Update Gold Info with Image Upload
 */
async function testGoldInfoWithImage() {
  console.log('\n🧪 Test 1: Create/Update Gold Info with Image Upload');
  console.log('='.repeat(60));

  try {
    const form = new FormData();
    
    // Add image file (create a test image or use existing one)
    // For testing, you can use any image file
    // form.append('coverImage', fs.createReadStream('path/to/test-image.jpg'));
    
    // Add bilingual content
    form.append('title_en', 'Gold Trading - Live Prices');
    form.append('title_ar', 'تداول الذهب - الأسعار المباشرة');
    
    form.append('description_en', 'Gold is one of the most traded precious metals in the world. It is widely used as a safe haven asset and its price changes based on global markets and demand.');
    form.append('description_ar', 'الذهب هو أحد أكثر المعادن الثمينة تداولاً في العالم. يستخدم على نطاق واسع كأصل آمن ويتغير سعره بناءً على الأسواق العالمية والطلب.');
    
    // Add FAQs
    const faqsEn = [
      {
        question: 'What is gold trading?',
        answer: 'Gold trading involves buying and selling gold to profit from price movements.'
      },
      {
        question: 'Why invest in gold?',
        answer: 'Gold is considered a safe haven asset that protects against inflation and economic uncertainty.'
      }
    ];
    
    const faqsAr = [
      {
        question: 'ما هو تداول الذهب؟',
        answer: 'تداول الذهب يتضمن شراء وبيع الذهب للاستفادة من تحركات الأسعار.'
      },
      {
        question: 'لماذا الاستثمار في الذهب؟',
        answer: 'يعتبر الذهب أصلاً آمناً يحمي من التضخم وعدم اليقين الاقتصادي.'
      }
    ];
    
    form.append('faqs_en', JSON.stringify(faqsEn));
    form.append('faqs_ar', JSON.stringify(faqsAr));

    const response = await axios.post(`${BASE_URL}/gold/info`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });

    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test 2: Get Gold Info (English)
 */
async function testGetGoldInfoEnglish() {
  console.log('\n🧪 Test 2: Get Gold Info (English)');
  console.log('='.repeat(60));

  try {
    const response = await axios.get(`${BASE_URL}/gold/info`, {
      headers: {
        'Accept-Language': 'en'
      }
    });

    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test 3: Get Gold Info (Arabic)
 */
async function testGetGoldInfoArabic() {
  console.log('\n🧪 Test 3: Get Gold Info (Arabic)');
  console.log('='.repeat(60));

  try {
    const response = await axios.get(`${BASE_URL}/gold/info`, {
      headers: {
        'Accept-Language': 'ar'
      }
    });

    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test 4: Get Gold Info (Both Languages)
 */
async function testGetGoldInfoBothLanguages() {
  console.log('\n🧪 Test 4: Get Gold Info (Both Languages)');
  console.log('='.repeat(60));

  try {
    const response = await axios.get(`${BASE_URL}/gold/info`, {
      headers: {
        'Accept-Language': 'ar|en'
      }
    });

    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test 5: Get Live Gold Price
 */
async function testGetLiveGoldPrice() {
  console.log('\n🧪 Test 5: Get Live Gold Price');
  console.log('='.repeat(60));

  try {
    const response = await axios.get(`${BASE_URL}/gold`);

    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test 6: Update Gold Info without Image (Text Only)
 */
async function testUpdateTextOnly() {
  console.log('\n🧪 Test 6: Update Gold Info (Text Only - No Image)');
  console.log('='.repeat(60));

  try {
    const form = new FormData();
    
    // Update only text fields
    form.append('title_en', 'Gold Trading - Updated Title');
    form.append('title_ar', 'تداول الذهب - عنوان محدث');
    
    form.append('description_en', 'Updated description for gold trading.');
    form.append('description_ar', 'وصف محدث لتداول الذهب.');

    const response = await axios.post(`${BASE_URL}/gold/info`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });

    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('\n🚀 Starting Gold Info Image Upload Tests...\n');

  try {
    // Test 1: Create/Update with image (commented out - requires actual image file)
    // await testGoldInfoWithImage();
    
    // Test 2: Get info in English
    await testGetGoldInfoEnglish();
    
    // Test 3: Get info in Arabic
    await testGetGoldInfoArabic();
    
    // Test 4: Get info in both languages
    await testGetGoldInfoBothLanguages();
    
    // Test 5: Get live gold price
    await testGetLiveGoldPrice();
    
    // Test 6: Update text only (no image)
    // await testUpdateTextOnly();

    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests();
