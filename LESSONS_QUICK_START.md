# 🚀 Course Lessons - Quick Start Guide

## 📋 What Was Built

Complete lessons system for courses with:
- ✅ Bilingual support (Arabic & English)
- ✅ Video upload integration (BunnyCDN)
- ✅ CRUD operations
- ✅ Permission-based access control
- ✅ Translation system integration

---

## 🎯 Quick API Reference

### Add Lesson (Admin)
```bash
POST /api/courses/:courseId/lessons
Authorization: Bearer ADMIN_TOKEN

{
  "title": { "en": "Lesson 1", "ar": "الدرس 1" },
  "videoUrl": "https://cdn.example.com/video.mp4",
  "duration": 1800,
  "order": 1
}
```

### Get Lessons (Public)
```bash
GET /api/courses/:courseId/lessons
Accept-Language: ar  # or en
```

### Update Lesson (Admin)
```bash
PUT /api/courses/:courseId/lessons/:lessonId
Authorization: Bearer ADMIN_TOKEN

{
  "title": { "ar": "الدرس المحدث" },
  "duration": 2100
}
```

### Delete Lesson (Admin)
```bash
DELETE /api/courses/:courseId/lessons/:lessonId
Authorization: Bearer ADMIN_TOKEN
```

---

## 📁 Files Created/Modified

**New Files:**
- `src/modules/courses/lessons.controller.js` - Lessons CRUD logic
- `course_lessons_postman.json` - Postman collection
- `COURSE_LESSONS_COMPLETE.md` - Full documentation (English)
- `COURSE_LESSONS_AR.md` - Full documentation (Arabic)

**Modified Files:**
- `src/modules/courses/course.model.js` - Added lessons array
- `src/modules/courses/courses.routes.js` - Added lesson routes
- `src/modules/translations/translation.model.js` - Added 'lesson' entity type
- `src/modules/translations/translation.service.js` - Added 'lesson' support

---

## 🧪 Test It

### Import Postman Collection
```
File: course_lessons_postman.json
```

### Quick Test Flow
1. Create a course (if you don't have one)
2. Add a lesson to the course (Admin)
3. Get all lessons (Public - test both languages)
4. Update a lesson (Admin)
5. Delete a lesson (Admin)

---

## 💡 Frontend Integration

### Add Lesson with Video
```javascript
// 1. Upload video to BunnyCDN
const { data } = await axios.post('/api/upload/generate-url', {
  fileName: 'video.mp4',
  fileType: 'video',
  category: 'lessons',
  fileSize: file.size
});

await axios.put(data.uploadUrl, file, { headers: data.headers });

// 2. Create lesson
await axios.post(`/api/courses/${courseId}/lessons`, {
  title: { en: 'Lesson 1', ar: 'الدرس 1' },
  videoUrl: data.fileUrl,
  duration: 1800,
  order: 1
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Display Lessons
```javascript
const { data } = await axios.get(`/api/courses/${courseId}/lessons`, {
  headers: { 'Accept-Language': 'ar' } // or 'en'
});

data.lessons.forEach(lesson => {
  console.log(`${lesson.order}. ${lesson.title}`);
  console.log(`Duration: ${lesson.duration}s`);
  console.log(`Video: ${lesson.videoUrl}`);
});
```

---

## 🔒 Permissions Required

**Admin Operations:**
- `courses:create` - Add lessons
- `courses:update` - Update lessons
- `courses:delete` - Delete lessons

**Public Operations:**
- No authentication required to view lessons

---

## 📚 Full Documentation

- **English:** `COURSE_LESSONS_COMPLETE.md`
- **Arabic:** `COURSE_LESSONS_AR.md`
- **Postman:** `course_lessons_postman.json`

---

## ✅ Ready to Use!

All endpoints are live and ready for testing. The system integrates seamlessly with your existing course structure and translation system.

**Last Updated:** February 11, 2026
