import path from 'path';

/**
 * 🚀 BunnyCDN Direct Upload Utility - High Performance
 * Handles 50MB-500MB files with zero backend processing
 * Architecture: Netflix/Udemy-style direct CDN upload
 */
class BunnyDirectUpload {
  constructor() {
    this.storageZone = process.env.BUNNY_STORAGE_ZONE;
    this.apiKey = process.env.BUNNY_API_KEY;
    this.cdnUrl = process.env.BUNNY_CDN_URL;
    this.storageEndpoint = 'storage.bunnycdn.com';
    
    if (!this.storageZone) throw new Error('❌ BUNNY_STORAGE_ZONE is required');
    if (!this.apiKey) throw new Error('❌ BUNNY_API_KEY is required');
    if (!this.cdnUrl) throw new Error('❌ BUNNY_CDN_URL is required');
    
    console.log('🚀 BunnyCDN Direct Upload Service Initialized');
    console.log(`   📦 Storage Zone: ${this.storageZone}`);
    console.log(`   🌐 CDN URL: ${this.cdnUrl}`);
  }

  /**
   * 🔐 Generate secure upload URL for direct frontend upload
   * @param {string} fileName - Original file name
   * @param {string} fileType - File type (pdf, image, video)
   * @param {string} category - Category (books, covers, courses)
   * @param {number} fileSize - File size in bytes
   * @returns {Object} - Upload configuration
   */
  generateUploadUrl(fileName, fileType, category, fileSize) {
    const startTime = Date.now();
    
    console.log('\n🔐 Generating Secure Upload URL');
    console.log(`   📄 File: ${fileName}`);
    console.log(`   📦 Size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   🏷️  Type: ${fileType}`);
    console.log(`   📂 Category: ${category}`);
    
    // Validate file type
    this._validateFileType(fileType);
    
    // Validate file size (500MB max)
    this._validateFileSize(fileSize, 500);
    
    // Generate unique filename with timestamp
    const uniqueFileName = this._generateUniqueFileName(fileName);
    
    // Determine storage folder
    const folder = this._getFolderPath(fileType, category);
    
    // Build storage path
    const storagePath = `${folder}/${uniqueFileName}`;
    
    // Build upload URL (direct to BunnyCDN Storage API)
    const uploadUrl = `https://${this.storageEndpoint}/${this.storageZone}/${storagePath}`;
    
    // Build public CDN URL
    const fileUrl = `${this.cdnUrl}/${storagePath}`;
    
    // Get content type
    const contentType = this._getContentType(fileType, fileName);
    
    const elapsed = Date.now() - startTime;
    
    console.log(`   ✅ Generated in ${elapsed}ms`);
    console.log(`   📁 Storage Path: ${storagePath}`);
    console.log(`   🔗 Upload URL: ${uploadUrl}`);
    console.log(`   🌐 Public URL: ${fileUrl}`);
    
    return {
      success: true,
      uploadUrl,
      fileUrl,
      storagePath,
      fileName: uniqueFileName,
      headers: {
        'AccessKey': this.apiKey,
        'Content-Type': contentType
      },
      metadata: {
        originalFileName: fileName,
        fileSize,
        fileType,
        category,
        folder,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * 🧹 Generate unique sanitized filename
   * @private
   */
  _generateUniqueFileName(fileName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(fileName).toLowerCase();
    const nameWithoutExt = path.basename(fileName, ext);
    
    // Sanitize: lowercase, remove special chars, replace spaces with hyphens
    const sanitized = nameWithoutExt
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50); // Limit length
    
    return `${sanitized}-${timestamp}-${random}${ext}`;
  }

  /**
   * 📂 Get folder path based on file type and category
   * @private
   */
  _getFolderPath(fileType, category) {
    const folderMap = {
      'pdf': {
        'books': 'books/files',
        'courses': 'courses/files',
        'default': 'documents'
      },
      'image': {
        'books': 'books/covers',
        'covers': 'books/covers',
        'courses': 'courses/covers',
        'default': 'images'
      },
      'video': {
        'books': 'books/videos',
        'courses': 'courses/videos',
        'default': 'videos'
      }
    };
    
    const typeMap = folderMap[fileType.toLowerCase()] || folderMap['pdf'];
    return typeMap[category] || typeMap['default'];
  }

  /**
   * 📋 Get content type
   * @private
   */
  _getContentType(fileType, fileName) {
    const ext = path.extname(fileName).toLowerCase();
    
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.webm': 'video/webm'
    };
    
    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * ✅ Validate file type
   * @private
   */
  _validateFileType(fileType) {
    const allowedTypes = ['pdf', 'image', 'video', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov'];
    
    if (!allowedTypes.includes(fileType.toLowerCase())) {
      throw new Error(
        `❌ Invalid file type: ${fileType}. Allowed types: ${allowedTypes.join(', ')}`
      );
    }
  }

  /**
   * 📏 Validate file size
   * @private
   */
  _validateFileSize(fileSize, maxSizeMB = 500) {
    if (!fileSize || fileSize <= 0) {
      throw new Error('❌ File size must be greater than 0');
    }
    
    const maxBytes = maxSizeMB * 1024 * 1024;
    const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
    
    if (fileSize > maxBytes) {
      throw new Error(
        `❌ File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`
      );
    }
    
    console.log(`   ✅ File size validated: ${fileSizeMB}MB (max: ${maxSizeMB}MB)`);
  }

  /**
   * 🔍 Extract storage path from CDN URL
   * @param {string} cdnUrl - Full CDN URL
   * @returns {string} - Storage path
   */
  extractStoragePath(cdnUrl) {
    try {
      const url = new URL(cdnUrl);
      return url.pathname.substring(1); // Remove leading slash
    } catch (error) {
      throw new Error(`❌ Invalid CDN URL: ${cdnUrl}`);
    }
  }

  /**
   * 📊 Get upload statistics
   * @param {number} fileSize - File size in bytes
   * @returns {Object} - Upload statistics
   */
  getUploadStats(fileSize) {
    const fileSizeMB = fileSize / 1024 / 1024;
    
    // Estimated upload time based on average CDN speed (50 Mbps)
    const estimatedSeconds = (fileSizeMB * 8) / 50;
    
    return {
      fileSizeMB: fileSizeMB.toFixed(2),
      estimatedUploadTime: `${Math.ceil(estimatedSeconds)}s`,
      recommendedChunkSize: fileSizeMB > 100 ? '10MB' : '5MB',
      maxRetries: 3
    };
  }
}

export default new BunnyDirectUpload();

