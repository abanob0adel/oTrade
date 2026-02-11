# 📚 إنشاء كورس - أمثلة كاملة

## 🎯 نظرة عامة

أمثلة لإنشاء كورس مع النظام المحدث الذي يدعم الدروس.

---

## 📡 Endpoint

```
POST /api/courses/addcourse
Content-Type: multipart/form-data
Authorization: Bearer ADMIN_TOKEN
```

---

## 📋 بنية الكورس بعد التحديث

```javascript
{
  // معلومات الكورس الأساسية
  title: { en: "...", ar: "..." },
  description: { en: "...", ar: "..." },
  content: { en: "...", ar: "..." },
  
  // إعدادات الكورس
  isFree: true/false,
  plans: ["plan_id_1", "plan_id_2"], // مطلوب إذا لم يكن مجاني
  
  // الوسائط
  coverImageUrl: "https://...",
  contentUrl: "https://...",
  
  // الدروس (تضاف بشكل منفصل بعد إنشاء الكورس)
  lessons: [] // فارغ عند الإنشاء، أضف عبر /courses/:id/lessons
}
```

---

## 💻 مثال 1: إنشاء كورس مجاني (FormData)

```javascript
import axios from 'axios';

async function createFreeCourse(adminToken) {
  const formData = new FormData();
  
  // الترجمات
  formData.append('title[en]', 'Introduction to Trading');
  formData.append('title[ar]', 'مقدمة في التداول');
  formData.append('description[en]', 'Learn the basics of trading');
  formData.append('description[ar]', 'تعلم أساسيات التداول');
  formData.append('content[en]', 'Complete trading course content...');
  formData.append('content[ar]', 'محتوى كورس التداول الكامل...');
  
  // إعدادات الكورس
  formData.append('isFree', 'true');
  
  // روابط الوسائط (اختياري)
  formData.append('coverImageUrl', 'https://cdn.example.com/courses/trading-cover.jpg');
  formData.append('contentUrl', 'https://cdn.example.com/courses/trading-intro.pdf');
  
  try {
    const response = await axios.post(
      '/api/courses/addcourse',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    console.log('تم إنشاء الكورس:', response.data);
    return response.data.course;
    
  } catch (error) {
    console.error('خطأ:', error.response?.data);
    throw error;
  }
}

// الاستخدام
const course = await createFreeCourse('ADMIN_TOKEN');
console.log('معرف الكورس:', course.id);
```

---

## 💻 مثال 2: إنشاء كورس مدفوع (FormData)

```javascript
async function createPaidCourse(adminToken, planIds) {
  const formData = new FormData();
  
  // الترجمات
  formData.append('title[en]', 'Advanced Trading Strategies');
  formData.append('title[ar]', 'استراتيجيات التداول المتقدمة');
  formData.append('description[en]', 'Master advanced trading techniques');
  formData.append('description[ar]', 'أتقن تقنيات التداول المتقدمة');
  formData.append('content[en]', 'Advanced course content...');
  formData.append('content[ar]', 'محتوى الكورس المتقدم...');
  
  // إعدادات الكورس
  formData.append('isFree', 'false');
  
  // الخطط (مطلوب للكورسات المدفوعة)
  planIds.forEach(planId => {
    formData.append('plans[]', planId);
  });
  
  // الوسائط
  formData.append('coverImageUrl', 'https://cdn.example.com/courses/advanced-cover.jpg');
  
  try {
    const response = await axios.post(
      '/api/courses/addcourse',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    console.log('تم إنشاء الكورس المدفوع:', response.data);
    return response.data.course;
    
  } catch (error) {
    console.error('خطأ:', error.response?.data);
    throw error;
  }
}

// الاستخدام
const planIds = ['plan_id_1', 'plan_id_2'];
const course = await createPaidCourse('ADMIN_TOKEN', planIds);
```

---

## 💻 مثال 3: إنشاء كورس + إضافة دروس (التدفق الكامل)

