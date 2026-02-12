# 🏆 Gold Config Endpoints - دليل الاستخدام

## نظرة عامة

Endpoints لإدارة إعدادات الذهب (description & coverImage) من خلال قاعدة البيانات بدلاً من hardcoding في الكود.

---

## 📡 Endpoints

### 1. Get Gold Config (Public)

```
GET /api/gold/config
```

يجلب إعدادات الذهب الحالية (description & coverImage).

#### Response Example

```json
{
  "success": true,
  "data": {
    "description": "Gold is one of the most traded precious metals in the world. It is widely used as a safe haven asset and its price changes based on global markets and demand.",
    "coverImage": "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80",
    "isActive": true,
    "updatedAt": "2026-02-11T10:30:00.000Z"
  }
}
```

#### cURL Example

```bash
curl http://localhost:3000/api/gold/config
```

---

### 2. Create Gold Config (Admin Only)

```
POST /api/gold/config
```

ينشئ إعدادات جديدة للذهب (يحذف القديمة).

#### Headers

```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

#### Request Body

```json
{
  "description": "Gold is one of the most traded precious metals in the world. It is widely used as a safe haven asset and its price changes based on global markets and demand.",
  "coverImage": "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80"
}
```

#### Response Example

```json
{
  "success": true,
  "message": "Gold configuration created successfully",
  "data": {
    "description": "Gold is one of the most traded precious metals...",
    "coverImage": "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80",
    "createdAt": "2026-02-11T10:30:00.000Z"
  }
}
```

#### cURL Example

```bash
curl -X POST http://localhost:3000/api/gold/config \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Your gold description here",
    "coverImage": "https://your-image-url.com/gold.jpg"
  }'
```

---

### 3. Update Gold Config (Admin Only)

```
PUT /api/gold/config
```

يحدث إعدادات الذهب الموجودة (يمكن تحديث حقل واحد أو الاثنين).

#### Headers

```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

#### Request Body (at least one field required)

```json
{
  "description": "Updated gold description",
  "coverImage": "https://new-image-url.com/gold.jpg"
}
```

أو تحديث حقل واحد فقط:

```json
{
  "description": "Updated description only"
}
```

```json
{
  "coverImage": "https://new-image.com/gold.jpg"
}
```

#### Response Example

```json
{
  "success": true,
  "message": "Gold configuration updated successfully",
  "data": {
    "description": "Updated gold description",
    "coverImage": "https://new-image-url.com/gold.jpg",
    "updatedAt": "2026-02-11T10:35:00.000Z"
  }
}
```

#### cURL Example

```bash
curl -X PUT http://localhost:3000/api/gold/config \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description"
  }'
```

---

## 🔐 Authentication

### Public Endpoints
- `GET /api/gold/config` - لا يحتاج authentication

### Admin Endpoints
- `POST /api/gold/config` - يحتاج admin token
- `PUT /api/gold/config` - يحتاج admin token

### الحصول على Admin Token

```bash
# Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }'

# Response will contain token
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🗄️ Database Model

### GoldConfig Schema

```javascript
{
  description: String (required),
  coverImage: String (required),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Features

- ✅ Only one config document allowed
- ✅ Auto-creates default config if none exists
- ✅ Timestamps (createdAt, updatedAt)
- ✅ Static method `getConfig()` for easy access

---

## 🔄 كيف يعمل النظام؟

### 1. عند جلب سعر الذهب

```javascript
// GET /api/gold
const config = await GoldConfig.getConfig(); // يجلب من DB

const goldData = {
  price: "2034.56",
  currency: "USD",
  description: config.description,  // من DB
  coverImage: config.coverImage     // من DB
};
```

### 2. إذا لم يوجد config في DB

```javascript
// Auto-creates default config
const config = await GoldConfig.create({
  description: 'Gold is one of the most traded precious metals...',
  coverImage: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80'
});
```

### 3. عند التحديث

```javascript
// PUT /api/gold/config
const config = await GoldConfig.getConfig();
config.description = newDescription;
config.coverImage = newCoverImage;
await config.save();
```

---

## 📝 أمثلة الاستخدام

### مثال 1: إنشاء config جديد

```javascript
// POST /api/gold/config
const response = await fetch('http://localhost:3000/api/gold/config', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    description: 'الذهب من أكثر المعادن الثمينة تداولاً في العالم',
    coverImage: 'https://cdn.example.com/gold-cover.jpg'
  })
});

const data = await response.json();
console.log(data);
```

### مثال 2: تحديث الوصف فقط

```javascript
// PUT /api/gold/config
const response = await fetch('http://localhost:3000/api/gold/config', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    description: 'وصف جديد للذهب'
  })
});

const data = await response.json();
console.log(data);
```

### مثال 3: تحديث الصورة فقط

```javascript
// PUT /api/gold/config
const response = await fetch('http://localhost:3000/api/gold/config', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    coverImage: 'https://new-cdn.example.com/gold-new.jpg'
  })
});

const data = await response.json();
console.log(data);
```

### مثال 4: جلب الإعدادات الحالية

```javascript
// GET /api/gold/config
const response = await fetch('http://localhost:3000/api/gold/config');
const data = await response.json();

console.log('Description:', data.data.description);
console.log('Cover Image:', data.data.coverImage);
console.log('Last Updated:', data.data.updatedAt);
```

---

## 🧪 الاختبار

### Test Script

```javascript
// test-gold-config.js
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
const ADMIN_TOKEN = 'your_admin_token_here';

async function testGoldConfig() {
  try {
    // 1. Get current config
    console.log('1. Getting current config...');
    const getResponse = await axios.get(`${BASE_URL}/gold/config`);
    console.log('Current config:', getResponse.data);

    // 2. Update description
    console.log('\n2. Updating description...');
    const updateResponse = await axios.put(
      `${BASE_URL}/gold/config`,
      {
        description: 'Updated gold description'
      },
      {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`
        }
      }
    );
    console.log('Update result:', updateResponse.data);

    // 3. Get updated config
    console.log('\n3. Getting updated config...');
    const getUpdatedResponse = await axios.get(`${BASE_URL}/gold/config`);
    console.log('Updated config:', getUpdatedResponse.data);

    // 4. Test gold price endpoint (should use new config)
    console.log('\n4. Testing gold price endpoint...');
    const priceResponse = await axios.get(`${BASE_URL}/gold`);
    console.log('Gold price with new config:', priceResponse.data);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testGoldConfig();
