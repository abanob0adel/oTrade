# 📮 أمثلة Postman - نظام تحليلات الأسواق

## 🎯 كيفية الاستخدام

### 1. استيراد الـ Collection
1. افتح Postman
2. اضغط على `Import`
3. اختر ملف `market_analysis_postman.json`
4. Collection هيظهر في Postman

### 2. تعيين المتغيرات
في الـ Collection Variables:
- `base_url`: `http://localhost:3000/api`
- `admin_token`: ضع الـ Admin Token بتاعك
- `analysis_id`: هيتملى تلقائياً بعد إنشاء تحليل

---

## 📝 أمثلة FormData

### مثال 1: إنشاء تحليل أسهم الخليج

```
POST http://localhost:3000/api/market-analysis
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data
```

**Body (form-data)**:

| Key | Type | Value |
|-----|------|-------|
| category | Text | gulf-stocks |
| coverImage | File | [اختر صورة الغلاف] |
| image | File | [اختر صورة المقال] |
| title_en | Text | Saudi Stock Market Analysis Q1 2026 |
| title_ar | Text | تحليل سوق الأسهم السعودية الربع الأول 2026 |
| description_en | Text | Comprehensive analysis of Saudi stock market... |
| description_ar | Text | تحليل شامل لأداء سوق الأسهم السعودية... |
| content_en | Text | The Saudi stock market showed strong performance... |
| content_ar | Text | أظهر سوق الأسهم السعودية أداءً قوياً... |

---

### مثال 2: إنشاء تحليل الفوريكس

```
POST http://localhost:3000/api/market-analysis
```

**Body (form-data)**:

| Key | Type | Value |
|-----|------|-------|
| category | Text | forex |
| coverImage | File | [صورة] |
| image | File | [صورة] |
| title_en | Text | EUR/USD Weekly Forecast |
| title_ar | Text | توقعات اليورو/دولار الأسبوعية |
| description_en | Text | Technical and fundamental analysis... |
| description_ar | Text | تحليل فني وأساسي... |
| content_en | Text | EUR/USD Technical Analysis:\n\nSupport: 1.0800... |
| content_ar | Text | التحليل الفني:\n\nالدعم: 1.0800... |

---

### مثال 3: إنشاء تحليل البيتكوين

```
POST http://localhost:3000/api/market-analysis
```

**Body (form-data)**:

| Key | Type | Value |
|-----|------|-------|
| category | Text | bitcoin |
| coverImage | File | [صورة] |
| image | File | [صورة] |
| title_en | Text | Bitcoin Price Analysis - Breaking $50K |
| title_ar | Text | تحليل سعر البيتكوين - كسر حاجز 50 ألف دولار |
| description_en | Text | Bitcoin breaks through $50,000... |
| description_ar | Text | البيتكوين يخترق مقاومة 50,000 دولار... |
| content_en | Text | Current Price: $50,250\nMarket Cap: $980B... |
| content_ar | Text | السعر الحالي: 50,250 دولار... |

---

### مثال 4: تحديث تحليل موجود

```
PUT http://localhost:3000/api/market-analysis/507f1f77bcf86cd799439011
```

**Body (form-data)** - كل الحقول اختيارية:

| Key | Type | Value |
|-----|------|-------|
| title_en | Text | Bitcoin Price Analysis - Updated |
| content_ar | Text | المحتوى المحدث... |
| coverImage | File | [صورة جديدة - اختياري] |

---

## 🔍 أمثلة GET Requests

### 1. جلب كل تحليلات أسهم الخليج (عربي)

```
GET http://localhost:3000/api/market-analysis/gulf-stocks
Header: Accept-Language: ar
```

### 2. جلب كل تحليلات الفوريكس (اللغتين)

```
GET http://localhost:3000/api/market-analysis/forex
Header: Accept-Language: ar|en
```

### 3. جلب تحليل واحد بالـ Slug

