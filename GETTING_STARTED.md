# 🚀 Getting Started with BunnyCDN

## Welcome! 👋

Your BunnyCDN integration is ready. This guide will get you up and running in 5 minutes.

---

## ⚡ 3-Step Quick Start

### Step 1: Add Your API Key (30 seconds)

1. Open `.env` file
2. Find this line:
   ```env
   BUNNY_API_KEY=your_bunnycdn_api_key_here
   ```
3. Replace `your_bunnycdn_api_key_here` with your actual API key

**Where to get your API key:**
1. Go to https://dash.bunny.net/
2. Click **Storage** in the left menu
3. Click **otrade** (your storage zone)
4. Copy the **Password** (this is your API key)
5. Paste it in `.env`

### Step 2: Start Your Server (10 seconds)

```bash
npm run dev
```

You should see:
```
Server running on port 3000
```

### Step 3: Test Upload (1 minute)

**Option A: Using Postman**
1. Import `bunnycdn_postman_collection.json`
2. Open "Upload Single Image" request
3. Select an image file
4. Click Send
5. You should get a CDN URL back!

**Option B: Using curl**
```bash
curl -X POST http://localhost:3000/api/upload/image \
  -F "image=@/path/to/your/image.jpg"
```

**Success Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://otrade.b-cdn.net/images/image-1707398400000.jpg",
    "fileName": "image-1707398400000.jpg",
    "path": "images/image-1707398400000.jpg",
    "size": 256000
  }
}
```

**🎉 Congratulations! You're now using BunnyCDN!**

---

## 📖 What Can You Do Now?

### Upload Different File Types

#### Upload Book PDF + Cover
```bash
curl -X POST http://localhost:3000/api/upload/book \
  -F "file=@book.pdf" \
  -F "coverImage=@cover.jpg"
```

#### Upload Video
```bash
curl -X POST http://localhost:3000/api/upload/video \
  -F "video=@tutorial.mp4"
```

#### Delete File
```bash
curl -X DELETE http://localhost:3000/api/upload/delete \
  -H "Content-Type: application/json" \
  -d '{"url":"https://otrade.b-cdn.net/images/image-123.jpg"}'
```

---

## 🔧 Integrate with Your Code

### In Your Controller

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

    // Save URL to database
    const book = await Book.create({
      title: req.body.title,
      pdfUrl: pdfResult.url  // ← CDN URL ready to use!
    });

    res.json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**That's it!** The URL is ready to use in your frontend.

---

## 🎨 Frontend Integration

### React Example

```jsx
const UploadImage = () => {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('http://localhost:3000/api/upload/image', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    setUrl(result.data.url);
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])} 
      />
      <button onClick={handleUpload}>Upload</button>
      {url && <img src={url} alt="Uploaded" />}
    </div>
  );
};
```

### Vanilla JavaScript

```javascript
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('http://localhost:3000/api/upload/image', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  return result.data.url;
};

// Usage
const fileInput = document.getElementById('file-input');
const url = await uploadFile(fileInput.files[0]);
console.log('Uploaded:', url);
```

---

## 📁 File Organization

Your files are automatically organized:

```
BunnyCDN Storage (otrade)
│
├── 📁 books/
│   ├── 📄 pdfs/          ← Book PDFs go here
│   └── 🖼️ covers/        ← Book covers go here
│
├── 📁 images/
│   ├── 📰 articles/      ← Article images
│   ├── 🎓 courses/       ← Course images
│   └── 🌐 general/       ← General images
│
├── 📁 videos/
│   ├── 🎓 courses/       ← Course videos
│   └── 🎤 webinars/      ← Webinar videos
│
└── 📁 uploads/           ← General uploads
```

**Customize folders:**
```javascript
await bunnyCDN.uploadFile(buffer, filename, 'custom/folder/path');
```

---

## 🎯 Common Use Cases

### 1. Upload Book with Cover

```javascript
// In your books controller
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

const book = await Book.create({
  title: req.body.title,
  pdfUrl: pdfResult.url,
  coverImageUrl: coverResult.url
});
```

### 2. Delete File When Deleting Resource

```javascript
// Before deleting book
if (book.pdfUrl) {
  await bunnyCDN.deleteFileByUrl(book.pdfUrl);
}
if (book.coverImageUrl) {
  await bunnyCDN.deleteFileByUrl(book.coverImageUrl);
}

await book.deleteOne();
```

### 3. Update File

```javascript
// Delete old file
if (book.coverImageUrl) {
  await bunnyCDN.deleteFileByUrl(book.coverImageUrl);
}

// Upload new file
const result = await bunnyCDN.uploadFile(
  req.files.coverImage[0].buffer,
  req.files.coverImage[0].originalname,
  'books/covers'
);

// Update database
book.coverImageUrl = result.url;
await book.save();
```

---

## 🔒 Add Authentication (Recommended for Production)

Edit `src/routes/upload.routes.js`:

```javascript
import { authenticate } from '../middlewares/auth.middleware.js';

// Add authenticate middleware
router.post('/book', authenticate, uploadBooks, uploadBookPDF);
router.post('/image', authenticate, upload.single('image'), uploadImage);
router.post('/video', authenticate, uploadVideoMiddleware, uploadVideo);
router.delete('/delete', authenticate, deleteFile);
```

---

## 🐛 Troubleshooting

### "BUNNY_API_KEY is required"
→ Add your API key to `.env` file

### Upload works but URL doesn't load
→ Wait 10-30 seconds for CDN propagation  
→ Check your Pull Zone is connected to Storage Zone

### 401 Unauthorized
→ Verify API key is correct in BunnyCDN dashboard  
→ Make sure you copied the Password, not the Storage Zone name

### File too large
→ Edit `src/middlewares/upload.middleware.js` to increase limits

---

## 📚 Learn More

### Quick References
- **Quick Start**: `BUNNYCDN_SETUP.md`
- **Quick Reference**: `BUNNYCDN_QUICK_REFERENCE.md`
- **Complete Docs**: `docs/bunnycdn_integration.md`

### Advanced Topics
- **Architecture**: `docs/bunnycdn_architecture.md`
- **Migration**: `docs/migration_guide.md`
- **Integration Example**: `src/modules/books/books.controller.bunnycdn.example.js`

### Testing
- **Postman Collection**: `bunnycdn_postman_collection.json`

---

## ✅ Next Steps

1. ✅ **You've completed setup!**
2. 📖 **Read the Quick Reference** for daily use
3. 🔧 **Integrate with your controllers**
4. 🧪 **Test with Postman**
5. 🚀 **Deploy to production**

---

## 🎊 You're Ready!

You now have a complete, production-ready BunnyCDN integration. Your files will be:

- ⚡ **Fast** - Delivered via global CDN
- 💰 **Affordable** - Lower costs than Cloudinary
- 🔒 **Secure** - HTTPS encryption
- 📈 **Scalable** - Handles any traffic

**Happy uploading! 🚀**

---

## 💡 Pro Tips

1. **Use organized folders** - Keep files organized by type
2. **Delete old files** - Clean up when updating resources
3. **Monitor usage** - Check BunnyCDN dashboard regularly
4. **Add authentication** - Protect upload endpoints in production
5. **Test first** - Always test uploads before deploying

---

## 🆘 Need Help?

- Check the documentation files
- Test with Postman collection
- Review integration examples
- Verify environment variables

**Everything you need is in the documentation!**

---

**Made with ❤️ for fast, affordable file delivery**
