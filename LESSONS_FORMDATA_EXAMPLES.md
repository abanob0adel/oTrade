# 📝 Course Lessons - FormData Examples

## 🎯 Overview

This guide shows how to send lesson data using FormData (multipart/form-data) instead of JSON.

---

## 📡 API Endpoint

```
POST /api/courses/:courseId/lessons
Content-Type: multipart/form-data
Authorization: Bearer ADMIN_TOKEN
```

---

## 📋 FormData Field Options

You can send translations in **4 different ways**:

### Option 1: Separate Fields with Underscore (title_en, title_ar)
```
title_en = "Introduction to Trading"
title_ar = "مقدمة في التداول"
description_en = "Learn the basics"
description_ar = "تعلم الأساسيات"
content_en = "Full content..."
content_ar = "المحتوى الكامل..."
videoUrl = "https://cdn.example.com/video.mp4"
duration = 1800
order = 1
```

### Option 2: Separate Fields with Brackets (title[en], title[ar])
```
title[en] = "Introduction to Trading"
title[ar] = "مقدمة في التداول"
description[en] = "Learn the basics"
description[ar] = "تعلم الأساسيات"
content[en] = "Full content..."
content[ar] = "المحتوى الكامل..."
videoUrl = "https://cdn.example.com/video.mp4"
duration = 1800
order = 1
```

### Option 3: JSON String
```
title = {"en":"Introduction to Trading","ar":"مقدمة في التداول"}
description = {"en":"Learn the basics","ar":"تعلم الأساسيات"}
videoUrl = "https://cdn.example.com/video.mp4"
duration = 1800
order = 1
```

### Option 4: Mixed (JSON + Separate)
```
title = {"en":"Introduction to Trading"}
title_ar = "مقدمة في التداول"
description[en] = "Learn the basics"
videoUrl = "https://cdn.example.com/video.mp4"
```

---

## 💻 JavaScript/Frontend Examples

### Example 1: Using FormData API (Vanilla JS)

```javascript
const formData = new FormData();

// Add translations (separate fields)
formData.append('title_en', 'Introduction to Trading');
formData.append('title_ar', 'مقدمة في التداول');
formData.append('description_en', 'Learn the basics of trading');
formData.append('description_ar', 'تعلم أساسيات التداول');
formData.append('content_en', 'Full lesson content in English...');
formData.append('content_ar', 'محتوى الدرس الكامل بالعربية...');

// Add other fields
formData.append('videoUrl', 'https://cdn.example.com/lessons/intro.mp4');
formData.append('contentUrl', 'https://cdn.example.com/lessons/materials.pdf');
formData.append('duration', '1800');
formData.append('order', '1');

// Send request
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

### Example 2: Using Axios

```javascript
import axios from 'axios';

const formData = new FormData();

// Add fields
formData.append('title_en', 'Introduction to Trading');
formData.append('title_ar', 'مقدمة في التداول');
formData.append('description_en', 'Learn the basics');
formData.append('description_ar', 'تعلم الأساسيات');
formData.append('videoUrl', 'https://cdn.example.com/video.mp4');
formData.append('duration', '1800');
formData.append('order', '1');

// Send request
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

### Example 3: React Component

