# 🔴 CRITICAL: Server Must Be Restarted!

## Current Status
The fix has been applied but `req.body` is still empty because **the server hasn't been restarted yet**.

---

## 🐛 Problem

When sending `multipart/form-data` from Postman, `req.body` is empty:

```
===== ADD LESSON DEBUG =====
Course ID: 698ca4faeb13e3c2d63f3d91
req.body: {}  ← EMPTY!
req.body keys: []
Content-Type: multipart/form-data; boundary=--------------------------287089400682659431181685
============================
```

### Root Cause

Express doesn't parse `multipart/form-data` by default. The `express.urlencoded()` middleware only handles `application/x-www-form-urlencoded`.

Postman's "form-data" option sends `multipart/form-data`, which requires **multer** middleware.

---

## ✅ Solution Applied

### 1. Added multer middleware to lesson routes

```javascript
// src/modules/courses/courses.routes.js
import { uploadAny } from '../../middlewares/upload.middleware.js';

// Apply uploadAny to all lesson routes that accept form-data
router.post('/:courseId/lessons', 
  authenticate(['admin', 'super_admin']), 
  checkPermission('courses', 'create'), 
  uploadAny,  // ← This parses multipart/form-data
  addLesson
);

router.put('/:courseId/lessons/:lessonId', 
  authenticate(['admin', 'super_admin']), 
  checkPermission('courses', 'update'), 
  uploadAny,  // ← Added here too
  updateLesson
);
```

### 2. uploadAny is multer.none()

```javascript
// src/middlewares/upload.middleware.js
export const uploadAny = upload.none(); // For requests without files
```

This tells multer to parse form-data fields but not expect any files.

---

## 🚨 RESTART SERVER NOW

The middleware changes won't take effect until you restart the server:

```bash
# 1. Stop the current server
# Press Ctrl+C in the terminal where server is running

# 2. Restart the server
npm start
# or
node src/server.js
```

---

## ✅ After Restart - Expected Output

When you send the same request from Postman, you should see:

```
===== ADD LESSON DEBUG =====
Course ID: 698ca4faeb13e3c2d63f3d91
req.body: {
  'title[en]': 'Introduction to Trading',
  'title[ar]': 'مقدمة في التداول',
  'description[en]': 'Learn the basics of trading',
  'description[ar]': 'تعلم أساسيات التداول',
  'content[en]': 'Full lesson content in English',
  'content[ar]': 'محتوى الدرس الكامل بالعربية',
  videoUrl: 'https://cdn.example.com/lessons/intro.mp4',
  contentUrl: 'https://cdn.example.com/lessons/materials.pdf',
  duration: '1800',
  order: '1'
}
req.body keys: [ 'title[en]', 'title[ar]', 'description[en]', ... ]
Content-Type: multipart/form-data; boundary=--------------------------...

--- Checking individual fields ---
req.body["title[en]"]: Introduction to Trading
req.body["title[ar]"]: مقدمة في التداول
...

✅ Validation passed, proceeding...
```

---

## 📊 Why This Happens

| Content-Type | Middleware Needed | Postman Option |
|-------------|-------------------|----------------|
| `application/json` | `express.json()` | Body → raw → JSON |
| `application/x-www-form-urlencoded` | `express.urlencoded()` | Body → x-www-form-urlencoded |
| `multipart/form-data` | **multer** | Body → form-data |

### Key Points:
- `express.json()` - Parses JSON only
- `express.urlencoded()` - Parses URL-encoded forms only
- `multer` - Parses multipart/form-data (with or without files)

---

## 🧪 Test Steps

### 1. Restart Server (REQUIRED)
```bash
# Stop server: Ctrl+C
# Start server: npm start
```

### 2. Test with Postman

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
| content[en] | Full lesson content in English |
| content[ar] | محتوى الدرس الكامل بالعربية |
| videoUrl | https://cdn.example.com/lessons/intro.mp4 |
| contentUrl | https://cdn.example.com/lessons/materials.pdf |
| duration | 1800 |
| order | 1 |

### 3. Expected Response

```json
{
  "success": true,
  "message": "Lesson added successfully",
  "lesson": {
    "id": "...",
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
    "createdAt": "2026-02-11T..."
  }
}
```

---

## 🧹 After Successful Test

Once you confirm it works, we'll remove the debug console.log statements from `src/modules/courses/lessons.controller.js`.

---

## 🔄 Alternative: Use x-www-form-urlencoded

If you don't want to restart the server right now, you can test with:

**Postman:**
- Change Body type from "form-data" to "x-www-form-urlencoded"
- This will work with existing `express.urlencoded()` middleware

But for file uploads later, you'll need multer anyway, so restarting is recommended.

---

## 📝 Technical Details

### What is multer.none()?

```javascript
const upload = multer();
export const uploadAny = upload.none();
```

- `multer()` - Creates multer instance
- `.none()` - Accepts only text fields (no files)
- Parses `multipart/form-data` into `req.body`

### When to Use Each Multer Method

```javascript
upload.single('file')    // One file
upload.array('files')    // Multiple files (same field)
upload.fields([...])     // Multiple files (different fields)
upload.none()            // No files (text only)
upload.any()             // Any files (any field names)
```

---

## ✅ Status: Fix Applied - Awaiting Server Restart

- ✅ Multer middleware added to routes
- ✅ uploadAny exported from upload.middleware.js
- ✅ Debug logging in place
- 🔴 **Server restart required**
- ⏳ Testing pending

**Last Updated:** February 11, 2026
