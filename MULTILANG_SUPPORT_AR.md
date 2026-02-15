# 🌍 دعم اللغات المتعددة - Gold, Forex, Bitcoin

## ✅ التحديثات

تم تحديث جميع الأنظمة (Gold, Forex, Bitcoin) لدعم إرجاع اللغتين معاً عند إرسال `Accept-Language: ar|en`.

---

## 🎯 كيفية الاستخدام

### لغة واحدة (Single Language)

```bash
# English
GET /api/gold
Header: Accept-Language: en

# Arabic
GET /api/gold
Header: Accept-Language: ar
```

**Response**:
```json
{
  "success": true,
  "data": {
    "price": "2045.50",
    "currency": "USD",
    "lastUpdate": "2026-02-13T10:30:00Z",
    "title": "Gold Trading",
    "description": "Gold is one of the most traded...",
    "coverImage": "https://otrade.b-cdn.net/gold/image.jpg"
  }
}
```

### لغتين معاً (Multiple Languages)

```bash
# Both languages
GET /api/gold
Header: Accept-Language: ar|en
```

**Response**:
```json
{
  "success": true,
  "data": {
    "price": "2045.50",
    "currency": "USD",
    "lastUpdate": "2026-02-13T10:30:00Z",
    "translations": {
      "en": {
        "title": "Gold Trading",
        "description": "Gold is one of the most traded precious metals..."
      },
      "ar": {
        "title": "تداول الذهب",
        "description": "الذهب هو أحد أكثر المعادن الثمينة تداولاً..."
      }
    },
    "coverImage": "https://otrade.b-cdn.net/gold/image.jpg"
  }
}
```

---

## 📋 الأنظمة المدعومة

### 1. Gold (الذهب)

```bash
# Single language
GET /api/gold
Header: Accept-Language: en

# Multiple languages
GET /api/gold
Header: Accept-Language: ar|en
```

### 2. Forex (الفوريكس)

```bash
# Single language
GET /api/forex
Header: Accept-Language: en

# Multiple languages
GET /api/forex
Header: Accept-Language: ar|en
```

**Response مع كل الـ rates**:
```json
{
  "success": true,
  "data": {
    "base": "EUR",
    "rates": {
      "USD": 1.19,
      "GBP": 0.871,
      "JPY": 181.58,
      "AED": 4.36,
      "SAR": 4.45,
      "EGP": 55.62,
      ...
    },
    "lastUpdate": "2026-02-13T10:30:00Z",
    "translations": {
      "en": {
        "title": "Forex Trading",
        "description": "Trade major currency pairs..."
      },
      "ar": {
        "title": "تداول الفوريكس",
        "description": "تداول أزواج العملات الرئيسية..."
      }
    },
    "coverImage": "https://otrade.b-cdn.net/forex/image.jpg"
  }
}
```

### 3. Bitcoin (البيتكوين)

```bash
# Single language
GET /api/bitcoin
Header: Accept-Language: en

# Multiple languages
GET /api/bitcoin
Header: Accept-Language: ar|en
```

---

## 🔄 الفرق بين Single و Multiple

### Single Language (`Accept-Language: en`)
- يرجع `title` و `description` مباشرة
- أسهل للاستخدام في الـ frontend
- حجم الـ response أصغر

### Multiple Languages (`Accept-Language: ar|en`)
- يرجع `translations` object
- يحتوي على اللغتين
- مفيد للـ apps اللي بتدعم تبديل اللغة

---

## 📤 أمثلة Response

### Gold - Single Language
```json
{
  "success": true,
  "data": {
    "price": "2045.50",
    "currency": "USD",
    "title": "Gold Trading",
    "description": "...",
    "coverImage": "..."
  }
}
```

### Gold - Multiple Languages
```json
{
  "success": true,
  "data": {
    "price": "2045.50",
    "currency": "USD",
    "translations": {
      "en": { "title": "...", "description": "..." },
      "ar": { "title": "...", "description": "..." }
    },
    "coverImage": "..."
  }
}
```

### Forex - Multiple Languages (مع كل الـ rates)
```json
{
  "success": true,
  "data": {
    "base": "EUR",
    "rates": {
      "USD": 1.19,
      "AED": 4.36,
      "SAR": 4.45,
      "EGP": 55.62,
      "GBP": 0.871,
      "JPY": 181.58,
      ...
    },
    "translations": {
      "en": { "title": "...", "description": "..." },
      "ar": { "title": "...", "description": "..." }
    },
    "coverImage": "..."
  }
}
```

---

## 🎨 استخدام في Frontend

### React Example

```javascript
// Single language
const fetchGoldPrice = async (lang = 'en') => {
  const response = await fetch('http://localhost:3000/api/gold', {
    headers: {
      'Accept-Language': lang
    }
  });
  const data = await response.json();
  
  // Use directly
  console.log(data.data.title);
  console.log(data.data.description);
};

// Multiple languages
const fetchGoldPriceMultiLang = async () => {
  const response = await fetch('http://localhost:3000/api/gold', {
    headers: {
      'Accept-Language': 'ar|en'
    }
  });
  const data = await response.json();
  
  // Choose language dynamically
  const currentLang = 'ar'; // or 'en'
  console.log(data.data.translations[currentLang].title);
  console.log(data.data.translations[currentLang].description);
};
```

---

## ✅ الميزات

- ✅ دعم لغة واحدة (`en` أو `ar`)
- ✅ دعم لغتين معاً (`ar|en`)
- ✅ يعمل في جميع الـ endpoints:
  - `/api/gold`
  - `/api/gold/cached`
  - `/api/forex`
  - `/api/forex/cached`
  - `/api/bitcoin`
  - `/api/bitcoin/cached`
- ✅ الفوريكس يرجع كل الـ rates (160+ عملة)
- ✅ نفس الـ structure في كل الأنظمة

---

## 🚀 جاهز للاستخدام!

أعد تشغيل السيرفر وجرب:

```bash
# Single language
curl -H "Accept-Language: en" http://localhost:3000/api/gold

# Multiple languages
curl -H "Accept-Language: ar|en" http://localhost:3000/api/gold

# Forex with all rates
curl -H "Accept-Language: ar|en" http://localhost:3000/api/forex
```

🎉
