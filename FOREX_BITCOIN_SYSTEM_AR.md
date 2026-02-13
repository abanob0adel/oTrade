# 🚀 نظام الفوريكس والبيتكوين - دليل كامل

## ✅ تم التنفيذ

تم إنشاء نظامين كاملين للفوريكس والبيتكوين، نفس نظام الذهب بالظبط!

---

## 📋 الأنظمة المتاحة

### 1. 🥇 Gold (الذهب)
- API: `https://api.gold-api.com/price/XAU`
- Base URL: `/api/gold`

### 2. 💱 Forex (الفوريكس)
- API: `https://api.exchangerate-api.com/v4/latest/EUR`
- Pair: EUR/USD
- Base URL: `/api/forex`

### 3. ₿ Bitcoin (البيتكوين)
- API: `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`
- Base URL: `/api/bitcoin`

---

## 🎯 الـ Endpoints

### Gold (الذهب)

```bash
# Get live gold price
GET /api/gold

# Get cached gold price (30s)
GET /api/gold/cached

# Get gold info with translations
GET /api/gold/info
Header: Accept-Language: ar|en

# Create/Update gold info (Admin)
POST /api/gold/info
Content-Type: multipart/form-data
```

### Forex (الفوريكس)

```bash
# Get live forex rate (EUR/USD)
GET /api/forex

# Get cached forex rate (30s)
GET /api/forex/cached

# Get forex info with translations
GET /api/forex/info
Header: Accept-Language: ar|en

# Create/Update forex info (Admin)
POST /api/forex/info
Content-Type: multipart/form-data
```

### Bitcoin (البيتكوين)

```bash
# Get live bitcoin price
GET /api/bitcoin

# Get cached bitcoin price (30s)
GET /api/bitcoin/cached

# Get bitcoin info with translations
GET /api/bitcoin/info
Header: Accept-Language: ar|en

# Create/Update bitcoin info (Admin)
POST /api/bitcoin/info
Content-Type: multipart/form-data
```

---

## 📤 مثال Response

### Gold
```json
{
  "success": true,
  "data": {
    "price": "2045.50",
    "currency": "USD",
    "lastUpdate": "2026-02-13T10:30:00Z",
    "title": "Gold Trading",
    "description": "Gold is one of the most traded precious metals...",
    "coverImage": "https://otrade.b-cdn.net/gold/image.jpg"
  },
  "timestamp": "2026-02-13T10:30:00Z"
}
```

### Forex
```json
{
  "success": true,
  "data": {
    "rate": "1.0850",
    "pair": "EUR/USD",
    "lastUpdate": "2026-02-13T10:30:00Z",
    "title": "Forex Trading",
    "description": "Trade major currency pairs...",
    "coverImage": "https://otrade.b-cdn.net/forex/image.jpg"
  },
  "timestamp": "2026-02-13T10:30:00Z"
}
```

### Bitcoin
```json
{
  "success": true,
  "data": {
    "price": "45250.00",
    "currency": "USD",
    "lastUpdate": "2026-02-13T10:30:00Z",
    "title": "Bitcoin Trading",
    "description": "Trade the world's leading cryptocurrency...",
    "coverImage": "https://otrade.b-cdn.net/bitcoin/image.jpg"
  },
  "timestamp": "2026-02-13T10:30:00Z"
}
```

---

## 🔧 إنشاء/تحديث المعلومات (Admin)

### Forex Example

```bash
POST /api/forex/info
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: multipart/form-data
```

**Body (form-data)**:

| Key | Type | Value |
|-----|------|-------|
| coverImage | File | [صورة الفوريكس] |
| title_en | Text | Forex Trading |
| title_ar | Text | تداول الفوريكس |
| description_en | Text | Trade major currency pairs with live rates |
| description_ar | Text | تداول أزواج العملات الرئيسية بأسعار مباشرة |
| faqs_en | Text | [{"question":"What is Forex?","answer":"..."}] |
| faqs_ar | Text | [{"question":"ما هو الفوريكس؟","answer":"..."}] |

### Bitcoin Example

```bash
POST /api/bitcoin/info
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: multipart/form-data
```

**Body (form-data)**:

| Key | Type | Value |
|-----|------|-------|
| coverImage | File | [صورة البيتكوين] |
| title_en | Text | Bitcoin Trading |
| title_ar | Text | تداول البيتكوين |
| description_en | Text | Trade the world's leading cryptocurrency |
| description_ar | Text | تداول العملة الرقمية الرائدة في العالم |
| faqs_en | Text | [{"question":"What is Bitcoin?","answer":"..."}] |
| faqs_ar | Text | [{"question":"ما هو البيتكوين؟","answer":"..."}] |

---

## 🗂️ الملفات المُنشأة

### Forex
- `src/modules/forex/forex.model.js` - Model
- `src/modules/forex/forex.controller.js` - Controller
- `src/modules/forex/forex.routes.js` - Routes

### Bitcoin
- `src/modules/bitcoin/bitcoin.model.js` - Model
- `src/modules/bitcoin/bitcoin.controller.js` - Controller
- `src/modules/bitcoin/bitcoin.routes.js` - Routes

### Updates
- `src/app.js` - Added forex & bitcoin routes
- `src/modules/translations/translation.model.js` - Added 'forex' & 'bitcoin' entity types
- `src/modules/translations/translation.service.js` - Added 'forex' & 'bitcoin' to valid types

---

## 🎨 الميزات

كل نظام يدعم:

✅ **Live API Integration**
- Gold: Gold-API.com
- Forex: ExchangeRate-API.com (EUR/USD)
- Bitcoin: CoinGecko API

✅ **Caching (30 seconds)**
- يقلل عدد الطلبات للـ API الخارجي
- يحسن الأداء

✅ **Bilingual Support**
- عربي + إنجليزي
- نظام الترجمة الكامل

✅ **Image Upload**
- رفع الصور على BunnyCDN
- دعم FormData

✅ **FAQs Support**
- أسئلة شائعة لكل نظام
- مخزنة كـ JSON

✅ **Multiple FormData Formats**
- `title_en`, `title_ar`
- `title[en]`, `title[ar]`
- `title: {"en":"...", "ar":"..."}`

---

## 🧪 الاختبار

### 1. أعد تشغيل السيرفر
```bash
npm start
```

### 2. اختبر الـ Endpoints

**Gold**:
```bash
curl http://localhost:3000/api/gold
curl http://localhost:3000/api/gold/info
```

**Forex**:
```bash
curl http://localhost:3000/api/forex
curl http://localhost:3000/api/forex/info
```

**Bitcoin**:
```bash
curl http://localhost:3000/api/bitcoin
curl http://localhost:3000/api/bitcoin/info
```

---

## 📊 مقارنة الأنظمة

| الميزة | Gold | Forex | Bitcoin |
|--------|------|-------|---------|
| Live API | ✅ | ✅ | ✅ |
| Caching | ✅ (30s) | ✅ (30s) | ✅ (30s) |
| Translations | ✅ | ✅ | ✅ |
| Image Upload | ✅ | ✅ | ✅ |
| FAQs | ✅ | ✅ | ✅ |
| FormData | ✅ | ✅ | ✅ |

---

## 🔍 الـ APIs المستخدمة

### Gold API
```
https://api.gold-api.com/price/XAU
```
- Free API
- Real-time gold prices
- USD currency

### Forex API
```
https://api.exchangerate-api.com/v4/latest/EUR
```
- Free API
- Real-time exchange rates
- EUR/USD pair

### Bitcoin API
```
https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd
```
- Free API (CoinGecko)
- Real-time crypto prices
- No API key required

---

## 📝 ملاحظات مهمة

1. **الـ APIs مجانية** - لا تحتاج API keys
2. **Caching مهم** - استخدم `/cached` endpoints لتقليل الطلبات
3. **Error Handling** - كل API لديه fallback للـ cache
4. **Rate Limits** - الـ APIs المجانية لها حدود، استخدم الـ cache
5. **BunnyCDN** - الصور تُرفع على BunnyCDN مباشرة

---

## 🎉 جاهز للاستخدام!

الأنظمة الثلاثة (Gold, Forex, Bitcoin) جاهزة ومتطابقة تماماً في:
- البنية
- الميزات
- الـ Endpoints
- الترجمات
- رفع الصور

كل ما عليك هو:
1. أعد تشغيل السيرفر
2. اختبر الـ Endpoints
3. أضف المحتوى من الـ Admin Panel

🚀 Happy Trading!
