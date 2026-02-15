# 📊 نظام تحليلات الأسواق - Market Analysis System

## ✅ تم التنفيذ

تم إنشاء نظام كامل لتحليلات الأسواق مع 6 فئات مختلفة.

---

## 📋 الفئات المتاحة (Categories)

1. **gulf-stocks** - تحليل أسهم الخليج
2. **egyptian-stocks** - تحليل الأسهم المصرية
3. **forex** - تحليل الفوريكس
4. **bitcoin** - تحليل البيتكوين
5. **gold** - تحليل الذهب
6. **indices** - تحليل المؤشرات

---

## 🎯 الـ Endpoints

### 1. Get All Analyses by Category (Public)
```
GET /api/market-analysis/:category
```

**مثال**:
```bash
GET /api/market-analysis/gulf-stocks
GET /api/market-analysis/forex
GET /api/market-analysis/bitcoin
```

**Headers**:
- `Accept-Language: en` (إنجليزي)
- `Accept-Language: ar` (عربي)
- `Accept-Language: ar|en` (اللغتين)

**Response (Single Language)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "category": "gulf-stocks",
      "slug": "saudi-market-analysis-2026",
      "title": "تحليل السوق السعودي 2026",
      "description": "تحليل شامل للسوق السعودي...",
      "coverImage": "https://otrade.b-cdn.net/market-analysis/gulf-stocks/cover.jpg",
      "updatedAt": "2026-02-13T10:30:00Z"
    }
  ]
}
```

**Response (Multiple Languages)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "category": "gulf-stocks",
      "slug": "saudi-market-analysis-2026",
      "translations": {
        "en": {
          "title": "Saudi Market Analysis 2026",
          "description": "Comprehensive analysis of Saudi market..."
        },
        "ar": {
          "title": "تحليل السوق السعودي 2026",
          "description": "تحليل شامل للسوق السعودي..."
        }
      },
      "coverImage": "https://otrade.b-cdn.net/market-analysis/gulf-stocks/cover.jpg",
      "updatedAt": "2026-02-13T10:30:00Z"
    }
  ]
}
```

---

### 2. Get Single Analysis by Slug (Public)
```
GET /api/market-analysis/:category/:slug
```

**مثال**:
```bash
GET /api/market-analysis/gulf-stocks/saudi-market-analysis-2026
```

**Response (Single Language)**:
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "category": "gulf-stocks",
    "slug": "saudi-market-analysis-2026",
    "title": "تحليل السوق السعودي 2026",
    "description": "تحليل شامل للسوق السعودي...",
    "content": "المحتوى الكامل للتحليل...",
    "coverImage": "https://otrade.b-cdn.net/market-analysis/gulf-stocks/cover.jpg",
    "image": "https://otrade.b-cdn.net/market-analysis/gulf-stocks/image.jpg",
    "updatedAt": "2026-02-13T10:30:00Z",
    "createdAt": "2026-02-10T08:00:00Z"
  }
}
```

---

### 3. Create Analysis (Admin)
```
POST /api/market-analysis
```

**Headers**:
- `Authorization: Bearer YOUR_ADMIN_TOKEN`
- `Content-Type: multipart/form-data`

**Body (form-data)**:

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| category | Text | Yes | gulf-stocks, egyptian-stocks, forex, bitcoin, gold, indices |
| coverImage | File | Yes | صورة الغلاف (للقائمة) |
| image | File | Yes | صورة المقال (داخل التفاصيل) |
| title_en | Text | Yes | العنوان بالإنجليزي |
| title_ar | Text | Yes | العنوان بالعربي |
| description_en | Text | Yes | الوصف بالإنجليزي |
| description_ar | Text | Yes | الوصف بالعربي |
| content_en | Text | Yes | المحتوى الكامل بالإنجليزي |
| content_ar | Text | Yes | المحتوى الكامل بالعربي |

**مثال Postman**:
```
POST http://localhost:3000/api/market-analysis
Authorization: Bearer YOUR_TOKEN

Body (form-data):
- category: gulf-stocks
- coverImage: [file]
- image: [file]
- title_en: Saudi Market Analysis 2026
- title_ar: تحليل السوق السعودي 2026
- description_en: Comprehensive analysis...
- description_ar: تحليل شامل...
- content_en: Full article content...
- content_ar: المحتوى الكامل للمقال...
```

**Response**:
```json
{
  "success": true,
  "message": "Market analysis created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "category": "gulf-stocks",
    "slug": "saudi-market-analysis-2026",
    "coverImage": "https://otrade.b-cdn.net/...",
    "image": "https://otrade.b-cdn.net/...",
    "translations": {
      "en": {
        "title": "Saudi Market Analysis 2026",
        "description": "...",
        "content": "..."
      },
      "ar": {
        "title": "تحليل السوق السعودي 2026",
        "description": "...",
        "content": "..."
      }
    },
    "updatedAt": "2026-02-13T10:30:00Z",
    "createdAt": "2026-02-13T10:30:00Z"
  }
}
```

---

### 4. Update Analysis (Admin)
```
PUT /api/market-analysis/:id
```

**Headers**:
- `Authorization: Bearer YOUR_ADMIN_TOKEN`
- `Content-Type: multipart/form-data`

**Body (form-data)** - كل الحقول اختيارية:

| Key | Type | Description |
|-----|------|-------------|
| coverImage | File | صورة غلاف جديدة (اختياري) |
| image | File | صورة مقال جديدة (اختياري) |
| title_en | Text | تحديث العنوان الإنجليزي |
| title_ar | Text | تحديث العنوان العربي |
| description_en | Text | تحديث الوصف الإنجليزي |
| description_ar | Text | تحديث الوصف العربي |
| content_en | Text | تحديث المحتوى الإنجليزي |
| content_ar | Text | تحديث المحتوى العربي |

**مثال**:
```
PUT http://localhost:3000/api/market-analysis/507f1f77bcf86cd799439011
Authorization: Bearer YOUR_TOKEN

