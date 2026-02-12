# 🖼️ رفع صورة الغلاف لنظام الذهب - دليل سريع

## ✅ التحديثات المنفذة

تم تحديث نظام معلومات الذهب لدعم رفع صور الغلاف مباشرة من BunnyCDN بدلاً من إرسال روابط URL.

---

## 📋 الـ Endpoint

```
POST /api/gold/info
```

**المصادقة**: مطلوبة (Admin/Super Admin)

**Content-Type**: `multipart/form-data`

---

## 🎯 الحقول المدعومة

### 1. صورة الغلاف (اختياري)
```
coverImage: [ملف صورة]
```
- يتم رفع الصورة مباشرة إلى BunnyCDN
- الحد الأقصى: 5MB
- الأنواع المدعومة: JPG, PNG, WebP, GIF

### 2. العنوان (مطلوب)
```
title_en: "Gold Trading"
title_ar: "تداول الذهب"
```
أو
```
title[en]: "Gold Trading"
title[ar]: "تداول الذهب"
```
أو
```
title: {"en": "Gold Trading", "ar": "تداول الذهب"}
```

### 3. الوصف (مطلوب)
```
description_en: "Gold is one of the most traded precious metals..."
description_ar: "الذهب هو أحد أكثر المعادن الثمينة تداولاً..."
```

### 4. الأسئلة الشائعة (اختياري)
```
faqs_en: [{"question": "What is gold?", "answer": "Gold is..."}]
faqs_ar: [{"question": "ما هو الذهب؟", "answer": "الذهب هو..."}]
```

---

## 🧪 مثال Postman

### الخطوات:
1. افتح Postman
2. اختر `POST`
3. URL: `http://localhost:3000/api/gold/info`
4. Headers:
   - `Authorization: Bearer YOUR_ADMIN_TOKEN`
5. Body → اختر `form-data`
6. أضف الحقول:

| Key | Type | Value |
|-----|------|-------|
| coverImage | File | [اختر ملف صورة] |
| title_en | Text | Gold Trading |
| title_ar | Text | تداول الذهب |
| description_en | Text | Gold is one of the most traded precious metals in the world. |
| description_ar | Text | الذهب هو أحد أكثر المعادن الثمينة تداولاً في العالم. |
| faqs_en | Text | [{"question":"What is gold?","answer":"Gold is a precious metal"}] |
| faqs_ar | Text | [{"question":"ما هو الذهب؟","answer":"الذهب معدن ثمين"}] |

---

## 📤 مثال Response

```json
{
  "success": true,
  "message": "Gold information updated successfully",
  "data": {
    "translations": {
      "en": {
        "title": "Gold Trading",
        "description": "Gold is one of the most traded precious metals...",
        "faqs": [
          {
            "question": "What is gold?",
            "answer": "Gold is a precious metal"
          }
        ]
      },
      "ar": {
        "title": "تداول الذهب",
        "description": "الذهب هو أحد أكثر المعادن الثمينة تداولاً...",
        "faqs": [
          {
            "question": "ما هو الذهب؟",
            "answer": "الذهب معدن ثمين"
          }
        ]
      }
    },
    "coverImage": "https://otrade.b-cdn.net/gold/image-123456.jpg",
    "updatedAt": "2026-02-13T10:30:00.000Z"
  }
}
```

---

## 🔍 جلب المعلومات مع السعر الحالي

```
GET /api/gold/info
```

**Headers**:
- `Accept-Language: ar` (للعربية)
- `Accept-Language: en` (للإنجليزية)
- `Accept-Language: ar|en` (للحصول على اللغتين)

**Response مع السعر الحالي**:
```json
{
  "success": true,
  "data": {
    "title": "Gold Trading",
    "description": "Gold is one of the most traded precious metals...",
    "coverImage": "https://otrade.b-cdn.net/gold/image-123456.jpg",
    "faqs": [
      {
        "question": "What is gold?",
        "answer": "Gold is a precious metal"
      }
    ],
    "livePrice": {
      "price": "2045.50",
      "currency": "USD",
      "lastUpdate": "2026-02-13T10:30:00.000Z"
    },
    "updatedAt": "2026-02-13T10:30:00.000Z"
  }
}
```

---

## 🔄 آلية العمل

1. **رفع الصورة**:
   - إذا تم إرسال ملف `coverImage`، يتم رفعه إلى BunnyCDN
   - يتم حفظ رابط الصورة في قاعدة البيانات
   - إذا لم يتم إرسال ملف، يتم استخدام الرابط من `req.body.coverImage` (إن وجد)
   - إذا لم يتم إرسال أي شيء، يتم الاحتفاظ بالصورة الحالية

2. **الترجمات**:
   - يتم حفظ العنوان والوصف والأسئلة في نظام الترجمة
   - يدعم اللغتين العربية والإنجليزية
   - الأسئلة الشائعة يتم حفظها كـ JSON في حقل `content`

3. **السعر الحالي**:
   - يتم جلب السعر من API خارجي: `https://api.gold-api.com/price/XAU`
   - يتم إرجاع السعر مع المعلومات في كل طلب GET
   - إذا فشل جلب السعر، يتم إرجاع المعلومات فقط

---

## 🐛 استكشاف الأخطاء

### الخطأ: "Only image files are allowed"
- تأكد من أن الملف المرفوع هو صورة (JPG, PNG, WebP, GIF)

### الخطأ: "File too large"
- الحد الأقصى لحجم الصورة: 5MB
- قم بضغط الصورة قبل الرفع

### الخطأ: "Authentication required"
- تأكد من إرسال `Authorization: Bearer TOKEN` في الـ Headers
- تأكد من أن المستخدم لديه صلاحيات Admin

### الخطأ: "Invalid JSON in faqs"
- تأكد من أن الأسئلة الشائعة بصيغة JSON صحيحة
- مثال: `[{"question":"Q1","answer":"A1"}]`

---

## 📝 ملاحظات مهمة

1. ✅ رفع الصورة اختياري - يمكن تحديث النصوص فقط
2. ✅ يدعم جميع صيغ FormData (underscore, brackets, JSON)
3. ✅ يتم إرجاع السعر الحالي للذهب تلقائياً مع كل طلب GET
4. ✅ نفس الـ Endpoint للإنشاء والتحديث
5. ✅ يتم حفظ سجل واحد فقط في قاعدة البيانات

---

## 🚀 الملفات المحدثة

- `src/modules/gold/gold.controller.js` - إضافة منطق رفع الصورة
- `src/modules/gold/gold.routes.js` - استخدام `uploadWithOptionalImage` middleware
- `src/modules/gold/gold.model.js` - نموذج بسيط يحتوي على `coverImage` فقط

---

تم التحديث بنجاح! 🎉
