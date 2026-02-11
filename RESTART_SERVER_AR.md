# 🔴 مهم جداً: لازم تعمل Restart للسيرفر!

## المشكلة الحالية

الكود اتعدل صح، بس السيرفر لسه شغال بالكود القديم.

عشان كده `req.body` لسه فاضي `{}`

---

## ✅ الحل اتطبق

أضفنا `uploadAny` middleware في الـ routes:

```javascript
// src/modules/courses/courses.routes.js
router.post('/:courseId/lessons', 
  authenticate(['admin', 'super_admin']), 
  checkPermission('courses', 'create'), 
  uploadAny,  // ← ده بيعمل parse للـ multipart/form-data
  addLesson
);
```

---

## 🚨 اعمل Restart للسيرفر دلوقتي

```bash
# 1. وقف السيرفر
# اضغط Ctrl+C في الـ terminal

# 2. شغل السيرفر تاني
npm start
# أو
node src/server.js
```

---

## ✅ بعد الـ Restart - النتيجة المتوقعة

لما تبعت نفس الـ request من Postman، هتشوف:

```
===== ADD LESSON DEBUG =====
Course ID: 698ca4faeb13e3c2d63f3d91
req.body: {
  'title[en]': 'Introduction to Trading',
  'title[ar]': 'مقدمة في التداول',
  'description[en]': 'Learn the basics of trading',
  'description[ar]': 'تعلم أساسيات التداول',
  videoUrl: 'https://cdn.example.com/lessons/intro.mp4',
  duration: '1800',
  order: '1'
}
req.body keys: [ 'title[en]', 'title[ar]', ... ]

✅ Validation passed, proceeding...
```

---

## 🧪 خطوات الاختبار

### 1. Restart السيرفر (مهم جداً!)
```bash
# وقف السيرفر: Ctrl+C
# شغل السيرفر: npm start
```

### 2. جرب من Postman

**Method:** POST  
**URL:** `http://localhost:3000/api/courses/698ca4faeb13e3c2d63f3d91/lessons`  
**Headers:** `Authorization: Bearer YOUR_ADMIN_TOKEN`

**Body (form-data):**

| KEY | VALUE |
|-----|-------|
| title[en] | Introduction to Trading |
| title[ar] | مقدمة في التداول |
| description[en] | Learn the basics of trading |
| description[ar] | تعلم أساسيات التداول |
| videoUrl | https://cdn.example.com/lessons/intro.mp4 |
| duration | 1800 |
| order | 1 |

### 3. النتيجة المتوقعة

```json
{
  "success": true,
  "message": "Lesson added successfully",
  "lesson": {
    "id": "...",
    "translations": {
      "en": {
        "title": "Introduction to Trading",
        "description": "Learn the basics of trading"
      },
      "ar": {
        "title": "مقدمة في التداول",
        "description": "تعلم أساسيات التداول"
      }
    },
    "videoUrl": "https://cdn.example.com/lessons/intro.mp4",
    "duration": 1800,
    "order": 1
  }
}
```

---

## 🧹 بعد ما تتأكد إنه شغال

لما تتأكد إن كل حاجة شغالة، هنشيل الـ console.log من الكود.

---

## 📊 ليه بيحصل كده؟

| Content-Type | Middleware المطلوب | Postman Option |
|-------------|-------------------|----------------|
| `application/json` | `express.json()` | Body → raw → JSON |
| `application/x-www-form-urlencoded` | `express.urlencoded()` | Body → x-www-form-urlencoded |
| `multipart/form-data` | **multer** | Body → form-data |

### النقاط المهمة:
- `express.json()` - بيعمل parse للـ JSON بس
- `express.urlencoded()` - بيعمل parse للـ URL-encoded forms بس
- `multer` - بيعمل parse للـ multipart/form-data (مع أو من غير files)

---

## 🔄 بديل: استخدم x-www-form-urlencoded

لو مش عايز تعمل restart دلوقتي، ممكن تجرب:

**في Postman:**
- غير Body type من "form-data" لـ "x-www-form-urlencoded"
- ده هيشتغل مع الـ `express.urlencoded()` الموجود

بس عشان الـ file uploads بعدين، هتحتاج multer، فالـ restart أحسن.

---

## ✅ الحالة: الحل اتطبق - مستني Restart

- ✅ Multer middleware اتضاف للـ routes
- ✅ uploadAny موجود في upload.middleware.js
- ✅ Debug logging موجود
- 🔴 **لازم restart للسيرفر**
- ⏳ الاختبار مستني

**آخر تحديث:** 11 فبراير 2026
