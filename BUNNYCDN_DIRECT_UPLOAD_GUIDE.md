# 🚀 BunnyCDN Direct Upload - دليل الرفع المباشر من Frontend

## 📋 نظرة عامة

هذا النظام يسمح للـ Frontend برفع الملفات **مباشرة** إلى BunnyCDN بدون المرور بالـ Backend، مما يحل مشاكل:
- ❌ Vercel 413 Payload Too Large
- ❌ Timeout مع الملفات الكبيرة
- ✅ رفع سريع ومباشر
- ✅ توفير موارد السيرفر

---

## 🔄 كيف يعمل النظام؟

```
1. Frontend → Backend: طلب توليد Upload URL
2. Backend → Frontend: إرجاع Upload URL + Headers
3. Frontend → BunnyCDN: رفع الملف مباشرة
4. Frontend → Backend: إرسال File URL النهائي مع البيانات
```

---

## 📡 API Endpoints

### 1️⃣ توليد Upload URL

**Endpoint:**
```
POST /api/upload/generate-url
```

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "fileName": "my-book.pdf",
  "fileType": "pdf",
  "folder": "books/files",
  "fileSize": 5242880,
  "category": "books"
}
```

**Parameters:**
- `fileName` (required): اسم الملف الأصلي
- `fileType` (required): نوع الملف (`pdf`, `image`, `video`, `jpg`, `png`, `mp4`)
- `folder` (optional): المجلد المطلوب (إذا لم يُحدد، يتم التحديد تلقائياً)
- `fileSize` (optional): حجم الملف بالـ bytes (للتحقق من الحد الأقصى 200MB)
- `category` (optional): الفئة (`books`, `courses`, `uploads`)

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

## 💻 أمثلة الاستخدام من Frontend

### React + Axios - رفع PDF

```javascript
import axios from 'axios';

