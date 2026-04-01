# Market Analysis API - Postman Examples

## 1. Create Market Analysis (إنشاء تحليل سوق)

**Endpoint:** `POST /api/market-analysis`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data
```

**Body (form-data):**
```
categoryId: 507f1f77bcf86cd799439011

title_en: Gold Market Analysis
title_ar: تحليل سوق الذهب

name_en: by John Smith
name_ar: بواسطة جون سميث

description_en: Comprehensive analysis of gold market trends
description_ar: تحليل شامل لاتجاهات سوق الذهب

content_en: Detailed content about gold market...
content_ar: محتوى تفصيلي عن سوق الذهب...

coverImage: [File] (اختر صورة الغلاف)
image: [File] (اختياري - صورة إضافية)
```

**Response:**
```json
{
  "success": true,
  "message": "Market analysis created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "categoryId": "507f1f77bcf86cd799439011",
    "slug": "gold-market-analysis",
    "coverImage": "https://otrade.b-cdn.net/market-analysis/gold/cover-123.png",
    "image": "https://otrade.b-cdn.net/market-analysis/gold/image-123.png",
    "updates": [],
    "translations": {
      "en": {
        "title": "Gold Market Analysis",
        "name": "by John Smith",
        "description": "Comprehensive analysis of gold market trends",
        "content": "Detailed content about gold market..."
      },
      "ar": {
        "title": "تحليل سوق الذهب",
        "name": "بواسطة جون سميث",
        "description": "تحليل شامل لاتجاهات سوق الذهب",
        "content": "محتوى تفصيلي عن سوق الذهب..."
      }
    },
    "updatedAt": "2026-03-03T10:00:00.000Z",
    "createdAt": "2026-03-03T10:00:00.000Z"
  }
}
```

---

## 2. Update Market Analysis (تحديث تحليل سوق)

**Endpoint:** `PUT /api/market-analysis/:id`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data
```

**Body (form-data):**
```
title_en: Updated Gold Market Analysis
title_ar: تحليل سوق الذهب المحدث

name_en: by John Smith - Updated
name_ar: بواسطة جون سميث - محدث

description_en: Updated comprehensive analysis
description_ar: تحليل شامل محدث

content_en: Updated detailed content...
content_ar: محتوى تفصيلي محدث...

coverImage: [File] (اختياري - لتحديث الصورة)
image: [File] (اختياري - لتحديث الصورة)
```

---

## 3. Add Update to Analysis (إضافة تحديث للتحليل)

**Endpoint:** `POST /api/market-analysis/updates/:id/add`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data
```

**Body (form-data):**
```
title_en: Market Update - March 3rd
title_ar: تحديث السوق - 3 مارس

name_en: by Sarah Johnson
name_ar: بواسطة سارة جونسون

content_en: Latest market movements and analysis...
content_ar: أحدث تحركات السوق والتحليل...

updateImage: [File] (صورة التحديث - مطلوبة)

updatedAt: 2026-03-03T12:00:00Z (اختياري - التاريخ)
```

**Response:**
```json
{
  "success": true,
  "message": "Update added successfully",
  "data": {
    "updateId": "507f1f77bcf86cd799439013",
    "image": "https://otrade.b-cdn.net/market-analysis/gold/updates/update-123.png",
    "updatedAt": "2026-03-03T12:00:00.000Z",
    "translations": {
      "en": {
        "title": "Market Update - March 3rd",
        "name": "by Sarah Johnson",
        "content": "Latest market movements and analysis..."
      },
      "ar": {
        "title": "تحديث السوق - 3 مارس",
        "name": "بواسطة سارة جونسون",
        "content": "أحدث تحركات السوق والتحليل..."
      }
    }
  }
}
```

---

## 4. Update Analysis Update (تحديث تحديث التحليل)

**Endpoint:** `PUT /api/market-analysis/updates/:id/edit/:updateId`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data
```

**Body (form-data):**
```
title_en: Updated Market Update
title_ar: تحديث السوق المحدث

name_en: by Sarah Johnson - Revised
name_ar: بواسطة سارة جونسون - منقح

content_en: Revised market analysis...
content_ar: تحليل السوق المنقح...

updateImage: [File] (اختياري - لتحديث الصورة)

updatedAt: 2026-03-03T14:00:00Z (اختياري)
```

---

## 5. Get Analysis by Category (الحصول على التحليلات حسب الفئة)

**Endpoint:** `GET /api/market-analysis/:category`

**Headers:**
```
Accept-Language: en (أو ar للعربية، أو en|ar للغتين)
```

