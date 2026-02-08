# 🚀 BunnyCDN Quick Reference

## 📦 What You Got

### Core Files
- `src/utils/bunnycdn.js` - Main service (upload, delete, multiple files)
- `src/controllers/upload.controller.js` - Ready-to-use controllers
- `src/routes/upload.routes.js` - API endpoints
- `src/middlewares/upload.middleware.js` - Multer config (updated)

### Documentation
- `BUNNYCDN_SETUP.md` - Quick start guide
- `docs/bunnycdn_integration.md` - Complete documentation
- `bunnycdn_postman_collection.json` - Postman tests
- `src/modules/books/books.controller.bunnycdn.example.js` - Integration example

## ⚡ Quick Start (3 Steps)

### 1. Add API Key to `.env`
```env
BUNNY_API_KEY=your_actual_api_key_here
```

### 2. Start Server
```bash
npm run dev
```

### 3. Test Upload
```bash
# Using curl
curl -X POST http://localhost:3000/api/upload/image \
  -F "image=@/path/to/image.jpg"
```

## 🎯 Common Use Cases

### Upload Book PDF + Cover
```javascript
import bunnyCDN from '../utils/bunnycdn.js';

// In your controller
const pdfResult = await bunnyCDN.uploadFile(
  req.files.file[0].buffer,
  req.files.file[0].originalname,
  'books/pdfs'
);

const coverResult = await bunnyCDN.uploadFile(
  req.files.coverImage[0].buffer,
  req.files.coverImage[0].originalname,
  'books/covers'
);

// Save URLs to database
book.pdfUrl = pdfResult.url;
book.coverImageUrl = coverResult.url;
```

### Upload Image
```javascript
const result = await bunnyCDN.uploadFile(
  imageBuffer,
  'photo.jpg',
  'images/articles'
);

console.log(result.url); // https://otrade.b-cdn.net/images/articles/photo-1234567890.jpg
```

### Upload Video
```javascript
const result = await bunnyCDN.uploadFile(
  videoBuffer,
  'tutorial.mp4',
  'videos/courses'
);

console.log(result.url); // https://otrade.b-cdn.net/videos/courses/tutorial-1234567890.mp4
```

### Delete File
```javascript
// By URL
await bunnyCDN.deleteFileByUrl('https://otrade.b-cdn.net/books/pdfs/mybook-123.pdf');

// By path
await bunnyCDN.deleteFile('books/pdfs/mybook-123.pdf');
```

### Upload Multiple Files
```javascript
const results = await bunnyCDN.uploadMultipleFiles(
  req.files, // Array of files from multer
  'uploads'
);

results.forEach(result => {
  console.log(result.url);
});
```

## 📡 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/upload/book` | POST | Upload book PDF + cover |
| `/api/upload/image` | POST | Upload single image |
| `/api/upload/video` | POST | Upload video |
| `/api/upload/multiple` | POST | Upload multiple files |
| `/api/upload/delete` | DELETE | Delete file |

## 🔧 BunnyCDN Service Methods

```javascript
import bunnyCDN from './utils/bunnycdn.js';

// Upload file
const result = await bunnyCDN.uploadFile(buffer, filename, folder);
// Returns: { success, url, fileName, path, size }

// Delete file by path
await bunnyCDN.deleteFile('books/pdfs/file.pdf');

// Delete file by URL
await bunnyCDN.deleteFileByUrl('https://otrade.b-cdn.net/books/pdfs/file.pdf');

// Upload multiple files
const results = await bunnyCDN.uploadMultipleFiles(filesArray, folder);

// Extract path from URL
const path = bunnyCDN.extractPathFromUrl('https://otrade.b-cdn.net/books/pdfs/file.pdf');
// Returns: 'books/pdfs/file.pdf'
```

## 📁 Folder Structure

```
otrade/  (Your Storage Zone)
├── books/
│   ├── pdfs/          ← Book PDFs
│   └── covers/        ← Book covers
├── images/
│   ├── articles/      ← Article images
│   ├── courses/       ← Course images
│   └── general/       ← General images
├── videos/
│   ├── courses/       ← Course videos
│   └── webinars/      ← Webinar videos
└── uploads/           ← General uploads
```

