# Market Analysis System - Postman Examples

## نظرة عامة
النظام الجديد للتحليلات السوقية مع Categories ديناميكية وصور غلاف.

---

## 1️⃣ إدارة الفئات (Categories)

### 1.1 إنشاء فئة جديدة (Create Category)
```
POST http://localhost:3000/api/market-analysis/categories
Authorization: Bearer {{admin_token}}
Content-Type: multipart/form-data
```

**Body (form-data):**
```
name_en: Gulf Stocks
name_ar: أسهم الخليج
description_en: Analysis and insights for Gulf stock markets
description_ar: تحليلات ورؤى لأسواق أسهم الخليج
coverImage: [اختر ملف صورة]
```

**Response:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "65f1234567890abcdef12345",
    "slug": "gulf-stocks",
    "coverImage": "https://otrade.b-cdn.net/market-categories/gulf-stocks-1234567890.jpg",
    "translations": {
      "en": {
        "name": "Gulf Stocks",
        "description": "Analysis and insights for Gulf stock markets"
      },
      "ar": {
        "name": "أسهم الخليج",
        "description": "تحليلات ورؤى لأسواق أسهم الخليج"
      }
    }
  }
}
```

---

### 1.2 إنشاء فئة (طريقة JSON)
```
POST http://localhost:3000/api/market-analysis/categories
Authorization: Bearer {{admin_token}}
Content-Type: multipart/form-data
```

**Body (form-data):**
```
name: {"en": "Egyptian Stocks", "ar": "أسهم مصرية"}
description: {"en": "Egyptian stock market analysis", "ar": "تحليل سوق الأسهم المصري"}
coverImage: [اختر ملف صورة]
```

---

### 1.3 إنشاء فئة (طريقة Brackets)
```
POST http://localhost:3000/api/market-analysis/categories
Authorization: Bearer {{admin_token}}
Content-Type: multipart/form-data
```

**Body (form-data):**
```
name[en]: Forex Analysis
name[ar]: تحليل الفوركس
description[en]: Foreign exchange market analysis
description[ar]: تحليل سوق العملات الأجنبية
coverImage: [اختر ملف صورة]
```

---

### 1.4 الحصول على جميع الفئات
```
GET http://localhost:3000/api/market-analysis/categories
Accept-Language: en
```

**Response (لغة واحدة):**
```json
{
  "success": true,
  "data": [
    {
      "id": "65f1234567890abcdef12345",
      "slug": "gulf-stocks",
      "name": "Gulf Stocks",
      "description": "Analysis and insights for Gulf stock markets",
      "coverImage": "https://otrade.b-cdn.net/market-categories/gulf-stocks.jpg"
    },
    {
      "id": "65f1234567890abcdef12346",
      "slug": "forex",
      "name": "Forex Analysis",
      "description": "Foreign exchange market analysis",
      "coverImage": "https://otrade.b-cdn.net/market-categories/forex.jpg"
    }
  ]
}
```

---

### 1.5 الحصول على جميع الفئات (لغتين)
```
GET http://localhost:3000/api/market-analysis/categories
Accept-Language: ar|en
```

**Response (لغتين):**
```json
{
  "success": true,
  "data": [
    {
      "id": "65f1234567890abcdef12345",
      "slug": "gulf-stocks",
      "coverImage": "https://otrade.b-cdn.net/market-categories/gulf-stocks.jpg",
      "translations": {
        "en": {
          "name": "Gulf Stocks",
          "description": "Analysis and insights for Gulf stock markets"
        },
        "ar": {
          "name": "أسهم الخليج",
          "description": "تحليلات ورؤى لأسواق أسهم الخليج"
        }
      }
    }
  ]
}
```

---

### 1.6 تحديث فئة
```
PUT http://localhost:3000/api/market-analysis/categories/65f1234567890abcdef12345
Authorization: Bearer {{admin_token}}
Content-Type: multipart/form-data
```

**Body (form-data):**
```
name_en: Gulf Stocks Updated
description_ar: وصف محدث
coverImage: [اختر ملف صورة جديد - اختياري]
isActive: true
```

---

### 1.7 حذف فئة
```
DELETE http://localhost:3000/api/market-analysis/categories/65f1234567890abcdef12345
Authorization: Bearer {{admin_token}}
```

---

## 2️⃣ إدارة التحليلات (Market Analyses)

### 2.1 إنشاء تحليل جديد
```
POST http://localhost:3000/api/market-analysis
Authorization: Bearer {{admin_token}}
Content-Type: multipart/form-data
```

**Body (form-data):**
```
categoryId: 65f1234567890abcdef12345
title_en: Saudi Market Analysis - Q1 2024
title_ar: تحليل السوق السعودي - الربع الأول 2024
description_en: Comprehensive analysis of Saudi stock market performance
description_ar: تحليل شامل لأداء سوق الأسهم السعودي
content_en: Full article content here with detailed analysis...
content_ar: محتوى المقال الكامل هنا مع تحليل مفصل...
coverImage: [اختر ملف صورة الغلاف]
image: [اختر ملف صورة المحتوى]
```

**Response:**
```json
{
  "success": true,
  "message": "Market analysis created successfully",
  "data": {
    "id": "65f1234567890abcdef12347",
    "categoryId": "65f1234567890abcdef12345",
    "slug": "saudi-market-analysis-q1-2024",
    "coverImage": "https://otrade.b-cdn.net/market-analysis/gulf-stocks/cover-1234567890.jpg",
    "image": "https://otrade.b-cdn.net/market-analysis/gulf-stocks/image-1234567890.jpg",
    "translations": {
      "en": {
        "title": "Saudi Market Analysis - Q1 2024",
        "description": "Comprehensive analysis of Saudi stock market performance",
        "content": "Full article content here..."
      },
      "ar": {
        "title": "تحليل السوق السعودي - الربع الأول 2024",
        "description": "تحليل شامل لأداء سوق الأسهم السعودي",
        "content": "محتوى المقال الكامل هنا..."
      }
    },
    "updatedAt": "2024-02-15T10:30:00.000Z",
    "createdAt": "2024-02-15T10:30:00.000Z"
  }
}
```

---

### 2.2 إنشاء تحليل (طريقة JSON)
```
POST http://localhost:3000/api/market-analysis
Authorization: Bearer {{admin_token}}
Content-Type: multipart/form-data
```

**Body (form-data):**
```
categoryId: 65f1234567890abcdef12346
title: {"en": "EUR/USD Weekly Forecast", "ar": "توقعات اليورو/دولار الأسبوعية"}
description: {"en": "Technical analysis for EUR/USD", "ar": "تحليل فني لليورو/دولار"}
content: {"en": "Full analysis...", "ar": "التحليل الكامل..."}
coverImage: [file]
image: [file]
```

---

### 2.3 إنشاء تحليل (طريقة Brackets)
```
POST http://localhost:3000/api/market-analysis
Authorization: Bearer {{admin_token}}
Content-Type: multipart/form-data
```

**Body (form-data):**
```
categoryId: 65f1234567890abcdef12347
title[en]: Bitcoin Price Analysis
title[ar]: تحليل سعر البيتكوين
description[en]: Current Bitcoin market trends
description[ar]: اتجاهات سوق البيتكوين الحالية
content[en]: Detailed analysis content...
content[ar]: محتوى التحليل المفصل...
coverImage: [file]
image: [file]
```

---

### 2.4 الحصول على جميع التحليلات لفئة معينة (بالـ slug)
```
GET http://localhost:3000/api/market-analysis/gulf-stocks
Accept-Language: en
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "65f1234567890abcdef12347",
      "categoryId": "65f1234567890abcdef12345",
      "slug": "saudi-market-analysis-q1-2024",
      "title": "Saudi Market Analysis - Q1 2024",
      "description": "Comprehensive analysis of Saudi stock market performance",
      "coverImage": "https://otrade.b-cdn.net/market-analysis/gulf-stocks/cover.jpg",
      "updatedAt": "2024-02-15T10:30:00.000Z"
    }
  ]
}
```

---

### 2.5 الحصول على جميع التحليلات لفئة معينة (بالـ ID)
```
GET http://localhost:3000/api/market-analysis/65f1234567890abcdef12345
Accept-Language: en
```

**Response:** نفس الـ response السابق

---

### 2.6 الحصول على جميع التحليلات (لغتين)
```
GET http://localhost:3000/api/market-analysis/forex
Accept-Language: ar|en
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "65f1234567890abcdef12348",
      "categoryId": "65f1234567890abcdef12346",
      "slug": "eur-usd-weekly-forecast",
      "coverImage": "https://otrade.b-cdn.net/market-analysis/forex/cover.jpg",
      "translations": {
        "en": {
          "title": "EUR/USD Weekly Forecast",
          "description": "Technical analysis for EUR/USD"
        },
        "ar": {
          "title": "توقعات اليورو/دولار الأسبوعية",
          "description": "تحليل فني لليورو/دولار"
        }
      },
      "updatedAt": "2024-02-15T10:30:00.000Z"
    }
  ]
}
```

---

### 2.7 الحصول على تحليل واحد بالـ ID
```
GET http://localhost:3000/api/market-analysis/single/65f1234567890abcdef12347
Accept-Language: en
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "65f1234567890abcdef12347",
    "categoryId": "65f1234567890abcdef12345",
    "slug": "saudi-market-analysis-q1-2024",
    "title": "Saudi Market Analysis - Q1 2024",
    "description": "Comprehensive analysis of Saudi stock market performance",
    "content": "Full article content with detailed analysis and charts...",
    "coverImage": "https://otrade.b-cdn.net/market-analysis/gulf-stocks/cover.jpg",
    "image": "https://otrade.b-cdn.net/market-analysis/gulf-stocks/image.jpg",
    "updates": [
      {
        "image": "https://otrade.b-cdn.net/market-analysis/gulf-stocks/updates/update-1.jpg",
        "updatedAt": "2025-06-31T10:30:00.000Z",
        "_id": "65f1234567890abcdef12348"
      }
    ],
    "updatedAt": "2024-02-15T10:30:00.000Z",
    "createdAt": "2024-02-15T10:30:00.000Z"
  }
}
```

---

### 2.8 الحصول على تحليل واحد بالـ slug (category + slug)
```
GET http://localhost:3000/api/market-analysis/gulf-stocks/saudi-market-analysis-q1-2024
Accept-Language: en
```

**Response:** نفس الـ response السابق

---

### 2.9 الحصول على تحليل واحد (لغتين)
```
GET http://localhost:3000/api/market-analysis/single/65f1234567890abcdef12349
Accept-Language: ar|en
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "65f1234567890abcdef12349",
    "categoryId": "65f1234567890abcdef12347",
    "slug": "bitcoin-price-analysis",
    "coverImage": "https://otrade.b-cdn.net/market-analysis/bitcoin/cover.jpg",
    "image": "https://otrade.b-cdn.net/market-analysis/bitcoin/image.jpg",
    "translations": {
      "en": {
        "title": "Bitcoin Price Analysis",
        "description": "Current Bitcoin market trends",
        "content": "Detailed analysis content..."
      },
      "ar": {
        "title": "تحليل سعر البيتكوين",
        "description": "اتجاهات سوق البيتكوين الحالية",
        "content": "محتوى التحليل المفصل..."
      }
    },
    "updatedAt": "2024-02-15T10:30:00.000Z",
    "createdAt": "2024-02-15T10:30:00.000Z"
  }
}
```

---

### 2.10 تعديل التحليل الأساسي
```
PUT http://localhost:3000/api/market-analysis/65f1234567890abcdef12347
Authorization: Bearer {{admin_token}}
Content-Type: multipart/form-data
```

**Body (form-data):**
```
title_en: Updated Saudi Market Analysis
content_ar: محتوى محدث...
coverImage: [ملف صورة غلاف جديد - اختياري]
image: [ملف صورة محتوى جديد - اختياري]
```

**ملاحظة:** هذا الـ endpoint للتعديل على المحتوى الأساسي فقط (بدون إضافة updates)

---

### 2.11 إضافة update جديد للتحليل
```
POST http://localhost:3000/api/market-analysis/65f1234567890abcdef12347/updates
Authorization: Bearer {{admin_token}}
Content-Type: multipart/form-data
```

**Body (form-data):**
```
updateImage: [ملف صورة التحديث - إلزامي]
```

**Response:**
```json
{
  "success": true,
  "message": "Update added successfully",
  "data": {
    "id": "65f1234567890abcdef12347",
    "updates": [
      {
        "image": "https://otrade.b-cdn.net/market-analysis/gulf-stocks/updates/update-1.jpg",
        "updatedAt": "2025-06-31T10:30:00.000Z",
        "_id": "65f1234567890abcdef12348"
      }
    ],
    "updatedAt": "2025-06-31T10:30:00.000Z"
  }
}
```

**ملاحظات:**
- هذا الـ endpoint مخصص لإضافة تحديثات جديدة فقط
- كل update يحتوي على صورة وتاريخ
- يمكن إضافة عدة updates لنفس التحليل
- التحديثات تظهر تحت المحتوى الأساسي بالترتيب الزمني

---

### 2.12 حذف تحليل
```
PUT http://localhost:3000/api/market-analysis/65f1234567890abcdef12347
Authorization: Bearer {{admin_token}}
Content-Type: multipart/form-data
```

**Body (form-data):**
```
title_en: Updated Saudi Market Analysis
content_ar: محتوى محدث...
coverImage: [ملف صورة جديد - اختياري]
image: [ملف صورة جديد - اختياري]
```

**ملاحظة:** يمكنك تحديث أي حقل بدون إرسال الباقي. الصور اختيارية في التحديث.

---

### 2.9 حذف تحليل
```
DELETE http://localhost:3000/api/market-analysis/65f1234567890abcdef12347
Authorization: Bearer {{admin_token}}
```

---

## 3️⃣ سيناريوهات الاستخدام الكاملة

### السيناريو 1: إنشاء نظام تحليلات كامل

**الخطوة 1: إنشاء الفئات الستة**
```
1. Gulf Stocks (أسهم الخليج)
2. Egyptian Stocks (أسهم مصرية)
3. Forex Analysis (تحليل الفوركس)
4. Bitcoin Analysis (تحليل البيتكوين)
5. Gold Analysis (تحليل الذهب)
6. Indices Analysis (تحليل المؤشرات)
```

**الخطوة 2: إضافة تحليلات لكل فئة**
- استخدم POST /api/market-analysis مع categoryId المناسب (الـ ID اللي رجع من إنشاء الفئة)

**الخطوة 3: إضافة updates للتحليلات**
- استخدم POST /api/market-analysis/{analysisId}/updates لإضافة تحديثات جديدة

**الخطوة 4: عرض التحليلات في التطبيق**
- GET /api/market-analysis/categories (للحصول على القائمة)
- GET /api/market-analysis/{categoryId أو slug} (للحصول على تحليلات الفئة)
- GET /api/market-analysis/single/{analysisId} (لعرض التحليل الكامل بالـ ID)
- GET /api/market-analysis/{categoryId أو slug}/{slug} (لعرض التحليل الكامل بالـ slug)

---

## 4️⃣ ملاحظات مهمة

### كيف يعمل نظام التحديثات (Updates)
- عند إنشاء تحليل جديد، يكون `updates` array فارغ
- لإضافة update جديد: `POST /api/market-analysis/{id}/updates` مع `updateImage`
- كل update يحتوي على:
  - `image`: صورة التحديث
  - `updatedAt`: تاريخ التحديث
  - `_id`: معرف فريد للتحديث
- يمكن إضافة عدة updates للتحليل الواحد
- التحديثات تظهر بالترتيب الزمني (الأحدث أولاً)
- `PUT /api/market-analysis/{id}` للتعديل على المحتوى الأساسي فقط (بدون إضافة updates)

### الـ Category ID
- عند إنشاء تحليل، يجب إرسال `categoryId` (ObjectId من MongoDB)
- يمكن الحصول على الـ ID من response إنشاء الفئة
- عند القراءة، يمكن استخدام الـ slug أو الـ ID في الـ URL
- مثال: `/api/market-analysis/gulf-stocks` أو `/api/market-analysis/65f1234567890abcdef12345`

### الـ Slug
- يتم توليده تلقائياً من الـ title (إنجليزي أو عربي)
- إذا كان موجود، يضاف رقم في النهاية تلقائياً
- مثال: `saudi-market-analysis`, `saudi-market-analysis-1`, `saudi-market-analysis-2`

### الصور
- **Categories**: صورة واحدة (coverImage) - إلزامية عند الإنشاء
- **Analyses**: صورتين (coverImage + image) - إلزاميتين عند الإنشاء
- الحد الأقصى: 5MB لكل صورة
- يتم الرفع على BunnyCDN تلقائياً

### اللغات
- دعم كامل للعربية والإنجليزية
- يمكن إرسال لغة واحدة فقط عند الإنشاء
- Accept-Language: en (لغة واحدة)
- Accept-Language: ar|en (لغتين معاً)

### الصلاحيات
- جميع عمليات الإنشاء/التحديث/الحذف تحتاج Admin token
- القراءة متاحة للجميع بدون authentication

### التحقق من الفئة
- عند إنشاء تحليل، يتم التحقق من وجود الفئة في قاعدة البيانات
- إذا كانت الفئة غير موجودة أو غير نشطة، يتم رفض الطلب

---

## 5️⃣ أخطاء شائعة

### خطأ: Invalid category ID
```json
{
  "success": false,
  "error": "Valid category ID is required"
}
```
**الحل:** تأكد من إرسال categoryId صحيح (ObjectId من MongoDB)

### خطأ: Category not found
```json
{
  "success": false,
  "error": "Invalid category. Category does not exist or is not active."
}
```
**الحل:** تأكد من إنشاء الفئة أولاً قبل إضافة التحليلات

### خطأ: Missing images
```json
{
  "success": false,
  "error": "Both coverImage and image are required"
}
```
**الحل:** أرسل الصورتين في الطلب

### خطأ: Missing name
```json
{
  "success": false,
  "error": "Name is required in at least one language"
}
```
**الحل:** أرسل name_en أو name_ar على الأقل

---

## 6️⃣ Postman Collection Variables

```json
{
  "base_url": "http://localhost:3000",
  "admin_token": "your_admin_jwt_token_here"
}
```

استخدم `{{base_url}}` و `{{admin_token}}` في الطلبات.
