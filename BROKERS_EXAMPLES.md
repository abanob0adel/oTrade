# Brokers System - Postman Examples

## 📋 Overview

نظام إدارة الوسطاء (Brokers) - النظام القديم للـ Partners.

**Base URL:** `/api/brokers`

---

## 1. Get All Brokers

### Endpoint
```
GET http://localhost:3000/api/brokers
```

### Headers
```
(No authentication required - Public)
```

### Response (200 OK)
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "65d...",
      "name": "XM Trading",
      "logo": "https://otrade.b-cdn.net/brokers/xm-logo.png",
      "description": "XM is a leading forex broker with over 10 years of experience",
      "websiteUrl": "https://www.xm.com",
      "rating": 4.5,
      "order": 1,
      "isActive": true,
      "createdAt": "2024-02-20T10:00:00.000Z",
      "updatedAt": "2024-02-20T10:00:00.000Z"
    },
    {
      "_id": "65d...",
      "name": "Exness",
      "logo": "https://otrade.b-cdn.net/brokers/exness-logo.png",
      "description": "Exness offers competitive spreads and fast execution",
      "websiteUrl": "https://www.exness.com",
      "rating": 4.8,
      "order": 2,
      "isActive": true,
      "createdAt": "2024-02-20T11:00:00.000Z",
      "updatedAt": "2024-02-20T11:00:00.000Z"
    }
  ]
}
```

---

## 2. Get Broker by ID

### Endpoint
```
GET http://localhost:3000/api/brokers/:id
```

### Headers
```
(No authentication required - Public)
```

### Example
```
GET http://localhost:3000/api/brokers/65d1234567890abcdef12345
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "65d1234567890abcdef12345",
    "name": "XM Trading",
    "logo": "https://otrade.b-cdn.net/brokers/xm-logo.png",
    "description": "XM is a leading forex broker with over 10 years of experience",
    "websiteUrl": "https://www.xm.com",
    "rating": 4.5,
    "order": 1,
    "isActive": true,
    "createdAt": "2024-02-20T10:00:00.000Z",
    "updatedAt": "2024-02-20T10:00:00.000Z"
  }
}
```

---

## 3. Create Broker (Admin)

### Endpoint
```
POST http://localhost:3000/api/brokers
```

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

### Body (JSON)
```json
{
  "name": "XM Trading",
  "logo": "https://otrade.b-cdn.net/brokers/xm-logo.png",
  "description": "XM is a leading forex broker with over 10 years of experience",
  "websiteUrl": "https://www.xm.com",
  "rating": 4.5,
  "order": 1
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Broker created successfully",
  "data": {
    "_id": "65d1234567890abcdef12345",
    "name": "XM Trading",
    "logo": "https://otrade.b-cdn.net/brokers/xm-logo.png",
    "description": "XM is a leading forex broker with over 10 years of experience",
    "websiteUrl": "https://www.xm.com",
    "rating": 4.5,
    "order": 1,
    "isActive": true,
    "createdAt": "2024-02-20T10:00:00.000Z",
    "updatedAt": "2024-02-20T10:00:00.000Z"
  }
}
```

---

## 4. Update Broker (Admin)

### Endpoint
```
PUT http://localhost:3000/api/brokers/:id
```

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

### Body (JSON)
```json
{
  "name": "XM Trading Updated",
  "rating": 4.8,
  "order": 2,
  "isActive": true
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Broker updated successfully",
  "data": {
    "_id": "65d1234567890abcdef12345",
    "name": "XM Trading Updated",
    "logo": "https://otrade.b-cdn.net/brokers/xm-logo.png",
    "description": "XM is a leading forex broker with over 10 years of experience",
    "websiteUrl": "https://www.xm.com",
    "rating": 4.8,
    "order": 2,
    "isActive": true,
    "createdAt": "2024-02-20T10:00:00.000Z",
    "updatedAt": "2024-02-20T12:00:00.000Z"
  }
}
```

---

## 5. Delete Broker (Admin)

### Endpoint
```
DELETE http://localhost:3000/api/brokers/:id
```

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Example
```
DELETE http://localhost:3000/api/brokers/65d1234567890abcdef12345
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Broker deleted successfully"
}
```

---

## 📝 Field Descriptions

### Broker Fields
- `name` (string, required): اسم الوسيط
- `logo` (string, required): رابط شعار الوسيط (URL)
- `description` (string, required): وصف الوسيط
- `websiteUrl` (string, required): رابط موقع الوسيط
- `rating` (number, optional): تقييم الوسيط (0-5)
- `order` (number, optional): ترتيب العرض
- `isActive` (boolean, optional): حالة النشاط

---

## 🔑 Permissions

### Required Permissions
- **Create Broker**: `brokers:create`
- **Update Broker**: `brokers:update`
- **Delete Broker**: `brokers:delete`
- **View Brokers**: Public (no permission required)

---

## 🎯 Use Cases

### 1. Display Brokers on Homepage
```
GET /api/brokers
```
يعرض جميع الوسطاء النشطين مرتبين حسب `order`

### 2. Add New Broker
```
POST /api/brokers
Body: { name, logo, description, websiteUrl, rating, order }
```

### 3. Update Broker Rating
```
PUT /api/brokers/:id
Body: { rating: 4.8 }
```

### 4. Deactivate Broker
```
PUT /api/brokers/:id
Body: { isActive: false }
```

### 5. Delete Broker
```
DELETE /api/brokers/:id
```
يحذف الوسيط والشعار من BunnyCDN

---

## 🚀 Quick Start (cURL)

### Get All Brokers
```bash
curl -X GET http://localhost:3000/api/brokers
```

### Create Broker
```bash
curl -X POST http://localhost:3000/api/brokers \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "XM Trading",
    "logo": "https://otrade.b-cdn.net/brokers/xm-logo.png",
    "description": "Leading forex broker",
    "websiteUrl": "https://www.xm.com",
    "rating": 4.5,
    "order": 1
  }'
```

### Update Broker
```bash
curl -X PUT http://localhost:3000/api/brokers/BROKER_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4.8
  }'
```

### Delete Broker
```bash
curl -X DELETE http://localhost:3000/api/brokers/BROKER_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 📊 Comparison: Brokers vs Partners

### Brokers (`/api/brokers`)
- النظام القديم
- بدون ترجمة
- حقول بسيطة: name, logo, description, websiteUrl, rating
- للوسطاء فقط

### Partners (`/api/v1/partners`)
- النظام الجديد
- مع ترجمة (عربي/إنجليزي)
- حقول متقدمة: title, description (translated), image, websiteUrl, links
- فئتين: people & company
- يستخدم Translation system

---

## ⚠️ Important Notes

1. **Logo Upload**: يجب رفع الشعار أولاً على BunnyCDN ثم استخدام الـ URL
2. **Rating**: القيمة بين 0 و 5
3. **Order**: يحدد ترتيب العرض (الأقل أولاً)
4. **isActive**: فقط الوسطاء النشطين يظهرون في GET /api/brokers
5. **Delete**: عند الحذف، يتم حذف الشعار من BunnyCDN تلقائياً

---

## 🐛 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Name, logo, description, and website URL are required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Broker not found"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```
