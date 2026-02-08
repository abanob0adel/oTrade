import bunnyDirectUpload from '../utils/bunnyDirectUpload.js';

/**
 * 🚀 Generate Secure Upload URL for Direct Frontend Upload
 * POST /api/upload/generate-url
 * 
 * High-performance architecture: Frontend → BunnyCDN (direct)
 * Handles 50MB-500MB files with zero backend processing
 * Used by Netflix, Udemy, YouTube for large file uploads
 */
export const generateUploadUrl = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 GENERATE UPLOAD URL REQUEST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const { fileName, fileType, category, fileSize } = req.body;
    
    console.log('📥 Request Data:');
    console.log(`   User: ${req.auth?.id || 'Unknown'}`);
    console.log(`   File Name: ${fileName}`);
    console.log(`   File Type: ${fileType}`);
    console.log(`   Category: ${category}`);
    console.log(`   File Size: ${fileSize ? (fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'Not provided'}`);
    
    // ✅ VALIDATION 1: Required fields
    if (!fileName) {
      console.log('❌ Validation failed: fileName is required');
      return res.status(400).json({
        success: false,
        error: 'fileName is required',
        code: 'MISSING_FILE_NAME'
      });
    }
    
    if (!fileType) {
      console.log('❌ Validation failed: fileType is required');
      return res.status(400).json({
        success: false,
        error: 'fileType is required (pdf, image, video)',
        code: 'MISSING_FILE_TYPE'
      });
    }
    
    if (!category) {
      console.log('❌ Validation failed: category is required');
      return res.status(400).json({
        success: false,
        error: 'category is required (books, covers, courses)',
        code: 'MISSING_CATEGORY'
      });
    }
    
    if (!fileSize || fileSize <= 0) {
      console.log('❌ Validation failed: fileSize is required');
      return res.status(400).json({
        success: false,
        error: 'fileSize is required and must be greater than 0',
        code: 'INVALID_FILE_SIZE'
      });
    }
    
    // ✅ VALIDATION 2: File size (500MB max)
    const maxSizeMB = 500;
    const maxBytes = maxSizeMB * 1024 * 1024;
    const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
    
    if (fileSize > maxBytes) {
      console.log(`❌ File too large: ${fileSizeMB}MB (max: ${maxSizeMB}MB)`);
      return res.status(400).json({
        success: false,
        error: `File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
        code: 'FILE_TOO_LARGE',
        maxSize: `${maxSizeMB}MB`,
        providedSize: `${fileSizeMB}MB`
      });
    }
    
    console.log(`✅ File size validated: ${fileSizeMB}MB`);
    
    // ✅ VALIDATION 3: File type
    const allowedTypes = ['pdf', 'image', 'video', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov'];
    if (!allowedTypes.includes(fileType.toLowerCase())) {
      console.log(`❌ Invalid file type: ${fileType}`);
      return res.status(400).json({
        success: false,
        error: `Invalid file type: ${fileType}`,
        code: 'INVALID_FILE_TYPE',
        allowedTypes
      });
    }
    
    console.log(`✅ File type validated: ${fileType}`);
    
    // ✅ VALIDATION 4: Category
    const allowedCategories = ['books', 'covers', 'courses'];
    if (!allowedCategories.includes(category.toLowerCase())) {
      console.log(`❌ Invalid category: ${category}`);
      return res.status(400).json({
        success: false,
        error: `Invalid category: ${category}`,
        code: 'INVALID_CATEGORY',
        allowedCategories
      });
    }
    
    console.log(`✅ Category validated: ${category}`);
    
    // 🔐 Generate secure upload URL
    const uploadData = bunnyDirectUpload.generateUploadUrl(
      fileName,
      fileType,
      category,
      fileSize
    );
    
    // 📊 Get upload statistics
    const stats = bunnyDirectUpload.getUploadStats(fileSize);
    
    const elapsed = Date.now() - startTime;
    
    console.log(`✅ Upload URL generated successfully in ${elapsed}ms`);
    console.log(`📊 Estimated upload time: ${stats.estimatedUploadTime}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.status(200).json({
      success: true,
      message: 'Upload URL generated successfully',
      data: {
        uploadUrl: uploadData.uploadUrl,
        fileUrl: uploadData.fileUrl,
        fileName: uploadData.fileName,
        storagePath: uploadData.storagePath,
        headers: uploadData.headers
      },
      stats: {
        fileSizeMB: stats.fileSizeMB,
        estimatedUploadTime: stats.estimatedUploadTime,
        maxRetries: stats.maxRetries
      },
      instructions: {
        step1: 'Use uploadUrl to upload file directly to BunnyCDN',
        step2: 'Use PUT request with provided headers',
        step3: 'After successful upload, send fileUrl to backend',
        example: 'axios.put(uploadUrl, file, { headers })'
      },
      generatedIn: `${elapsed}ms`
    });
    
  } catch (error) {
    const elapsed = Date.now() - startTime;
    
    console.error('❌ Generate upload URL error:', error);
    console.error(`   Failed after ${elapsed}ms`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate upload URL',
      code: 'GENERATION_FAILED',
      generatedIn: `${elapsed}ms`
    });
  }
};

