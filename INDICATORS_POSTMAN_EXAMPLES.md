# Indicators API - Postman Examples

Base URL: `https://api.otrade.ae`

> All admin endpoints require: `Authorization: Bearer <token>`

---

## 1. Get All Indicators
**GET** `/api/indicators`

Headers:
```
Accept-Language: ar
```

Response:
```json
{
  "indicators": [
    {
      "id": "664f1a2b3c4d5e6f7a8b9c0d",
      "coverImageUrl": "https://otrade.b-cdn.net/indicators/img.jpg",
      "date": "2026-04-20T00:00:00.000Z",
      "plans": ["664a1b2c3d4e5f6a7b8c9d0e"],
      "title": "مؤشر الذهب",
      "description": "تحليل مؤشر الذهب اليومي",
      "createdAt": "2026-04-20T10:00:00.000Z",
      "updatedAt": "2026-04-20T10:00:00.000Z"
    }
  ]
}
```

---

## 2. Get Indicator By ID
**GET** `/api/indicators/:id`

Headers:
```
Accept-Language: en
Authorization: Bearer <token>
```

Response (unlocked):
```json
{
  "indicator": {
    "id": "664f1a2b3c4d5e6f7a8b9c0d",
    "coverImageUrl": "https://otrade.b-cdn.net/indicators/img.jpg",
    "date": "2026-04-20T00:00:00.000Z",
    "title": "Gold Indicator",
    "description": "Daily gold indicator analysis",
    "content": "Full content here...",
    "updates": [],
    "locked": false
  }
}
```

Response (locked - no subscription):
```json
{
  "error": "Access denied",
  "message": "You need to subscribe to a plan that includes this indicator.",
  "indicator": {
    "id": "664f1a2b3c4d5e6f7a8b9c0d",
    "title": "Gold Indicator",
    "locked": true
  },
  "requiredPlans": ["664a1b2c3d4e5f6a7b8c9d0e"]
}
```

---

## 3. Create Indicator (Admin)
**POST** `/api/indicators`

Headers:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

Body (form-data):
```
coverImage        → [File]
plans[]           → 664a1b2c3d4e5f6a7b8c9d0e
date              → 2026-04-20
title[en]         → Gold Indicator
title[ar]         → مؤشر الذهب
description[en]   → Daily gold indicator analysis
description[ar]   → تحليل مؤشر الذهب اليومي
content[en]       → Full content in English
content[ar]       → المحتوى الكامل بالعربي
```

Response:
```json
{
  "message": "Indicator created successfully.",
  "indicator": {
    "id": "664f1a2b3c4d5e6f7a8b9c0d",
    "coverImageUrl": "https://otrade.b-cdn.net/indicators/img.jpg",
    "date": "2026-04-20T00:00:00.000Z",
    "plans": ["664a1b2c3d4e5f6a7b8c9d0e"],
    "translations": [
      { "language": "en", "title": "Gold Indicator", "description": "...", "content": "..." },
      { "language": "ar", "title": "مؤشر الذهب", "description": "...", "content": "..." }
    ]
  }
}
```

---

## 4. Update Indicator (Admin)
**PUT** `/api/indicators/:id`

Headers:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

Body (form-data) - كل الحقول اختيارية:
```
coverImage        → [File] (optional)
plans[]           → 664a1b2c3d4e5f6a7b8c9d0e
date              → 2026-04-21
title[en]         → Updated Gold Indicator
title[ar]         → مؤشر الذهب المحدث
description[en]   → Updated description
description[ar]   → الوصف المحدث
content[en]       → Updated content
content[ar]       → المحتوى المحدث
```

Response:
```json
{
  "message": "Indicator updated successfully.",
  "indicator": {
    "id": "664f1a2b3c4d5e6f7a8b9c0d",
    "coverImageUrl": "https://otrade.b-cdn.net/indicators/new-img.jpg",
    "updatedAt": "2026-04-21T10:00:00.000Z"
  }
}
```

---

## 5. Delete Indicator (Admin)
**DELETE** `/api/indicators/:id`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "message": "Indicator deleted successfully."
}
```

---

## 6. Add Update to Indicator (Admin)
**POST** `/api/indicators/:id/updates`

Headers:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

Body (form-data):
```
coverImage:    [File]
title:         Update title
description:   Update description
```

> التاريخ بيتعمل أوتو، مش محتاج تبعته.

Response:
```json
{
  "message": "Update added successfully.",
  "indicator": {
    "id": "664f1a2b3c4d5e6f7a8b9c0d",
    "updates": [
      {
        "_id": "664f2b3c4d5e6f7a8b9c0d1e",
        "coverImageUrl": "https://otrade.b-cdn.net/indicators/updates/img.jpg",
        "title": "Update title",
        "description": "Update description",
        "date": "2026-04-20T00:00:00.000Z"
      }
    ]
  }
}
```

---

## 7. Delete Update from Indicator (Admin)
**DELETE** `/api/indicators/:id/updates/:updateId`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "message": "Update deleted successfully."
}
```