## 🎨 Frontend Examples

### React Upload Component
```jsx
const UploadBook = () => {
  const [pdf, setPdf] = useState(null);
  const [cover, setCover] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', pdf);
    formData.append('coverImage', cover);

    const response = await fetch('http://localhost:3000/api/upload/book', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    console.log('PDF URL:', result.data.pdf.url);
    console.log('Cover URL:', result.data.coverImage.url);
  };

  return (
    <div>
      <input type="file" accept=".pdf" onChange={(e) => setPdf(e.target.files[0])} />
      <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};
```

### Vanilla JavaScript
```javascript
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', 'articles');

  const response = await fetch('http://localhost:3000/api/upload/image', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  return result.data.url;
};
```

## 🔒 Add Authentication

In `src/routes/upload.routes.js`:

```javascript
import { authenticate } from '../middlewares/auth.middleware.js';

// Add to routes
router.post('/book', authenticate, uploadBooks, uploadBookPDF);
router.post('/image', authenticate, upload.single('image'), uploadImage);
router.delete('/delete', authenticate, deleteFile);
```

## ⚙️ Configuration

### File Size Limits
Edit `src/middlewares/upload.middleware.js`:

```javascript
const uploadVideos = multer({ 
  storage: storage,
  fileFilter: videoFilter,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB
  }
});
```

### Environment Variables
```env
BUNNY_STORAGE_ZONE=otrade
BUNNY_API_KEY=your_api_key
BUNNY_STORAGE_ENDPOINT=storage.bunnycdn.com
BUNNY_CDN_URL=https://otrade.b-cdn.net
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "BUNNY_API_KEY is required" | Add API key to `.env` |
| 401 Unauthorized | Check API key is correct |
| CDN URL doesn't load | Wait 10-30 seconds for propagation |
| File too large | Increase limit in `upload.middleware.js` |
| Upload fails | Check storage zone name matches |

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "success": true,
    "url": "https://otrade.b-cdn.net/books/pdfs/mybook-1234567890.pdf",
    "fileName": "mybook-1234567890.pdf",
    "path": "books/pdfs/mybook-1234567890.pdf",
    "size": 2048576
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "No files provided"
}
```

## 🔄 Replace Cloudinary

### Before (Cloudinary)
```javascript
import { uploadImage } from '../../utils/cloudinary.js';

const imageUrl = await uploadImage(req.files.image[0], 'books');
```

### After (BunnyCDN)
```javascript
import bunnyCDN from '../../utils/bunnycdn.js';

const result = await bunnyCDN.uploadFile(
  req.files.image[0].buffer,
  req.files.image[0].originalname,
  'books/covers'
);
const imageUrl = result.url;
```

## 🎯 Key Differences from Cloudinary

| Feature | Cloudinary | BunnyCDN |
|---------|-----------|----------|
| Upload | `uploadImage(file, folder)` | `uploadFile(buffer, name, folder)` |
| Return | URL string | Object with url, path, size |
| Delete | By public_id | By URL or path |
| Folders | Automatic | Manual organization |
| Transformations | Built-in | Manual (use image processing) |
| Speed | Fast | Faster (edge network) |
| Cost | Higher | Lower |

## 📚 Full Documentation

- **Setup Guide**: `BUNNYCDN_SETUP.md`
- **Complete Docs**: `docs/bunnycdn_integration.md`
- **Integration Example**: `src/modules/books/books.controller.bunnycdn.example.js`
- **Postman Collection**: `bunnycdn_postman_collection.json`

## ✅ Checklist

- [ ] Add `BUNNY_API_KEY` to `.env`
- [ ] Verify `BUNNY_CDN_URL` is correct
- [ ] Test upload with Postman
- [ ] Integrate with your controllers
- [ ] Add authentication to routes
- [ ] Test file deletion
- [ ] Update frontend to use new URLs
- [ ] Deploy and enjoy!

---

**Need Help?** Check the full documentation or test with the Postman collection!
