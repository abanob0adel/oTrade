# Newsletter Subscription - Postman Examples

## 📋 Endpoints Overview

1. **POST /api/newsletter** - Subscribe to newsletter (Public)
2. **GET /api/newsletter** - Get all subscriptions (Admin)

---

## 1. Subscribe to Newsletter

### Endpoint
```
POST http://localhost:3000/api/newsletter
```

### Headers
```
Content-Type: application/json
```

### Body (JSON)
```json
{
  "email": "user@example.com"
}
```

### Response (Success - 201)
```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter",
  "data": {
    "email": "user@example.com",
    "subscribedAt": "2024-02-18T20:30:00.000Z"
  }
}
```

### Response (Error - 400 - Already Subscribed)
```json
{
  "success": false,
  "error": "This email is already subscribed to our newsletter"
}
```

### Response (Error - 400 - Missing Email)
```json
{
  "success": false,
  "error": "Email is required"
}
```

### Response (Error - 400 - Invalid Email)
```json
{
  "success": false,
  "error": "Validation Error",
  "details": [
    "Please enter a valid email address"
  ]
}
```

---

## 2. Get All Newsletter Subscriptions

### Endpoint
```
GET http://localhost:3000/api/newsletter
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
      "email": "user1@example.com",
      "createdAt": "2024-02-18T20:30:00.000Z",
      "updatedAt": "2024-02-18T20:30:00.000Z"
    },
    {
      "_id": "65d1234567890abcdef12346",
      "email": "user2@example.com",
      "createdAt": "2024-02-18T19:15:00.000Z",
      "updatedAt": "2024-02-18T19:15:00.000Z"
    },
    {
      "_id": "65d1234567890abcdef12347",
      "email": "user3@example.com",
      "createdAt": "2024-02-18T18:00:00.000Z",
      "updatedAt": "2024-02-18T18:00:00.000Z"
    }
  ]
}
```

### Response with Pagination (if enabled)
```json
{
  "success": true,
  "data": [
    {
      "_id": "65d1234567890abcdef12345",
      "email": "user1@example.com",
      "createdAt": "2024-02-18T20:30:00.000Z",
      "updatedAt": "2024-02-18T20:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Response (Error - 401 - Unauthorized)
```json
{
  "success": false,
  "error": "Authentication required"
}
```

### Response (Error - 403 - Forbidden)
```json
{
  "success": false,
  "error": "You don't have permission to access this resource"
}
```

---

## 📝 Complete Workflow Example

### Step 1: User Subscribes to Newsletter (Public)
```
POST http://localhost:3000/api/newsletter
```
Body:
```json
{
  "email": "ahmed@example.com"
}
```

Response:
```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter",
  "data": {
    "email": "ahmed@example.com",
    "subscribedAt": "2024-02-18T20:30:00.000Z"
  }
}
```

### Step 2: Another User Subscribes
```
POST http://localhost:3000/api/newsletter
```
Body:
```json
{
  "email": "sara@example.com"
}
```

### Step 3: Admin Views All Subscriptions
```
GET http://localhost:3000/api/newsletter
Authorization: Bearer ADMIN_TOKEN
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65d1234567890abcdef12345",
      "email": "sara@example.com",
      "createdAt": "2024-02-18T20:35:00.000Z",
      "updatedAt": "2024-02-18T20:35:00.000Z"
    },
    {
      "_id": "65d1234567890abcdef12344",
      "email": "ahmed@example.com",
      "createdAt": "2024-02-18T20:30:00.000Z",
      "updatedAt": "2024-02-18T20:30:00.000Z"
    }
  ]
}
```

### Step 4: Admin Views Paginated Results
```
GET http://localhost:3000/api/newsletter?page=1&limit=10
Authorization: Bearer ADMIN_TOKEN
```

---

## 🔑 Important Notes

1. **Public Access**: POST endpoint is public - no authentication required
2. **Admin Access**: GET endpoint requires admin authentication with 'emails' read permission
3. **Email Validation**: 
   - Email must be valid format
   - Email is automatically converted to lowercase
   - Email is trimmed of whitespace
4. **Unique Emails**: Each email can only subscribe once
5. **Sorting**: Results are sorted by newest first (createdAt descending)
6. **Pagination**: Supports pagination when enabled via middleware
7. **No Unsubscribe**: System doesn't support unsubscribe - emails are permanent

---

## 🎯 Testing Checklist

- [ ] Subscribe with valid email
- [ ] Try to subscribe with same email twice (should fail)
- [ ] Try to subscribe without email (should fail)
- [ ] Try to subscribe with invalid email format (should fail)
- [ ] Get all subscriptions as admin
- [ ] Try to get subscriptions without auth (should fail)
- [ ] Try to get subscriptions as regular user (should fail)
- [ ] Test pagination (if enabled)
- [ ] Test with different email formats (uppercase, spaces, etc.)

---

## 📧 Email Format Examples

Valid email formats:
- `user@example.com`
- `john.doe@company.co.uk`
- `info+newsletter@domain.org`
- `contact_us@my-site.com`

Invalid email formats:
- `notanemail` (missing @)
- `@example.com` (missing username)
- `user@` (missing domain)
- `user @example.com` (space in email)

---

## 💡 Use Cases

1. **Website Footer Newsletter Form**
   - User enters email in footer form
   - Frontend sends POST request to `/api/newsletter`
   - User receives confirmation message

2. **Admin Dashboard**
   - Admin logs in to dashboard
   - Views all newsletter subscribers
   - Can export list for email marketing campaigns

3. **Marketing Integration**
   - Admin fetches all emails via API
   - Imports to email marketing platform (Mailchimp, SendGrid, etc.)
   - Sends newsletters to all subscribers

---

## 🚀 Quick Start

### Subscribe (cURL)
```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### Get All Subscriptions (cURL)
```bash
curl -X GET http://localhost:3000/api/newsletter \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 📊 Response Status Codes

- `201` - Successfully subscribed
- `200` - Successfully retrieved subscriptions
- `400` - Bad request (invalid email, already subscribed, missing email)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `500` - Internal server error
