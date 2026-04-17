# Indicators API - Postman Examples

Base URL: `http://localhost:3000/api/indicators`

---

## 1. Create Indicator

**POST** `/api/indicators`

Headers:
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

Body (form-data):
```
plans[]        = pro
plans[]        = otrade
date           = 2026-04-17
title[en]      = RSI Indicator
title[ar]      = مؤشر RSI
description[en]= Relative Strength Index analysis
description[ar]= تحليل مؤشر القوة النسبية
content[en]    = Full content here
content[ar]    = المحتوى الكامل هنا
coverImage     = <file>
```

Response:
```json
{
  "message": "Indicator created successfully.",
  "indicator": {
    "id": "664abc123...",
    "coverImageUrl": "https://res.cloudinary.com/...",
    "date": "2026-04-17T00:00:00.000Z",
    "plans": ["pro", "otrade"],
    "translations": [...]
  }
}
```

---

## 2. Get All Indicators

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
      "id": "664abc123...",
      "coverImageUrl": "https://res.cloudinary.com/...",
      "date": "2026-04-17T00:00:00.000Z",
      "plans": ["pro"],
      "title": "مؤشر RSI",
      "description": "تحليل مؤشر القوة النسبية",
      "createdAt": "2026-04-17T10:00:00.000Z"
    }
  ]
}
```

---

## 3. Get Indicator By ID

**GET** `/api/indicators/:id`

Headers:
```
Authorization: Bearer <user_token>
Accept-Language: en
```

Response (has access):
```json
{
  "indicator": {
    "id": "664abc123...",
    "coverImageUrl": "https://res.cloudinary.com/...",
    "date": "2026-04-17T00:00:00.000Z",
    "title": "RSI Indicator",
    "description": "Relative Strength Index analysis",
    "content": "Full content here",
    "updates": [],
    "locked": false
  }
}
```

Response (no access):
```json
{
  "error": "Access denied",
  "message": "You need to subscribe to a plan that includes this indicator.",
  "indicator": {
    "id": "664abc123...",
    "title": "RSI Indicator",
    "locked": true
  },
  "requiredPlans": ["pro"]
}
```

---

## 4. Update Indicator

**PUT** `/api/indicators/:id`

Headers:
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

Body (form-data):
```
title[en]      = RSI Indicator Updated
title[ar]      = مؤشر RSI محدث
description[en]= Updated description
description[ar]= وصف محدث
coverImage     = <file>
```

Response:
```json
{
  "message": "Indicator updated successfully.",
  "indicator": { ... }
}
```

---

## 5. Add Update to Indicator

**POST** `/api/indicators/:id/updates`

Headers:
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

Body (form-data):
```
title       = New Signal Alert
description = Price broke resistance level
date        = 2026-04-17
coverImage  = <file>
```

Response:
```json
{
  "message": "Update added successfully.",
  "indicator": {
    "id": "664abc123...",
    "updates": [
      {
        "_id": "664def456...",
        "title": "New Signal Alert",
        "description": "Price broke resistance level",
        "coverImageUrl": "https://res.cloudinary.com/...",
        "date": "2026-04-17T00:00:00.000Z"
      }
    ]
  }
}
```

---

## 6. Delete Update

**DELETE** `/api/indicators/:id/updates/:updateId`

Headers:
```
Authorization: Bearer <admin_token>
```

Response:
```json
{
  "message": "Update deleted successfully."
}
```

---

## 7. Delete Indicator

**DELETE** `/api/indicators/:id`

Headers:
```
Authorization: Bearer <admin_token>
```

Response:
```json
{
  "message": "Indicator deleted successfully."
}
```