**Response (Single Language - en):**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "categoryId": "507f1f77bcf86cd799439011",
      "slug": "gold-market-analysis",
      "title": "Gold Market Analysis",
      "name": "by John Smith",
      "description": "Comprehensive analysis of gold market trends",
      "content": "Detailed content about gold market...",
      "coverImage": "https://otrade.b-cdn.net/market-analysis/gold/cover-123.png",
      "image": "https://otrade.b-cdn.net/market-analysis/gold/image-123.png",
      "updatedAt": "2026-03-03T10:00:00.000Z"
    }
  ]
}
```

**Response (Multiple Languages - en|ar):**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "categoryId": "507f1f77bcf86cd799439011",
      "slug": "gold-market-analysis",
      "coverImage": "https://otrade.b-cdn.net/market-analysis/gold/cover-123.png",
      "image": "https://otrade.b-cdn.net/market-analysis/gold/image-123.png",
      "translations": {
        "en": {
          "title": "Gold Market Analysis",
          "name": "by John Smith",
          "description": "Comprehensive analysis of gold market trends",
          "content": "Detailed content about gold market..."
        },
        "ar": {
          "title": "تحليل سوق الذهب",
          "name": "بواسطة جون سميث",
          "description": "تحليل شامل لاتجاهات سوق الذهب",
          "content": "محتوى تفصيلي عن سوق الذهب..."
        }
      },
      "updatedAt": "2026-03-03T10:00:00.000Z"
    }
  ]
}
```

---

## 6. Get Single Analysis (الحصول على تحليل واحد)

**Endpoint:** `GET /api/market-analysis/:category/:slug`

أو

**Endpoint:** `GET /api/market-analysis/single/:slug`

**Headers:**
```
Accept-Language: en|ar (للحصول على اللغتين)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "categoryId": "507f1f77bcf86cd799439011",
    "slug": "gold-market-analysis",
    "coverImage": "https://otrade.b-cdn.net/market-analysis/gold/cover-123.png",
    "image": "https://otrade.b-cdn.net/market-analysis/gold/image-123.png",
    "updates": [
      {
        "id": "507f1f77bcf86cd799439013",
        "image": "https://otrade.b-cdn.net/market-analysis/gold/updates/update-123.png",
        "updatedAt": "2026-03-03T12:00:00.000Z",
        "translations": {
          "en": {
            "title": "Market Update - March 3rd",
            "name": "by Sarah Johnson",
            "content": "Latest market movements..."
          },
          "ar": {
            "title": "تحديث السوق - 3 مارس",
            "name": "بواسطة سارة جونسون",
            "content": "أحدث تحركات السوق..."
          }
        }
      }
    ],
    "translations": {
      "en": {
        "title": "Gold Market Analysis",
        "name": "by John Smith",
        "description": "Comprehensive analysis of gold market trends",
        "content": "Detailed content about gold market..."
      },
      "ar": {
        "title": "تحليل سوق الذهب",
        "name": "بواسطة جون سميث",
        "description": "تحليل شامل لاتجاهات سوق الذهب",
        "content": "محتوى تفصيلي عن سوق الذهب..."
      }
    },
    "updatedAt": "2026-03-03T10:00:00.000Z",
    "createdAt": "2026-03-03T10:00:00.000Z"
  }
}
```

---

## 7. Get All Updates for Analysis (الحصول على جميع التحديثات)

**Endpoint:** `GET /api/market-analysis/updates/:id/all`

**Headers:**
```
Accept-Language: ar (للعربية فقط)
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439013",
      "title": "تحديث السوق - 3 مارس",
      "name": "بواسطة سارة جونسون",
      "content": "أحدث تحركات السوق والتحليل...",
      "image": "https://otrade.b-cdn.net/market-analysis/gold/updates/update-123.png",
      "updatedAt": "2026-03-03T12:00:00.000Z"
    }
  ]
}
```

---

## ملاحظات مهمة:

### 1. طرق إرسال الترجمات:

**الطريقة الأولى (مفضلة):**
```
title_en: English Title
title_ar: العنوان بالعربية
name_en: by Author Name
name_ar: بواسطة اسم الكاتب
```

**الطريقة الثانية:**
```
title[en]: English Title
title[ar]: العنوان بالعربية
name[en]: by Author Name
name[ar]: بواسطة اسم الكاتب
```

**الطريقة الثالثة (JSON):**
```
title: {"en": "English Title", "ar": "العنوان بالعربية"}
name: {"en": "by Author Name", "ar": "بواسطة اسم الكاتب"}
```

### 2. الحقول المطلوبة:

**Create Analysis:**
- `categoryId` ✅ مطلوب
- `title` (en أو ar) ✅ مطلوب
- `coverImage` ✅ مطلوب
- `image` ❌ اختياري
- `name` ❌ اختياري
- `description` ❌ اختياري
- `content` ❌ اختياري

**Add Update:**
- `title` (en أو ar) ✅ مطلوب
- `updateImage` ✅ مطلوب
- `name` ❌ اختياري
- `content` ❌ اختياري
- `updatedAt` ❌ اختياري

### 3. Accept-Language Header:

- `en` - إنجليزي فقط
- `ar` - عربي فقط
- `en|ar` - اللغتين معاً (يرجع translations object)

### 4. Authentication:

جميع endpoints الخاصة بالإنشاء والتعديل والحذف تحتاج:
- Bearer Token في الـ Authorization header
- صلاحيات Admin أو Super Admin
- Permission: `analysis` (create/update/delete)

### 5. أمثلة استخدام name:

```
name_en: by John Smith
name_ar: بواسطة جون سميث

name_en: Analysis by Sarah Johnson
name_ar: تحليل بواسطة سارة جونسون

name_en: Market Expert - Mike Brown
name_ar: خبير السوق - مايك براون
```

الحقل `name` مرن ويمكن استخدامه لأي نص تريده (اسم الكاتب، المصدر، إلخ).
