# ✅ نظام الدروس للكورسات - مكتمل

## 📋 نظرة عامة

تم تنفيذ نظام إدارة دروس كامل للكورسات مع دعم كامل للغتين (العربية والإنجليزية) باستخدام نظام الترجمة الموجود.

---

## 🎯 المميزات المنفذة

### 1. تحديث Course Model
- أضيف مصفوفة `lessons` لكل كورس
- كل درس يحتوي على:
  - `videoUrl` - رابط فيديو الدرس (BunnyCDN)
  - `contentUrl` - رابط مواد الدرس (PDF، إلخ)
  - `duration` - مدة الدرس بالثواني
  - `order` - ترتيب الدرس
  - `createdAt` - تاريخ الإنشاء
  - `_id` - معرف فريد للدرس

### 2. التكامل مع نظام الترجمة
- عناوين وأوصاف ومحتوى الدروس مخزنة في Translation collection
- يدعم العربية والإنجليزية
- يستخدم البنية التحتية الموجودة للترجمة
- نوع الكيان: `lesson`

### 3. عمليات CRUD كاملة
- ✅ إنشاء درس (Admin فقط)
- ✅ قراءة الدروس (عام/مصادق)
- ✅ تحديث درس (Admin فقط)
- ✅ حذف درس (Admin فقط)

---

## 📡 Endpoints

### Admin Endpoints (تتطلب مصادقة + صلاحيات)

#### 1. إضافة درس لكورس
```
POST /api/courses/:courseId/lessons
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": {
    "en": "Introduction to Trading",
    "ar": "مقدمة في التداول"
  },
  "description": {
    "en": "Learn the basics of trading",
    "ar": "تعلم أساسيات التداول"
  },
  "content": {
    "en": "Full lesson content in English",
    "ar": "محتوى الدرس الكامل بالعربية"
  },
  "videoUrl": "https://cdn.example.com/lessons/intro.mp4",
  "contentUrl": "https://cdn.example.com/lessons/materials.pdf",
  "duration": 1800,
  "order": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lesson added successfully",
  "lesson": {
    "id": "lesson_id",
    "translations": {
      "en": {
        "title": "Introduction to Trading",
        "description": "Learn the basics of trading",
        "content": "Full lesson content in English"
      },
      "ar": {
        "title": "مقدمة في التداول",
        "description": "تعلم أساسيات التداول",
        "content": "محتوى الدرس الكامل بالعربية"
      }
    },
    "videoUrl": "https://cdn.example.com/lessons/intro.mp4",
    "contentUrl": "https://cdn.example.com/lessons/materials.pdf",
    "duration": 1800,
    "order": 1,
    "createdAt": "2026-02-11T10:00:00.000Z"
  }
}
```

#### 2. تحديث درس
```
PUT /api/courses/:courseId/lessons/:lessonId
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
```

**Request Body (كل الحقول اختيارية):**
```json
{
  "title": {
    "en": "Updated Title",
    "ar": "العنوان المحدث"
  },
  "description": {
    "en": "Updated description"
  },
  "videoUrl": "https://cdn.example.com/lessons/updated.mp4",
  "duration": 2100,
  "order": 2
}
```

#### 3. حذف درس
```
DELETE /api/courses/:courseId/lessons/:lessonId
Authorization: Bearer ADMIN_TOKEN
```

---

### Public/User Endpoints

#### 4. الحصول على جميع الدروس
```
GET /api/courses/:courseId/lessons
Accept-Language: ar  (أو en)
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "lessons": [
    {
      "id": "lesson_id_1",
      "title": "مقدمة في التداول",
      "description": "تعلم الأساسيات",
      "content": "المحتوى الكامل...",
      "videoUrl": "https://cdn.example.com/lessons/intro.mp4",
      "contentUrl": "https://cdn.example.com/lessons/materials.pdf",
      "duration": 1800,
      "order": 1,
      "createdAt": "2026-02-11T10:00:00.000Z"
    }
  ]
}
```

#### 5. الحصول على درس واحد
```
GET /api/courses/:courseId/lessons/:lessonId
Accept-Language: ar  (أو en)
```

---

## 🔧 كيف يعمل النظام

### نظام الترجمة
1. بيانات الدرس (videoUrl, duration, order) مخزنة في Course.lessons
2. محتوى الدرس النصي (title, description, content) مخزن في Translation collection
3. كل درس له ترجمات للعربية والإنجليزية
4. اختيار اللغة عبر `Accept-Language` header

### تدفق البيانات

**إنشاء درس:**
1. Admin يرسل POST request مع البيانات بلغتين
2. النظام ينشئ الدرس في Course.lessons
3. النظام ينشئ Translation documents لكل لغة
4. يرجع الدرس الكامل مع كل الترجمات