```jsx
import React, { useState } from 'react';
import axios from 'axios';

function AddLessonForm({ courseId, adminToken }) {
  const [formData, setFormData] = useState({
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

    const data = new FormData();
    data.append('title_en', formData.title_en);
    data.append('title_ar', formData.title_ar);
    data.append('description_en', formData.description_en);
    data.append('description_ar', formData.description_ar);
    data.append('videoUrl', formData.videoUrl);
    data.append('duration', formData.duration);
    data.append('order', formData.order);

    try {
      const response = await axios.post(
        `/api/courses/${courseId}/lessons`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Lesson added:', response.data);
      alert('Lesson added successfully!');
    } catch (error) {
      console.error('Error:', error.response?.data);
      alert('Failed to add lesson');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title (English)"
        value={formData.title_en}
        onChange={(e) => setFormData({...formData, title_en: e.target.value})}
      />
      <input
        type="text"
        placeholder="Title (Arabic)"
        value={formData.title_ar}
        onChange={(e) => setFormData({...formData, title_ar: e.target.value})}
      />
      <textarea
        placeholder="Description (English)"
        value={formData.description_en}
        onChange={(e) => setFormData({...formData, description_en: e.target.value})}
      />
      <textarea
        placeholder="Description (Arabic)"
        value={formData.description_ar}
        onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
      />
      <input
        type="text"
        placeholder="Video URL"
        value={formData.videoUrl}
        onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
      />
      <input
        type="number"
        placeholder="Duration (seconds)"
        value={formData.duration}
        onChange={(e) => setFormData({...formData, duration: e.target.value})}
      />
      <input
        type="number"
        placeholder="Order"
        value={formData.order}
        onChange={(e) => setFormData({...formData, order: e.target.value})}
      />
      <button type="submit">Add Lesson</button>
    </form>
  );
}

export default AddLessonForm;
```

---

## 🧪 Postman Examples

### Method 1: Using Form-Data Tab

1. Open Postman
2. Create new POST request: `http://localhost:3000/api/courses/COURSE_ID/lessons`
3. Go to **Body** tab
4. Select **form-data**
5. Add fields:

| KEY | VALUE |
|-----|-------|
| title_en | Introduction to Trading |
| title_ar | مقدمة في التداول |
| description_en | Learn the basics |
| description_ar | تعلم الأساسيات |
| videoUrl | https://cdn.example.com/video.mp4 |
| duration | 1800 |
| order | 1 |

6. Add Authorization header: `Bearer YOUR_ADMIN_TOKEN`
7. Click **Send**

### Method 2: Using JSON String in FormData

| KEY | VALUE |
|-----|-------|
| title | {"en":"Introduction to Trading","ar":"مقدمة في التداول"} |
| description | {"en":"Learn the basics","ar":"تعلم الأساسيات"} |
| videoUrl | https://cdn.example.com/video.mp4 |
| duration | 1800 |
| order | 1 |

---

## 🎬 Complete Example: Upload Video + Create Lesson

```javascript
async function uploadVideoAndCreateLesson(courseId, videoFile, lessonData, adminToken) {
  try {
    // Step 1: Generate upload URL
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

    // Step 2: Upload video to BunnyCDN
    await axios.put(
      uploadUrlResponse.data.uploadUrl,
      videoFile,
      {
        headers: uploadUrlResponse.data.headers
      }
    );

    // Step 3: Create lesson with video URL
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

    console.log('Lesson created:', lessonResponse.data);
    return lessonResponse.data;

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
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

## 📋 Field Reference

### Required Fields
- `title_en` OR `title_ar` (at least one language required)

### Optional Fields
- `title_en` - English title
- `title_ar` - Arabic title
- `description_en` - English description
- `description_ar` - Arabic description
- `content_en` - English content
- `content_ar` - Arabic content
- `videoUrl` - Video URL (from BunnyCDN)
- `contentUrl` - Materials URL (PDF, etc.)
- `duration` - Duration in seconds (number)
- `order` - Lesson order (number)

---

## ✅ Response Format

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

## 🚨 Common Errors

### Error: Title required
```json
{
  "success": false,
  "error": "Lesson title is required in at least one language (en or ar)"
}
```
**Solution:** Add at least `title_en` or `title_ar`

### Error: Invalid course ID
```json
{
  "success": false,
  "error": "Invalid course ID"
}
```
**Solution:** Check the courseId in the URL

### Error: Course not found
```json
{
  "success": false,
  "error": "Course not found"
}
```
**Solution:** Make sure the course exists in the database

---

## 📚 Related Documentation

- **Full Guide:** `COURSE_LESSONS_COMPLETE.md`
- **Arabic Guide:** `COURSE_LESSONS_AR.md`
- **Quick Start:** `LESSONS_QUICK_START.md`
- **Postman Collection:** `course_lessons_postman.json`

---

**Last Updated:** February 11, 2026
