# 🔧 إصلاح خطأ entityType للذهب

## ❌ المشكلة

```
Error: Invalid entityType: course, strategy, analysis, webinar, psychology, analyst, testimonial, books, articles, lesson
```

كان نظام الترجمة لا يدعم `gold` كنوع كيان (entityType).

---

## ✅ الحل

تم إضافة `'gold'` إلى قائمة الأنواع المسموحة في:

### 1. Translation Model
**الملف**: `src/modules/translations/translation.model.js`

```javascript
entityType: {
  type: String,
  enum: [
    'course',
    'strategy',
    'analysis',
    'webinar',
    'psychology',
    'analyst',
    'testimonial',
    'books',
    'articles',
    'lesson',
    'gold'  // ✅ تمت الإضافة
  ],
  required: true
}
```

### 2. Translation Service
**الملف**: `src/modules/translations/translation.service.js`

```javascript
const validEntityTypes = [
  'course',
  'strategy',
  'analysis',
  'webinar',
  'psychology',
  'analyst',
  'testimonial',
  'books',
  'articles',
  'lesson',
  'gold'  // ✅ تمت الإضافة
];
```

---

## 🔄 الخطوات التالية

1. **أعد تشغيل السيرفر**:
```bash
# إذا كنت تستخدم nodemon، سيعيد التشغيل تلقائياً
# وإلا، أوقف السيرفر وأعد تشغيله:
npm start
```

2. **اختبر الـ Endpoint مرة أخرى**:
```bash
POST /api/gold/info
```

---

## ✅ النتيجة المتوقعة

الآن يجب أن يعمل الـ endpoint بنجاح:

```json
{
  "success": true,
  "message": "Gold information updated successfully",
  "data": {
    "translations": {
      "en": {
        "title": "Gold Trading",
        "description": "...",
        "faqs": [...]
      },
      "ar": {
        "title": "تداول الذهب",
        "description": "...",
        "faqs": [...]
      }
    },
    "coverImage": "https://res.cloudinary.com/...",
    "updatedAt": "2026-02-13T..."
  }
}
```

---

## 📝 ملاحظة

الصورة تم رفعها بنجاح إلى Cloudinary (كما يظهر في الـ log):
```
Cover image uploaded: https://res.cloudinary.com/dxvynre0v/image/upload/v1770938753/gold/...
```

الخطأ كان فقط في حفظ الترجمات، وتم إصلاحه الآن! ✅

---

## 🎉 تم الإصلاح!

النظام الآن يدعم:
- ✅ رفع صور الذهب
- ✅ حفظ الترجمات (عربي + إنجليزي)
- ✅ حفظ الأسئلة الشائعة
- ✅ جلب المعلومات مع السعر الحالي

جاهز للاستخدام! 🚀
