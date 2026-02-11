# 📚 Create Course - Complete Examples

## 🎯 Overview

Examples for creating a course with the updated system that includes lessons support.

---

## 📡 API Endpoint

```
POST /api/courses/addcourse
Content-Type: multipart/form-data
Authorization: Bearer ADMIN_TOKEN
```

---

## 📋 Course Structure After Update

```javascript
{
  // Course basic info
  title: { en: "...", ar: "..." },
  description: { en: "...", ar: "..." },
  content: { en: "...", ar: "..." },
  
  // Course settings
  isFree: true/false,
  plans: ["plan_id_1", "plan_id_2"], // Required if not free
  
  // Media
  coverImageUrl: "https://...",
  contentUrl: "https://...",
  
  // Lessons (added separately after course creation)
  lessons: [] // Empty on creation, add via /courses/:id/lessons
}
```

---

## 💻 Example 1: Create Free Course (FormData)

### JavaScript/Axios

```javascript
import axios from 'axios';

async function createFreeCourse(adminToken) {
  const formData = new FormData();
  
  // Translations
  formData.append('title[en]', 'Introduction to Trading');
  formData.append('title[ar]', 'مقدمة في التداول');
  formData.append('description[en]', 'Learn the basics of trading');
  formData.append('description[ar]', 'تعلم أساسيات التداول');
  formData.append('content[en]', 'Complete trading course content...');
  formData.append('content[ar]', 'محتوى كورس التداول الكامل...');
  
  // Course settings
  formData.append('isFree', 'true');
  
  // Media URLs (optional)
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
    
    console.log('Course created:', response.data);
    return response.data.course;
    
  } catch (error) {
    console.error('Error:', error.response?.data);
    throw error;
  }
}

// Usage
const course = await createFreeCourse('ADMIN_TOKEN');
console.log('Course ID:', course.id);
```

---

## 💻 Example 2: Create Paid Course (FormData)

```javascript
async function createPaidCourse(adminToken, planIds) {
  const formData = new FormData();
  
  // Translations
  formData.append('title[en]', 'Advanced Trading Strategies');
  formData.append('title[ar]', 'استراتيجيات التداول المتقدمة');
  formData.append('description[en]', 'Master advanced trading techniques');
  formData.append('description[ar]', 'أتقن تقنيات التداول المتقدمة');
  formData.append('content[en]', 'Advanced course content...');
  formData.append('content[ar]', 'محتوى الكورس المتقدم...');
  
  // Course settings
  formData.append('isFree', 'false');
  
  // Plans (required for paid courses)
  planIds.forEach(planId => {
    formData.append('plans[]', planId);
  });
  
  // Media
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
    
    console.log('Paid course created:', response.data);
    return response.data.course;
    
  } catch (error) {
    console.error('Error:', error.response?.data);
    throw error;
  }
}

// Usage
const planIds = ['plan_id_1', 'plan_id_2'];
const course = await createPaidCourse('ADMIN_TOKEN', planIds);
```

---

## 💻 Example 3: Create Course + Add Lessons (Complete Flow)

```javascript
async function createCourseWithLessons(adminToken) {
  try {
    // Step 1: Create the course
    console.log('Creating course...');
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
    console.log('Course created:', course.id);
    
    // Step 2: Add lessons to the course
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
    
    console.log('Adding lessons...');
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
      console.log(`Lesson ${lessonData.order} added:`, lessonResponse.data.lesson.id);
    }
    
    console.log('Course with lessons created successfully!');
    return {
      course,
      lessons: addedLessons
    };
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
const result = await createCourseWithLessons('ADMIN_TOKEN');
console.log('Course ID:', result.course.id);
console.log('Total lessons:', result.lessons.length);
```

---

## 💻 Example 4: React Component - Create Course Form