```javascript
async function createCourseWithLessons(adminToken) {
  try {
    // الخطوة 1: إنشاء الكورس
    console.log('جاري إنشاء الكورس...');
    const formData = new FormData();
    
    formData.append('title[en]', 'Complete Trading Course');
    formData.append('title[ar]', 'كورس التداول الكامل');
    formData.append('description[en]', 'From beginner to expert');
    formData.append('description[ar]', 'من المبتدئ إلى الخبير');
    formData.append('isFree', 'true');
    formData.append('coverImageUrl', 'https://cdn.example.com/courses/cover.jpg');
    
    const courseResponse = await axios.post(
      '/api/courses/addcourse',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    const course = courseResponse.data.course;
    console.log('تم إنشاء الكورس:', course.id);
    
    // الخطوة 2: إضافة الدروس للكورس
    const lessons = [
      {
        title_en: 'Introduction',
        title_ar: 'المقدمة',
        description_en: 'Course introduction',
        description_ar: 'مقدمة الكورس',
        videoUrl: 'https://cdn.example.com/lessons/intro.mp4',
        duration: 600,
        order: 1
      },
      {
        title_en: 'Basic Concepts',
        title_ar: 'المفاهيم الأساسية',
        description_en: 'Learn basic trading concepts',
        description_ar: 'تعلم مفاهيم التداول الأساسية',
        videoUrl: 'https://cdn.example.com/lessons/basics.mp4',
        duration: 1200,
        order: 2
      },
      {
        title_en: 'Advanced Strategies',
        title_ar: 'الاستراتيجيات المتقدمة',
        description_en: 'Master advanced techniques',
        description_ar: 'أتقن التقنيات المتقدمة',
        videoUrl: 'https://cdn.example.com/lessons/advanced.mp4',
        duration: 1800,
        order: 3
      }
    ];
    
    console.log('جاري إضافة الدروس...');
    const addedLessons = [];
    
    for (const lessonData of lessons) {
      const lessonFormData = new FormData();
      
      lessonFormData.append('title_en', lessonData.title_en);
      lessonFormData.append('title_ar', lessonData.title_ar);
      lessonFormData.append('description_en', lessonData.description_en);
      lessonFormData.append('description_ar', lessonData.description_ar);
      lessonFormData.append('videoUrl', lessonData.videoUrl);
      lessonFormData.append('duration', lessonData.duration.toString());
      lessonFormData.append('order', lessonData.order.toString());
      
      const lessonResponse = await axios.post(
        `/api/courses/${course.id}/lessons`,
        lessonFormData,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      addedLessons.push(lessonResponse.data.lesson);
      console.log(`تم إضافة الدرس ${lessonData.order}:`, lessonResponse.data.lesson.id);
    }
    
    console.log('تم إنشاء الكورس مع الدروس بنجاح!');
    return {
      course,
      lessons: addedLessons
    };
    
  } catch (error) {
    console.error('خطأ:', error.response?.data || error.message);
    throw error;
  }
}

// الاستخدام
const result = await createCourseWithLessons('ADMIN_TOKEN');
console.log('معرف الكورس:', result.course.id);
console.log('إجمالي الدروس:', result.lessons.length);
```

---

## 🧪 مثال Postman

### إنشاء كورس مجاني

**Method:** POST  
**URL:** `http://localhost:3000/api/courses/addcourse`  
**Headers:**
- `Authorization: Bearer YOUR_ADMIN_TOKEN`

**Body (form-data):**

| KEY | VALUE |
|-----|-------|
| title[en] | Introduction to Trading |
| title[ar] | مقدمة في التداول |
| description[en] | Learn the basics of trading |
| description[ar] | تعلم أساسيات التداول |
| content[en] | Complete course content... |
| content[ar] | محتوى الكورس الكامل... |
| isFree | true |
| coverImageUrl | https://cdn.example.com/courses/cover.jpg |

