# 🐰 إصلاح: رفع صور الذهب على BunnyCDN

## ❌ المشكلة السابقة

الكود كان بيرفع الصور على Cloudinary بدل BunnyCDN:
```
"coverImage": "https://res.cloudinary.com/dxvynre0v/image/upload/..."
```

---

## ✅ الحل

تم تغيير الكود لاستخدام BunnyCDN مباشرة.

### التغييرات في `src/modules/gold/gold.controller.js`:

#### 1. تغيير الـ Import

**قبل**:
```javascript
import { uploadImage } from '../../utils/cloudinary.js';
```

**بعد**:
```javascript
import bunnycdn from '../../utils/bunnycdn.js';
```

#### 2. تغيير استدعاء الرفع

**قبل**:
```javascript
coverImageUrl = await uploadImage(req.files.coverImage[0], 'gold');
```

**بعد**:
```javascript
const file = req.files.coverImage[0];
coverImageUrl = await bunnycdn.uploadImage(file.buffer, file.originalname, 'gold');
```

---

## 🎯 النتيجة

الآن الصور تُرفع مباشرة على BunnyCDN:
```
"coverImage": "https://otrade.b-cdn.net/gold/image-1707654321000.jpg"
```

---

## 🧪 الاختبار

### 1. أعد تشغيل السيرفر
```bash
npm start
```

### 2. ارفع صورة جديدة
```bash
POST /api/gold/info
Content-Type: multipart/form-data

coverImage: [ملف صورة]
title_en: "Gold Trading"
title_ar: "تداول الذهب"
```

### 3. تحقق من الـ Response
```json
{
  "success": true,
  "data": {
    "coverImage": "https://otrade.b-cdn.net/gold/..."
  }
}
```

---

## 📋 معلومات إضافية

### مسار الرفع على BunnyCDN:
```
Storage Zone: otrade
Folder: gold/
File Name: image-{timestamp}.jpg
Full Path: gold/image-1707654321000.jpg
CDN URL: https://otrade.b-cdn.net/gold/image-1707654321000.jpg
```

### الحد الأقصى لحجم الملف:
- الصور: 5MB (من multer middleware)
- BunnyCDN يدعم حتى 100MB

### الأنواع المدعومة:
- JPG, JPEG
- PNG
- WebP
- GIF

---

## ✅ تم الإصلاح!

الآن نظام الذهب يرفع الصور مباشرة على BunnyCDN بدون المرور على Cloudinary! 🚀

### الميزات:
- ✅ رفع مباشر على BunnyCDN
- ✅ أسماء ملفات فريدة (timestamp)
- ✅ مجلد منفصل للذهب (gold/)
- ✅ روابط CDN سريعة
- ✅ دعم الترجمات (عربي + إنجليزي)
- ✅ السعر الحالي للذهب

جاهز للاستخدام! 🎉
