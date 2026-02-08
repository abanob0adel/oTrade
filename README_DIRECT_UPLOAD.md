# 🚀 BunnyCDN Direct Upload System

## 📖 Overview

Complete implementation of **direct frontend-to-BunnyCDN upload system** that bypasses backend file handling to solve:
- ❌ Vercel 413 Payload Too Large errors
- ❌ Timeout issues with large files
- ✅ Fast, direct uploads
- ✅ Reduced server load
- ✅ Better user experience with real progress tracking

---

## 🏗️ Architecture

```
┌─────────────┐      1. Request Upload URL      ┌─────────────┐
│             │ ──────────────────────────────> │             │
│  Frontend   │                                  │   Backend   │
│             │ <────────────────────────────── │             │
└─────────────┘      2. Return Signed URL       └─────────────┘
       │                                                
       │ 3. Upload File Directly                       
       │                                                
       ▼                                                
┌─────────────┐                                        
│  BunnyCDN   │                                        
│   Storage   │                                        
└─────────────┘                                        
       │                                                
       │ 4. Send File URL to Backend                   
       │                                                
       ▼                                                
┌─────────────┐      5. Create Book Record      ┌─────────────┐
│  Frontend   │ ──────────────────────────────> │   Backend   │
│             │                                  │  (Database) │
└─────────────┘                                  └─────────────┘
```

---

## 📁 Project Structure

```
project/
├── src/
│   ├── utils/
│   │   ├── bunnycdn.js                    # Original upload utility (backup)
│   │   └── bunnyDirectUpload.js           # ✨ NEW: Direct upload utility
│   ├── controllers/
│   │   └── upload.controller.js           # ✨ UPDATED: Added generateUploadUrl
│   ├── routes/
│   │   └── upload.routes.js               # ✨ UPDATED: Added /generate-url route
│   └── modules/
│       └── books/
│           └── books.controller.js        # ✨ UPDATED: Accepts direct URLs
├── docs/
│   ├── BUNNYCDN_DIRECT_UPLOAD_GUIDE.md   # Complete English guide
│   ├── DIRECT_UPLOAD_SUMMARY_AR.md       # Arabic summary
│   └── README_DIRECT_UPLOAD.md           # This file
├── frontend-example-react.jsx             # Complete React component example
├── bunnycdn_direct_upload_postman.json   # Postman collection
└── test-direct-upload.js                  # Backend test script
```

---

## 🚀 Quick Start

### 1. Backend Setup

No additional dependencies needed! Everything uses existing packages.

### 2. Test the System

```bash
# Test the utility functions
node test-direct-upload.js

# Expected output:
# ✅ All tests completed!
```

### 3. Start Your Server

```bash
npm start
```

### 4. Test the API Endpoint

```bash
curl -X POST http://localhost:3000/api/upload/generate-url \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test-book.pdf",
    "fileType": "pdf",
    "category": "books"
  }'
```

---

## 📡 API Reference

### POST /api/upload/generate-url

Generate a signed upload URL for direct frontend upload.

**Authentication:** Required (JWT Bearer token)

**Request Body:**
```json
{
  "fileName": "my-book.pdf",
  "fileType": "pdf",
  "category": "books",
  "fileSize": 5242880,
  "folder": "books/files"
}
```

**Parameters:**
- `fileName` (required): Original filename
- `fileType` (required): File type (`pdf`, `image`, `video`, `jpg`, `png`, `mp4`, `mov`)
- `category` (optional): Category for auto folder detection (`books`, `courses`, `uploads`)
- `fileSize` (optional): File size in bytes (for validation, max 200MB)
- `folder` (optional): Custom folder path (overrides auto-detection)

**Response:**
```json
{
  "success": true,
  "message": "Upload URL generated successfully",
  "data": {
    "uploadUrl": "https://storage.bunnycdn.com/otrade/books/files/my-book-1234567890.pdf",
    "fileUrl": "https://otrade.b-cdn.net/books/files/my-book-1234567890.pdf",
    "fileName": "my-book-1234567890.pdf",
    "storagePath": "books/files/my-book-1234567890.pdf",
    "headers": {
      "AccessKey": "your-api-key",
      "Content-Type": "application/pdf"
    }
  }
}
```

---

## 💻 Frontend Implementation

### Simple Upload Function

```javascript
import axios from 'axios';

const uploadFileToBunny = async (file, fileType, category = 'books') => {
  try {
    // Step 1: Get upload URL from backend
    const { data } = await axios.post(
      '/api/upload/generate-url',
      {
        fileName: file.name,
        fileType,
        category,
        fileSize: file.size
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    const { uploadUrl, fileUrl, headers } = data.data;

    // Step 2: Upload directly to BunnyCDN
    await axios.put(uploadUrl, file, {
      headers: {
        'AccessKey': headers.AccessKey,
        'Content-Type': headers['Content-Type']
      },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload progress: ${percent}%`);
      }
    });

    // Step 3: Return public URL
    return fileUrl;

  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

