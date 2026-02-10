# ⚡ Auth System - Quick Reference

## 📡 Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Sign up new user |
| POST | `/api/auth/login` | ❌ | Sign in user |
| POST | `/api/auth/forgot-password` | ❌ | Request password reset |
| POST | `/api/auth/reset-password` | ❌ | Reset password with token |
| GET | `/api/auth/profile` | ✅ | Get user profile |
| PUT | `/api/auth/profile` | ✅ | Update user profile |
| POST | `/api/auth/profile/image` | ✅ | Upload profile image |

---

## 📥 Request Examples

### Sign Up
```json
POST /api/auth/register
{
  "fullName": "Ahmed Mohamed",
  "email": "ahmed@example.com",
  "password": "password123"
}
```

### Sign In
```json
POST /api/auth/login
{
  "email": "ahmed@example.com",
  "password": "password123"
}
```

### Forgot Password
```json
POST /api/auth/forgot-password
{
  "email": "ahmed@example.com"
}
```

### Reset Password
```json
POST /api/auth/reset-password
{
  "token": "reset-token-here",
  "password": "newpassword123"
}
```

### Get Profile
```
GET /api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

### Update Profile
```json
PUT /api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN

// Update name only
{ "fullName": "New Name" }

// Update email only
{ "email": "new@example.com" }

// Update password only
{
  "currentPassword": "old123",
  "newPassword": "new456"
}

// Update all
{
  "fullName": "New Name",
  "email": "new@example.com",
  "currentPassword": "old123",
  "newPassword": "new456"
}
```

### Upload Profile Image
```json
POST /api/auth/profile/image
Authorization: Bearer YOUR_JWT_TOKEN

{
  "profileImage": "https://cdn.example.com/profile-images/user123.jpg"
}
```

> **Note:** Frontend should first upload image to BunnyCDN using `/api/upload/generate-url`, then send the CDN URL here.

---

## 📤 Response Format

### Success (Register/Login)
```json
{
  "message": "Success message",
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "profileImage": "https://cdn.example.com/profile.jpg",
    "subscriptionPlan": "free"
  }
}
```

### Success (Profile)
```json
{
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "profileImage": "https://cdn.example.com/profile.jpg",
    "subscriptionPlan": "pro",
    "subscriptionStatus": "active",
    "subscriptionExpiry": "2024-12-31T23:59:59.999Z",
    "subscription": {
      "plan": { "name": "Pro Plan", "price": 99 },
      "startDate": "2024-01-01",
      "endDate": "2024-12-31"
    }
  }
}
```

### Error
```json
{
  "error": "Error message here"
}
```

---

## 🔒 Security

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens for authentication
- ✅ Reset tokens expire in 1 hour
- ✅ Email validation
- ✅ Password min 6 characters

---

## 💻 Frontend Quick Start

```javascript
// Sign Up
const response = await axios.post('/api/auth/register', {
  fullName, email, password
});
localStorage.setItem('token', response.data.token);

// Sign In
const response = await axios.post('/api/auth/login', {
  email, password
});
localStorage.setItem('token', response.data.token);

// Get Profile
const response = await axios.get('/api/auth/profile', {
  headers: { Authorization: `Bearer ${token}` }
});

// Update Profile
await axios.put('/api/auth/profile', updates, {
  headers: { Authorization: `Bearer ${token}` }
});

// Upload Profile Image
// Step 1: Upload image to BunnyCDN
const uploadResponse = await axios.post('/api/upload/generate-url', {
  fileName: 'profile.jpg',
  fileType: 'image',
  category: 'profiles',
  fileSize: imageFile.size
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Step 2: Upload to BunnyCDN
await axios.put(uploadResponse.data.uploadUrl, imageFile, {
  headers: uploadResponse.data.headers
});

// Step 3: Save CDN URL to profile
await axios.post('/api/auth/profile/image', {
  profileImage: uploadResponse.data.fileUrl
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

**Full docs:** `AUTH_SYSTEM_DOCUMENTATION.md`  
**Arabic summary:** `AUTH_SYSTEM_SUMMARY_AR.md`  
**Postman collection:** `auth_system_postman_collection.json`
