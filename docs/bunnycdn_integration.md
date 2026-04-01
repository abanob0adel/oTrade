# BunnyCDN Integration Guide

## Overview
Complete BunnyCDN Storage integration for uploading and serving files (PDFs, images, videos) with fast CDN delivery.

## Configuration

### 1. Environment Variables
Add these to your `.env` file:

```env
BUNNY_STORAGE_ZONE=otrade
BUNNY_API_KEY=your_bunnycdn_api_key_here
BUNNY_STORAGE_ENDPOINT=storage.bunnycdn.com
BUNNY_CDN_URL=https://otrade.b-cdn.net
```

### 2. Get Your BunnyCDN API Key
1. Login to BunnyCDN Dashboard
2. Go to Storage → Your Storage Zone (otrade)
3. Copy the API Key (Password)
4. Add it to `.env` as `BUNNY_API_KEY`

## Folder Structure

```
src/
├── utils/
│   └── bunnycdn.js              # BunnyCDN service (main logic)
├── controllers/
│   └── upload.controller.js     # Upload controllers
├── routes/
│   └── upload.routes.js         # Upload routes
└── middlewares/
    └── upload.middleware.js     # Multer configuration
```

## API Endpoints

### 1. Upload Book (PDF + Cover Image)
```http
POST /api/upload/book
Content-Type: multipart/form-data

Fields:
- file: PDF file (required)
- coverImage: Image file (optional)
```

**Example Response:**
```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "data": {
    "pdf": {
      "success": true,
      "url": "https://otrade.b-cdn.net/books/pdfs/mybook-1234567890.pdf",
      "fileName": "mybook-1234567890.pdf",
      "path": "books/pdfs/mybook-1234567890.pdf",
      "size": 2048576
    },
    "coverImage": {
      "success": true,
      "url": "https://otrade.b-cdn.net/books/covers/cover-1234567890.jpg",
      "fileName": "cover-1234567890.jpg",
      "path": "books/covers/cover-1234567890.jpg",
      "size": 512000
    }
  }
}
```

### 2. Upload Single Image
```http
POST /api/upload/image
Content-Type: multipart/form-data

Fields:
- image: Image file (required)
- folder: Custom folder path (optional, default: 'images')
```

**Example Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "success": true,
    "url": "https://otrade.b-cdn.net/images/photo-1234567890.jpg",
    "fileName": "photo-1234567890.jpg",
    "path": "images/photo-1234567890.jpg",
    "size": 256000
  }
}
```

### 3. Upload Video
```http
POST /api/upload/video
Content-Type: multipart/form-data

Fields:
- video: Video file (required)
- folder: Custom folder path (optional, default: 'videos')
```

**Example Response:**
```json
{
  "success": true,
  "message": "Video uploaded successfully",
  "data": {
    "success": true,
    "url": "https://otrade.b-cdn.net/videos/tutorial-1234567890.mp4",
    "fileName": "tutorial-1234567890.mp4",
    "path": "videos/tutorial-1234567890.mp4",
    "size": 52428800
  }
}
```

### 4. Delete File
```http
DELETE /api/upload/delete
Content-Type: application/json

Body:
{
  "url": "https://otrade.b-cdn.net/books/pdfs/mybook-1234567890.pdf"
}
// OR
{
  "path": "books/pdfs/mybook-1234567890.pdf"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": {
    "success": true,
    "message": "File deleted successfully",
    "path": "books/pdfs/mybook-1234567890.pdf"
  }
}
```

### 5. Upload Multiple Files
```http
POST /api/upload/multiple
Content-Type: multipart/form-data

