# About Us System - Postman Examples (with Translations)

## 📋 Overview

The About Us system supports two types of content with bilingual translations (Arabic & English):
1. **Vision** - Company vision with title and description (both translated)
2. **Team** - Team members with image, name, description, and LinkedIn link (name and description translated)

All text fields support multiple translation formats:
- JSON string: `{"en": "English text", "ar": "النص العربي"}`
- Underscore format: `title_en`, `title_ar`
- Bracket format: `title[en]`, `title[ar]`

---

## 1. Create Vision (with Translations)

### Endpoint
```
POST http://localhost:3000/api/about
```

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: multipart/form-data
```

### Body (form-data) - Option 1: JSON Format
```
key: vision
title: {"en": "Our Vision", "ar": "رؤيتنا"}
description: {"en": "To become the leading platform for financial education and trading in the Middle East", "ar": "أن نصبح المنصة الرائدة للتعليم المالي والتداول في الشرق الأوسط"}
```

### Body (form-data) - Option 2: Underscore Format
```
key: vision
title_en: Our Vision
title_ar: رؤيتنا
description_en: To become the leading platform for financial education and trading in the Middle East
description_ar: أن نصبح المنصة الرائدة للتعليم المالي والتداول في الشرق الأوسط
```

### Body (form-data) - Option 3: Bracket Format
```
key: vision
title[en]: Our Vision
title[ar]: رؤيتنا
description[en]: To become the leading platform for financial education and trading in the Middle East
description[ar]: أن نصبح المنصة الرائدة للتعليم المالي والتداول في الشرق الأوسط
```

### Response (Success - 201)
```json
{
  "success": true,
  "message": "About item created successfully",
  "data": {
    "id": "65d1234567890abcdef12345",
    "key": "vision",
    "translations": {
      "en": {
        "title": "Our Vision",
        "description": "To become the leading platform for financial education and trading in the Middle East"
      },
      "ar": {
        "title": "رؤيتنا",
        "description": "أن نصبح المنصة الرائدة للتعليم المالي والتداول في الشرق الأوسط"
      }
    },
    "isActive": true,
    "createdAt": "2024-02-18T20:30:00.000Z",
    "updatedAt": "2024-02-18T20:30:00.000Z"
  }
}
```

---

## 2. Create Team Member (with Translations)

### Endpoint
```
POST http://localhost:3000/api/about
```

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: multipart/form-data
```

### Body (form-data) - JSON Format
```
key: team
name: {"en": "Ahmed Mohamed", "ar": "أحمد محمد"}
description: {"en": "CEO & Founder with 10+ years of experience in financial markets", "ar": "الرئيس التنفيذي والمؤسس مع أكثر من 10 سنوات من الخبرة في الأسواق المالية"}
linkedIn: https://linkedin.com/in/ahmed-mohamed
order: 1
image: [SELECT FILE]
```

### Body (form-data) - Underscore Format
```
key: team
name_en: Ahmed Mohamed
name_ar: أحمد محمد
description_en: CEO & Founder with 10+ years of experience in financial markets
description_ar: الرئيس التنفيذي والمؤسس مع أكثر من 10 سنوات من الخبرة في الأسواق المالية
linkedIn: https://linkedin.com/in/ahmed-mohamed
order: 1
image: [SELECT FILE]
```

### Response (Success - 201)
```json
{
  "success": true,
  "message": "About item created successfully",
  "data": {
    "id": "65d1234567890abcdef12346",
    "key": "team",
    "image": "https://otrade.b-cdn.net/about/team/ahmed-mohamed.jpg",
    "linkedIn": "https://linkedin.com/in/ahmed-mohamed",
    "order": 1,
    "translations": {
      "en": {
        "name": "Ahmed Mohamed",
        "description": "CEO & Founder with 10+ years of experience in financial markets"
      },
      "ar": {
        "name": "أحمد محمد",
        "description": "الرئيس التنفيذي والمؤسس مع أكثر من 10 سنوات من الخبرة في الأسواق المالية"
      }
    },
    "isActive": true,
    "createdAt": "2024-02-18T20:35:00.000Z",
    "updatedAt": "2024-02-18T20:35:00.000Z"
  }
}
```

---

## 3. Get All About Items (Single Language)

### Endpoint
```
GET http://localhost:3000/api/about
```

### Headers
```
Accept-Language: en
```

### Query Parameters (Optional)
```
key=vision  (or key=team to filter by type)
```

### Examples
```
GET http://localhost:3000/api/about
GET http://localhost:3000/api/about?key=vision
GET http://localhost:3000/api/about?key=team
```

### Response (Success - 200) - English
```json
{
  "success": true,
  "data": [
    {
      "id": "65d1234567890abcdef12345",
      "key": "vision",
      "title": "Our Vision",
      "description": "To become the leading platform for financial education and trading in the Middle East"
    },
    {
      "id": "65d1234567890abcdef12346",
      "key": "team",
      "name": "Ahmed Mohamed",
      "description": "CEO & Founder with 10+ years of experience in financial markets",
      "image": "https://otrade.b-cdn.net/about/team/ahmed-mohamed.jpg",
      "linkedIn": "https://linkedin.com/in/ahmed-mohamed",
      "order": 1
    }
  ]
}
```

