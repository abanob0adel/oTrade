# Partners System - Postman Examples

## 📋 Overview

نظام الشركاء يدعم نوعين من الشركاء:
1. **People** - أشخاص
2. **Company** - شركات

كل شريك يحتوي على:
- `category` - النوع (people أو company)
- `title` - العنوان (مترجم عربي/إنجليزي)
- `description` - الوصف (مترجم عربي/إنجليزي)
- `image` - الصورة
- `websiteUrl` - رابط الموقع
- `links` - روابط إضافية مرنة (array)
- `order` - الترتيب

---

## 1. Create Partner (People)

### Endpoint
```
POST http://localhost:3000/api/v1/partners
```

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: multipart/form-data
```

### Body (form-data) - JSON Format
```
category: people
title: {"en": "Ahmed Mohamed", "ar": "أحمد محمد"}
description: {"en": "Financial Expert & Analyst", "ar": "خبير ومحلل مالي"}
websiteUrl: https://ahmed-mohamed.com
links: [{"label": "LinkedIn", "url": "https://linkedin.com/in/ahmed"}, {"label": "Twitter", "url": "https://twitter.com/ahmed"}]
order: 1
image: [SELECT FILE]
```

### Body (form-data) - Underscore Format
```
category: people
title_en: Ahmed Mohamed
title_ar: أحمد محمد
description_en: Financial Expert & Analyst
description_ar: خبير ومحلل مالي
websiteUrl: https://ahmed-mohamed.com
links: [{"label": "LinkedIn", "url": "https://linkedin.com/in/ahmed"}, {"label": "Twitter", "url": "https://twitter.com/ahmed"}]
order: 1
image: [SELECT FILE]
```

### Response (Success - 201)
```json
{
  "success": true,
  "message": "Partner created successfully",
  "data": {
    "id": "65d1234567890abcdef12345",
    "category": "people",
    "image": "https://otrade.b-cdn.net/partners/people/ahmed-mohamed.jpg",
    "websiteUrl": "https://ahmed-mohamed.com",
    "links": [
      {
        "label": "LinkedIn",
        "url": "https://linkedin.com/in/ahmed"
      },
      {
        "label": "Twitter",
        "url": "https://twitter.com/ahmed"
      }
    ],
    "order": 1,
    "translations": {
      "en": {
        "title": "Ahmed Mohamed",
        "description": "Financial Expert & Analyst"
      },
      "ar": {
        "title": "أحمد محمد",
        "description": "خبير ومحلل مالي"
      }
    },
    "isActive": true,
    "createdAt": "2024-02-18T20:30:00.000Z",
    "updatedAt": "2024-02-18T20:30:00.000Z"
  }
}
```

---

## 2. Create Partner (Company)

### Endpoint
```
POST http://localhost:3000/api/v1/partners
```

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: multipart/form-data
```

### Body (form-data)
```
category: company
title_en: TechCorp Solutions
title_ar: تك كورب للحلول
description_en: Leading technology solutions provider
description_ar: مزود رائد لحلول التكنولوجيا
websiteUrl: https://techcorp.com
links: [{"label": "Facebook", "url": "https://facebook.com/techcorp"}, {"label": "Instagram", "url": "https://instagram.com/techcorp"}]
order: 1
image: [SELECT FILE]
```

### Response (Success - 201)
```json
{
  "success": true,
  "message": "Partner created successfully",
  "data": {
    "id": "65d1234567890abcdef12346",
    "category": "company",
    "image": "https://otrade.b-cdn.net/partners/company/techcorp.jpg",
    "websiteUrl": "https://techcorp.com",
    "links": [
      {
        "label": "Facebook",
        "url": "https://facebook.com/techcorp"
      },
      {
        "label": "Instagram",
        "url": "https://instagram.com/techcorp"
      }
    ],
    "order": 1,
    "translations": {
      "en": {
        "title": "TechCorp Solutions",
        "description": "Leading technology solutions provider"
      },
      "ar": {
        "title": "تك كورب للحلول",
        "description": "مزود رائد لحلول التكنولوجيا"
      }
    },
    "isActive": true,
    "createdAt": "2024-02-18T20:35:00.000Z",
    "updatedAt": "2024-02-18T20:35:00.000Z"
  }
}
```

