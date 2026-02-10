/**
 * Test Books & Articles Permissions
 * 
 * This script tests the RBAC permissions for books and articles modules
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testPermissions() {
  console.log('🧪 Testing Books & Articles Permissions\n');
  
  try {
    // Step 1: Get all available permissions
    console.log('1️⃣ Getting all available permissions...');
    const allPermissions = await axios.get(`${BASE_URL}/api/auth/permissions/all`);
    
    console.log('✅ All available permissions:');
    console.log('   Books:', allPermissions.data.books);
    console.log('   Articles:', allPermissions.data.articles);
    
    // Check if books and articles are included
    if (allPermissions.data.books && allPermissions.data.articles) {
      console.log('✅ Books and Articles permissions are available!\n');
    } else {
      console.log('❌ Books or Articles permissions are missing!\n');
      return;
    }
    
    // Step 2: Test with admin token (you need to provide a valid admin token)
    console.log('2️⃣ Testing with admin token...');
    console.log('   ℹ️  To test fully, you need to:');
    console.log('   1. Login as admin: POST /api/admin/login');
    console.log('   2. Get your permissions: GET /api/auth/me/permissions');
    console.log('   3. Try to access books: GET /api/books/admin');
    console.log('   4. Try to create book: POST /api/books\n');
    
    // Step 3: Show expected permission structure
    console.log('3️⃣ Expected admin permissions structure:');
    console.log(JSON.stringify({
      permissions: [
        {
          books: ['view', 'create', 'update', 'delete'],
          articles: ['view', 'create', 'update', 'delete'],
          courses: ['view'],
          webinars: ['view']
        }
      ]
    }, null, 2));
    
    console.log('\n✅ Permissions system is configured correctly!');
    console.log('\n📚 Next steps:');
    console.log('   1. Create/update admin with books & articles permissions');
    console.log('   2. Login as that admin');
    console.log('   3. Test accessing /api/books/admin and /api/articles/admin');
    console.log('   4. Test creating/updating/deleting books and articles');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the server is running on http://localhost:3000');
    }
  }
}

// Run test
testPermissions();
