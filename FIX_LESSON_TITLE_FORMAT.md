# ✅ Fix: Lesson Title Format Issue

## 🐛 Problem

When adding a lesson, you got this error:
```json
{
  "success": false,
  "error": "Lesson title is required in at least one language (en or ar)"
}
```

Even though you sent:
```
title[en]: Introduction to Trading
title[ar]: مقدمة في التداول
```

### Root Cause

The controller was only looking for `title_en` and `title_ar` format, but you were sending `title[en]` and `title[ar]` format (with brackets).

---

## 🔧 What Was Fixed

Updated `src/modules/courses/lessons.controller.js` to support **BOTH formats**:

### Before (Only Supported Underscore)
```javascript
if (req.body.title_en) title.en = req.body.title_en;
if (req.body.title_ar) title.ar = req.body.title_ar;
```

### After (Supports Both Formats)
```javascript
// Support underscore format: title_en, title_ar
if (req.body.title_en) title.en = req.body.title_en;
if (req.body.title_ar) title.ar = req.body.title_ar;

// Support bracket format: title[en], title[ar]
if (req.body['title[en]']) title.en = req.body['title[en]'];
if (req.body['title[ar]']) title.ar = req.body['title[ar]'];
```

Same fix applied to `description` and `content` fields.

---

## ✅ Now Supports 4 Formats

### Format 1: Underscore (title_en, title_ar)
```javascript
const formData = new FormData();
formData.append('title_en', 'Introduction to Trading');
formData.append('title_ar', 'مقدمة في التداول');
formData.append('description_en', 'Learn the basics');
formData.append('description_ar', 'تعلم الأساسيات');
```

### Format 2: Brackets (title[en], title[ar])
```javascript
const formData = new FormData();
formData.append('title[en]', 'Introduction to Trading');
formData.append('title[ar]', 'مقدمة في التداول');
formData.append('description[en]', 'Learn the basics');
formData.append('description[ar]', 'تعلم الأساسيات');
```

### Format 3: JSON String
```javascript
const formData = new FormData();
formData.append('title', JSON.stringify({
  en: 'Introduction to Trading',
  ar: 'مقدمة في التداول'
}));
```

### Format 4: Mixed
```javascript
const formData = new FormData();
formData.append('title_en', 'Introduction to Trading');
formData.append('title[ar]', 'مقدمة في التداول'); // Mix formats!
```

---

## 📝 Postman Examples

### Using Underscore Format

**Method:** POST  
**URL:** `http://localhost:3000/api/courses/:courseId/lessons`  
**Headers:** `Authorization: Bearer ADMIN_TOKEN`

**Body (form-data):**

| KEY | VALUE |
|-----|-------|
| title_en | Introduction to Trading |
| title_ar | مقدمة في التداول |
| description_en | Learn the basics |
| description_ar | تعلم الأساسيات |
| videoUrl | https://cdn.example.com/video.mp4 |
| duration | 1800 |
| order | 1 |

### Using Bracket Format

**Body (form-data):**

| KEY | VALUE |
|-----|-------|
| title[en] | Introduction to Trading |
| title[ar] | مقدمة في التداول |
| description[en] | Learn the basics |
| description[ar] | تعلم الأساسيات |
| videoUrl | https://cdn.example.com/video.mp4 |
| duration | 1800 |
| order | 1 |

---

## 💻 JavaScript Examples

### Example 1: Underscore Format
```javascript
const formData = new FormData();

formData.append('title_en', 'Introduction to Trading');
formData.append('title_ar', 'مقدمة في التداول');
formData.append('description_en', 'Learn the basics');
formData.append('description_ar', 'تعلم الأساسيات');
formData.append('videoUrl', 'https://cdn.example.com/video.mp4');
formData.append('duration', '1800');
formData.append('order', '1');

await axios.post(`/api/courses/${courseId}/lessons`, formData, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Example 2: Bracket Format
```javascript
const formData = new FormData();

formData.append('title[en]', 'Introduction to Trading');
formData.append('title[ar]', 'مقدمة في التداول');
formData.append('description[en]', 'Learn the basics');
formData.append('description[ar]', 'تعلم الأساسيات');
formData.append('videoUrl', 'https://cdn.example.com/video.mp4');
formData.append('duration', '1800');
formData.append('order', '1');

await axios.post(`/api/courses/${courseId}/lessons`, formData, {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## 🧪 Test It

### Test 1: Underscore Format
```bash
POST http://localhost:3000/api/courses/COURSE_ID/lessons
Authorization: Bearer ADMIN_TOKEN

Body (form-data):
- title_en = "Lesson 1"
- title_ar = "الدرس 1"
- videoUrl = https://cdn.example.com/video.mp4
- duration = 1800
- order = 1
```

**Expected:** ✅ Success

### Test 2: Bracket Format
```bash
POST http://localhost:3000/api/courses/COURSE_ID/lessons
Authorization: Bearer ADMIN_TOKEN

Body (form-data):
- title[en] = "Lesson 1"
- title[ar] = "الدرس 1"
- videoUrl = https://cdn.example.com/video.mp4
- duration = 1800
- order = 1
```

**Expected:** ✅ Success

### Test 3: Mixed Format
```bash
POST http://localhost:3000/api/courses/COURSE_ID/lessons
Authorization: Bearer ADMIN_TOKEN

Body (form-data):
- title_en = "Lesson 1"
- title[ar] = "الدرس 1"  # Mix formats!
- videoUrl = https://cdn.example.com/video.mp4
```

**Expected:** ✅ Success

---

## 📋 Field Reference

### Supported Field Formats

| Field | Format 1 (Underscore) | Format 2 (Bracket) |
|-------|----------------------|-------------------|
| Title EN | `title_en` | `title[en]` |
| Title AR | `title_ar` | `title[ar]` |
| Description EN | `description_en` | `description[en]` |
| Description AR | `description_ar` | `description[ar]` |
| Content EN | `content_en` | `content[en]` |
| Content AR | `content_ar` | `content[ar]` |

### Other Fields (No Format Variation)
- `videoUrl` - Video URL
- `contentUrl` - Materials URL
- `duration` - Duration in seconds
- `order` - Lesson order

---

## 🚨 Common Mistakes

### Mistake 1: Missing Both Languages
```javascript
// ❌ Wrong - No title provided
formData.append('videoUrl', 'https://...');
```

**Solution:** Add at least one language:
```javascript
// ✅ Correct
formData.append('title_en', 'Lesson Title');
// OR
formData.append('title[ar]', 'عنوان الدرس');
```

### Mistake 2: Typo in Field Name
```javascript
// ❌ Wrong
formData.append('titleen', 'Lesson Title'); // Missing underscore

// ✅ Correct
formData.append('title_en', 'Lesson Title');
// OR
formData.append('title[en]', 'Lesson Title');
```

---

## 📚 Related Files

- `src/modules/courses/lessons.controller.js` - Updated to support both formats
- `LESSONS_FORMDATA_EXAMPLES.md` - Complete FormData examples
- `FORMDATA_EXAMPLES_AR.md` - Arabic examples

---

## ✅ Status: FIXED

The lesson controller now accepts:
- ✅ Underscore format: `title_en`, `title_ar`
- ✅ Bracket format: `title[en]`, `title[ar]`
- ✅ JSON string format
- ✅ Mixed formats

**Last Updated:** February 11, 2026
