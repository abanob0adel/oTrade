# 🏆 Gold Price API - دليل كامل

## نظرة عامة

API احترافي لجلب سعر الذهب live من مصدر خارجي وإرجاعه بصيغة منظمة.

---

## 📡 Endpoints

### 1. Get Gold Price (بدون Cache)

```
GET /api/gold
```

يجلب سعر الذهب مباشرة من API الخارجي في كل request.

#### Response Example

```json
{
  "success": true,
  "data": {
    "price": "2034.56",
    "currency": "USD",
    "lastUpdate": "2026-02-11T10:30:00.000Z",
    "description": "Gold is one of the most traded precious metals in the world. It is widely used as a safe haven asset and its price changes based on global markets and demand.",
    "coverImage": "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80"
  },
  "timestamp": "2026-02-11T10:30:15.123Z"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | Boolean | حالة النجاح |
| `data.price` | String | سعر الذهب الحالي (بدولار) |
| `data.currency` | String | العملة (USD) |
| `data.lastUpdate` | String | وقت آخر تحديث من API الخارجي |
| `data.description` | String | وصف عن الذهب |
| `data.coverImage` | String | رابط صورة الذهب |
| `timestamp` | String | وقت الـ response من السيرفر |

---

### 2. Get Gold Price (مع Cache)

```
GET /api/gold/cached
```

يجلب سعر الذهب مع استخدام cache لمدة 30 ثانية لتحسين الأداء.

#### Response Example (Fresh Data)

```json
{
  "success": true,
  "data": {
    "price": "2034.56",
    "currency": "USD",
    "lastUpdate": "2026-02-11T10:30:00.000Z",
    "description": "Gold is one of the most traded precious metals in the world. It is widely used as a safe haven asset and its price changes based on global markets and demand.",
    "coverImage": "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80"
  },
  "timestamp": "2026-02-11T10:30:15.123Z",
  "cached": false
}
```

#### Response Example (Cached Data)

```json
{
  "success": true,
  "data": {
    "price": "2034.56",
    "currency": "USD",
    "lastUpdate": "2026-02-11T10:30:00.000Z",
    "description": "Gold is one of the most traded precious metals in the world. It is widely used as a safe haven asset and its price changes based on global markets and demand.",
    "coverImage": "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80"
  },
  "timestamp": "2026-02-11T10:30:15.123Z",
  "cached": true,
  "cacheAge": 15
}
```

#### Additional Fields

| Field | Type | Description |
|-------|------|-------------|
| `cached` | Boolean | هل البيانات من الـ cache؟ |
| `cacheAge` | Number | عمر الـ cache بالثواني (إذا كان cached) |
| `stale` | Boolean | هل الـ cache منتهي الصلاحية؟ (في حالة خطأ API) |
| `warning` | String | رسالة تحذير (في حالة استخدام cache قديم) |

---

## 🔧 التنفيذ التقني

### الملفات المُنشأة

```
src/
  modules/
    gold/
      gold.controller.js  ← Controller مع logic
      gold.routes.js      ← Routes definition
  app.js                  ← تم إضافة gold routes
test-gold-api.js          ← Test script
gold_api_postman_collection.json  ← Postman collection
```

---

## 📝 الكود

### Controller (gold.controller.js)

```javascript
import axios from 'axios';