// Usage
const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  const fileUrl = await uploadFileToBunny(file, 'pdf', 'books');
  console.log('File uploaded:', fileUrl);
};
```

### Complete React Component

See `frontend-example-react.jsx` for a full working example with:
- ✅ Cover image upload
- ✅ PDF upload
- ✅ Progress tracking
- ✅ Error handling
- ✅ Form validation
- ✅ Book creation

---

## 🔒 Security Features

### Backend Validation:
- ✅ JWT authentication required
- ✅ File type validation (whitelist only)
- ✅ File size validation (200MB max)
- ✅ Filename sanitization
- ✅ Unique filename generation

### Frontend Validation:
```javascript
// Validate file type
const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type');
}

// Validate file size (200MB)
if (file.size > 200 * 1024 * 1024) {
  throw new Error('File too large');
}
```

---

## 📂 Folder Structure

| File Type | Category | Auto Folder Path |
|-----------|----------|------------------|
| PDF | books | `books/files/` |
| Image | books | `books/covers/` |
| Video | books | `books/videos/` |
| PDF | courses | `courses/files/` |
| Image | courses | `courses/covers/` |
| Video | courses | `courses/videos/` |
| Any | uploads | `uploads/` |

You can override auto-detection by providing a custom `folder` parameter.

---

## 🧪 Testing

### Test Backend Utility

```bash
node test-direct-upload.js
```

### Test API with Postman

Import `bunnycdn_direct_upload_postman.json` into Postman and test:
1. Generate Upload URL
2. Upload File to BunnyCDN (direct)
3. Create Book with URLs

### Test with cURL

```bash
# Generate upload URL
curl -X POST http://localhost:3000/api/upload/generate-url \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.pdf","fileType":"pdf","category":"books"}'

# Upload to BunnyCDN (use uploadUrl from response)
curl -X PUT "UPLOAD_URL_FROM_RESPONSE" \
  -H "AccessKey: YOUR_API_KEY" \
  -H "Content-Type: application/pdf" \
  --data-binary "@test.pdf"
```

---

## ⚠️ Error Handling

### Common Errors

**401 Unauthorized:**
```javascript
// JWT token expired or invalid
// Solution: Refresh token or re-login
```

**400 Bad Request:**
```javascript
// Invalid file type or size
// Solution: Validate file before upload
```

**Network Error:**
```javascript
// Connection issue
// Solution: Check internet connection, retry upload
```

### Error Handling Example

```javascript
try {
  const fileUrl = await uploadFileToBunny(file, 'pdf', 'books');
} catch (error) {
  if (error.response?.status === 401) {
    alert('Session expired. Please login again.');
    // Redirect to login
  } else if (error.response?.status === 400) {
    alert('Invalid file: ' + error.response.data.message);
  } else if (error.code === 'ERR_NETWORK') {
    alert('Network error. Please check your connection.');
  } else {
    alert('Upload failed. Please try again.');
  }
}
```

---

## 🎯 Benefits

✅ **Solves Vercel 413 Error** - No file upload to backend  
✅ **Solves Timeout Issues** - Direct upload, no intermediary  
✅ **Faster Uploads** - Direct connection to CDN  
✅ **Real Progress Tracking** - Accurate upload progress  
✅ **Reduced Server Load** - No file processing on backend  
✅ **Scalable** - Handles millions of uploads  
✅ **Better UX** - Smooth upload experience  

---

## 📊 Comparison

| Feature | Old System | New System |
|---------|-----------|------------|
| Upload Path | Frontend → Backend → BunnyCDN | Frontend → BunnyCDN |
| Vercel 413 Error | ❌ Yes | ✅ No |
| Timeout Issues | ❌ Yes | ✅ No |
| Server Load | ❌ High | ✅ Minimal |
| Upload Speed | ⚠️ Slow | ✅ Fast |
| Progress Tracking | ⚠️ Inaccurate | ✅ Accurate |
| Max File Size | ⚠️ Limited | ✅ 200MB+ |

---

## 🔧 Environment Variables

Required in `.env`:

```env
BUNNY_STORAGE_ZONE=otrade
BUNNY_API_KEY=your-api-key-here
BUNNY_CDN_URL=https://otrade.b-cdn.net
```

---

## 📚 Documentation Files

- **BUNNYCDN_DIRECT_UPLOAD_GUIDE.md** - Complete English guide with examples
- **DIRECT_UPLOAD_SUMMARY_AR.md** - Arabic summary and quick reference
- **README_DIRECT_UPLOAD.md** - This file (overview and quick start)
- **frontend-example-react.jsx** - Complete React component example
- **bunnycdn_direct_upload_postman.json** - Postman collection for testing

---

## 🆘 Support

### Troubleshooting

1. **Upload fails with 401:**
   - Check JWT token validity
   - Verify token is sent in Authorization header

2. **Upload fails with 400:**
   - Check file type (must be pdf, image, or video)
   - Check file size (must be < 200MB)

3. **Network error:**
   - Check internet connection
   - Verify BunnyCDN API key in .env
   - Check CORS settings if needed

### Need Help?

- Check the logs in browser console
- Check backend logs for errors
- Review the complete guide: `BUNNYCDN_DIRECT_UPLOAD_GUIDE.md`
- Test with Postman collection

---

## 🎉 Success!

You now have a production-ready direct upload system that:
- ✅ Bypasses backend for file uploads
- ✅ Solves Vercel limitations
- ✅ Provides fast, reliable uploads
- ✅ Offers great user experience

**Happy uploading! 🚀**