---

## 4. Get All About Items (Multiple Languages)

### Endpoint
```
GET http://localhost:3000/api/about
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
      "key": "vision",
      "translations": {
        "en": {
          "title": "Our Vision",
          "description": "To become the leading platform..."
        },
        "ar": {
          "title": "رؤيتنا",
          "description": "أن نصبح المنصة الرائدة..."
        }
      }
    },
    {
      "id": "65d1234567890abcdef12346",
      "key": "team",
      "image": "https://otrade.b-cdn.net/about/team/ahmed-mohamed.jpg",
      "linkedIn": "https://linkedin.com/in/ahmed-mohamed",
      "order": 1,
      "translations": {
        "en": {
          "name": "Ahmed Mohamed",
          "description": "CEO & Founder..."
        },
        "ar": {
          "name": "أحمد محمد",
          "description": "الرئيس التنفيذي..."
        }
      }
    }
  ]
}
```

---

## 5. Get About Item by ID (Single Language)

### Endpoint
```
GET http://localhost:3000/api/about/:id
```

### Headers
```
Accept-Language: ar
```

### Example
```
GET http://localhost:3000/api/about/65d1234567890abcdef12345
```

### Response (Success - 200) - Arabic
```json
{
  "success": true,
  "data": {
    "id": "65d1234567890abcdef12345",
    "key": "vision",
    "title": "رؤيتنا",
    "description": "أن نصبح المنصة الرائدة للتعليم المالي والتداول في الشرق الأوسط",
    "createdAt": "2024-02-18T20:30:00.000Z",
    "updatedAt": "2024-02-18T20:30:00.000Z"
  }
}
```

---

## 6. Get About Item by ID (Multiple Languages)

### Endpoint
```
GET http://localhost:3000/api/about/:id
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
    "key": "vision",
    "translations": {
      "en": {
        "title": "Our Vision",
        "description": "To become the leading platform..."
      },
      "ar": {
        "title": "رؤيتنا",
        "description": "أن نصبح المنصة الرائدة..."
      }
    },
    "createdAt": "2024-02-18T20:30:00.000Z",
    "updatedAt": "2024-02-18T20:30:00.000Z"
  }
}
```

---

## 7. Update Vision (with Translations)

### Endpoint
```
PUT http://localhost:3000/api/about/:id
```

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: multipart/form-data
```

### Body (form-data) - Update English only
```
title_en: Our Updated Vision
description_en: New vision description here...
```

### Body (form-data) - Update both languages
```
title: {"en": "Our Updated Vision", "ar": "رؤيتنا المحدثة"}
description: {"en": "New vision description", "ar": "وصف الرؤية الجديدة"}
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "About item updated successfully",
  "data": {
    "id": "65d1234567890abcdef12345",
    "key": "vision",
    "translations": {
      "en": {
        "title": "Our Updated Vision",
        "description": "New vision description"
      },
      "ar": {
        "title": "رؤيتنا المحدثة",
        "description": "وصف الرؤية الجديدة"
      }
    },
    "isActive": true,
    "createdAt": "2024-02-18T20:30:00.000Z",
    "updatedAt": "2024-02-18T21:00:00.000Z"
  }
}
```

---

## 8. Update Team Member (with Translations)

### Endpoint
```
PUT http://localhost:3000/api/about/:id
```

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: multipart/form-data
```

### Body (form-data) - Update text only
```
name_en: Ahmed Mohamed Ali
name_ar: أحمد محمد علي
description_en: Updated description
description_ar: وصف محدث
linkedIn: https://linkedin.com/in/ahmed-mohamed-ali
order: 2
```

### Body (form-data) - Update with new image
```
name: {"en": "Ahmed Mohamed Ali", "ar": "أحمد محمد علي"}
description: {"en": "Updated description", "ar": "وصف محدث"}
linkedIn: https://linkedin.com/in/ahmed-mohamed-ali
order: 2
image: [SELECT NEW FILE]
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "About item updated successfully",
  "data": {
    "id": "65d1234567890abcdef12346",
    "key": "team",
    "image": "https://otrade.b-cdn.net/about/team/new-image.jpg",
    "linkedIn": "https://linkedin.com/in/ahmed-mohamed-ali",
    "order": 2,
    "translations": {
      "en": {
        "name": "Ahmed Mohamed Ali",
        "description": "Updated description"
      },
      "ar": {
        "name": "أحمد محمد علي",
        "description": "وصف محدث"
      }
    },
    "isActive": true,
    "createdAt": "2024-02-18T20:35:00.000Z",
    "updatedAt": "2024-02-18T21:05:00.000Z"
  }
}
```

---

## 9. Delete About Item

### Endpoint
```
DELETE http://localhost:3000/api/about/:id
```

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Example
```
DELETE http://localhost:3000/api/about/65d1234567890abcdef12345
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "About item deleted successfully"
}
```

---

## 📝 Complete Workflow Example

