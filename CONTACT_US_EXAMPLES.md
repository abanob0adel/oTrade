# Contact Us System - Postman Examples

## 📋 Endpoints Overview

1. **POST /api/contact-us** - Submit contact request (Public)
2. **GET /api/contact-us** - Get all contact requests (Admin)
3. **GET /api/contact-us/:id** - Get specific contact request (Admin)
4. **DELETE /api/contact-us/:id** - Delete contact request (Admin)

---

## 1. Submit Contact Request

### Endpoint
```
POST http://localhost:3000/api/contact-us
```

### Headers
```
Content-Type: application/json
```

### Body (JSON)
```json
{
  "fullName": "Ahmed Mohamed",
  "phone": "+201234567890",
  "country": "Egypt"
}
```

### Response (Success - 201)
```json
{
  "success": true,
  "message": "Contact request submitted successfully",
  "data": {
    "id": "65d1234567890abcdef12345",
    "fullName": "Ahmed Mohamed",
    "phone": "+201234567890",
    "country": "Egypt",
    "createdAt": "2024-02-18T20:30:00.000Z"
  }
}
```

### Response (Error - 400)
```json
{
  "success": false,
  "error": "All fields are required: fullName, phone, country"
}
```

---

## 2. Get All Contact Requests

### Endpoint
```
GET http://localhost:3000/api/contact-us
```

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Query Parameters (Optional)
```
page=1
limit=10
```

### Response (Success - 200)
```json
{
  "success": true,
  "data": [
    {
      "_id": "65d1234567890abcdef12345",
      "fullName": "Ahmed Mohamed",
      "phone": "+201234567890",
      "country": "Egypt",
      "createdAt": "2024-02-18T20:30:00.000Z",
      "updatedAt": "2024-02-18T20:30:00.000Z"
    },
    {
      "_id": "65d1234567890abcdef12346",
      "fullName": "Sara Ali",
      "phone": "+966501234567",
      "country": "Saudi Arabia",
      "createdAt": "2024-02-18T19:15:00.000Z",
      "updatedAt": "2024-02-18T19:15:00.000Z"
    }
  ]
}
```

### Response with Pagination (if enabled)
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 3. Get Contact Request by ID

### Endpoint
```
GET http://localhost:3000/api/contact-us/:id
```

### Example
```
GET http://localhost:3000/api/contact-us/65d1234567890abcdef12345
```

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "_id": "65d1234567890abcdef12345",
    "fullName": "Ahmed Mohamed",
    "phone": "+201234567890",
    "country": "Egypt",
    "createdAt": "2024-02-18T20:30:00.000Z",
    "updatedAt": "2024-02-18T20:30:00.000Z"
  }
}
```

### Response (Error - 404)
```json
{
  "success": false,
  "error": "Contact request not found"
}
```

---

## 4. Delete Contact Request

### Endpoint
```
DELETE http://localhost:3000/api/contact-us/:id
```

### Example
```
DELETE http://localhost:3000/api/contact-us/65d1234567890abcdef12345
```

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Contact request deleted successfully"
}
```

### Response (Error - 404)
```json
{
  "success": false,
  "error": "Contact request not found"
}
```

---

## 📝 Complete Workflow Example

### Step 1: User Submits Contact Request (Public)
```
POST http://localhost:3000/api/contact-us
```
Body:
```json
{
  "fullName": "Mohamed Hassan",
  "phone": "+971501234567",
  "country": "UAE"
}
```

### Step 2: Admin Views All Requests
```
GET http://localhost:3000/api/contact-us
Authorization: Bearer ADMIN_TOKEN
```

### Step 3: Admin Views Specific Request
```
GET http://localhost:3000/api/contact-us/65d1234567890abcdef12345
Authorization: Bearer ADMIN_TOKEN
```

### Step 4: Admin Deletes Request After Processing
```
DELETE http://localhost:3000/api/contact-us/65d1234567890abcdef12345
Authorization: Bearer ADMIN_TOKEN
```

---

## 🔑 Important Notes

1. **Public Access**: POST endpoint is public - no authentication required
2. **Admin Access**: GET and DELETE endpoints require admin authentication
3. **Required Fields**: All three fields (fullName, phone, country) are required
4. **Validation**: 
   - fullName must be at least 2 characters
   - All fields are trimmed automatically
5. **Sorting**: Results are sorted by newest first (createdAt descending)
6. **Pagination**: Supports pagination when enabled via middleware
7. **Permissions**: Uses 'support' permission for admin operations

---

## 🎯 Testing Checklist

- [ ] Submit contact request with all fields
- [ ] Try to submit without fullName (should fail)
- [ ] Try to submit without phone (should fail)
- [ ] Try to submit without country (should fail)
- [ ] Get all contact requests as admin
- [ ] Get all contact requests without auth (should fail)
- [ ] Get specific contact request by ID
- [ ] Try to get non-existent contact request (should return 404)
- [ ] Delete contact request as admin
- [ ] Try to delete without auth (should fail)
- [ ] Test pagination (if enabled)

---

## 🌍 Country Examples

Common country values:
- Egypt
- Saudi Arabia
- UAE
- Kuwait
- Qatar
- Bahrain
- Oman
- Jordan
- Lebanon
- Palestine
- Iraq
- Syria
- Morocco
- Algeria
- Tunisia
- Libya
- Sudan
- Yemen

---

## 📱 Phone Format Examples

- Egypt: +201234567890
- Saudi Arabia: +966501234567
- UAE: +971501234567
- Kuwait: +96512345678
- Qatar: +97412345678
- International: +1234567890

Note: Phone validation is flexible - any format is accepted as long as it's provided.