const uploadPDFToBunny = async (file) => {
  try {
    // Step 1: Get upload URL from backend
    const { data } = await axios.post(
      'https://your-api.com/api/upload/generate-url',
      {
        fileName: file.name,
        fileType: 'pdf',
        category: 'books',
        fileSize: file.size
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    const { uploadUrl, fileUrl, headers } = data.data;

    // Step 2: Upload file directly to BunnyCDN
    await axios.put(uploadUrl, file, {
      headers: {
        'AccessKey': headers.AccessKey,
        'Content-Type': headers['Content-Type']
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload Progress: ${percentCompleted}%`);
      }
    });

    console.log('✅ File uploaded successfully!');
    console.log('📎 File URL:', fileUrl);

    // Step 3: Use fileUrl in your form data
    return fileUrl;

  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
};

// Usage in component
const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  
  if (!file) return;
  
  // Validate file size (200MB max)
  if (file.size > 200 * 1024 * 1024) {
    alert('File size exceeds 200MB');
    return;
  }
  
  try {
    const fileUrl = await uploadPDFToBunny(file);
    
    // Now send fileUrl to backend with other book data
    await axios.post('/api/books', {
      title: { en: 'Book Title', ar: 'عنوان الكتاب' },
      description: { en: 'Description', ar: 'الوصف' },
      pdfUrl: fileUrl, // ← Use the uploaded file URL
      // ... other fields
    });
    
    alert('Book created successfully!');
  } catch (error) {
    alert('Upload failed: ' + error.message);
  }
};
```

---

### React + Axios - رفع صورة الغلاف

```javascript
const uploadCoverImage = async (file) => {
  try {
    // Step 1: Get upload URL
    const { data } = await axios.post(
      'https://your-api.com/api/upload/generate-url',
      {
        fileName: file.name,
        fileType: 'image',
        category: 'books',
        fileSize: file.size
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    const { uploadUrl, fileUrl, headers } = data.data;

    // Step 2: Upload to BunnyCDN
    await axios.put(uploadUrl, file, {
      headers: {
        'AccessKey': headers.AccessKey,
        'Content-Type': headers['Content-Type']
      }
    });

    console.log('✅ Cover uploaded:', fileUrl);
    return fileUrl;

  } catch (error) {
    console.error('❌ Cover upload failed:', error);
    throw error;
  }
};
```

---

### React Component - نموذج كامل

```javascript
import React, { useState } from 'react';
import axios from 'axios';

const CreateBookForm = () => {
  const [formData, setFormData] = useState({
    title: { en: '', ar: '' },
    description: { en: '', ar: '' },
    coverImageUrl: '',
    pdfUrl: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (file, fileType, category) => {
    try {
      // Get upload URL
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

      // Upload to BunnyCDN
      await axios.put(uploadUrl, file, {
        headers: {
          'AccessKey': headers.AccessKey,
          'Content-Type': headers['Content-Type']
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        }
      });

      return fileUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const coverUrl = await uploadFile(file, 'image', 'books');
      setFormData({ ...formData, coverImageUrl: coverUrl });
      alert('Cover uploaded successfully!');
    } catch (error) {
      alert('Cover upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > 200 * 1024 * 1024) {
      alert('PDF size exceeds 200MB');
      return;
    }

    setUploading(true);
    try {
      const pdfUrl = await uploadFile(file, 'pdf', 'books');
      setFormData({ ...formData, pdfUrl });
      alert('PDF uploaded successfully!');
    } catch (error) {
      alert('PDF upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('/api/books', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert('Book created successfully!');
    } catch (error) {
      alert('Failed to create book');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Cover Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleCoverUpload}
          disabled={uploading}
        />
        {formData.coverImageUrl && (
          <img src={formData.coverImageUrl} alt="Cover" width="100" />
        )}
      </div>

      <div>
        <label>PDF File:</label>
        <input
          type="file"
          accept=".pdf"
          onChange={handlePDFUpload}
          disabled={uploading}
        />
        {formData.pdfUrl && <p>✅ PDF uploaded</p>}
      </div>

      {uploading && (
        <div>
          <p>Uploading... {uploadProgress}%</p>
          <progress value={uploadProgress} max="100" />
        </div>
      )}

      <div>
        <label>Title (English):</label>
        <input
          type="text"
          value={formData.title.en}
          onChange={(e) =>
            setFormData({
              ...formData,
              title: { ...formData.title, en: e.target.value }
            })
          }
        />
      </div>

      <div>
        <label>Title (Arabic):</label>
        <input
          type="text"
          value={formData.title.ar}
          onChange={(e) =>
            setFormData({
              ...formData,
              title: { ...formData.title, ar: e.target.value }
            })
          }
        />
      </div>

      <button type="submit" disabled={uploading}>
        Create Book
      </button>
    </form>
  );
};

export default CreateBookForm;
```

---

## 🔒 الأمان

### Backend Validation:
- ✅ يتطلب JWT token للمصادقة
- ✅ يتحقق من نوع الملف (pdf, image, video فقط)
- ✅ يتحقق من حجم الملف (حد أقصى 200MB)
- ✅ ينظف اسم الملف من الأحرف الخاصة
- ✅ يولد اسم ملف فريد بـ timestamp

### Frontend Validation:
```javascript
// Validate file type
const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'video/mp4'];
if (!allowedTypes.includes(file.type)) {
  alert('Invalid file type');
  return;
}

// Validate file size (200MB)
if (file.size > 200 * 1024 * 1024) {
  alert('File too large (max 200MB)');
  return;
}
```

---

## 📂 هيكل المجلدات التلقائي

| File Type | Category | Folder Path |
|-----------|----------|-------------|
| PDF | books | `books/files/` |
| Image | books | `books/covers/` |
| Video | books | `books/videos/` |
| PDF | courses | `courses/files/` |
| Image | courses | `courses/covers/` |
| Any | uploads | `uploads/` |

---

## ⚠️ معالجة الأخطاء

```javascript
try {
  const fileUrl = await uploadFile(file, 'pdf', 'books');
} catch (error) {
  if (error.response?.status === 401) {
    alert('Unauthorized. Please login again.');
  } else if (error.response?.status === 400) {
    alert('Invalid file: ' + error.response.data.message);
  } else if (error.code === 'ERR_NETWORK') {
    alert('Network error. Check your connection.');
  } else {
    alert('Upload failed. Please try again.');
  }
}
```

---

## 🧪 اختبار النظام

### Test with cURL:

```bash
# Step 1: Generate upload URL
curl -X POST https://your-api.com/api/upload/generate-url \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.pdf",
    "fileType": "pdf",
    "category": "books"
  }'

# Step 2: Upload file to BunnyCDN
curl -X PUT "UPLOAD_URL_FROM_STEP_1" \
  -H "AccessKey: YOUR_API_KEY" \
  -H "Content-Type: application/pdf" \
  --data-binary "@test.pdf"
```

---

## 📊 المزايا

✅ **سرعة**: رفع مباشر بدون وسيط  
✅ **موثوقية**: لا timeout على Vercel  
✅ **قابلية التوسع**: لا حمل على السيرفر  
✅ **تجربة مستخدم**: progress bar حقيقي  
✅ **أمان**: توليد URLs موقعة من Backend  

---

## 🔧 Environment Variables

تأكد من وجود المتغيرات في `.env`:

```env
BUNNY_STORAGE_ZONE=otrade
BUNNY_API_KEY=your-api-key
BUNNY_CDN_URL=https://otrade.b-cdn.net
```

---

## 📞 الدعم

إذا واجهت مشاكل:
1. تحقق من JWT token
2. تحقق من حجم الملف (< 200MB)
3. تحقق من نوع الملف المسموح
4. راجع console logs في Frontend و Backend

---

**🎉 الآن يمكنك رفع الملفات مباشرة من Frontend إلى BunnyCDN!**
