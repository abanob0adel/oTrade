# 📸 Profile Image - Quick Start

## 🚀 3-Step Upload Process

### Step 1: Generate Upload URL
```javascript
POST /api/upload/generate-url
Authorization: Bearer YOUR_TOKEN

{
  "fileName": "profile.jpg",
  "fileType": "image",
  "category": "profiles",
  "fileSize": 1024000
}
```

### Step 2: Upload to BunnyCDN
```javascript
PUT {uploadUrl from step 1}
Headers: {headers from step 1}
Body: [image file binary]
```

### Step 3: Save URL to Profile
```javascript
POST /api/auth/profile/image
Authorization: Bearer YOUR_TOKEN

{
  "profileImage": "{fileUrl from step 1}"
}
```

---

## 💻 Complete Frontend Example

```javascript
async function uploadProfileImage(imageFile, token) {
  try {
    // Step 1: Get upload URL
    const { data } = await axios.post('/api/upload/generate-url', {
      fileName: imageFile.name,
      fileType: 'image',
      category: 'profiles',
      fileSize: imageFile.size
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Step 2: Upload to CDN
    await axios.put(data.uploadUrl, imageFile, {
      headers: data.headers
    });
    
    // Step 3: Save to profile
    const response = await axios.post('/api/auth/profile/image', {
      profileImage: data.fileUrl
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data.user.profileImage;
    
  } catch (error) {
    console.error('Upload failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
const imageUrl = await uploadProfileImage(file, userToken);
console.log('Profile image uploaded:', imageUrl);
```

---

## 🎯 Alternative: Update via Profile Endpoint

You can also update profile image using the general profile update endpoint:

```javascript
PUT /api/auth/profile
Authorization: Bearer YOUR_TOKEN

{
  "profileImage": "https://cdn.example.com/profiles/user123.jpg"
}
```

---

## ✅ Response Format

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "profileImage": "https://cdn.example.com/profiles/user123.jpg",
    "role": "user",
    "subscriptionPlan": "free",
    "subscriptionStatus": "inactive"
  }
}
```

---

## 🧪 Test It

```bash
# Run automated test
node test-profile-image.js

# Or test manually with Postman
# Import: auth_system_postman_collection.json
# Use request: "10. Upload Profile Image"
```

---

## 📚 Full Documentation

- English: `PROFILE_IMAGE_COMPLETE.md`
- Arabic: `PROFILE_IMAGE_SUMMARY_AR.md`
- Auth System: `AUTH_SYSTEM_DOCUMENTATION.md`
