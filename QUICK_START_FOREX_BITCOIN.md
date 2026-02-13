# ⚡ دليل البدء السريع - Forex & Bitcoin

## 🎯 الـ Endpoints الجديدة

### Forex (الفوريكس)
```
GET  /api/forex              # Live EUR/USD rate
GET  /api/forex/cached       # Cached rate (30s)
GET  /api/forex/info         # Info + translations
POST /api/forex/info         # Create/Update (Admin)
```

### Bitcoin (البيتكوين)
```
GET  /api/bitcoin            # Live BTC price
GET  /api/bitcoin/cached     # Cached price (30s)
GET  /api/bitcoin/info       # Info + translations
POST /api/bitcoin/info       # Create/Update (Admin)
```

---

## 🧪 اختبار سريع

### 1. Forex
```bash
# Get live rate
curl http://localhost:3000/api/forex

# Get info (English)
curl -H "Accept-Language: en" http://localhost:3000/api/forex/info

# Get info (Arabic)
curl -H "Accept-Language: ar" http://localhost:3000/api/forex/info
```

### 2. Bitcoin
```bash
# Get live price
curl http://localhost:3000/api/bitcoin

# Get info (English)
curl -H "Accept-Language: en" http://localhost:3000/api/bitcoin/info

# Get info (Arabic)
curl -H "Accept-Language: ar" http://localhost:3000/api/bitcoin/info
```

---

## 📤 إضافة محتوى (Postman)

### Forex

```
POST http://localhost:3000/api/forex/info
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: multipart/form-data

Body:
- coverImage: [file]
- title_en: "Forex Trading"
- title_ar: "تداول الفوريكس"
- description_en: "Trade major currency pairs"
- description_ar: "تداول أزواج العملات الرئيسية"
```

### Bitcoin

```
POST http://localhost:3000/api/bitcoin/info
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: multipart/form-data

Body:
- coverImage: [file]
- title_en: "Bitcoin Trading"
- title_ar: "تداول البيتكوين"
- description_en: "Trade cryptocurrency"
- description_ar: "تداول العملات الرقمية"
```

---

## ✅ الميزات

- ✅ Live API integration
- ✅ 30-second caching
- ✅ Bilingual (AR/EN)
- ✅ Image upload (BunnyCDN)
- ✅ FAQs support
- ✅ FormData support

---

## 🚀 البدء

1. أعد تشغيل السيرفر:
```bash
npm start
```

2. جرب الـ endpoints:
```bash
curl http://localhost:3000/api/forex
curl http://localhost:3000/api/bitcoin
```

3. أضف المحتوى من Postman

---

جاهز! 🎉
