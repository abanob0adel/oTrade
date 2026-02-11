# ✅ Course Lessons System - Complete Implementation

## 📋 Overview

Successfully implemented a complete lessons management system for courses with full bilingual support (Arabic & English) using the existing translation system.

---

## 🎯 Features Implemented

### 1. Course Model Updated
- Added `lessons` array to Course schema
- Each lesson contains:
  - `videoUrl` - Link to lesson video (BunnyCDN)
  - `contentUrl` - Link to lesson materials (PDF, etc.)
  - `duration` - Lesson duration in seconds
  - `order` - Lesson order/sequence
  - `createdAt` - Creation timestamp
  - `_id` - Unique lesson ID

### 2. Translation System Integration
- Lesson titles, descriptions, and content stored in Translation collection
- Supports both Arabic and English
- Uses existing translation infrastructure
- Entity type: `lesson`

### 3. Complete CRUD Operations
- ✅ Create lesson (Admin only)
- ✅ Read lessons (Public/Authenticated)
- ✅ Update lesson (Admin only)
- ✅ Delete lesson (Admin only)

---

## 📡 API Endpoints

### Admin Endpoints (Require Authentication + Permission)

#### 1. Add Lesson to Course
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

#### 2. Update Lesson
```
PUT /api/courses/:courseId/lessons/:lessonId
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
```

**Request Body (all fields optional):**
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

#### 3. Delete Lesson
```
DELETE /api/courses/:courseId/lessons/:lessonId
Authorization: Bearer ADMIN_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Lesson deleted successfully"
}
```

---

### Public/User Endpoints

#### 4. Get All Lessons
```
GET /api/courses/:courseId/lessons
Accept-Language: en  (or ar)
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "lessons": [
    {
      "id": "lesson_id_1",
      "title": "Introduction to Trading",
      "description": "Learn the basics",
      "content": "Full content...",
      "videoUrl": "https://cdn.example.com/lessons/intro.mp4",
      "contentUrl": "https://cdn.example.com/lessons/materials.pdf",
      "duration": 1800,
      "order": 1,
      "createdAt": "2026-02-11T10:00:00.000Z"
    },
    {
      "id": "lesson_id_2",
      "title": "Advanced Strategies",
      "description": "Master advanced techniques",
      "content": "Advanced content...",
      "videoUrl": "https://cdn.example.com/lessons/advanced.mp4",
      "duration": 2400,
      "order": 2,
      "createdAt": "2026-02-11T11:00:00.000Z"
    }
  ]
}
```

#### 5. Get Single Lesson
```
GET /api/courses/:courseId/lessons/:lessonId
Accept-Language: en  (or ar)
```

**Response:**
```json
{
  "success": true,
  "lesson": {
    "id": "lesson_id",
    "title": "Introduction to Trading",
    "description": "Learn the basics of trading",
    "content": "Full lesson content...",
    "videoUrl": "https://cdn.example.com/lessons/intro.mp4",
    "contentUrl": "https://cdn.example.com/lessons/materials.pdf",
    "duration": 1800,
    "order": 1,
    "createdAt": "2026-02-11T10:00:00.000Z"
  }
}
```

---

## 🔧 How It Works

### Translation System
1. Lesson metadata (videoUrl, duration, order) stored in Course.lessons array
2. Lesson text content (title, description, content) stored in Translation collection
3. Each lesson has translations for both Arabic and English
4. Language selected via `Accept-Language` header

### Data Flow

**Creating a Lesson:**
1. Admin sends POST request with bilingual data
2. System creates lesson in Course.lessons array
3. System creates Translation documents for each language
4. Returns complete lesson with all translations

**Reading Lessons:**
1. User/Guest sends GET request with Accept-Language header
2. System fetches lessons from course
3. System fetches translations for each lesson
4. Returns lessons in requested language

---

## 📁 Modified Files

1. **src/modules/courses/course.model.js**
   - Added `lessonSchema` with videoUrl, contentUrl, duration, order
   - Added `lessons` array to courseSchema

2. **src/modules/courses/lessons.controller.js** (NEW)
   - `addLesson()` - Create lesson with translations
   - `getLessons()` - Get all lessons with language support
   - `getLessonById()` - Get single lesson with language support
   - `updateLesson()` - Update lesson and translations
   - `deleteLesson()` - Delete lesson and translations

3. **src/modules/courses/courses.routes.js**
   - Added lesson routes (admin + public)

4. **src/modules/translations/translation.model.js**
   - Added `lesson` to entityType enum

5. **src/modules/translations/translation.service.js**
   - Added `lesson` to validEntityTypes

---

## 🧪 Testing

### Using Postman
Import collection: `course_lessons_postman.json`

### Manual Testing

**1. Add Lesson (Admin):**
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

**2. Get Lessons (English):**
```bash
GET http://localhost:3000/api/courses/COURSE_ID/lessons
Accept-Language: en
```

**3. Get Lessons (Arabic):**
```bash
GET http://localhost:3000/api/courses/COURSE_ID/lessons
Accept-Language: ar
```

---

## 💡 Usage Examples

### Frontend - Add Lesson with Video Upload

```javascript
// Step 1: Upload video to BunnyCDN
const uploadResponse = await axios.post('/api/upload/generate-url', {
  fileName: 'lesson-video.mp4',
  fileType: 'video',
  category: 'lessons',
  fileSize: videoFile.size
}, {
  headers: { Authorization: `Bearer ${adminToken}` }
});

// Step 2: Upload to BunnyCDN
await axios.put(uploadResponse.data.uploadUrl, videoFile, {
  headers: uploadResponse.data.headers
});

// Step 3: Create lesson with video URL
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

### Frontend - Display Lessons

```javascript
// Get lessons in user's language
const response = await axios.get(`/api/courses/${courseId}/lessons`, {
  headers: { 'Accept-Language': userLanguage } // 'en' or 'ar'
});

const lessons = response.data.lessons;

// Display lessons
lessons.forEach(lesson => {
  console.log(`${lesson.order}. ${lesson.title}`);
  console.log(`Duration: ${lesson.duration}s`);
  console.log(`Video: ${lesson.videoUrl}`);
});
```

---

## 🔒 Permissions

### Admin Operations (Require courses permission):
- `courses:create` - Add lessons
- `courses:update` - Update lessons
- `courses:delete` - Delete lessons
- `courses:view` - View all lessons (admin panel)

### Public/User Operations:
- No authentication required to view lessons
- Language selection via Accept-Language header

---

## 📚 Related Documentation

- **Postman Collection:** `course_lessons_postman.json`
- **Upload System:** `HIGH_PERFORMANCE_UPLOAD_SYSTEM.md`
- **Permissions:** `PERMISSIONS_UPDATE_COMPLETE.md`
- **Course System:** `src/modules/courses/`

---

## ✅ Status: COMPLETE

All lesson functionality implemented with full bilingual support. Ready for production use.

**Features:**
- ✅ CRUD operations
- ✅ Bilingual support (AR/EN)
- ✅ Translation system integration
- ✅ BunnyCDN video upload support
- ✅ Permission-based access control
- ✅ Clean, production-ready code

**Last Updated:** February 11, 2026
