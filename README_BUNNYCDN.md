# 🐰 BunnyCDN Integration - Complete Package

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [What's Included](#whats-included)
3. [Documentation](#documentation)
4. [Features](#features)
5. [API Reference](#api-reference)
6. [Integration Examples](#integration-examples)
7. [Migration from Cloudinary](#migration-from-cloudinary)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### 1. Add Your API Key

Edit `.env`:
```env
BUNNY_API_KEY=your_actual_api_key_here
```

Get your API key from: https://dash.bunny.net/ → Storage → otrade → Password

### 2. Start Server

```bash
npm run dev
```

### 3. Test Upload

```bash
curl -X POST http://localhost:3000/api/upload/image \
  -F "image=@test.jpg"
```

**That's it!** You're ready to use BunnyCDN.

---

## 📦 What's Included

### Core Files

```
src/
├── utils/
│   └── bunnycdn.js                    # Main service (upload, delete)
├── controllers/
│   └── upload.controller.js           # Upload controllers
├── routes/
│   └── upload.routes.js               # API endpoints
├── middlewares/
│   └── upload.middleware.js           # Multer config (updated)
└── scripts/
    └── migrate-to-bunnycdn.js         # Migration script

docs/
├── bunnycdn_integration.md            # Complete documentation
├── bunnycdn_architecture.md           # System architecture
└── migration_guide.md                 # Migration guide

Root Files:
├── BUNNYCDN_SETUP.md                  # Quick setup guide
├── BUNNYCDN_QUICK_REFERENCE.md        # Quick reference
├── BUNNYCDN_IMPLEMENTATION_SUMMARY.md # Implementation summary
└── bunnycdn_postman_collection.json   # Postman tests
```

### Example Files

```
src/modules/books/
└── books.controller.bunnycdn.example.js  # Integration example
```

---

## 📚 Documentation

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **BUNNYCDN_SETUP.md** | Quick start guide | First time setup |
| **BUNNYCDN_QUICK_REFERENCE.md** | Quick reference | Daily development |
| **docs/bunnycdn_integration.md** | Complete docs | Detailed information |
| **docs/bunnycdn_architecture.md** | System design | Understanding architecture |
| **docs/migration_guide.md** | Migration guide | Moving from Cloudinary |
| **BUNNYCDN_IMPLEMENTATION_SUMMARY.md** | Summary | Overview of implementation |

---

## ✨ Features

### Upload Capabilities

✅ **Multiple File Types**
- PDFs (up to 100MB)
- Images (JPG, PNG, GIF, WebP)
- Videos (MP4, MOV, AVI, etc.)
- Any file type supported

✅ **Upload Methods**
- Single file upload
- Multiple files at once
- Book with PDF + cover image
- Batch processing

✅ **Smart Features**
- Automatic unique filenames
- Organized folder structure
- Memory-efficient processing
- Error handling

### CDN Delivery

✅ **Fast Global Delivery**
- Edge network distribution
- Automatic caching
- Low latency worldwide
- High availability

✅ **File Management**
- Delete by URL or path
- Update files
- Organized storage
- Easy access

### Production Ready

✅ **Enterprise Features**
- Environment-based config
- Comprehensive error handling
- Async/await patterns
- Clean ES6 code
- Scalable architecture

---

## 📡 API Reference

### Upload Book (PDF + Cover)

```http
POST /api/upload/book
Content-Type: multipart/form-data

Fields:
- file: PDF file (required)
- coverImage: Image file (optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pdf": {
      "url": "https://otrade.b-cdn.net/books/pdfs/book-123.pdf",
      "fileName": "book-123.pdf",
      "path": "books/pdfs/book-123.pdf",
      "size": 2048576
    },
    "coverImage": {
      "url": "https://otrade.b-cdn.net/books/covers/cover-123.jpg",
      "fileName": "cover-123.jpg",
      "path": "books/covers/cover-123.jpg",
      "size": 512000
    }
  }
}
```

### Upload Image

```http
POST /api/upload/image
Content-Type: multipart/form-data

Fields:
- image: Image file (required)
- folder: Folder path (optional, default: 'images')
```

### Upload Video

```http
POST /api/upload/video
Content-Type: multipart/form-data

Fields:
- video: Video file (required)
- folder: Folder path (optional, default: 'videos')
```

### Delete File

```http
DELETE /api/upload/delete
Content-Type: application/json

Body:
{
  "url": "https://otrade.b-cdn.net/books/pdfs/book-123.pdf"
}
```

**See full API documentation in `docs/bunnycdn_integration.md`**

---

## 💻 Integration Examples

### Basic Upload in Controller

```javascript
import bunnyCDN from '../../utils/bunnycdn.js';

export const createBook = async (req, res) => {
  try {
    // Upload PDF
    const pdfResult = await bunnyCDN.uploadFile(
      req.files.file[0].buffer,
      req.files.file[0].originalname,
      'books/pdfs'
    );

    // Upload cover image
    const coverResult = await bunnyCDN.uploadFile(
      req.files.coverImage[0].buffer,
      req.files.coverImage[0].originalname,
      'books/covers'
    );

    // Save to database
    const book = await Book.create({
      title: req.body.title,
      pdfUrl: pdfResult.url,
      coverImageUrl: coverResult.url
    });

    res.json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Delete File When Deleting Resource

```javascript
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    // Delete files from BunnyCDN
    if (book.pdfUrl) {
      await bunnyCDN.deleteFileByUrl(book.pdfUrl);
    }
    if (book.coverImageUrl) {
      await bunnyCDN.deleteFileByUrl(book.coverImageUrl);
    }

    // Delete from database
    await book.deleteOne();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Frontend Upload (React)

```jsx
const UploadBook = () => {
  const handleUpload = async (pdfFile, coverFile) => {
    const formData = new FormData();
    formData.append('file', pdfFile);
    formData.append('coverImage', coverFile);

    const response = await fetch('/api/upload/book', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    console.log('PDF URL:', result.data.pdf.url);
    console.log('Cover URL:', result.data.coverImage.url);
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleUpload(pdfFile, coverFile);
    }}>
      <input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files[0])} />
      <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} />
      <button type="submit">Upload</button>
    </form>
  );
};
```

**See complete examples in `src/modules/books/books.controller.bunnycdn.example.js`**

---

## 🔄 Migration from Cloudinary

### Automated Migration

Use the migration script to automatically migrate all files:

```bash
# Test migration (dry run)
export DRY_RUN=true
node src/scripts/migrate-to-bunnycdn.js

# Actual migration
export DRY_RUN=false
node src/scripts/migrate-to-bunnycdn.js
```

**Features:**
- Batch processing
- Progress tracking
- Error handling
- Database updates
- Detailed logging

### Manual Migration

For individual files:

```javascript
import bunnyCDN from './utils/bunnycdn.js';
import axios from 'axios';

// Download from Cloudinary
const response = await axios.get(cloudinaryUrl, {
  responseType: 'arraybuffer'
});
const buffer = Buffer.from(response.data);

// Upload to BunnyCDN
const result = await bunnyCDN.uploadFile(buffer, 'filename.pdf', 'books/pdfs');

// Update database
book.pdfUrl = result.url;
await book.save();
```

**See complete migration guide in `docs/migration_guide.md`**

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "BUNNY_API_KEY is required" | Add API key to `.env` file |
| 401 Unauthorized | Verify API key is correct |
| CDN URL doesn't load | Wait 10-30 seconds for propagation |
| File too large | Increase limits in `upload.middleware.js` |
| Upload fails | Check storage zone name is correct |

### Debug Mode

Enable detailed logging:

```javascript
// In src/utils/bunnycdn.js
console.log('Upload URL:', uploadUrl);
console.log('File size:', fileBuffer.length);
console.log('Response:', response.status);
```

### Test Connection

```bash
# Test BunnyCDN API directly
curl -X PUT \
  -H "AccessKey: your_api_key" \
  -H "Content-Type: application/octet-stream" \
  --data-binary "@test.jpg" \
  "https://storage.bunnycdn.com/otrade/test.jpg"
```

---

## 🎯 Key Differences from Cloudinary

| Feature | Cloudinary | BunnyCDN |
|---------|-----------|----------|
| **Upload** | `uploadImage(file, folder)` | `uploadFile(buffer, name, folder)` |
| **Return** | URL string | Object with url, path, size |
| **Delete** | By public_id | By URL or path |
| **Folders** | Automatic | Manual organization |
| **Transformations** | Built-in | Manual (use image processing) |
| **Speed** | Fast | Faster (edge network) |
| **Cost** | Higher | Lower |
| **Pricing** | Complex tiers | Simple pay-as-you-go |

---

## 📊 File Organization

Files are automatically organized in BunnyCDN:

```
otrade/  (Storage Zone)
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

---

## ⚙️ Configuration

### Environment Variables

```env
BUNNY_STORAGE_ZONE=otrade
BUNNY_API_KEY=your_api_key_here
BUNNY_STORAGE_ENDPOINT=storage.bunnycdn.com
BUNNY_CDN_URL=https://otrade.b-cdn.net
```

### File Size Limits

Edit `src/middlewares/upload.middleware.js`:

```javascript
const uploadVideos = multer({ 
  limits: {
    fileSize: 200 * 1024 * 1024 // Change to 200MB
  }
});
```

### Add Authentication

Edit `src/routes/upload.routes.js`:

```javascript
import { authenticate } from '../middlewares/auth.middleware.js';

router.post('/book', authenticate, uploadBooks, uploadBookPDF);
```

---

## 🎉 Benefits

### Cost Savings
- **Lower storage costs** compared to Cloudinary
- **Cheaper bandwidth** for file delivery
- **No surprise bills** with predictable pricing

### Performance
- **Faster delivery** via global edge network
- **Lower latency** for end users
- **Better caching** at edge locations

### Control
- **Direct storage access** via API
- **Flexible organization** with folders
- **Simple integration** with existing code

---

## 📈 Next Steps

1. ✅ **Setup Complete** - Add API key and test
2. 📖 **Read Documentation** - Check detailed guides
3. 🔧 **Integrate** - Add to your controllers
4. 🧪 **Test** - Use Postman collection
5. 🚀 **Deploy** - Push to production
6. 📊 **Monitor** - Check BunnyCDN dashboard

---

## 📚 Additional Resources

### Documentation Files
- `BUNNYCDN_SETUP.md` - Quick start
- `BUNNYCDN_QUICK_REFERENCE.md` - Quick reference
- `docs/bunnycdn_integration.md` - Complete docs
- `docs/bunnycdn_architecture.md` - Architecture
- `docs/migration_guide.md` - Migration guide

### Test Files
- `bunnycdn_postman_collection.json` - Postman tests

### Example Files
- `src/modules/books/books.controller.bunnycdn.example.js` - Integration example

### External Links
- [BunnyCDN Documentation](https://docs.bunny.net/)
- [BunnyCDN Dashboard](https://dash.bunny.net/)
- [BunnyCDN Support](https://support.bunny.net/)

---

## ✅ Checklist

- [ ] Add `BUNNY_API_KEY` to `.env`
- [ ] Verify `BUNNY_CDN_URL` is correct
- [ ] Test upload with Postman
- [ ] Integrate with your controllers
- [ ] Add authentication to routes
- [ ] Test file deletion
- [ ] Update frontend to use new URLs
- [ ] Run migration script (if needed)
- [ ] Test in production
- [ ] Monitor BunnyCDN usage

---

## 🎊 You're All Set!

Your BunnyCDN integration is complete and ready to use. Start uploading files and enjoy fast, affordable CDN delivery!

**Questions?** Check the documentation files or test with the Postman collection.

**Need Help?** All examples and patterns are in the documentation.

**Ready to Deploy?** Make sure to add authentication in production!

---

**Made with ❤️ for fast, affordable file delivery**
