import axios from 'axios';
import path from 'path';
import fs from 'fs';

/**
 * 🐰 BunnyCDN Service - Production Ready
 * Handles file uploads to BunnyCDN Storage
 */
class BunnyCDNService {
  constructor() {
    this.storageZone = process.env.BUNNY_STORAGE_ZONE;
    this.apiKey = process.env.BUNNY_API_KEY;
    this.cdnUrl = process.env.BUNNY_CDN_URL;
    
    // Use default endpoint
this.storageEndpoint = 'storage.bunnycdn.com'; 
    
    if (!this.storageZone) throw new Error('BUNNY_STORAGE_ZONE is required');
    if (!this.apiKey) throw new Error('BUNNY_API_KEY is required');
    if (!this.cdnUrl) throw new Error('BUNNY_CDN_URL is required');
    
    console.log('🐰 BunnyCDN Service Initialized');
    console.log(`📦 Storage Zone: ${this.storageZone}`);
    console.log(`🔗 Storage Endpoint: https://${this.storageEndpoint}`);
    console.log(`🌐 CDN URL: ${this.cdnUrl}`);
  }

  /**
   * Upload file (image, PDF, video, etc.) to BunnyCDN
   */
  async uploadFile(fileInput, fileName, folder = '') {
    const maxRetries = 2;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const fileBuffer = await this._getFileBuffer(fileInput);
        this._validateFile(fileBuffer, fileName);
        
        const sanitizedFileName = this._generateUniqueFileName(fileName);
        const storagePath = folder ? `${folder}/${sanitizedFileName}` : sanitizedFileName;
        const uploadUrl = `https://${this.storageEndpoint}/${this.storageZone}/${storagePath}`;
        
        console.log(`[${new Date().toISOString()}] Attempt ${attempt}/${maxRetries}: Uploading ${fileName}`);
        console.log(`   📁 Storage Path: ${storagePath}`);
        console.log(`   📦 Size: ${(fileBuffer.length / 1024).toFixed(2)} KB`);
        console.log(`   🔗 URL: ${uploadUrl}`);
        
        const res = await axios.put(uploadUrl, fileBuffer, {
          headers: { 
            'AccessKey': this.apiKey, 
            'Content-Type': 'application/octet-stream' 
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          timeout: 600000,
        });

        if (res.status === 200 || res.status === 201) {
          const publicUrl = `${this.cdnUrl}/${storagePath}`;
          console.log(`   ✅ Upload Success: ${publicUrl}`);
          return publicUrl;
        }

        throw new Error(`Upload failed with status ${res.status}`);

      } catch (error) {
        lastError = error;
        
        console.error(`   ❌ Attempt ${attempt} failed: ${error.message}`);
        
        if (error.response?.status === 401) {
          throw new Error('❌ 401 Unauthorized: Check BUNNY_API_KEY');
        }
        if (error.code === 'ENOTFOUND') {
          throw new Error(`❌ Cannot resolve ${this.storageEndpoint}. Check internet`);
        }
        
        if (attempt < maxRetries) {
          console.log(`   🔄 Retrying in 2 seconds...`);
          await this._sleep(2000);
        }
      }
    }

    throw new Error(`Failed to upload '${fileName}' after ${maxRetries} attempts: ${lastError.message}`);
  }

  /**
   * Upload image to BunnyCDN
   */
  async uploadImage(fileInput, fileName, folder = 'images') {
    return await this.uploadFile(fileInput, fileName, folder);
  }

  /**
   * Upload PDF to BunnyCDN
   */
  async uploadPDF(fileInput, fileName, folder = 'books/files') {
    return await this.uploadFile(fileInput, fileName, folder);
  }

  /**
   * Upload video to BunnyCDN
   */
  async uploadVideo(fileInput, fileName, folder = 'videos') {
    return await this.uploadFile(fileInput, fileName, folder);
  }

  /**
   * Upload book cover to BunnyCDN
   */
  async uploadBookCover(fileInput, fileName) {
    return await this.uploadFile(fileInput, fileName, 'books/covers');
  }

  /**
   * Delete file from BunnyCDN
   */
  async deleteFile(filePath) {
    try {
      const deleteUrl = `https://${this.storageEndpoint}/${this.storageZone}/${filePath}`;
      console.log(`🗑️ Deleting: ${deleteUrl}`);
      
      const res = await axios.delete(deleteUrl, {
        headers: { 'AccessKey': this.apiKey },
        timeout: 30000,
      });

      console.log(`   ✅ Deleted successfully`);
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn(`   ⚠️ File not found (already deleted)`);
        return true;
      }
      throw new Error(`Failed to delete '${filePath}': ${error.message}`);
    }
  }

  /**
   * Delete file by CDN URL
   */
  async deleteFileByUrl(cdnUrl) {
    const filePath = this._extractPathFromUrl(cdnUrl);
    if (!filePath) throw new Error(`Invalid CDN URL: ${cdnUrl}`);
    return await this.deleteFile(filePath);
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files, folder = '') {
    console.log(`📤 Uploading ${files.length} files to ${folder || 'root'}`);
    const results = await Promise.all(
      files.map(file => this.uploadFile(file.buffer, file.originalname, folder))
    );
    console.log(`   ✅ All ${files.length} files uploaded`);
    return results;
  }

  /**
   * Test connection to BunnyCDN
   */
  async testConnection() {
    try {
      console.log('🧪 Testing BunnyCDN connection...');
      const testBuffer = Buffer.from('BunnyCDN test');
      const testFileName = `test-${Date.now()}.txt`;
      
      const publicUrl = await this.uploadFile(testBuffer, testFileName, 'test');
      console.log('   ✅ Upload test passed');
      
      const filePath = this._extractPathFromUrl(publicUrl);
      await this.deleteFile(filePath);
      console.log('   ✅ Delete test passed');
      
      console.log('\n✅ BunnyCDN connection successful!');
      return true;
    } catch (error) {
      console.error('\n❌ Connection test failed:', error.message);
      return false;
    }
  }

  async _getFileBuffer(fileInput) {
    if (Buffer.isBuffer(fileInput)) return fileInput;
    if (typeof fileInput === 'string') return fs.promises.readFile(fileInput);
    throw new Error('Invalid file input');
  }

  _validateFile(buffer, fileName) {
    if (!buffer || buffer.length === 0) throw new Error(`File is empty: ${fileName}`);
    const maxSize = 100 * 1024 * 1024;
    if (buffer.length > maxSize) throw new Error(`File exceeds 100MB: ${fileName}`);
  }

  _generateUniqueFileName(fileName) {
    const timestamp = Date.now();
    const ext = path.extname(fileName);
    const name = path.basename(fileName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '');
    return `${name}-${timestamp}${ext}`;
  }

  _extractPathFromUrl(cdnUrl) {
    if (!cdnUrl) return null;
    try {
      const urlObj = new URL(cdnUrl);
      return urlObj.pathname.substring(1);
    } catch (error) {
      return null;
    }
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new BunnyCDNService();