/**
 * Upload Book PDF Controller
 * Handles book PDF and cover image upload to BunnyCDN
 */
export const uploadBookPDF = async (req, res, next) => {
  try {
    const files = req.files;
    
    if (!files || (!files.file && !files.coverImage)) {
      return res.status(400).json({
        success: false,
        message: 'No files provided'
      });
    }

    const uploadResults = {};

    // Upload PDF file if provided
    if (files.file && files.file[0]) {
      const pdfFile = files.file[0];
      
      // Validate file type
      if (pdfFile.mimetype !== 'application/pdf') {
        return res.status(400).json({
          success: false,
          message: 'File must be a PDF'
        });
      }

      uploadResults.pdf = await bunnyCDN.uploadPDF(
        pdfFile.buffer,
        pdfFile.originalname
      );
    }

    // Upload cover image if provided
    if (files.coverImage && files.coverImage[0]) {
      const imageFile = files.coverImage[0];
      
      // Validate file type
      if (!imageFile.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          message: 'Cover must be an image'
        });
      }

      uploadResults.coverImage = await bunnyCDN.uploadBookCover(
        imageFile.buffer,
        imageFile.originalname
      );
    }

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      data: uploadResults
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Upload Image Controller
 * Handles single image upload to BunnyCDN
 */
export const uploadImage = async (req, res, next) => {
  try {
    const file = req.file;
    const folder = req.body.folder || 'images'; // Allow custom folder from request
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'File must be an image'
      });
    }

    const result = await bunnyCDN.uploadImage(
      file.buffer,
      file.originalname,
      folder
    );

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: result
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Upload Video Controller
 * Handles video upload to BunnyCDN
 */
export const uploadVideo = async (req, res, next) => {
  try {
    const file = req.file;
    const folder = req.body.folder || 'videos';
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    // Validate file type
    if (!file.mimetype.startsWith('video/')) {
      return res.status(400).json({
        success: false,
        message: 'File must be a video'
      });
    }

    const result = await bunnyCDN.uploadVideo(
      file.buffer,
      file.originalname,
      folder
    );

    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      data: result
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Delete File Controller
 * Handles file deletion from BunnyCDN
 */
export const deleteFile = async (req, res, next) => {
  try {
    const { url, path } = req.body;
    
    if (!url && !path) {
      return res.status(400).json({
        success: false,
        message: 'File URL or path is required'
      });
    }

    let result;
    
    if (url) {
      result = await bunnyCDN.deleteFileByUrl(url);
    } else {
      result = await bunnyCDN.deleteFile(path);
    }

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      data: result
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Upload Multiple Files Controller
 * Handles multiple file uploads to BunnyCDN
 */
export const uploadMultipleFiles = async (req, res, next) => {
  try {
    const files = req.files;
    const folder = req.body.folder || 'uploads';
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided'
      });
    }

    const results = await bunnyCDN.uploadMultipleFiles(files, folder);

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      data: results
    });

  } catch (error) {
    next(error);
  }
};