**قراءة الدروس:**
1. المستخدم يرسل GET request مع Accept-Language header
2. النظام يجلب الدروس من الكورس
3. النظام يجلب الترجمات لكل درس
4. يرجع الدروس باللغة المطلوبة

---

## 📁 الملفات المعدلة

1. **src/modules/courses/course.model.js**
   - أضيف `lessonSchema`
   - أضيف `lessons` array

2. **src/modules/courses/lessons.controller.js** (جديد)
   - `addLesson()` - إنشاء درس مع ترجمات
   - `getLessons()` - جلب كل الدروس مع دعم اللغات
   - `getLessonById()` - جلب درس واحد مع دعم اللغات
   - `updateLesson()` - تحديث درس وترجماته
   - `deleteLesson()` - حذف درس وترجماته

3. **src/modules/courses/courses.routes.js**
   - أضيفت routes الدروس

4. **src/modules/translations/translation.model.js**
   - أضيف `lesson` لـ entityType enum

5. **src/modules/translations/translation.service.js**
   - أضيف `lesson` لـ validEntityTypes

---

## 🧪 الاختبار

### استخدام Postman
استورد: `course_lessons_postman.json`

### اختبار يدوي

**1. إضافة درس (Admin):**
```bash
POST http://localhost:3000/api/courses/COURSE_ID/lessons
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "title": {
    "en": "Lesson 1",
    "ar": "الدرس 1"
  },
  "videoUrl": "https://cdn.example.com/video.mp4",
  "duration": 1800,
  "order": 1
}
```

**2. جلب الدروس (بالإنجليزية):**
```bash
GET http://localhost:3000/api/courses/COURSE_ID/lessons
Accept-Language: en
```

**3. جلب الدروس (بالعربية):**
```bash
GET http://localhost:3000/api/courses/COURSE_ID/lessons
Accept-Language: ar
```

---

## 💡 أمثلة الاستخدام

### Frontend - إضافة درس مع رفع فيديو

```javascript
// الخطوة 1: رفع الفيديو على BunnyCDN
const uploadResponse = await axios.post('/api/upload/generate-url', {
  fileName: 'lesson-video.mp4',
  fileType: 'video',
  category: 'lessons',
  fileSize: videoFile.size
}, {
  headers: { Authorization: `Bearer ${adminToken}` }
});

// الخطوة 2: رفع على BunnyCDN
await axios.put(uploadResponse.data.uploadUrl, videoFile, {
  headers: uploadResponse.data.headers
});

// الخطوة 3: إنشاء الدرس مع رابط الفيديو
const lessonResponse = await axios.post(`/api/courses/${courseId}/lessons`, {
  title: {
    en: 'Introduction to Trading',
    ar: 'مقدمة في التداول'
  },
  description: {
    en: 'Learn the basics',
    ar: 'تعلم الأساسيات'
  },
  videoUrl: uploadResponse.data.fileUrl,
  duration: 1800,
  order: 1
}, {
  headers: { Authorization: `Bearer ${adminToken}` }
});
```

### Frontend - عرض الدروس

```javascript
// جلب الدروس بلغة المستخدم
const response = await axios.get(`/api/courses/${courseId}/lessons`, {
  headers: { 'Accept-Language': userLanguage } // 'en' أو 'ar'
});

const lessons = response.data.lessons;

// عرض الدروس
lessons.forEach(lesson => {
  console.log(`${lesson.order}. ${lesson.title}`);
  console.log(`المدة: ${lesson.duration} ثانية`);
  console.log(`الفيديو: ${lesson.videoUrl}`);
});
```

---

## 🔒 الصلاحيات

### عمليات Admin (تتطلب صلاحية courses):
- `courses:create` - إضافة دروس
- `courses:update` - تحديث دروس
- `courses:delete` - حذف دروس
- `courses:view` - عرض كل الدروس (لوحة التحكم)

### عمليات عامة/مستخدم:
- لا تتطلب مصادقة لعرض الدروس
- اختيار اللغة عبر Accept-Language header

---

## 📚 التوثيق ذو الصلة

- **Postman Collection:** `course_lessons_postman.json`
- **نظام الرفع:** `HIGH_PERFORMANCE_UPLOAD_SYSTEM.md`
- **الصلاحيات:** `PERMISSIONS_UPDATE_AR.md`
- **التوثيق الكامل (إنجليزي):** `COURSE_LESSONS_COMPLETE.md`

---

## ✅ الحالة: مكتمل

جميع وظائف الدروس منفذة مع دعم كامل للغتين. جاهز للاستخدام في الإنتاج.

**المميزات:**
- ✅ عمليات CRUD
- ✅ دعم لغتين (عربي/إنجليزي)
- ✅ التكامل مع نظام الترجمة
- ✅ دعم رفع الفيديو على BunnyCDN
- ✅ التحكم بالوصول حسب الصلاحيات
- ✅ كود نظيف وجاهز للإنتاج

**آخر تحديث:** 11 فبراير 2026
