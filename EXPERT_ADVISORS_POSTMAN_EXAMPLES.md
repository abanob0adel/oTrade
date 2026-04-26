# Expert Advisors API - Postman Examples

Base URL: `https://api.otrade.ae`

> Admin endpoints require: `Authorization: Bearer <token>`

---

## 1. Get All Expert Advisors
**GET** `/api/expert-advisors`

Headers:
```
Accept-Language: ar
```

Response:
```json
{
  "expertAdvisors": [
    {
      "id": "664f1a2b3c4d5e6f7a8b9c0d",
      "coverImageUrl": "https://otrade.b-cdn.net/expert-advisors/img.jpg",
      "date": "2026-04-20T00:00:00.000Z",
      "plans": ["664a1b2c3d4e5f6a7b8c9d0e"],
      "title": "مستشار الخبراء",
      "description": "وصف المستشار",
      "createdAt": "2026-04-20T10:00:00.000Z",
      "updatedAt": "2026-04-20T10:00:00.000Z"
    }
  ]
}
```

---

## 2. Get Expert Advisor By ID
**GET** `/api/expert-advisors/:id`

Headers:
```
Accept-Language: en
Authorization: Bearer <token>
```

Response:
```json
{
  "expertAdvisor": {
    "id": "664f1a2b3c4d5e6f7a8b9c0d",
    "coverImageUrl": "https://otrade.b-cdn.net/expert-advisors/img.jpg",
    "date": "2026-04-20T00:00:00.000Z",
    "title": "Expert Advisor",
    "description": "Description",
    "content": "Full content",
    "keyFeatures": [
      { "id": "...", "title": "Fast Execution", "description": "Executes in ms" }
    ],
    "recommendations": [
      {
        "id": "...",
        "title": "Recommended for Forex",
        "performanceSummary": "85% win rate",
        "pros": [
          { "id": "...", "title": "High accuracy", "description": "Very precise signals" }
        ],
        "cons": [
          { "id": "...", "title": "High risk", "description": "Not suitable for beginners" }
        ]
      }
    ],
    "updates": [
      { "id": "...", "coverImageUrl": "...", "date": "2026-04-21T00:00:00.000Z", "title": "v2.0 Update", "description": "New features added" }
    ],
    "locked": false
  }
}
```

---

## 3. Create Expert Advisor (Admin)
**POST** `/api/expert-advisors`

Headers:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

Body (form-data):
```
coverImage       → [File]
plans[]          → 664a1b2c3d4e5f6a7b8c9d0e
date             → 2026-04-20
title[en]        → Expert Advisor
title[ar]        → مستشار الخبراء
description[en]  → Description in English
description[ar]  → الوصف بالعربي
content[en]      → Full content in English
content[ar]      → المحتوى الكامل بالعربي
```

Response:
```json
{
  "message": "Expert advisor created successfully.",
  "expertAdvisor": {
    "id": "664f1a2b3c4d5e6f7a8b9c0d",
    "coverImageUrl": "https://otrade.b-cdn.net/expert-advisors/img.jpg",
    "plans": ["664a1b2c3d4e5f6a7b8c9d0e"]
  }
}
```

---

## 4. Update Expert Advisor (Admin)
**PUT** `/api/expert-advisors/:id`

Headers:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

Body (form-data) - كل الحقول اختيارية:
```
coverImage       → [File]
title[en]        → Updated Title
title[ar]        → العنوان المحدث
description[en]  → Updated description
description[ar]  → الوصف المحدث
```

---

