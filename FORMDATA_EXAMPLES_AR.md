# 📝 أمثلة FormData لإضافة الدروس

## 🎯 نظرة عامة

هذا الدليل يوضح كيفية إرسال بيانات الدرس باستخدام FormData بدلاً من JSON.

---

## 📡 Endpoint

```
POST /api/courses/:courseId/lessons
Content-Type: multipart/form-data
Authorization: Bearer ADMIN_TOKEN
```

---

## 📋 طرق إرسال البيانات

### الطريقة 1: حقول منفصلة (موصى بها)

```
title_en = "Introduction to Trading"
title_ar = "مقدمة في التداول"
description_en = "Learn the basics"
description_ar = "تعلم الأساسيات"
videoUrl = "https://cdn.example.com/video.mp4"
duration = 1800
order = 1
```

### الطريقة 2: JSON String

```
title = {"en":"Introduction to Trading","ar":"مقدمة في التداول"}
description = {"en":"Learn the basics","ar":"تعلم الأساسيات"}
videoUrl = "https://cdn.example.com/video.mp4"
```

---

## 💻 أمثلة JavaScript

### مثال 1: Vanilla JavaScript

```javascript
const formData = new FormData();

// إضافة الترجمات
formData.append('title_en', 'Introduction to Trading');
formData.append('title_ar', 'مقدمة في التداول');
formData.append('description_en', 'Learn the basics');
formData.append('description_ar', 'تعلم الأساسيات');

// إضافة باقي الحقول
formData.append('videoUrl', 'https://cdn.example.com/video.mp4');
formData.append('duration', '1800');
formData.append('order', '1');

// إرسال الطلب
const response = await fetch(`/api/courses/${courseId}/lessons`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  },
  body: formData
});

const result = await response.json();
console.log(result);
```

### مثال 2: Axios

```javascript
import axios from 'axios';

const formData = new FormData();

formData.append('title_en', 'Introduction to Trading');
formData.append('title_ar', 'مقدمة في التداول');
formData.append('description_en', 'Learn the basics');
formData.append('description_ar', 'تعلم الأساسيات');
formData.append('videoUrl', 'https://cdn.example.com/video.mp4');
formData.append('duration', '1800');
formData.append('order', '1');

const response = await axios.post(
  `/api/courses/${courseId}/lessons`,
  formData,
  {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'multipart/form-data'
    }
  }
);

console.log(response.data);
```

### مثال 3: React Component

```jsx
import React, { useState } from 'react';
import axios from 'axios';

function AddLessonForm({ courseId, adminToken }) {
  const [lesson, setLesson] = useState({
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    videoUrl: '',
    duration: '',
    order: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title_en', lesson.title_en);
    formData.append('title_ar', lesson.title_ar);
    formData.append('description_en', lesson.description_en);
    formData.append('description_ar', lesson.description_ar);
    formData.append('videoUrl', lesson.videoUrl);
    formData.append('duration', lesson.duration);
    formData.append('order', lesson.order);

    try {
      const response = await axios.post(
        `/api/courses/${courseId}/lessons`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('تم إضافة الدرس بنجاح!');
      console.log(response.data);
    } catch (error) {
      alert('فشل في إضافة الدرس');
      console.error(error.response?.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="العنوان (إنجليزي)"
        value={lesson.title_en}
        onChange={(e) => setLesson({...lesson, title_en: e.target.value})}
      />
      <input
        type="text"
        placeholder="العنوان (عربي)"
        value={lesson.title_ar}
        onChange={(e) => setLesson({...lesson, title_ar: e.target.value})}
      />
      <textarea
        placeholder="الوصف (إنجليزي)"
        value={lesson.description_en}
        onChange={(e) => setLesson({...lesson, description_en: e.target.value})}
      />
      <textarea
        placeholder="الوصف (عربي)"
        value={lesson.description_ar}
        onChange={(e) => setLesson({...lesson, description_ar: e.target.value})}
      />
      <input
        type="text"
        placeholder="رابط الفيديو"
        value={lesson.videoUrl}
        onChange={(e) => setLesson({...lesson, videoUrl: e.target.value})}
      />
      <input
        type="number"
        placeholder="المدة (بالثواني)"
        value={lesson.duration}
        onChange={(e) => setLesson({...lesson, duration: e.target.value})}
      />
      <input
        type="number"
        placeholder="الترتيب"
        value={lesson.order}
        onChange={(e) => setLesson({...lesson, order: e.target.value})}
      />
      <button type="submit">إضافة الدرس</button>
    </form>
  );
}

export default AddLessonForm;
```

---

## 🧪 Postman

### الخطوات:

1. افتح Postman
2. أنشئ POST request: `http://localhost:3000/api/courses/COURSE_ID/lessons`
3. اذهب لتبويب **Body**
4. اختر **form-data**
5. أضف الحقول:

| KEY | VALUE |
|-----|-------|
| title_en | Introduction to Trading |
| title_ar | مقدمة في التداول |
| description_en | Learn the basics |
| description_ar | تعلم الأساسيات |
| videoUrl | https://cdn.example.com/video.mp4 |
| duration | 1800 |
| order | 1 |

6. أضف Authorization header: `Bearer YOUR_ADMIN_TOKEN`
7. اضغط **Send**

---

## 🎬 مثال كامل: رفع فيديو + إنشاء درس

```javascript
async function uploadVideoAndCreateLesson(courseId, videoFile, lessonData, adminToken) {
  try {
    // الخطوة 1: احصل على رابط الرفع
    const uploadUrlResponse = await axios.post(
      '/api/upload/generate-url',
      {
        fileName: videoFile.name,
        fileType: 'video',
        category: 'lessons',
        fileSize: videoFile.size
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    // الخطوة 2: ارفع الفيديو على BunnyCDN
    await axios.put(
      uploadUrlResponse.data.uploadUrl,
      videoFile,
      {
        headers: uploadUrlResponse.data.headers
      }
    );

    // الخطوة 3: أنشئ الدرس مع رابط الفيديو
    const formData = new FormData();
    formData.append('title_en', lessonData.title_en);
    formData.append('title_ar', lessonData.title_ar);
    formData.append('description_en', lessonData.description_en);
    formData.append('description_ar', lessonData.description_ar);
    formData.append('videoUrl', uploadUrlResponse.data.fileUrl);
    formData.append('duration', lessonData.duration);
    formData.append('order', lessonData.order);

    const lessonResponse = await axios.post(
      `/api/courses/${courseId}/lessons`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    console.log('تم إنشاء الدرس:', lessonResponse.data);
    return lessonResponse.data;

  } catch (error) {
    console.error('خطأ:', error.response?.data || error.message);
    throw error;
  }
}

// الاستخدام
const videoFile = document.getElementById('videoInput').files[0];
const lessonData = {
  title_en: 'Introduction to Trading',
  title_ar: 'مقدمة في التداول',
  description_en: 'Learn the basics',
  description_ar: 'تعلم الأساسيات',
  duration: 1800,
  order: 1
};

uploadVideoAndCreateLesson('COURSE_ID', videoFile, lessonData, 'ADMIN_TOKEN');
```

---

## 📋 الحقول المتاحة

### حقول مطلوبة
- `title_en` أو `title_ar` (على الأقل لغة واحدة)

### حقول اختيارية
- `title_en` - العنوان بالإنجليزية
- `title_ar` - العنوان بالعربية
- `description_en` - الوصف بالإنجليزية
- `description_ar` - الوصف بالعربية
- `content_en` - المحتوى بالإنجليزية
- `content_ar` - المحتوى بالعربية
- `videoUrl` - رابط الفيديو (من BunnyCDN)
- `contentUrl` - رابط المواد (PDF، إلخ)
- `duration` - المدة بالثواني (رقم)
- `order` - ترتيب الدرس (رقم)

---

## ✅ شكل الرد

```json
{
  "success": true,
  "message": "Lesson added successfully",
  "lesson": {
    "id": "67abc123def456789",
    "translations": {
      "en": {
        "title": "Introduction to Trading",
        "description": "Learn the basics",
        "content": ""
      },
      "ar": {
        "title": "مقدمة في التداول",
        "description": "تعلم الأساسيات",
        "content": ""
      }
    },
    "videoUrl": "https://cdn.example.com/video.mp4",
    "contentUrl": null,
    "duration": 1800,
    "order": 1,
    "createdAt": "2026-02-11T10:00:00.000Z"
  }
}
```

---

## 🚨 الأخطاء الشائعة

### خطأ: العنوان مطلوب
```json
{
  "success": false,
  "error": "Lesson title is required in at least one language (en or ar)"
}
```
**الحل:** أضف على الأقل `title_en` أو `title_ar`

### خطأ: معرف الكورس غير صحيح
```json
{
  "success": false,
  "error": "Invalid course ID"
}
```
**الحل:** تحقق من courseId في الرابط

---

## 📚 التوثيق ذو الصلة

- **الدليل الكامل (إنجليزي):** `LESSONS_FORMDATA_EXAMPLES.md`
- **دليل الدروس:** `COURSE_LESSONS_AR.md`
- **Postman Collection:** `course_lessons_postman.json`

---

**آخر تحديث:** 11 فبراير 2026