### Step 1: Create Vision (Bilingual)
```
POST http://localhost:3000/api/about
Authorization: Bearer ADMIN_TOKEN
Content-Type: multipart/form-data
```
Body:
```
key: vision
title_en: Our Vision
title_ar: رؤيتنا
description_en: To revolutionize financial education
description_ar: لإحداث ثورة في التعليم المالي
```

### Step 2: Create First Team Member (Bilingual)
```
POST http://localhost:3000/api/about
Authorization: Bearer ADMIN_TOKEN
```
Form-data:
```
key: team
name_en: Ahmed Mohamed
name_ar: أحمد محمد
description_en: CEO & Founder
description_ar: الرئيس التنفيذي والمؤسس
linkedIn: https://linkedin.com/in/ahmed
order: 1
image: [FILE]
```

### Step 3: Create Second Team Member (Bilingual)
```
POST http://localhost:3000/api/about
Authorization: Bearer ADMIN_TOKEN
```
Form-data:
```
key: team
name: {"en": "Sara Ali", "ar": "سارة علي"}
description: {"en": "CTO & Co-Founder", "ar": "المدير التقني والمؤسس المشارك"}
linkedIn: https://linkedin.com/in/sara
order: 2
image: [FILE]
```

### Step 4: Get All Items in English (Public)
```
GET http://localhost:3000/api/about
Accept-Language: en
```

### Step 5: Get All Items in Arabic (Public)
```
GET http://localhost:3000/api/about
Accept-Language: ar
```

### Step 6: Get All Items in Both Languages (Public)
```
GET http://localhost:3000/api/about
Accept-Language: en|ar
```

### Step 7: Get Only Team Members in Arabic
```
GET http://localhost:3000/api/about?key=team
Accept-Language: ar
```

### Step 8: Update Team Member Order
```
PUT http://localhost:3000/api/about/65d1234567890abcdef12346
Authorization: Bearer ADMIN_TOKEN
```
Body:
```
order: 3
```

---

## 🔑 Important Notes

### Translation Fields
1. **Vision**: `title` and `description` (both translated)
2. **Team**: `name` and `description` (both translated), `image`, `linkedIn`, `order` (not translated)

### Translation Formats Supported
- JSON string: `{"en": "text", "ar": "نص"}`
- Underscore: `field_en`, `field_ar`
- Bracket: `field[en]`, `field[ar]`

### Language Headers
- Single language: `Accept-Language: en` or `Accept-Language: ar`
- Multiple languages: `Accept-Language: en|ar`
- Default: English (`en`)

### Required Fields
- Vision: At least one language for `title` and `description`
- Team: At least one language for `name` and `description`, plus `image`

### Image Upload
- Only for team members
- Max size: 5MB
- Uploaded to BunnyCDN: `about/team/` folder

### Permissions
- GET endpoints: Public
- POST, PUT, DELETE: Admin only (requires 'support' permission)

---

## 🎯 Testing Checklist

- [ ] Create vision with English only
- [ ] Create vision with Arabic only
- [ ] Create vision with both languages
- [ ] Try to create vision without title (should fail)
- [ ] Create team member with English only
- [ ] Create team member with both languages
- [ ] Try to create team member without image (should fail)
- [ ] Get all items in English
- [ ] Get all items in Arabic
- [ ] Get all items in both languages
- [ ] Get only vision items
- [ ] Get only team items
- [ ] Get specific item by ID in English
- [ ] Get specific item by ID in Arabic
- [ ] Get specific item by ID in both languages
- [ ] Update vision English translation only
- [ ] Update vision both translations
- [ ] Update team member without changing image
- [ ] Update team member with new image
- [ ] Update team member order
- [ ] Delete about item
- [ ] Try to access admin endpoints without auth (should fail)

---

## 💡 Use Cases

### 1. About Us Page (English)
```
GET /api/about
Accept-Language: en
```
Returns vision and all team members in English

### 2. About Us Page (Arabic)
```
GET /api/about
Accept-Language: ar
```
Returns vision and all team members in Arabic

### 3. About Us Page (Bilingual App)
```
GET /api/about
Accept-Language: en|ar
```
Returns all content with both translations

### 4. Team Section Only (Arabic)
```
GET /api/about?key=team
Accept-Language: ar
```
Returns only team members in Arabic, sorted by order

---

## 🚀 Quick Start (cURL)

### Create Vision (Bilingual)
```bash
curl -X POST http://localhost:3000/api/about \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "key=vision" \
  -F "title_en=Our Vision" \
  -F "title_ar=رؤيتنا" \
  -F "description_en=Description here" \
  -F "description_ar=الوصف هنا"
```

### Get All Items in English
```bash
curl -X GET http://localhost:3000/api/about \
  -H "Accept-Language: en"
```

### Get All Items in Arabic
```bash
curl -X GET http://localhost:3000/api/about \
  -H "Accept-Language: ar"
```

### Get Team Only (Both Languages)
```bash
curl -X GET "http://localhost:3000/api/about?key=team" \
  -H "Accept-Language: en|ar"
```

