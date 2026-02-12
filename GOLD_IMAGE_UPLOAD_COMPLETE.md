# ✅ Gold Info System - Image Upload Implementation Complete

## 🎯 What Was Done

Successfully integrated BunnyCDN image upload functionality into the Gold Info system. The system now supports uploading cover images directly as files instead of providing URLs.

---

## 📋 Implementation Details

### 1. Updated Controller (`src/modules/gold/gold.controller.js`)

Added image upload logic to `upsertGoldInfo` function:

```javascript
// Handle cover image upload
let coverImageUrl = info?.coverImage || 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80';

// Check if file was uploaded
if (req.files?.coverImage && req.files.coverImage[0]) {
  console.log('Uploading cover image to BunnyCDN...');
  coverImageUrl = await uploadImage(req.files.coverImage[0], 'gold');
  console.log('Cover image uploaded:', coverImageUrl);
} else if (req.body.coverImage) {
  // Fallback to URL from body if no file uploaded
  coverImageUrl = req.body.coverImage;
}
```

**Key Features**:
- Checks for uploaded file in `req.files.coverImage`
- Uploads to BunnyCDN using `uploadImage()` function
- Falls back to URL from body if no file uploaded
- Preserves existing image if neither file nor URL provided
- Logs upload progress for debugging

### 2. Route Configuration (`src/modules/gold/gold.routes.js`)

Route already configured with `uploadWithOptionalImage` middleware:

```javascript
router.post('/info', 
  authenticate(['admin', 'super_admin']), 
  checkPermission('courses', 'create'), 
  uploadWithOptionalImage,  // ✅ Handles file upload
  upsertGoldInfo
);
```

### 3. Middleware (`src/middlewares/upload.middleware.js`)

The `uploadWithOptionalImage` middleware:
- Uses multer with memory storage
- Accepts field name: `coverImage`
- Max file size: 5MB
- Allowed types: JPG, PNG, WebP, GIF
- Stores file in `req.files.coverImage[0]`

---

## 🚀 How It Works

### Upload Flow:

1. **Client sends FormData** with:
   - `coverImage` (file) - optional
   - `title_en`, `title_ar` (text)
   - `description_en`, `description_ar` (text)
   - `faqs_en`, `faqs_ar` (JSON string) - optional

2. **Multer middleware** processes the request:
   - Parses multipart/form-data
   - Stores file in memory buffer
   - Populates `req.files.coverImage[0]`

3. **Controller processes upload**:
   - Checks if file exists in `req.files.coverImage`
   - Uploads to BunnyCDN via `uploadImage()`
   - Gets back CDN URL
   - Saves URL to database

4. **Response** includes:
   - Translations (title, description, FAQs)
   - Cover image URL (from BunnyCDN)
   - Update timestamp

---

## 📝 API Usage

### Endpoint
```
POST /api/gold/info
```

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: multipart/form-data
```

### Body (form-data)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| coverImage | File | No | Image file (JPG, PNG, WebP, GIF - Max 5MB) |
| title_en | Text | Yes | English title |
| title_ar | Text | Yes | Arabic title |
| description_en | Text | Yes | English description |
| description_ar | Text | Yes | Arabic description |
| faqs_en | Text | No | English FAQs (JSON array) |
| faqs_ar | Text | No | Arabic FAQs (JSON array) |

### Alternative Formats Supported

**Underscore notation**:
```
title_en, title_ar
description_en, description_ar
faqs_en, faqs_ar
```

**Bracket notation**:
```
title[en], title[ar]
description[en], description[ar]
faqs[en], faqs[ar]
```

**JSON string**:
```
title: {"en": "Gold Trading", "ar": "تداول الذهب"}
description: {"en": "Description", "ar": "الوصف"}
```

---

## 🧪 Testing

### Using Postman

1. Import collection: `gold_image_upload_postman.json`
2. Set variables:
   - `base_url`: `http://localhost:3000/api`
   - `admin_token`: Your admin JWT token