## 5. Delete Expert Advisor (Admin)
**DELETE** `/api/expert-advisors/:id`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{ "message": "Expert advisor deleted successfully." }
```

---

## 6. Add Update (Admin)
**POST** `/api/expert-advisors/:id/updates`

Headers:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

Body (form-data):
```
coverImage       → [File]
date             → 2026-04-21
title[en]        → Version 2.0
title[ar]        → الإصدار 2.0
description[en]  → New features added
description[ar]  → تمت إضافة ميزات جديدة
```

Response:
```json
{
  "message": "Update added.",
  "update": {
    "id": "664f2b3c4d5e6f7a8b9c0d1e",
    "coverImageUrl": "https://otrade.b-cdn.net/expert-advisors/updates/img.jpg",
    "date": "2026-04-21T00:00:00.000Z"
  }
}
```

---

## 7. Edit Update (Admin)
**PUT** `/api/expert-advisors/:id/updates/:updateId`

Headers:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

Body (form-data):
```
coverImage       → [File] (optional)
title[en]        → Updated title
title[ar]        → العنوان المحدث
```

---

## 8. Delete Update (Admin)
**DELETE** `/api/expert-advisors/:id/updates/:updateId`

Headers:
```
Authorization: Bearer <token>
```

---

## 9. Add Key Feature (Admin)
**POST** `/api/expert-advisors/:id/key-features`

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Body:
```json
{
  "title[en]": "Fast Execution",
  "title[ar]": "تنفيذ سريع",
  "description[en]": "Executes trades in milliseconds",
  "description[ar]": "ينفذ الصفقات في ميلي ثانية"
}
```

Response:
```json
{
  "message": "Key feature added.",
  "keyFeature": { "id": "664f3c4d5e6f7a8b9c0d1e2f" }
}
```

---

## 10. Edit Key Feature (Admin)
**PUT** `/api/expert-advisors/:id/key-features/:featureId`

Body:
```json
{
  "title[en]": "Updated Feature",
  "title[ar]": "الميزة المحدثة",
  "description[en]": "Updated description",
  "description[ar]": "الوصف المحدث"
}
```

---

## 11. Delete Key Feature (Admin)
**DELETE** `/api/expert-advisors/:id/key-features/:featureId`

---

## 12. Add Recommendation (Admin)
**POST** `/api/expert-advisors/:id/recommendations`

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Body:
```json
{
  "title[en]": "Recommended for Forex",
  "title[ar]": "موصى به للفوركس",
  "performanceSummary": [
    { "en": "85% win rate", "ar": "نسبة فوز 85%" },
    { "en": "Low drawdown", "ar": "انخفاض منخفض" }
  ]
}
```

Response:
```json
{
  "message": "Recommendation added.",
  "recommendation": { "id": "664f4d5e6f7a8b9c0d1e2f3a" }
}
```

---

## 13. Edit Recommendation (Admin)
**PUT** `/api/expert-advisors/:id/recommendations/:recId`

Body:
```json
{
  "title[en]": "Updated Recommendation",
  "title[ar]": "التوصية المحدثة",
  "performanceSummary": [
    { "en": "90% win rate", "ar": "نسبة فوز 90%" },
    { "en": "Very low drawdown", "ar": "انخفاض منخفض جداً" }
  ]
}
```

---

## 14. Delete Recommendation (Admin)
**DELETE** `/api/expert-advisors/:id/recommendations/:recId`

---

## 15. Add Pro or Con (Admin)
**POST** `/api/expert-advisors/:id/items`

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Body (Pro):
```json
{
  "type": "pro",
  "title[en]": "High Accuracy",
  "title[ar]": "دقة عالية",
  "description[en]": "Very precise entry and exit signals",
  "description[ar]": "إشارات دخول وخروج دقيقة جداً"
}
```

Body (Con):
```json
{
  "type": "con",
  "title[en]": "High Risk",
  "title[ar]": "مخاطرة عالية",
  "description[en]": "Not suitable for beginners",
  "description[ar]": "غير مناسب للمبتدئين"
}
```

Response:
```json
{
  "message": "pro added.",
  "item": { "id": "664f5e6f7a8b9c0d1e2f3a4b", "type": "pro" }
}
```

---

## 16. Edit Pro or Con (Admin)
**PUT** `/api/expert-advisors/:id/items/:itemId`

Body:
```json
{
  "title[en]": "Updated title",
  "title[ar]": "العنوان المحدث",
  "description[en]": "Updated description",
  "description[ar]": "الوصف المحدث"
}
```

---

## 17. Delete Pro or Con (Admin)
**DELETE** `/api/expert-advisors/:id/items/:itemId`
