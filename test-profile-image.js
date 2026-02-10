/**
 * Test Profile Image Upload
 * 
 * This script tests the complete profile image upload flow:
 * 1. Register/Login user
 * 2. Upload profile image URL
 * 3. Verify profile contains image
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = `test${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';

async function testProfileImageUpload() {
  console.log('🧪 Testing Profile Image Upload Flow\n');
  
  try {
    // Step 1: Register user
    console.log('1️⃣ Registering test user...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      fullName: 'Test User',
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    const token = registerResponse.data.token;
    console.log('✅ User registered successfully');
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log(`   User: ${registerResponse.data.user.name}\n`);
    
    // Step 2: Upload profile image
    console.log('2️⃣ Uploading profile image...');
    const imageUrl = 'https://cdn.example.com/profiles/test-user-123.jpg';
    const uploadResponse = await axios.post(
      `${BASE_URL}/api/auth/profile/image`,
      { profileImage: imageUrl },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Profile image uploaded successfully');
    console.log(`   Image URL: ${uploadResponse.data.user.profileImage}\n`);
    
    // Step 3: Get profile to verify
    console.log('3️⃣ Verifying profile contains image...');
    const profileResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const profile = profileResponse.data.user;
    console.log('✅ Profile retrieved successfully');
    console.log(`   Name: ${profile.name}`);
    console.log(`   Email: ${profile.email}`);
    console.log(`   Profile Image: ${profile.profileImage}`);
    
    // Verify image URL matches
    if (profile.profileImage === imageUrl) {
      console.log('\n✅ SUCCESS: Profile image upload working correctly!');
    } else {
      console.log('\n❌ ERROR: Profile image URL mismatch');
      console.log(`   Expected: ${imageUrl}`);
      console.log(`   Got: ${profile.profileImage}`);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      console.log('\n💡 Make sure the server is running on http://localhost:3000');
    }
  }
}

// Run test
testProfileImageUpload();
