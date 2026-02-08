# 🚀 BunnyCDN Integration - Quick Start

## ✅ What's Been Created

### Files Created:
```
src/
├── utils/bunnycdn.js              # Main BunnyCDN service
├── controllers/upload.controller.js   # Upload controllers
├── routes/upload.routes.js        # API routes
└── middlewares/upload.middleware.js   # Updated with video support

docs/
└── bunnycdn_integration.md        # Complete documentation

.env                               # Updated with BunnyCDN config
```

## 🔧 Setup Steps

### 1. Add Your BunnyCDN API Key

Open `.env` and replace `your_bunnycdn_api_key_here` with your actual API key:

```env
BUNNY_API_KEY=your_actual_api_key_from_bunnycdn_dashboard
```

**How to get your API key:**
1. Login to https://dash.bunny.net/
2. Go to **Storage** → **otrade** (your storage zone)
3. Copy the **Password** (this is your API key)
4. Paste it in `.env`

### 2. Verify CDN URL

Make sure your Pull Zone URL is correct in `.env`:

```env
BUNNY_CDN_URL=https://otrade.b-cdn.net
```

If you have a custom domain, use that instead.

### 3. Test the Integration

Start your server:
```bash
npm run dev
```

## 📡 API Endpoints Ready to Use

### Upload Book PDF + Cover
```bash
POST http://localhost:3000/api/upload/book
```

### Upload Image
```bash
POST http://localhost:3000/api/upload/image
```

### Upload Video
```bash
POST http://localhost:3000/api/upload/video
```

### Delete File
```bash
DELETE http://localhost:3000/api/upload/delete
```

## 🧪 Test with Postman

### Example 1: Upload Book
1. Create new POST request: `http://localhost:3000/api/upload/book`
2. Go to **Body** → **form-data**
3. Add fields:
   - `file` (File) → Select a PDF
   - `coverImage` (File) → Select an image
4. Click **Send**

**Expected Response:**
```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "data": {
    "pdf": {
      "url": "https://otrade.b-cdn.net/books/pdfs/mybook-1234567890.pdf",
      "fileName": "mybook-1234567890.pdf",
      "path": "books/pdfs/mybook-1234567890.pdf",
      "size": 2048576
    },
    "coverImage": {
      "url": "https://otrade.b-cdn.net/books/covers/cover-1234567890.jpg",
      "fileName": "cover-1234567890.jpg",
      "path": "books/covers/cover-1234567890.jpg",
      "size": 512000
    }
  }
}
```

### Example 2: Upload Image
1. Create new POST request: `http://localhost:3000/api/upload/image`
2. Go to **Body** → **form-data**
3. Add fields:
   - `image` (File) → Select an image
   - `folder` (Text) → `articles` (optional)
4. Click **Send**

### Example 3: Delete File
1. Create new DELETE request: `http://localhost:3000/api/upload/delete`
2. Go to **Body** → **raw** → **JSON**
3. Add:
```json
{
  "url": "https://otrade.b-cdn.net/books/pdfs/mybook-1234567890.pdf"
}
```
4. Click **Send**

## 💻 Frontend Integration Example

### React/JavaScript
```javascript
const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', 'articles');

  try {
    const response = await fetch('http://localhost:3000/api/upload/image', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('File URL:', result.data.url);
      // Use result.data.url in your app
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

## 🔄 Integrate with Existing Controllers

### Example: Update Books Controller

```javascript
// src/modules/books/books.controller.js
import bunnyCDN from '../../utils/bunnycdn.js';

export const createBook = async (req, res, next) => {
  try {
    const { title, description, author } = req.body;
    const files = req.files;

    let pdfUrl = null;
    let coverImageUrl = null;

    // Upload to BunnyCDN
    if (files.file && files.file[0]) {
      const result = await bunnyCDN.uploadFile(
        files.file[0].buffer,
        files.file[0].originalname,
        'books/pdfs'
      );
      pdfUrl = result.url;
    }

    if (files.coverImage && files.coverImage[0]) {
      const result = await bunnyCDN.uploadFile(
        files.coverImage[0].buffer,
        files.coverImage[0].originalname,
        'books/covers'
      );
      coverImageUrl = result.url;
    }

    // Save to database
    const book = await Book.create({
      title,
      description,
      author,
      pdfUrl,
      coverImageUrl
    });

    res.status(201).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};
```

## 📁 Folder Structure in BunnyCDN

Your files will be organized like this:

```
otrade/  (Storage Zone)
├── books/
│   ├── pdfs/
│   │   └── mybook-1234567890.pdf
│   └── covers/
│       └── cover-1234567890.jpg
├── images/
│   ├── articles/
│   ├── courses/
│   └── general/
├── videos/
│   ├── courses/
│   └── webinars/
└── uploads/
```

## ⚙️ Configuration Options

### Change File Size Limits

Edit `src/middlewares/upload.middleware.js`:

```javascript
const uploadVideos = multer({ 
  storage: storage,
  fileFilter: videoFilter,
  limits: {
    fileSize: 200 * 1024 * 1024 // Change to 200MB
  }
});
```

### Add Authentication

Add auth middleware to routes in `src/routes/upload.routes.js`:

```javascript
import { authenticate } from '../middlewares/auth.middleware.js';

router.post('/book', authenticate, uploadBooks, uploadBookPDF);
router.post('/image', authenticate, upload.single('image'), uploadImage);
```

## 🎯 Key Features

✅ Upload PDFs, images, videos (up to 100MB)  
✅ Fast CDN delivery worldwide  
✅ Automatic unique filenames  
✅ Delete files from storage  
✅ Multiple file uploads  
✅ Clean error handling  
✅ Production-ready code  
✅ Environment-based config  

## 🐛 Troubleshooting

### "BUNNY_API_KEY is required"
→ Add your API key to `.env` file

### Upload works but CDN URL doesn't load
→ Wait 10-30 seconds for CDN propagation  
→ Check your Pull Zone is connected to Storage Zone

### 401 Unauthorized error
→ Verify API key is correct  
→ Check API key has write permissions

### File too large error
→ Increase limits in `upload.middleware.js`

## 📚 Full Documentation

See `docs/bunnycdn_integration.md` for:
- Complete API reference
- Advanced usage examples
- Migration from Cloudinary
- Performance tips
- Security best practices

## 🎉 You're Ready!

1. ✅ Add your API key to `.env`
2. ✅ Start server: `npm run dev`
3. ✅ Test with Postman
4. ✅ Integrate with your controllers
5. ✅ Deploy and enjoy fast CDN delivery!

---

**Need help?** Check the full documentation in `docs/bunnycdn_integration.md`