---

## 3. Get All Partners (Single Language)

### Endpoint
```
GET http://localhost:3000/api/v1/partners
```

### Headers
```
Accept-Language: en
```

### Query Parameters (Optional)
```
category=people  (or category=company to filter by type)
```

### Examples
```
GET http://localhost:3000/api/v1/partners
GET http://localhost:3000/api/v1/partners?category=people
GET http://localhost:3000/api/v1/partners?category=company
```

### Response (Success - 200) - English
```json
{
  "success": true,
  "data": [
    {
      "id": "65d1234567890abcdef12345",
      "category": "people",
      "title": "Ahmed Mohamed",
      "description": "Financial Expert & Analyst",
      "image": "https://otrade.b-cdn.net/partners/people/ahmed-mohamed.jpg",
      "websiteUrl": "https://ahmed-mohamed.com",
      "links": [
        {
          "label": "LinkedIn",
          "url": "https://linkedin.com/in/ahmed"
        }
      ],
      "order": 1
    },
    {
      "id": "65d1234567890abcdef12346",
      "category": "company",
      "title": "TechCorp Solutions",
      "description": "Leading technology solutions provider",
      "image": "https://otrade.b-cdn.net/partners/company/techcorp.jpg",
      "websiteUrl": "https://techcorp.com",
      "links": [
        {
          "label": "Facebook",
          "url": "https://facebook.com/techcorp"
        }
      ],
      "order": 1
    }
  ]
}
```

---

## 4. Get All Partners (Multiple Languages)

### Endpoint
```
GET http://localhost:3000/api/v1/partners
```

### Headers
```
Accept-Language: en|ar
```

### Response (Success - 200)
```json
{
  "success": true,
  "data": [
    {
      "id": "65d1234567890abcdef12345",
      "category": "people",
      "image": "https://otrade.b-cdn.net/partners/people/ahmed-mohamed.jpg",
      "websiteUrl": "https://ahmed-mohamed.com",
      "links": [
        {
          "label": "LinkedIn",
          "url": "https://linkedin.com/in/ahmed"
        }
      ],
      "order": 1,
      "translations": {
        "en": {
          "title": "Ahmed Mohamed",
          "description": "Financial Expert & Analyst"
        },
        "ar": {
          "title": "أحمد محمد",
          "description": "خبير ومحلل مالي"
        }
      }
    }
  ]
}
```

---

## 5. Get Partner by ID (Single Language)

### Endpoint
```
GET http://localhost:3000/api/v1/partners/:id
```

### Headers
```
Accept-Language: ar
```

### Example
```
GET http://localhost:3000/api/v1/partners/65d1234567890abcdef12345
```

### Response (Success - 200) - Arabic
```json
{
  "success": true,
  "data": {
    "id": "65d1234567890abcdef12345",
    "category": "people",
    "title": "أحمد محمد",
    "description": "خبير ومحلل مالي",
    "image": "https://otrade.b-cdn.net/partners/people/ahmed-mohamed.jpg",
    "websiteUrl": "https://ahmed-mohamed.com",
    "links": [
      {
        "label": "LinkedIn",
        "url": "https://linkedin.com/in/ahmed"
      }
    ],
    "order": 1,
    "createdAt": "2024-02-18T20:30:00.000Z",
    "updatedAt": "2024-02-18T20:30:00.000Z"
  }
}
```

---

## 6. Get Partner by ID (Multiple Languages)

### Endpoint
```
GET http://localhost:3000/api/v1/partners/:id
```

### Headers
```
Accept-Language: en|ar
```

### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "id": "65d1234567890abcdef12345",
    "category": "people",
    "image": "https://otrade.b-cdn.net/partners/people/ahmed-mohamed.jpg",
    "websiteUrl": "https://ahmed-mohamed.com",
    "links": [
      {
        "label": "LinkedIn",
        "url": "https://linkedin.com/in/ahmed"
      }
    ],
    "order": 1,
    "translations": {
      "en": {
        "title": "Ahmed Mohamed",
        "description": "Financial Expert & Analyst"
      },
      "ar": {
        "title": "أحمد محمد",
        "description": "خبير ومحلل مالي"
      }
    },
    "createdAt": "2024-02-18T20:30:00.000Z",
    "updatedAt": "2024-02-18T20:30:00.000Z"
  }
}
```

---

## 7. Update Partner

### Endpoint
```
PUT http://localhost:3000/api/v1/partners/:id
```

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: multipart/form-data
```

### Body (form-data) - Update text only
```
title_en: Ahmed Mohamed Ali
title_ar: أحمد محمد علي
description_en: Senior Financial Expert
description_ar: خبير مالي أول
websiteUrl: https://ahmed-ali.com
links: [{"label": "LinkedIn", "url": "https://linkedin.com/in/ahmed-ali"}]
order: 2
```

### Body (form-data) - Update with new image
```
title: {"en": "Ahmed Mohamed Ali", "ar": "أحمد محمد علي"}
description: {"en": "Senior Financial Expert", "ar": "خبير مالي أول"}
websiteUrl: https://ahmed-ali.com
links: [{"label": "LinkedIn", "url": "https://linkedin.com/in/ahmed-ali"}, {"label": "Website", "url": "https://ahmed-ali.com"}]
order: 2
image: [SELECT NEW FILE]
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Partner updated successfully",
  "data": {
    "id": "65d1234567890abcdef12345",
    "category": "people",
    "image": "https://otrade.b-cdn.net/partners/people/new-image.jpg",
    "websiteUrl": "https://ahmed-ali.com",
    "links": [
      {
        "label": "LinkedIn",
        "url": "https://linkedin.com/in/ahmed-ali"
      },
      {
        "label": "Website",
        "url": "https://ahmed-ali.com"
      }
    ],
    "order": 2,
    "translations": {
      "en": {
        "title": "Ahmed Mohamed Ali",
        "description": "Senior Financial Expert"
      },
      "ar": {
        "title": "أحمد محمد علي",
        "description": "خبير مالي أول"
      }
    },
    "isActive": true,
    "createdAt": "2024-02-18T20:30:00.000Z",
    "updatedAt": "2024-02-18T21:00:00.000Z"
  }
}
```

---

## 8. Delete Partner

### Endpoint
```
DELETE http://localhost:3000/api/v1/partners/:id
```

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Example
```
DELETE http://localhost:3000/api/v1/partners/65d1234567890abcdef12345
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Partner deleted successfully"
}
```

---

## 📝 Complete Workflow Example

### Step 1: Create Person Partner
```
POST http://localhost:3000/api/v1/partners
Authorization: Bearer ADMIN_TOKEN
```
Form-data:
```
category: people
title_en: Ahmed Mohamed
title_ar: أحمد محمد
description_en: Financial Expert
description_ar: خبير مالي
websiteUrl: https://ahmed.com
links: [{"label": "LinkedIn", "url": "https://linkedin.com/in/ahmed"}]
order: 1
image: [FILE]
```

### Step 2: Create Company Partner
```
POST http://localhost:3000/api/v1/partners
Authorization: Bearer ADMIN_TOKEN
```
Form-data:
```
category: company
title_en: TechCorp
title_ar: تك كورب
description_en: Technology Solutions
description_ar: حلول تكنولوجية
websiteUrl: https://techcorp.com
links: [{"label": "Facebook", "url": "https://facebook.com/techcorp"}]
order: 1
image: [FILE]
```

### Step 3: Get All Partners in English
```
GET http://localhost:3000/api/v1/partners
Accept-Language: en
```

### Step 4: Get All Partners in Arabic
```
GET http://localhost:3000/api/v1/partners
Accept-Language: ar
```