```jsx
import React, { useState } from 'react';
import axios from 'axios';

function CreateCourseForm({ adminToken, onSuccess }) {
  const [course, setCourse] = useState({
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    content_en: '',
    content_ar: '',
    isFree: true,
    plans: [],
    coverImageUrl: ''
  });
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      
      // Add translations
      formData.append('title[en]', course.title_en);
      formData.append('title[ar]', course.title_ar);
      formData.append('description[en]', course.description_en);
      formData.append('description[ar]', course.description_ar);
      formData.append('content[en]', course.content_en);
      formData.append('content[ar]', course.content_ar);
      
      // Add settings
      formData.append('isFree', course.isFree.toString());
      
      if (!course.isFree && course.plans.length > 0) {
        course.plans.forEach(planId => {
          formData.append('plans[]', planId);
        });
      }
      
      if (course.coverImageUrl) {
        formData.append('coverImageUrl', course.coverImageUrl);
      }

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

      alert('Course created successfully!');
      console.log('Created course:', response.data.course);
      
      if (onSuccess) {
        onSuccess(response.data.course);
      }
      
    } catch (error) {
      console.error('Error:', error.response?.data);
      alert('Failed to create course: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Create New Course</h2>
      
      <div>
        <h3>English</h3>
        <input
          type="text"
          placeholder="Title (English)"
          value={course.title_en}
          onChange={(e) => setCourse({...course, title_en: e.target.value})}
          required
        />
        <textarea
          placeholder="Description (English)"
          value={course.description_en}
          onChange={(e) => setCourse({...course, description_en: e.target.value})}
          required
        />
        <textarea
          placeholder="Content (English)"
          value={course.content_en}
          onChange={(e) => setCourse({...course, content_en: e.target.value})}
        />
      </div>
      
      <div>
        <h3>Arabic</h3>
        <input
          type="text"
          placeholder="العنوان (عربي)"
          value={course.title_ar}
          onChange={(e) => setCourse({...course, title_ar: e.target.value})}
          required
        />
        <textarea
          placeholder="الوصف (عربي)"
          value={course.description_ar}
          onChange={(e) => setCourse({...course, description_ar: e.target.value})}
          required
        />
        <textarea
          placeholder="المحتوى (عربي)"
          value={course.content_ar}
          onChange={(e) => setCourse({...course, content_ar: e.target.value})}
        />
      </div>
      
      <div>
        <h3>Settings</h3>
        <label>
          <input
            type="checkbox"
            checked={course.isFree}
            onChange={(e) => setCourse({...course, isFree: e.target.checked})}
          />
          Free Course
        </label>
        
        <input
          type="text"
          placeholder="Cover Image URL"
          value={course.coverImageUrl}
          onChange={(e) => setCourse({...course, coverImageUrl: e.target.value})}
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Course'}
      </button>
    </form>
  );
}

export default CreateCourseForm;
```

---

## 🧪 Postman Example

### Create Free Course

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

### Create Paid Course

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

## ✅ Response Format

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

## 📋 Field Reference

### Required Fields
- `title[en]` OR `title[ar]` - At least one language
- `description[en]` OR `description[ar]` - At least one language

### Optional Fields
- `content[en]` - English content
- `content[ar]` - Arabic content
- `isFree` - true/false (default: false)
- `plans[]` - Array of plan IDs (required if isFree=false)
- `coverImageUrl` - Cover image URL
- `contentUrl` - Course materials URL

### Auto-Generated Fields
- `id` - Course ID
- `slug` - URL-friendly slug
- `isPaid` - Calculated from plans
- `isInSubscription` - Calculated from plans
- `lessons` - Empty array (add lessons separately)
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp

---

## 🎯 Complete Workflow

### 1. Create Course
```javascript
const course = await createCourse(adminToken);
```

### 2. Add Lessons
```javascript
await addLesson(course.id, lesson1Data, adminToken);
await addLesson(course.id, lesson2Data, adminToken);
await addLesson(course.id, lesson3Data, adminToken);
```

### 3. Get Course with Lessons
```javascript
const courseWithLessons = await axios.get(`/api/courses/${course.id}`);
const lessons = await axios.get(`/api/courses/${course.id}/lessons`);
```

---

## 🚨 Common Errors

### Error: Title required
```json
{
  "error": "Title is required in at least one language"
}
```
**Solution:** Add `title[en]` or `title[ar]`

### Error: Plans required
```json
{
  "error": "Plans are required when course is not free"
}
```
**Solution:** Add `plans[]` array when `isFree=false`

### Error: Invalid Plan ID
```json
{
  "error": "Invalid Plan ID found"
}
```
**Solution:** Verify plan IDs exist in database

---

## 📚 Related Documentation

- **Lessons Guide:** `LESSONS_FORMDATA_EXAMPLES.md`
- **Course Lessons:** `COURSE_LESSONS_COMPLETE.md`
- **Arabic Guide:** `FORMDATA_EXAMPLES_AR.md`

---

**Last Updated:** February 11, 2026