### إنشاء كورس مدفوع

**Body (form-data):**

| KEY | VALUE |
|-----|-------|
| title[en] | Advanced Trading |
| title[ar] | التداول المتقدم |
| description[en] | Master advanced techniques |
| description[ar] | أتقن التقنيات المتقدمة |
| isFree | false |
| plans[] | plan_id_1 |
| plans[] | plan_id_2 |
| coverImageUrl | https://cdn.example.com/courses/advanced.jpg |

---

## ✅ شكل الرد

```json
{
  "message": "Course created successfully",
  "course": {
    "id": "67abc123def456789",
    "translations": {
      "en": {
        "title": "Introduction to Trading",
        "description": "Learn the basics of trading",
        "content": "Complete course content..."
      },
      "ar": {
        "title": "مقدمة في التداول",
        "description": "تعلم أساسيات التداول",
        "content": "محتوى الكورس الكامل..."
      }
    },
    "isFree": true,
    "plans": [],
    "coverImageUrl": "https://cdn.example.com/courses/cover.jpg",
    "contentUrl": "",
    "slug": "introduction_to_trading",
    "isPaid": false,
    "isInSubscription": false,
    "lessons": [],
    "createdAt": "2026-02-11T10:00:00.000Z",
    "updatedAt": "2026-02-11T10:00:00.000Z"
  }
}
```

---

## 📋 مرجع الحقول

### حقول مطلوبة
- `title[en]` أو `title[ar]` - على الأقل لغة واحدة
- `description[en]` أو `description[ar]` - على الأقل لغة واحدة

### حقول اختيارية
- `content[en]` - المحتوى بالإنجليزية
- `content[ar]` - المحتوى بالعربية
- `isFree` - true/false (افتراضي: false)
- `plans[]` - مصفوفة معرفات الخطط (مطلوب إذا isFree=false)
- `coverImageUrl` - رابط صورة الغلاف
- `contentUrl` - رابط مواد الكورس

### حقول تلقائية
- `id` - معرف الكورس
- `slug` - رابط صديق لمحركات البحث
- `isPaid` - محسوب من الخطط
- `isInSubscription` - محسوب من الخطط
- `lessons` - مصفوفة فارغة (أضف الدروس بشكل منفصل)
- `createdAt` - تاريخ الإنشاء
- `updatedAt` - تاريخ التحديث

---

## 🎯 سير العمل الكامل

### 1. إنشاء الكورس
```javascript
const course = await createCourse(adminToken);
```

### 2. إضافة الدروس
```javascript
await addLesson(course.id, lesson1Data, adminToken);
await addLesson(course.id, lesson2Data, adminToken);
await addLesson(course.id, lesson3Data, adminToken);
```

### 3. الحصول على الكورس مع الدروس
```javascript
const courseWithLessons = await axios.get(`/api/courses/${course.id}`);
const lessons = await axios.get(`/api/courses/${course.id}/lessons`);
```

---

## 🚨 الأخطاء الشائعة

### خطأ: العنوان مطلوب
```json
{
  "error": "Title is required in at least one language"
}
```
**الحل:** أضف `title[en]` أو `title[ar]`

### خطأ: الخطط مطلوبة
```json
{
  "error": "Plans are required when course is not free"
}
```
**الحل:** أضف مصفوفة `plans[]` عندما `isFree=false`

### خطأ: معرف خطة غير صحيح
```json
{
  "error": "Invalid Plan ID found"
}
```
**الحل:** تحقق من وجود معرفات الخطط في قاعدة البيانات

---

## 📚 التوثيق ذو الصلة

- **دليل الدروس:** `FORMDATA_EXAMPLES_AR.md`
- **دروس الكورس:** `COURSE_LESSONS_AR.md`
- **الدليل الإنجليزي:** `CREATE_COURSE_EXAMPLES.md`

---

**آخر تحديث:** 11 فبراير 2026