Fields:
- files: Multiple files (up to 10)
- folder: Custom folder path (optional)
```

## Usage Examples

### Frontend (JavaScript/React)

#### Upload Book with Cover
```javascript
const uploadBook = async (pdfFile, coverImage) => {
  const formData = new FormData();
  formData.append('file', pdfFile);
  formData.append('coverImage', coverImage);

  const response = await fetch('http://localhost:3000/api/upload/book', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}` // Add if using auth
    },
    body: formData
  });

  const result = await response.json();
  console.log('PDF URL:', result.data.pdf.url);
  console.log('Cover URL:', result.data.coverImage.url);
  return result;
};
```

#### Upload Single Image
```javascript
const uploadImage = async (imageFile, folder = 'images') => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('folder', folder);

  const response = await fetch('http://localhost:3000/api/upload/image', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  return result.data.url; // Direct CDN URL
};
```

#### Delete File
```javascript
const deleteFile = async (fileUrl) => {
  const response = await fetch('http://localhost:3000/api/upload/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: fileUrl })
  });

  return await response.json();
};
```

### Backend Integration Example

#### In Your Book Controller
```javascript
import bunnyCDN from '../utils/bunnycdn.js';

export const createBook = async (req, res, next) => {
  try {
    const { title, description, author } = req.body;
    const files = req.files;

    // Upload files to BunnyCDN
    let pdfUrl = null;
    let coverImageUrl = null;

    if (files.file && files.file[0]) {
      const pdfResult = await bunnyCDN.uploadFile(
        files.file[0].buffer,
        files.file[0].originalname,
        'books/pdfs'
      );
      pdfUrl = pdfResult.url;
    }

    if (files.coverImage && files.coverImage[0]) {
      const imageResult = await bunnyCDN.uploadFile(
        files.coverImage[0].buffer,
        files.coverImage[0].originalname,
        'books/covers'
      );
      coverImageUrl = imageResult.url;
    }

    // Save to database
    const book = await Book.create({
      title,
      description,
      author,
      pdfUrl,
      coverImageUrl
    });

    res.status(201).json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Delete files from BunnyCDN
    if (book.pdfUrl) {
      await bunnyCDN.deleteFileByUrl(book.pdfUrl);
    }
    if (book.coverImageUrl) {
      await bunnyCDN.deleteFileByUrl(book.coverImageUrl);
    }

    // Delete from database
    await book.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
```

## Features

✅ **Upload Files**: PDF, images, videos (up to 100MB)  
✅ **Fast CDN Delivery**: Files served via BunnyCDN edge network  
✅ **Unique Filenames**: Automatic timestamp-based naming to avoid conflicts  
✅ **Delete Files**: Remove files from storage  
✅ **Multiple Uploads**: Batch upload support  
✅ **Error Handling**: Comprehensive error messages  
✅ **Production Ready**: Clean, ES6, async/await  
✅ **Environment Config**: All settings via .env  

## File Size Limits

- Images: 5MB (configurable in `upload.middleware.js`)
- PDFs: 10MB (configurable)
- Videos: 100MB (configurable)
- Mixed uploads: 100MB (configurable)

To change limits, edit `src/middlewares/upload.middleware.js`:

```javascript
const uploadVideos = multer({ 
  storage: storage,
  fileFilter: videoFilter,
  limits: {
    fileSize: 200 * 1024 * 1024 // Change to 200MB
  }
});
```

## Folder Organization

Recommended folder structure in BunnyCDN:

```
otrade/
├── books/
│   ├── pdfs/
│   └── covers/
├── images/
│   ├── articles/
│   ├── courses/
│   └── general/
├── videos/
│   ├── courses/
│   └── webinars/
└── uploads/
```

## Security Notes

1. **API Key**: Keep your `BUNNY_API_KEY` secret and never commit to Git
2. **Authentication**: Add auth middleware to upload routes in production
3. **File Validation**: Multer filters validate file types before upload
4. **Rate Limiting**: Consider adding rate limiting for upload endpoints
5. **CORS**: Configure CORS properly for your frontend domain

## Troubleshooting

### Upload fails with 401 Unauthorized
- Check your `BUNNY_API_KEY` is correct
- Verify the API key has write permissions

### Files upload but CDN URL doesn't work
- Check your `BUNNY_CDN_URL` matches your Pull Zone URL
- Verify the Pull Zone is connected to your Storage Zone
- Wait a few seconds for CDN propagation

### Large files fail to upload
- Increase file size limits in `upload.middleware.js`
- Check your server's body parser limits
- Verify BunnyCDN storage has enough space

## Migration from Cloudinary

To migrate from Cloudinary to BunnyCDN:

1. Replace Cloudinary upload calls with BunnyCDN service
2. Update database URLs from Cloudinary to BunnyCDN
3. Optionally migrate existing files using a script
4. Update frontend to use new CDN URLs

Example migration script:
```javascript
import bunnyCDN from './utils/bunnycdn.js';
import Book from './modules/books/book.model.js';
import axios from 'axios';

const migrateBooks = async () => {
  const books = await Book.find({ pdfUrl: { $exists: true } });
  
  for (const book of books) {
    if (book.pdfUrl.includes('cloudinary')) {
      // Download from Cloudinary
      const response = await axios.get(book.pdfUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);
      
      // Upload to BunnyCDN
      const result = await bunnyCDN.uploadFile(buffer, `${book.title}.pdf`, 'books/pdfs');
      
      // Update database
      book.pdfUrl = result.url;
      await book.save();
      
      console.log(`Migrated: ${book.title}`);
    }
  }
};
```

## Performance Tips

1. **Use CDN URLs directly**: Store and serve CDN URLs, not storage URLs
2. **Enable caching**: BunnyCDN automatically caches files at edge locations
3. **Optimize images**: Compress images before upload for faster delivery
4. **Use appropriate folders**: Organize files for better management
5. **Clean up unused files**: Regularly delete old/unused files to save storage

## Support

For BunnyCDN-specific issues:
- BunnyCDN Documentation: https://docs.bunny.net/
- BunnyCDN Support: https://support.bunny.net/

For integration issues:
- Check the error logs in your console
- Verify environment variables are loaded
- Test with Postman/Insomnia first