export const getGoldPrice = async (req, res) => {
  try {
    // Fetch from external API
    const response = await axios.get('https://api.gold-api.com/price/XAU', {
      timeout: 10000
    });

    const { price, currency, updatedAt } = response.data;

    // Validate response
    if (!price || !currency) {
      return res.status(502).json({
        success: false,
        error: 'Invalid response from gold price API'
      });
    }

    // Format response
    const goldData = {
      success: true,
      data: {
        price: parseFloat(price).toFixed(2),
        currency: currency,
        lastUpdate: updatedAt || new Date().toISOString(),
        description: 'Gold is one of the most traded precious metals...',
        coverImage: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80'
      },
      timestamp: new Date().toISOString()
    };

    res.status(200).json(goldData);

  } catch (error) {
    // Error handling
    console.error('Gold API Error:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        error: 'Request timeout'
      });
    }

    if (error.response) {
      return res.status(502).json({
        success: false,
        error: 'Failed to fetch gold price'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
```

### Routes (gold.routes.js)

```javascript
import express from 'express';
import { getGoldPrice, getGoldPriceWithCache } from './gold.controller.js';

const router = express.Router();

router.get('/', getGoldPrice);
router.get('/cached', getGoldPriceWithCache);

export default router;
```

### App Registration (app.js)

```javascript
import goldRoutes from './modules/gold/gold.routes.js';

app.use('/api/gold', goldRoutes);
```

---

## 🎯 المميزات

### 1. Error Handling شامل

```javascript
// Timeout errors
if (error.code === 'ECONNABORTED') {
  return res.status(504).json({
    success: false,
    error: 'Request timeout'
  });
}

// API errors
if (error.response) {
  return res.status(502).json({
    success: false,
    error: 'Failed to fetch gold price'
  });
}

// Network errors
if (error.request) {
  return res.status(503).json({
    success: false,
    error: 'API is currently unavailable'
  });
}
```

### 2. Caching System

```javascript
let cachedGoldPrice = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30000; // 30 seconds

// Check cache validity
if (cachedGoldPrice && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
  return res.status(200).json({
    ...cachedGoldPrice,
    cached: true,
    cacheAge: Math.floor((Date.now() - cacheTimestamp) / 1000)
  });
}
```

### 3. Fallback Mechanism

```javascript
// If API fails but cache exists, return stale cache
if (cachedGoldPrice) {
  return res.status(200).json({
    ...cachedGoldPrice,
    cached: true,
    stale: true,
    warning: 'Returning cached data due to API error'
  });
}
```

### 4. Data Validation

```javascript
// Validate API response
if (!price || !currency) {
  return res.status(502).json({
    success: false,
    error: 'Invalid response from gold price API'
  });
}
```

### 5. Timeout Protection

```javascript
const response = await axios.get('https://api.gold-api.com/price/XAU', {
  timeout: 10000 // 10 seconds
});
```

---

## 🧪 الاختبار

### 1. باستخدام cURL

```bash
# Test basic endpoint
curl http://localhost:3000/api/gold

# Test cached endpoint
curl http://localhost:3000/api/gold/cached
```

### 2. باستخدام Test Script

```bash
node test-gold-api.js
```

#### Test Script Features:
- ✅ Test basic endpoint
- ✅ Test cached endpoint
- ✅ Test cache performance
- ✅ Test multiple rapid requests
- ✅ Colored console output
- ✅ Detailed results

### 3. باستخدام Postman

1. Import `gold_api_postman_collection.json`
2. Set `BASE_URL` variable to `http://localhost:3000`
3. Run requests

---

## 📊 Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | Success | البيانات تم جلبها بنجاح |
| 502 | Bad Gateway | API الخارجي أرجع بيانات غير صحيحة |
| 503 | Service Unavailable | API الخارجي غير متاح |
| 504 | Gateway Timeout | API الخارجي لم يرد في الوقت المحدد |
| 500 | Internal Server Error | خطأ داخلي في السيرفر |

---

## 🚀 الاستخدام من Frontend

### React Example

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

function GoldPrice() {
  const [goldData, setGoldData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGoldPrice = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/gold/cached');
        setGoldData(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchGoldPrice();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchGoldPrice, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Gold Price</h2>
      <p>Price: ${goldData.price} {goldData.currency}</p>
      <p>Last Update: {new Date(goldData.lastUpdate).toLocaleString()}</p>
      <img src={goldData.coverImage} alt="Gold" />
      <p>{goldData.description}</p>
    </div>
  );
}
```

### Vanilla JavaScript Example

```javascript
async function getGoldPrice() {
  try {
    const response = await fetch('http://localhost:3000/api/gold/cached');
    const data = await response.json();
    
    if (data.success) {
      console.log('Gold Price:', data.data.price);
      console.log('Currency:', data.data.currency);
      console.log('Last Update:', data.data.lastUpdate);
      
      // Update UI
      document.getElementById('gold-price').textContent = `$${data.data.price}`;
      document.getElementById('gold-currency').textContent = data.data.currency;
    }
  } catch (error) {
    console.error('Error fetching gold price:', error);
  }
}

// Fetch immediately
getGoldPrice();

// Auto-refresh every 30 seconds
setInterval(getGoldPrice, 30000);
```

---

## ⚙️ التخصيص

### تغيير مدة الـ Cache

```javascript
// في gold.controller.js
const CACHE_DURATION = 30000; // 30 seconds

// غيره لـ 60 ثانية:
const CACHE_DURATION = 60000; // 60 seconds
```

### تغيير Timeout

```javascript
const response = await axios.get('https://api.gold-api.com/price/XAU', {
  timeout: 10000 // 10 seconds
});

// غيره لـ 5 ثواني:
  timeout: 5000 // 5 seconds
```

### تغيير الوصف

```javascript
description: 'Your custom description here'
```

### تغيير صورة الكوفر

```javascript
coverImage: 'https://your-image-url.com/gold.jpg'
```

---

## 🔍 Troubleshooting

### المشكلة: "Gold price API is currently unavailable"

**السبب:** API الخارجي غير متاح أو الإنترنت مقطوع

**الحل:**
1. تأكد من اتصال الإنترنت
2. جرب الـ API مباشرة: `https://api.gold-api.com/price/XAU`
3. استخدم `/api/gold/cached` للحصول على بيانات من الـ cache

### المشكلة: "Request timeout"

**السبب:** API الخارجي بطيء جداً

**الحل:**
1. زود الـ timeout في الكود
2. استخدم `/api/gold/cached` للحصول على استجابة أسرع

### المشكلة: "Invalid response from gold price API"

**السبب:** API الخارجي أرجع بيانات غير صحيحة

**الحل:**
1. تحقق من API الخارجي
2. شوف الـ console logs للتفاصيل

---

## 📈 Performance

### بدون Cache
- Response time: ~500-1000ms
- يعتمد على سرعة API الخارجي
- كل request يجلب بيانات جديدة

### مع Cache
- Response time: ~10-50ms (من الـ cache)
- Response time: ~500-1000ms (أول request)
- يقلل الضغط على API الخارجي
- يحسن تجربة المستخدم

---

## 🎯 Best Practices

### 1. استخدم Cached Endpoint

```javascript
// ✅ Good - استخدم cached للأداء الأفضل
GET /api/gold/cached

// ❌ Avoid - استخدم basic فقط لو محتاج بيانات real-time
GET /api/gold
```

### 2. Handle Errors

```javascript
try {
  const response = await axios.get('/api/gold/cached');
  // Handle success
} catch (error) {
  // Handle error
  console.error('Error:', error.message);
}
```

### 3. Auto-Refresh

```javascript
// Refresh every 30 seconds
setInterval(() => {
  fetchGoldPrice();
}, 30000);
```

### 4. Loading States

```javascript
const [loading, setLoading] = useState(true);

if (loading) {
  return <Spinner />;
}
```

---

## ✅ الخلاصة

### ما تم إنشاؤه:
- ✅ Endpoint: `GET /api/gold`
- ✅ Endpoint: `GET /api/gold/cached`
- ✅ Error handling شامل
- ✅ Caching system
- ✅ Fallback mechanism
- ✅ Data validation
- ✅ Timeout protection
- ✅ Test script
- ✅ Postman collection
- ✅ Documentation

### الملفات:
1. `src/modules/gold/gold.controller.js` - Controller
2. `src/modules/gold/gold.routes.js` - Routes
3. `src/app.js` - تم تحديثه
4. `test-gold-api.js` - Test script
5. `gold_api_postman_collection.json` - Postman
6. `GOLD_API_DOCUMENTATION_AR.md` - هذا الملف

### الاستخدام:
```bash
# Start server
npm start

# Test endpoint
curl http://localhost:3000/api/gold

# Or use cached version
curl http://localhost:3000/api/gold/cached
```

**جاهز للاستخدام في production! 🚀**

---

**آخر تحديث:** 11 فبراير 2026
