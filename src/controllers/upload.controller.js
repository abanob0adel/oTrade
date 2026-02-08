import bunnyCDN from '../utils/bunnycdn.js';

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