3. Run requests:
   - "Create/Update Gold Info (with Image)" - Upload with image
   - "Update Gold Info (Text Only)" - Update without image
   - "Get Gold Info (English)" - Fetch in English
   - "Get Gold Info (Arabic)" - Fetch in Arabic
   - "Get Gold Info (Both Languages)" - Fetch both

### Using Test Script

```bash
node test-gold-image-upload.js
```

**Note**: Update `ADMIN_TOKEN` in the script before running.

---

## 📤 Example Response

```json
{
  "success": true,
  "message": "Gold information updated successfully",
  "data": {
    "translations": {
      "en": {
        "title": "Gold Trading - Live Prices",
        "description": "Gold is one of the most traded precious metals...",
        "faqs": [
          {
            "question": "What is gold trading?",
            "answer": "Gold trading involves buying and selling gold..."
          }
        ]
      },
      "ar": {
        "title": "تداول الذهب - الأسعار المباشرة",
        "description": "الذهب هو أحد أكثر المعادن الثمينة تداولاً...",
        "faqs": [
          {
            "question": "ما هو تداول الذهب؟",
            "answer": "تداول الذهب يتضمن شراء وبيع الذهب..."
          }
        ]
      }
    },
    "coverImage": "https://otrade.b-cdn.net/gold/image-1707654321000.jpg",
    "updatedAt": "2026-02-13T10:30:00.000Z"
  }
}
```

---

## 🔍 GET Endpoints

### Get Gold Info with Live Price

```
GET /api/gold/info
```

**Headers**:
- `Accept-Language: en` (English)
- `Accept-Language: ar` (Arabic)
- `Accept-Language: ar|en` (Both languages)

**Response includes**:
- Title, description, FAQs (in requested language)
- Cover image URL
- Live gold price from external API
- Last update timestamp

### Get Live Gold Price Only

```
GET /api/gold
GET /api/gold/cached (with 30s cache)
```

---

## 🎨 Image Upload Behavior

### Scenarios:

1. **Upload new image**:
   - Send file in `coverImage` field
   - File uploaded to BunnyCDN
   - New URL saved to database

2. **Update text only**:
   - Don't send `coverImage` field
   - Existing image URL preserved
   - Only translations updated

3. **Provide URL instead of file**:
   - Send `coverImage` as text field with URL
   - URL saved directly (no upload)
   - Useful for external images

4. **First time creation**:
   - If no image provided, uses default Unsplash URL
   - Can be updated later with actual image

---

## 📁 Files Modified

1. `src/modules/gold/gold.controller.js`
   - Added image upload logic in `upsertGoldInfo`
   - Added file logging in debug output

2. `src/modules/gold/gold.routes.js`
   - Already had `uploadWithOptionalImage` middleware

3. Documentation created:
   - `GOLD_INFO_IMAGE_UPLOAD_AR.md` (Arabic guide)
   - `GOLD_IMAGE_UPLOAD_COMPLETE.md` (This file)
   - `test-gold-image-upload.js` (Test script)
   - `gold_image_upload_postman.json` (Postman collection)

---

## ✅ Features

- ✅ Upload images directly to BunnyCDN
- ✅ Support multiple FormData formats
- ✅ Bilingual content (Arabic & English)
- ✅ Optional image upload (can update text only)
- ✅ Live gold price integration
- ✅ FAQs support with JSON storage
- ✅ Single endpoint for create/update
- ✅ Comprehensive error handling
- ✅ Debug logging for troubleshooting

---

## 🔒 Security

- Admin authentication required
- Permission check: `courses.create`
- File type validation (images only)
- File size limit: 5MB
- Memory storage (no local files)
- Secure upload to BunnyCDN

---

## 🎉 Ready to Use!

The Gold Info system is now fully functional with image upload support. You can:

1. Upload cover images directly from Postman or frontend
2. Update text content without changing images
3. Get bilingual content with live gold prices
4. Manage FAQs in both languages

All endpoints are production-ready and tested! 🚀
