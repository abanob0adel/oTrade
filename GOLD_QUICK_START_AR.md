# 🚀 نظام الذهب - دليل البدء السريع

## ⚡ البدء السريع

### 1️⃣ إنشاء/تحديث معلومات الذهب

```bash
POST /api/gold/info
```

**Postman**:
- Method: `POST`
- URL: `http://localhost:3000/api/gold/info`
- Headers: `Authorization: Bearer YOUR_TOKEN`
- Body: `form-data`

| المفتاح | النوع | القيمة |
|---------|------|--------|
| coverImage | File | [اختر صورة] |
| title_en | Text | Gold Trading |
| title_ar | Text | تداول الذهب |
| description_en | Text | Gold description |
| description_ar | Text | وصف الذهب |

---

### 2️⃣ جلب المعلومات (عربي)

```bash
GET /api/gold/info
Header: Accept-Language: ar
```

---

### 3️⃣ جلب المعلومات (إنجليزي)

```bash
GET /api/gold/info
Header: Accept-Language: en
```

---

### 4️⃣ جلب المعلومات (اللغتين)

```bash
GET /api/gold/info
Header: Accept-Language: ar|en
```

---

### 5️⃣ جلب السعر الحالي فقط

```bash
GET /api/gold
```

---

## 📋 الحقول المدعومة

### صيغة 1: Underscore
```
title_en, title_ar
description_en, description_ar
faqs_en, faqs_ar
```

### صيغة 2: Brackets
```
title[en], title[ar]
description[en], description[ar]
faqs[en], faqs[ar]
```

### صيغة 3: JSON
```
title: {"en": "Gold", "ar": "ذهب"}
description: {"en": "Desc", "ar": "وصف"}
```

---

## 🖼️ رفع الصورة

### مع صورة:
```
coverImage: [ملف صورة]
```

### بدون صورة (تحديث النص فقط):
```
لا ترسل حقل coverImage
```

### استخدام رابط:
```
coverImage: "https://example.com/image.jpg"
```

---

## 📤 مثال Response

```json
{
  "success": true,
  "data": {
    "title": "تداول الذهب",
    "description": "الذهب هو أحد أكثر المعادن...",
    "coverImage": "https://otrade.b-cdn.net/gold/image.jpg",
    "faqs": [
      {
        "question": "ما هو الذهب؟",
        "answer": "الذهب معدن ثمين"
      }
    ],
    "livePrice": {
      "price": "2045.50",
      "currency": "USD",
      "lastUpdate": "2026-02-13T10:30:00.000Z"
    }
  }
}
```

---

## 🎯 الميزات الرئيسية

✅ رفع الصور مباشرة إلى BunnyCDN  
✅ دعم اللغتين (عربي + إنجليزي)  
✅ السعر الحالي للذهب تلقائياً  
✅ الأسئلة الشائعة  
✅ نفس الـ Endpoint للإنشاء والتحديث  
✅ رفع الصورة اختياري  

---

## 📚 الملفات المساعدة

- `GOLD_INFO_IMAGE_UPLOAD_AR.md` - دليل مفصل بالعربي
- `GOLD_IMAGE_UPLOAD_COMPLETE.md` - دليل تقني كامل
- `gold_image_upload_postman.json` - مجموعة Postman
- `test-gold-image-upload.js` - سكريبت اختبار

---

## 🔧 استكشاف الأخطاء

### خطأ: "Only image files allowed"
➡️ تأكد من رفع صورة (JPG, PNG, WebP, GIF)

### خطأ: "File too large"
➡️ الحد الأقصى 5MB

### خطأ: "Authentication required"
➡️ أضف `Authorization: Bearer TOKEN`

---

جاهز للاستخدام! 🎉
