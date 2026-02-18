# Market Analysis Updates - Postman Examples

## 📋 Table of Contents
1. [Create Update](#1-create-update)
2. [Get All Updates](#2-get-all-updates)
3. [Update Specific Update](#3-update-specific-update)
4. [Delete Update](#4-delete-update)

---

## 1. Create Update

### Endpoint
```
POST http://localhost:3000/api/market-analysis/:id/updates
```

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Accept-Language: en
```

### Body (form-data)

#### Option 1: Using underscore format (_en, _ar)
```
title_en: "Market Update - Gold Prices Rising"
title_ar: "تحديث السوق - ارتفاع أسعار الذهب"
content_en: "Gold prices have increased by 5% today due to global economic uncertainty..."
content_ar: "ارتفعت أسعار الذهب بنسبة 5٪ اليوم بسبب عدم اليقين الاقتصادي العالمي..."
updatedAt: 2024-02-15T10:30:00Z
updateImage: [SELECT FILE]
```
  
#### Option 2: Using brackets format ([en], [ar])
```
title[en]: "Market Update - Gold Prices Rising"
title[ar]: "تحديث السوق - ارتفاع أسعار الذهب"
content[en]: "Gold prices have increased by 5% today..."
content[ar]: "ارتفعت أسعار الذهب بنسبة 5٪ اليوم..."
updatedAt: 2024-02-15T10:30:00Z
updateImage: [SELECT FILE]
```

#### Option 3: Using JSON string
```
title: {"en":"Market Update - Gold Prices Rising","ar":"تحديث السوق - ارتفاع أسعار الذهب"}
content: {"en":"Gold prices have increased by 5% today...","ar":"ارتفعت أسعار الذهب بنسبة 5٪ اليوم..."}
updatedAt: 2024-02-15T10:30:00Z
updateImage: [SELECT FILE]
```

### Response (Success - 201)
```json
{
  "success": true,
  "message": "Update added successfully",
  "data": {
    "updateId": "65d1234567890abcdef12345",
    "image": "https://cdn.example.com/market-analysis/forex/updates/update-image.jpg",
    "updatedAt": "2024-02-15T10:30:00.000Z",
    "translations": {
      "en": {
        "title": "Market Update - Gold Prices Rising",
        "content": "Gold prices have increased by 5% today due to global economic uncertainty..."
      },
      "ar": {
        "title": "تحديث السوق - ارتفاع أسعار الذهب",
        "content": "ارتفعت أسعار الذهب بنسبة 5٪ اليوم بسبب عدم اليقين الاقتصادي العالمي..."
      }
    }
  }
}
```

### Response (Error - 400)
```json
{
  "success": false,
  "error": "Title is required in at least one language"
}
```

OR

```json
{
  "success": false,
  "error": "Invalid date format for updatedAt. Use ISO 8601 format: YYYY-MM-DDTHH:mm:ssZ"
}
```

---

## 2. Get All Updates

### Endpoint
```
GET http://localhost:3000/api/market-analysis/:id/updates
```

### Headers
```
Accept-Language: en
```

### Response (Single Language - 200)
```json
{
  "success": true,
  "data": [
    {
      "id": "65d1234567890abcdef12345",
      "title": "Market Update - Gold Prices Rising",
      "content": "Gold prices have increased by 5% today due to global economic uncertainty...",
      "image": "https://cdn.example.com/market-analysis/forex/updates/update-1.jpg",
      "updatedAt": "2024-02-15T10:30:00.000Z"
    },
    {
      "id": "65d1234567890abcdef12346",
      "title": "Breaking: Oil Prices Drop",
      "content": "Oil prices have fallen by 3% following OPEC announcement...",
      "image": "https://cdn.example.com/market-analysis/forex/updates/update-2.jpg",
      "updatedAt": "2024-02-14T14:20:00.000Z"
    }
  ]
}
```

### Response (Multiple Languages - 200)
Use header: `Accept-Language: en|ar`

```json
{
  "success": true,
  "data": [
    {
      "id": "65d1234567890abcdef12345",
      "image": "https://cdn.example.com/market-analysis/forex/updates/update-1.jpg",
      "updatedAt": "2024-02-15T10:30:00.000Z",
      "translations": {
        "en": {
          "title": "Market Update - Gold Prices Rising",
          "content": "Gold prices have increased by 5% today..."
        },
        "ar": {
          "title": "تحديث السوق - ارتفاع أسعار الذهب",
          "content": "ارتفعت أسعار الذهب بنسبة 5٪ اليوم..."
        }
      }
    }
  ]
}
```

---

## 3. Update Specific Update

### Endpoint
```
PUT http://localhost:3000/api/market-analysis/:id/updates/:updateId
```

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Accept-Language: en
```

### Body (form-data)

#### Example 1: Update title and content only
```
title_en: "Updated: Gold Prices Continue to Rise"
title_ar: "محدث: أسعار الذهب تواصل الارتفاع"
content_en: "Gold prices have now increased by 7% this week..."
content_ar: "ارتفعت أسعار الذهب الآن بنسبة 7٪ هذا الأسبوع..."
```

#### Example 2: Update image only
```
updateImage: [SELECT NEW FILE]
```

#### Example 3: Update everything
```
title_en: "Updated: Gold Prices Continue to Rise"
title_ar: "محدث: أسعار الذهب تواصل الارتفاع"
content_en: "Gold prices have now increased by 7% this week..."
content_ar: "ارتفعت أسعار الذهب الآن بنسبة 7٪ هذا الأسبوع..."
updatedAt: 2024-02-16T09:00:00Z
updateImage: [SELECT NEW FILE]
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Update modified successfully",
  "data": {
    "updateId": "65d1234567890abcdef12345",
    "image": "https://cdn.example.com/market-analysis/forex/updates/new-update-image.jpg",
    "updatedAt": "2024-02-16T09:00:00.000Z",
    "translations": {
      "en": {
        "title": "Updated: Gold Prices Continue to Rise",
        "content": "Gold prices have now increased by 7% this week..."
      },
      "ar": {
        "title": "محدث: أسعار الذهب تواصل الارتفاع",
        "content": "ارتفعت أسعار الذهب الآن بنسبة 7٪ هذا الأسبوع..."
      }
    }
  }
}
```

### Response (Error - 404)
```json
{
  "success": false,
  "error": "Update not found"
}
```

---

## 4. Delete Update

### Endpoint
```
DELETE http://localhost:3000/api/market-analysis/:id/updates/:updateId
```

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Update deleted successfully"
}
```

### Response (Error - 404)
```json
{
  "success": false,
  "error": "Update not found"
}
```

---

## 📝 Complete Workflow Example

### Step 1: Create a Market Analysis
```
POST http://localhost:3000/api/market-analysis
```
Body (form-data):
```
categoryId: 65d0000000000000000001
title_en: "Gold Market Analysis"
title_ar: "تحليل سوق الذهب"
description_en: "Complete analysis of gold market trends"
description_ar: "تحليل كامل لاتجاهات سوق الذهب"
content_en: "Detailed content here..."
content_ar: "محتوى تفصيلي هنا..."
coverImage: [SELECT FILE]
image: [SELECT FILE]
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "65d9999999999999999999",
    ...
  }
}
```

### Step 2: Add First Update
```
POST http://localhost:3000/api/market-analysis/65d9999999999999999999/updates
```
Body (form-data):
```
title_en: "Morning Update"
title_ar: "تحديث الصباح"
content_en: "Gold opened at $2050..."
content_ar: "افتتح الذهب عند 2050 دولار..."
updateImage: [SELECT FILE]
```

### Step 3: Add Second Update
```
POST http://localhost:3000/api/market-analysis/65d9999999999999999999/updates
```
Body (form-data):
```
title_en: "Afternoon Update"
title_ar: "تحديث بعد الظهر"
content_en: "Gold reached $2075..."
content_ar: "وصل الذهب إلى 2075 دولار..."
updateImage: [SELECT FILE]
```

### Step 4: Get Analysis with All Updates
```
GET http://localhost:3000/api/market-analysis/single/gold-market-analysis
```
Header: `Accept-Language: en`

Response includes main analysis + all updates with translations

### Step 5: Update Specific Update
```
PUT http://localhost:3000/api/market-analysis/65d9999999999999999999/updates/65d1111111111111111111
```
Body (form-data):
```
title_en: "Corrected: Afternoon Update"
content_en: "Gold reached $2080 (corrected)..."
```

### Step 6: Delete an Update
```
DELETE http://localhost:3000/api/market-analysis/65d9999999999999999999/updates/65d1111111111111111111
```

---

## 🔑 Important Notes

1. **Authentication Required**: All Create, Update, Delete operations require admin authentication
2. **Image Required on Create**: `updateImage` is required when creating a new update
3. **Image Optional on Update**: `updateImage` is optional when updating an existing update
4. **Date Format**: Use ISO 8601 format for `updatedAt`: `YYYY-MM-DDTHH:mm:ssZ` (without quotes in form-data)
   - ✅ Correct: `2024-02-15T10:30:00Z`
   - ❌ Wrong: `"2024-02-15T10:30:00Z"` (with quotes)
   - ❌ Wrong: `2024-02-15T10:30:0Z` (missing second digit)
5. **Date is Optional**: If `updatedAt` is not provided, current date/time will be used
6. **Language Support**: Supports English (en) and Arabic (ar)
7. **Translation Formats**: Supports underscore (_en), brackets ([en]), and JSON string formats
8. **File Size Limit**: Maximum 5MB for images
9. **Accepted Formats**: Only image files (jpg, png, gif, webp, etc.)

---

## 🎯 Testing Checklist

- [ ] Create update with English only
- [ ] Create update with Arabic only
- [ ] Create update with both languages
- [ ] Create update with custom date
- [ ] Get all updates (single language)
- [ ] Get all updates (multiple languages)
- [ ] Update title and content
- [ ] Update image only
- [ ] Update date only
- [ ] Update everything at once
- [ ] Delete update
- [ ] Try to create without image (should fail)
- [ ] Try to create without title (should fail)
- [ ] Try to access without authentication (should fail)