```

---

## 📊 Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | Success | Config retrieved/updated successfully |
| 201 | Created | Config created successfully |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Invalid or missing admin token |
| 403 | Forbidden | User doesn't have admin permissions |
| 500 | Internal Server Error | Database or server error |

---

## 🔍 Error Responses

### Missing Fields (POST)

```json
{
  "success": false,
  "error": "Both description and coverImage are required"
}
```

### Missing Fields (PUT)

```json
{
  "success": false,
  "error": "At least one field (description or coverImage) is required"
}
```

### Unauthorized

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

## 🎯 Best Practices

### 1. استخدم PUT للتحديث الجزئي

```javascript
// ✅ Good - تحديث حقل واحد
PUT /api/gold/config
{
  "description": "New description"
}

// ❌ Avoid - استخدام POST للتحديث
POST /api/gold/config
```

### 2. احفظ الصور على CDN

```javascript
// ✅ Good - استخدم CDN
{
  "coverImage": "https://cdn.example.com/gold.jpg"
}

// ❌ Avoid - روابط محلية
{
  "coverImage": "/images/gold.jpg"
}
```

### 3. استخدم وصف واضح

```javascript
// ✅ Good - وصف مفيد
{
  "description": "Gold is one of the most traded precious metals..."
}

// ❌ Avoid - وصف قصير جداً
{
  "description": "Gold"
}
```

---

## 🚀 Integration مع Frontend

### React Component

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function GoldConfigManager() {
  const [config, setConfig] = useState(null);
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');

  // Load current config
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/gold/config');
      setConfig(response.data.data);
      setDescription(response.data.data.description);
      setCoverImage(response.data.data.coverImage);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const updateConfig = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      await axios.put(
        'http://localhost:3000/api/gold/config',
        {
          description,
          coverImage
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert('Config updated successfully!');
      loadConfig();
    } catch (error) {
      console.error('Error updating config:', error);
      alert('Failed to update config');
    }
  };

  return (
    <div>
      <h2>Gold Configuration</h2>
      
      <div>
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
        />
      </div>

      <div>
        <label>Cover Image URL:</label>
        <input
          type="text"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
        />
      </div>

      <button onClick={updateConfig}>Update Config</button>

      {config && (
        <div>
          <h3>Current Config:</h3>
          <p>Last Updated: {new Date(config.updatedAt).toLocaleString()}</p>
          <img src={config.coverImage} alt="Gold" width="200" />
        </div>
      )}
    </div>
  );
}

export default GoldConfigManager;
```

---

## ✅ الخلاصة

### ما تم إضافته:

- ✅ Model: `GoldConfig` في MongoDB
- ✅ Endpoint: `GET /api/gold/config` (Public)
- ✅ Endpoint: `POST /api/gold/config` (Admin)
- ✅ Endpoint: `PUT /api/gold/config` (Admin)
- ✅ Auto-create default config
- ✅ تحديث `getGoldPrice` ليستخدم DB
- ✅ تحديث `getGoldPriceWithCache` ليستخدم DB
- ✅ Postman collection محدث
- ✅ Documentation كامل

### الملفات المحدثة:

1. `src/modules/gold/gold.model.js` - جديد
2. `src/modules/gold/gold.controller.js` - محدث
3. `src/modules/gold/gold.routes.js` - محدث
4. `gold_api_postman_collection.json` - محدث
5. `GOLD_CONFIG_ENDPOINTS_AR.md` - جديد

### الاستخدام:

```bash
# Get config (public)
curl http://localhost:3000/api/gold/config

# Update config (admin)
curl -X PUT http://localhost:3000/api/gold/config \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "New description"}'
```

**جاهز للاستخدام! 🚀**

---

**آخر تحديث:** 11 فبراير 2026