```
GET http://localhost:3000/api/market-analysis/bitcoin/bitcoin-price-analysis-breaking-50k
Header: Accept-Language: en
```

---

## 📊 الفئات المتاحة

استخدم واحدة من هذه القيم في حقل `category`:

1. `gulf-stocks` - أسهم الخليج
2. `egyptian-stocks` - الأسهم المصرية
3. `forex` - الفوريكس
4. `bitcoin` - البيتكوين
5. `gold` - الذهب
6. `indices` - المؤشرات

---

## 🎨 صيغ FormData المدعومة

### صيغة 1: Underscore (موصى بها)
```
title_en: "Title"
title_ar: "العنوان"
description_en: "Description"
description_ar: "الوصف"
content_en: "Content"
content_ar: "المحتوى"
```

### صيغة 2: Brackets
```
title[en]: "Title"
title[ar]: "العنوان"
description[en]: "Description"
description[ar]: "الوصف"
content[en]: "Content"
content[ar]: "المحتوى"
```

### صيغة 3: JSON String
```
title: {"en": "Title", "ar": "العنوان"}
description: {"en": "Description", "ar": "الوصف"}
content: {"en": "Content", "ar": "المحتوى"}
```

---

## 🖼️ رفع الصور

### في Postman:
1. اختر `form-data` في Body
2. في حقل `coverImage` أو `image`:
   - غير النوع من `Text` إلى `File`
   - اضغط `Select Files`
   - اختر الصورة من جهازك

### متطلبات الصور:
- النوع: JPG, PNG, WebP, GIF
- الحد الأقصى: 5MB
- يتم رفعها على BunnyCDN تلقائياً

---

## ✅ Response Examples

### Create Success:
```json
{
  "success": true,
  "message": "Market analysis created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "category": "gulf-stocks",
    "slug": "saudi-stock-market-analysis-q1-2026",
    "coverImage": "https://otrade.b-cdn.net/market-analysis/gulf-stocks/cover-123.jpg",
    "image": "https://otrade.b-cdn.net/market-analysis/gulf-stocks/image-123.jpg",
    "translations": {
      "en": {
        "title": "Saudi Stock Market Analysis Q1 2026",
        "description": "...",
        "content": "..."
      },
      "ar": {
        "title": "تحليل سوق الأسهم السعودية...",
        "description": "...",
        "content": "..."
      }
    },
    "updatedAt": "2026-02-13T10:30:00Z",
    "createdAt": "2026-02-13T10:30:00Z"
  }
}
```

### Get List (Arabic):
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "category": "gulf-stocks",
      "slug": "saudi-stock-market-analysis-q1-2026",
      "title": "تحليل سوق الأسهم السعودية الربع الأول 2026",
      "description": "تحليل شامل لأداء سوق الأسهم السعودية...",
      "coverImage": "https://otrade.b-cdn.net/...",
      "updatedAt": "2026-02-13T10:30:00Z"
    }
  ]
}
```

---

## 🔐 المصادقة (Authentication)

### الحصول على Admin Token:
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

استخدم الـ `token` في كل الطلبات:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎯 نصائح Postman

1. **حفظ الـ Token**:
   - بعد Login، انسخ الـ token
   - ضعه في Collection Variable `admin_token`
   - هيستخدم تلقائياً في كل الطلبات

2. **حفظ الـ ID**:
   - بعد Create، انسخ الـ `id` من Response
   - ضعه في Collection Variable `analysis_id`
   - استخدمه في Update/Delete

3. **اختبار اللغات**:
   - جرب `Accept-Language: ar`
   - جرب `Accept-Language: en`
   - جرب `Accept-Language: ar|en`

4. **رفع الصور**:
   - استخدم صور حقيقية للاختبار
   - تأكد من الحجم أقل من 5MB
   - جرب صيغ مختلفة (JPG, PNG)

---

## 🚀 جاهز للاستخدام!

1. استورد الـ Collection
2. عيّن الـ Variables
3. ابدأ الاختبار!

🎉
