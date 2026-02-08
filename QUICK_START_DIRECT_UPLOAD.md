# ⚡ Quick Start - Direct Upload to BunnyCDN

## 🎯 What This Does

Frontend uploads files **directly** to BunnyCDN, bypassing backend to solve Vercel 413 and timeout issues.

---

## 🚀 3-Step Implementation

### Step 1: Backend Endpoint (Already Done ✅)

```
POST /api/upload/generate-url
```

Request:
```json
{
  "fileName": "book.pdf",
  "fileType": "pdf",
  "category": "books"
}
```

Response:
```json
{
  "uploadUrl": "https://storage.bunnycdn.com/...",
  "fileUrl": "https://otrade.b-cdn.net/...",
  "headers": { "AccessKey": "...", "Content-Type": "..." }
}
```

---

### Step 2: Frontend Upload Function

```javascript
const uploadFile = async (file, fileType) => {
  // Get upload URL
  const { data } = await axios.post('/api/upload/generate-url', {
    fileName: file.name,
    fileType,
    category: 'books',
    fileSize: file.size
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });

  // Upload to BunnyCDN
  await axios.put(data.data.uploadUrl, file, {
    headers: data.data.headers
  });

  // Return public URL
  return data.data.fileUrl;
};
```

---

### Step 3: Use in Your Form

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Upload files
  const coverUrl = await uploadFile(coverFile, 'image');
  const pdfUrl = await uploadFile(pdfFile, 'pdf');
  
  // Create book with URLs
  await axios.post('/api/books', {
    title: { en: 'Title', ar: 'العنوان' },
    coverImageUrl: coverUrl,
    pdfUrl: pdfUrl
  });
};
```

---

## 📋 File Types Supported

- **PDF**: `pdf`
- **Images**: `image`, `jpg`, `jpeg`, `png`
- **Videos**: `video`, `mp4`, `mov`

---

## 🔒 Security

- ✅ JWT authentication required
- ✅ File type validation
- ✅ File size limit: 200MB
- ✅ Unique filenames generated

---

## 📂 Auto Folder Structure

| Type | Category | Folder |
|------|----------|--------|
| PDF | books | `books/files/` |
| Image | books | `books/covers/` |
| Video | courses | `courses/videos/` |

---

## 🧪 Test It

```bash
# Test backend
node test-direct-upload.js

# Test API
curl -X POST http://localhost:3000/api/upload/generate-url \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.pdf","fileType":"pdf","category":"books"}'
```

---

## 📖 Full Documentation

- **Complete Guide**: `BUNNYCDN_DIRECT_UPLOAD_GUIDE.md`
- **Arabic Summary**: `DIRECT_UPLOAD_SUMMARY_AR.md`
- **React Example**: `frontend-example-react.jsx`
- **Postman Collection**: `bunnycdn_direct_upload_postman.json`

---

## ✅ Benefits

✅ No Vercel 413 errors  
✅ No timeout issues  
✅ Fast direct uploads  
✅ Real progress tracking  
✅ Reduced server load  

---

**That's it! You're ready to upload directly to BunnyCDN! 🎉**
