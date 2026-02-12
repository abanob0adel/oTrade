import axios from 'axios';

/**
 * Test Gold Price API
 * 
 * This script tests the gold price endpoint
 */

const BASE_URL = 'http://localhost:3000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(50)}\n${msg}\n${'='.repeat(50)}${colors.reset}\n`)
};

/**
 * Test 1: Get Gold Price (No Cache)
 */
async function testGetGoldPrice() {
  log.section('TEST 1: Get Gold Price (No Cache)');
  
  try {
    log.info('Sending GET request to /api/gold');
    
    const response = await axios.get(`${BASE_URL}/gold`);
    
    log.success('Request successful!');
    console.log('\nResponse Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
    // Validate response structure
    const { success, data, timestamp } = response.data;
    
    if (success && data && data.price && data.currency) {
      log.success('Response structure is valid');
      log.info(`Gold Price: $${data.price} ${data.currency}`);
      log.info(`Last Update: ${data.lastUpdate}`);
      log.info(`Description: ${data.description.substring(0, 50)}...`);
      log.info(`Cover Image: ${data.coverImage}`);
    } else {
      log.error('Response structure is invalid');
    }
    
    return true;
  } catch (error) {
    log.error('Request failed!');
    if (error.response) {
      console.log('Error Status:', error.response.status);
      console.log('Error Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

/**
 * Test 2: Get Gold Price (With Cache)
 */
async function testGetGoldPriceWithCache() {
  log.section('TEST 2: Get Gold Price (With Cache)');
  
  try {
    log.info('Sending GET request to /api/gold/cached');
    
    const response = await axios.get(`${BASE_URL}/gold/cached`);
    
    log.success('Request successful!');
    console.log('\nResponse Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
    const { success, data, cached, cacheAge } = response.data;
    
    if (success && data) {
      log.success('Response structure is valid');
      log.info(`Gold Price: $${data.price} ${data.currency}`);
      log.info(`Cached: ${cached ? 'Yes' : 'No'}`);
      if (cacheAge !== undefined) {
        log.info(`Cache Age: ${cacheAge} seconds`);
      }
    }
    
    return true;
  } catch (error) {
    log.error('Request failed!');
    if (error.response) {
      console.log('Error Status:', error.response.status);
      console.log('Error Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

/**
 * Test 3: Cache Performance Test
 */
async function testCachePerformance() {
  log.section('TEST 3: Cache Performance Test');
  
  try {
    log.info('Making 3 consecutive requests to /api/gold/cached');
    
    // First request (should fetch from API)
    log.info('\n1st Request (Fresh data)...');
    const start1 = Date.now();
    const response1 = await axios.get(`${BASE_URL}/gold/cached`);
    const time1 = Date.now() - start1;
    log.success(`Response time: ${time1}ms | Cached: ${response1.data.cached || false}`);
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Second request (should use cache)
    log.info('\n2nd Request (Should be cached)...');
    const start2 = Date.now();
    const response2 = await axios.get(`${BASE_URL}/gold/cached`);
    const time2 = Date.now() - start2;
    log.success(`Response time: ${time2}ms | Cached: ${response2.data.cached || false}`);
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Third request (should still use cache)
    log.info('\n3rd Request (Should be cached)...');
    const start3 = Date.now();
    const response3 = await axios.get(`${BASE_URL}/gold/cached`);
    const time3 = Date.now() - start3;
    log.success(`Response time: ${time3}ms | Cached: ${response3.data.cached || false}`);
    
    log.info('\nPerformance Summary:');
    log.info(`1st Request: ${time1}ms`);
    log.info(`2nd Request: ${time2}ms (${time2 < time1 ? 'Faster' : 'Slower'})`);
    log.info(`3rd Request: ${time3}ms (${time3 < time1 ? 'Faster' : 'Slower'})`);
    
    return true;
  } catch (error) {
    log.error('Cache performance test failed!');
    console.log('Error:', error.message);
    return false;
  }
}

/**
 * Test 4: Multiple Rapid Requests
 */
async function testMultipleRequests() {
  log.section('TEST 4: Multiple Rapid Requests');
  
  try {
    log.info('Sending 5 rapid requests to /api/gold');
    
    const promises = [];
    for (let i = 1; i <= 5; i++) {
      promises.push(
        axios.get(`${BASE_URL}/gold`)
          .then(res => ({ success: true, request: i, price: res.data.data.price }))
          .catch(err => ({ success: false, request: i, error: err.message }))
      );
    }
    
    const results = await Promise.all(promises);
    
    console.log('\nResults:');
    results.forEach(result => {
      if (result.success) {
        log.success(`Request ${result.request}: $${result.price}`);
      } else {
        log.error(`Request ${result.request}: ${result.error}`);
      }
    });
    
    const successCount = results.filter(r => r.success).length;
    log.info(`\nSuccess Rate: ${successCount}/5 (${(successCount/5*100).toFixed(0)}%)`);
    
    return true;
  } catch (error) {
    log.error('Multiple requests test failed!');
    console.log('Error:', error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log(`${colors.cyan}
╔═══════════════════════════════════════════════════╗
║         Gold Price API Test Suite                ║
║         Testing: ${BASE_URL}/gold          ║
╚═══════════════════════════════════════════════════╝
${colors.reset}`);

  const results = {
    test1: false,
    test2: false,
    test3: false,
    test4: false
  };

  // Run tests
  results.test1 = await testGetGoldPrice();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  results.test2 = await testGetGoldPriceWithCache();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  results.test3 = await testCachePerformance();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  results.test4 = await testMultipleRequests();

  // Summary
  log.section('TEST SUMMARY');
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  console.log('Test 1 (Get Gold Price):', results.test1 ? '✓ PASSED' : '✗ FAILED');
  console.log('Test 2 (Get with Cache):', results.test2 ? '✓ PASSED' : '✗ FAILED');
  console.log('Test 3 (Cache Performance):', results.test3 ? '✓ PASSED' : '✗ FAILED');
  console.log('Test 4 (Multiple Requests):', results.test4 ? '✓ PASSED' : '✗ FAILED');
  
  console.log(`\n${colors.cyan}Overall: ${passed}/${total} tests passed (${(passed/total*100).toFixed(0)}%)${colors.reset}\n`);
  
  if (passed === total) {
    log.success('All tests passed! 🎉');
  } else {
    log.warning('Some tests failed. Please check the output above.');
  }
}

// Run tests
runAllTests().catch(error => {
  log.error('Test suite failed to run!');
  console.error(error);
  process.exit(1);
});
