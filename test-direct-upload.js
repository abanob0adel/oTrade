/**
 * 🧪 Test BunnyCDN Direct Upload System
 * Tests the generate-url endpoint
 */

import 'dotenv/config';
import bunnyDirectUpload from './src/utils/bunnyDirectUpload.js';

console.log('🧪 Testing BunnyCDN Direct Upload System\n');

// Test 1: Generate upload URL for PDF
console.log('📄 Test 1: Generate PDF Upload URL');
try {
  const pdfUpload = bunnyDirectUpload.generateUploadUrl(
    'test-book.pdf',
    'pdf',
    'books/files'
  );
  
  console.log('✅ PDF Upload URL generated:');
  console.log('   Upload URL:', pdfUpload.uploadUrl);
  console.log('   Public URL:', pdfUpload.fileUrl);
  console.log('   File Name:', pdfUpload.fileName);
  console.log('   Storage Path:', pdfUpload.storagePath);
  console.log('   Headers:', pdfUpload.headers);
  console.log('');
} catch (error) {
  console.error('❌ Test 1 failed:', error.message);
}

// Test 2: Generate upload URL for Image
console.log('🖼️  Test 2: Generate Image Upload URL');
try {
  const imageUpload = bunnyDirectUpload.generateUploadUrl(
    'book-cover.jpg',
    'image',
    'books/covers'
  );
  
  console.log('✅ Image Upload URL generated:');
  console.log('   Upload URL:', imageUpload.uploadUrl);
  console.log('   Public URL:', imageUpload.fileUrl);
  console.log('   File Name:', imageUpload.fileName);
  console.log('');
} catch (error) {
  console.error('❌ Test 2 failed:', error.message);
}

// Test 3: Generate upload URL for Video
console.log('🎥 Test 3: Generate Video Upload URL');
try {
  const videoUpload = bunnyDirectUpload.generateUploadUrl(
    'course-video.mp4',
    'video',
    'courses/videos'
  );
  
  console.log('✅ Video Upload URL generated:');
  console.log('   Upload URL:', videoUpload.uploadUrl);
  console.log('   Public URL:', videoUpload.fileUrl);
  console.log('');
} catch (error) {
  console.error('❌ Test 3 failed:', error.message);
}

// Test 4: Auto folder detection
console.log('📂 Test 4: Auto Folder Detection');
try {
  const folder1 = bunnyDirectUpload.getFolderPath('pdf', 'books');
  const folder2 = bunnyDirectUpload.getFolderPath('image', 'books');
  const folder3 = bunnyDirectUpload.getFolderPath('video', 'courses');
  
  console.log('✅ Folder paths:');
  console.log('   PDF in books:', folder1);
  console.log('   Image in books:', folder2);
  console.log('   Video in courses:', folder3);
  console.log('');
} catch (error) {
  console.error('❌ Test 4 failed:', error.message);
}

// Test 5: File size validation
console.log('📏 Test 5: File Size Validation');
try {
  const size1 = 50 * 1024 * 1024; // 50MB - should pass
  const size2 = 250 * 1024 * 1024; // 250MB - should fail
  
  bunnyDirectUpload.validateFileSize(size1, 200);
  console.log('✅ 50MB file: Valid');
  
  try {
    bunnyDirectUpload.validateFileSize(size2, 200);
    console.log('❌ 250MB file: Should have failed!');
  } catch (error) {
    console.log('✅ 250MB file: Correctly rejected');
  }
  console.log('');
} catch (error) {
  console.error('❌ Test 5 failed:', error.message);
}

// Test 6: Invalid file type
console.log('🚫 Test 6: Invalid File Type');
try {
  bunnyDirectUpload.generateUploadUrl('test.exe', 'exe', 'uploads');
  console.log('❌ Should have rejected .exe file!');
} catch (error) {
  console.log('✅ Correctly rejected invalid file type:', error.message);
  console.log('');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ All tests completed!');
console.log('');
console.log('📋 Next Steps:');
console.log('1. Start your backend server');
console.log('2. Test the endpoint: POST /api/upload/generate-url');
console.log('3. Use the returned uploadUrl to upload from frontend');
console.log('4. Send the fileUrl to backend when creating books');
console.log('');
console.log('📖 Read BUNNYCDN_DIRECT_UPLOAD_GUIDE.md for full documentation');