### Step 5: Get Only People Partners
```
GET http://localhost:3000/api/v1/partners?category=people
Accept-Language: en
```

### Step 6: Get Only Company Partners
```
GET http://localhost:3000/api/v1/partners?category=company
Accept-Language: ar
```

### Step 7: Get All Partners (Both Languages)
```
GET http://localhost:3000/api/v1/partners
Accept-Language: en|ar
```

### Step 8: Update Partner
```
PUT http://localhost:3000/api/v1/partners/65d1234567890abcdef12345
Authorization: Bearer ADMIN_TOKEN
```
Body:
```
order: 3
links: [{"label": "LinkedIn", "url": "https://linkedin.com/in/new"}, {"label": "Twitter", "url": "https://twitter.com/new"}]
```

---

## 🔑 Important Notes

### Categories
- **people**: للأشخاص
- **company**: للشركات

### Fields
- **title**: العنوان (مترجم)
- **description**: الوصف (مترجم)
- **image**: الصورة (مطلوب عند الإنشاء)
- **websiteUrl**: رابط الموقع (اختياري)
- **links**: روابط إضافية (array مرن)
- **order**: الترتيب (الأقل رقم يظهر أولاً)

### Links Format
```json
[
  {
    "label": "LinkedIn",
    "url": "https://linkedin.com/in/username"
  },
  {
    "label": "Twitter",
    "url": "https://twitter.com/username"
  }
]
```

### Translation Formats
- JSON: `{"en": "text", "ar": "نص"}`
- Underscore: `field_en`, `field_ar`
- Bracket: `field[en]`, `field[ar]`

### Language Headers
- Single: `Accept-Language: en` or `ar`
- Multiple: `Accept-Language: en|ar`
- Default: English

### Permissions
- GET endpoints: Public
- POST, PUT, DELETE: Admin only (requires 'partners' permission)

---

## 🎯 Testing Checklist

- [ ] Create people partner with English only
- [ ] Create people partner with both languages
- [ ] Create company partner with both languages
- [ ] Try to create without image (should fail)
- [ ] Try to create without title (should fail)
- [ ] Try to create with invalid category (should fail)
- [ ] Get all partners in English
- [ ] Get all partners in Arabic
- [ ] Get all partners in both languages
- [ ] Get only people partners
- [ ] Get only company partners
- [ ] Get partner by ID
- [ ] Update partner text only
- [ ] Update partner with new image
- [ ] Update partner links
- [ ] Update partner order
- [ ] Delete partner

---

## 💡 Use Cases

### 1. Partners Page (English)
```
GET /api/partners
Accept-Language: en
```
Returns all partners in English

### 2. Partners Page (Arabic)
```
GET /api/partners
Accept-Language: ar
```
Returns all partners in Arabic

### 3. People Section Only
```
GET /api/partners?category=people
Accept-Language: en
```
Returns only people partners

### 4. Companies Section Only
```
GET /api/partners?category=company
Accept-Language: ar
```
Returns only company partners

### 5. Bilingual App
```
GET /api/partners
Accept-Language: en|ar
```
Returns all partners with both translations

---

## 🚀 Quick Start (cURL)

### Create Partner
```bash
curl -X POST http://localhost:3000/api/v1/partners \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "category=people" \
  -F "title_en=Ahmed Mohamed" \
  -F "title_ar=أحمد محمد" \
  -F "description_en=Financial Expert" \
  -F "description_ar=خبير مالي" \
  -F "websiteUrl=https://ahmed.com" \
  -F 'links=[{"label":"LinkedIn","url":"https://linkedin.com/in/ahmed"}]' \
  -F "order=1" \
  -F "image=@/path/to/image.jpg"
```

### Get All Partners in English
```bash
curl -X GET http://localhost:3000/api/v1/partners \
  -H "Accept-Language: en"
```

### Get People Partners Only
```bash
curl -X GET "http://localhost:3000/api/v1/partners?category=people" \
  -H "Accept-Language: ar"
```

