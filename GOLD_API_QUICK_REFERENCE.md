# 🏆 Gold Price API - Quick Reference

## Endpoints

### 1. Get Gold Price (No Cache)
```
GET /api/gold
```

### 2. Get Gold Price (With Cache)
```
GET /api/gold/cached
```

---

## Response Format

```json
{
  "success": true,
  "data": {
    "price": "2034.56",
    "currency": "USD",
    "lastUpdate": "2026-02-11T10:30:00.000Z",
    "description": "Gold is one of the most traded precious metals in the world...",
    "coverImage": "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80"
  },
  "timestamp": "2026-02-11T10:30:15.123Z"
}
```

---

## Quick Test

### cURL
```bash
curl http://localhost:3000/api/gold
```

### JavaScript
```javascript
const response = await fetch('http://localhost:3000/api/gold/cached');
const data = await response.json();
console.log('Gold Price:', data.data.price);
```

### React
```jsx
const [goldData, setGoldData] = useState(null);

useEffect(() => {
  fetch('http://localhost:3000/api/gold/cached')
    .then(res => res.json())
    .then(data => setGoldData(data.data));
}, []);
```

---

## Features

✅ Live gold price (XAU/USD)  
✅ 30-second caching  
✅ Error handling  
✅ Timeout protection (10s)  
✅ Fallback mechanism  
✅ Clean JSON response  

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 502 | Bad Gateway (Invalid API response) |
| 503 | Service Unavailable (API down) |
| 504 | Gateway Timeout (API slow) |
| 500 | Internal Server Error |

---

## Files Created

```
src/modules/gold/
  ├── gold.controller.js
  └── gold.routes.js
test-gold-api.js
gold_api_postman_collection.json
GOLD_API_DOCUMENTATION_AR.md
GOLD_API_QUICK_REFERENCE.md
```

---

## Usage Example

```javascript
// Fetch gold price
async function getGoldPrice() {
  try {
    const response = await fetch('http://localhost:3000/api/gold/cached');
    const data = await response.json();
    
    if (data.success) {
      return {
        price: data.data.price,
        currency: data.data.currency,
        lastUpdate: data.data.lastUpdate,
        description: data.data.description,
        coverImage: data.data.coverImage
      };
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Use it
const gold = await getGoldPrice();
console.log(`Gold: $${gold.price} ${gold.currency}`);
```

---

## Cache Behavior

| Endpoint | Cache | Speed | Use Case |
|----------|-------|-------|----------|
| `/api/gold` | No | Slower | Real-time data needed |
| `/api/gold/cached` | 30s | Faster | Better performance |

---

## Testing

```bash
# Run test script
node test-gold-api.js

# Import Postman collection
gold_api_postman_collection.json
```

---

## Production Ready ✅

- Clean code structure
- Error handling
- Caching system
- Timeout protection
- Data validation
- Fallback mechanism
- Test coverage
- Documentation

**Ready to deploy! 🚀**