Body (form-data):
- title_ar: تحليل السوق السعودي 2026 - محدث
- content_ar: المحتوى المحدث...
```

---

### 5. Delete Analysis (Admin)
```
DELETE /api/market-analysis/:id
```

**Headers**:
- `Authorization: Bearer YOUR_ADMIN_TOKEN`

**Response**:
```json
{
  "success": true,
  "message": "Market analysis deleted successfully"
}
```

---

## 📊 البنية (Structure)

### Model Fields:
- `category` - الفئة (gulf-stocks, egyptian-stocks, etc.)
- `slug` - رابط فريد (يتم توليده تلقائياً)
- `coverImage` - صورة الغلاف (للقائمة)
- `image` - صورة المقال (داخل التفاصيل)
- `isActive` - نشط/غير نشط
- `createdAt` - تاريخ الإنشاء
- `updatedAt` - تاريخ آخر تحديث

### Translations (في Translation Collection):
- `title` - العنوان
- `description` - الوصف
- `content` - المحتوى الكامل

---

## 🎨 الميزات

✅ **6 فئات مختلفة** للتحليلات  
✅ **دعم اللغتين** (عربي + إنجليزي)  
✅ **رفع صورتين** (coverImage + image)  
✅ **Slug تلقائي** من العنوان  
✅ **FormData support** بصيغ متعددة  
✅ **BunnyCDN** لرفع الصور  
✅ **CRUD كامل** (Create, Read, Update, Delete)  
✅ **Admin only** للإنشاء والتعديل والحذف  
✅ **Public access** للقراءة  

---

## 🔍 أمثلة الاستخدام

### Frontend - Get All Gulf Stocks Analyses
```javascript
const fetchGulfStocksAnalyses = async () => {
  const response = await fetch('http://localhost:3000/api/market-analysis/gulf-stocks', {
    headers: {
      'Accept-Language': 'ar'
    }
  });
  const data = await response.json();
  
  data.data.forEach(analysis => {
    console.log(analysis.title);
    console.log(analysis.description);
    console.log(analysis.coverImage);
  });
};
```

### Frontend - Get Single Analysis
```javascript
const fetchAnalysis = async (category, slug) => {
  const response = await fetch(`http://localhost:3000/api/market-analysis/${category}/${slug}`, {
    headers: {
      'Accept-Language': 'ar|en'
    }
  });
  const data = await response.json();
  
  // Access translations
  console.log(data.data.translations.ar.title);
  console.log(data.data.translations.en.title);
  console.log(data.data.content);
};
```

---

## 📁 الملفات المُنشأة

- `src/modules/market-analysis/market-analysis.model.js` - Model
- `src/modules/market-analysis/market-analysis.controller.js` - Controller
- `src/modules/market-analysis/market-analysis.routes.js` - Routes
- `src/modules/translations/translation.model.js` - Updated (added market-analysis)
- `src/modules/translations/translation.service.js` - Updated
- `src/app.js` - Updated (added route)

---

## 🧪 الاختبار

### 1. أعد تشغيل السيرفر
```bash
npm start
```

### 2. اختبر الـ Endpoints

**Get all gulf stocks analyses**:
```bash
curl -H "Accept-Language: ar" http://localhost:3000/api/market-analysis/gulf-stocks
```

**Create new analysis** (Postman):
```
POST http://localhost:3000/api/market-analysis
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

Body:
- category: forex
- coverImage: [file]
- image: [file]
- title_en: Forex Market Analysis
- title_ar: تحليل سوق الفوريكس
- description_en: Latest forex trends...
- description_ar: أحدث اتجاهات الفوريكس...
- content_en: Full analysis content...
- content_ar: المحتوى الكامل للتحليل...
```

---

## ✅ جاهز للاستخدام!

النظام الآن جاهز بالكامل مع:
- 6 فئات للتحليلات
- دعم كامل للغتين
- رفع الصور على BunnyCDN
- CRUD operations كاملة
- Admin permissions

🚀 Happy Trading!
