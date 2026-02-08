# 🚀 ابدأ من هنا - BunnyCDN

## ✅ تم حل مشكلة 401 Unauthorized

تم إصلاح المشكلة وتحسين الكود بالكامل! 🔥

---

## 📋 الخطوات (5 دقائق)

### 1️⃣ احصل على Global API Key الصحيح

**⚠️ مهم جداً: استخدم Global API Key وليس FTP Password!**

**الطريقة:**
1. اذهب إلى https://dash.bunny.net/
2. اضغط على **Account** (أعلى اليمين)
3. اضغط على **API** من القائمة
4. انسخ **Global API Key**

**شكل الـ API Key الصحيح:**
```
y41d31714-d537-4a4f-9f32-6cb4f5196b1cd395ac5b-77f0-4cec-91d1-99a828422a16
```
(طويل جداً، حوالي 60-80 حرف)

---

### 2️⃣ تأكد من الـ Region

افتح Storage Zone في BunnyCDN:
1. اذهب إلى **Storage** → **otrade**
2. شوف الـ **Region** أو **Location**

**Regions المتاحة:**
- `de` = Falkenstein, Germany (default)
- `ny` = New York, USA
- `la` = Los Angeles, USA
- `sg` = Singapore

---

### 3️⃣ ظبط ملف .env

افتح `.env` وتأكد من:

```env
# ✅ الإعدادات الصحيحة
BUNNY_STORAGE_ZONE=otrade
BUNNY_API_KEY=your-global-api-key-here
BUNNY_STORAGE_REGION=de
BUNNY_CDN_URL=https://otrade.b-cdn.net
```

**⚠️ ملاحظات:**
- استبدل `your-global-api-key-here` بالـ API Key الحقيقي
- تأكد من الـ Region صحيح
- لا تضع مسافات قبل أو بعد القيم

---

### 4️⃣ اختبر الاتصال

```bash
# اختبار سريع
node test-bunnycdn.js
```

**النتيجة المتوقعة:**
```
🐰 BunnyCDN Service Initialized:
   Storage Zone: otrade
   Region: de
   Endpoint: storage.bunnycdn.com
   CDN URL: https://otrade.b-cdn.net

🧪 Testing BunnyCDN connection...
✅ Upload test successful
✅ Delete test successful
✅ BunnyCDN connection test passed!

✅ SUCCESS! BunnyCDN is working correctly!
```

---

### 5️⃣ شغل السيرفر

```bash
npm run dev
```

**ابحث عن:**
```
🐰 BunnyCDN Service Initialized:
   Storage Zone: otrade
   Region: de
   Endpoint: storage.bunnycdn.com
```

---

## 🧪 اختبار الرفع

### من Postman:

1. استورد `bunnycdn_postman_collection.json`
2. افتح "Upload Single Image"
3. اختر صورة
4. اضغط Send

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://otrade.b-cdn.net/images/photo-1707398400000.jpg",
    "fileName": "photo-1707398400000.jpg",
    "path": "images/photo-1707398400000.jpg",
    "size": 256000
  }
}
```

### من curl:

```bash
curl -X POST http://localhost:3000/api/upload/image \
  -F "image=@test.jpg"
```

---

## 🎯 استخدام في الكود

### رفع صورة:
```javascript
import bunnyCDN from './utils/bunnycdn.js';

const result = await bunnyCDN.uploadImage(
  req.files.image[0].buffer,
  req.files.image[0].originalname,
  'books/covers'
);

console.log('URL:', result.url);
// https://otrade.b-cdn.net/books/covers/image-1707398400000.jpg
```

### رفع PDF:
```javascript
const result = await bunnyCDN.uploadPDF(
  req.files.file[0].buffer,
  req.files.file[0].originalname,
  'books/pdfs'
);

console.log('URL:', result.url);
// https://otrade.b-cdn.net/books/pdfs/book-1707398400000.pdf
```

### رفع فيديو:
```javascript
const result = await bunnyCDN.uploadVideo(
  req.files.video[0].buffer,
  req.files.video[0].originalname,
  'videos/courses'
);

console.log('URL:', result.url);
// https://otrade.b-cdn.net/videos/courses/video-1707398400000.mp4
```

### حذف ملف:
```javascript
await bunnyCDN.deleteFileByUrl(
  'https://otrade.b-cdn.net/books/pdfs/book-123.pdf'
);
```

---

## ✨ المميزات الجديدة

### 1. Functions متخصصة:
- ✅ `uploadImage()` - للصور
- ✅ `uploadPDF()` - للـ PDF
- ✅ `uploadVideo()` - للفيديوهات
- ✅ `uploadFile()` - عام لأي ملف

### 2. Error Handling محسن:
- ✅ رسائل خطأ واضحة
- ✅ تشخيص تلقائي للمشاكل
- ✅ اقتراحات للحل

### 3. Logging مفصل:
- ✅ URL الرفع
- ✅ حجم الملف
- ✅ API Key المستخدم
- ✅ Region والـ Endpoint
- ✅ Response status

### 4. Validation شامل:
- ✅ فحص Buffer
- ✅ فحص حجم الملف (100MB max)
- ✅ فحص API Key
- ✅ فحص Region

### 5. Auto-rename:
- ✅ أسماء فريدة بـ timestamp
- ✅ تنظيف الأسماء من الرموز
- ✅ الحفاظ على الامتداد

---

## 🐛 لو في مشكلة

### المشكلة: 401 Unauthorized

**الحل:**
1. تأكد إنك بتستخدم **Global API Key** (ليس FTP Password)
2. احصل عليه من: Account → API
3. تأكد من الـ Region صحيح

**راجع:** `BUNNYCDN_TROUBLESHOOTING_AR.md`

### المشكلة: 404 Not Found

**الحل:**
1. تأكد من `BUNNY_STORAGE_ZONE=otrade`
2. تأكد إن Storage Zone موجود في حسابك

### المشكلة: Timeout

**الحل:**
1. الملف كبير جداً
2. الاتصال بطيء
3. زود الـ timeout في الكود

---

## 📚 التوثيق الكامل

- **حل المشاكل**: `BUNNYCDN_TROUBLESHOOTING_AR.md`
- **دليل شامل**: `BUNNYCDN_ARABIC_GUIDE.md`
- **ملخص التغييرات**: `SUMMARY_ARABIC.md`
- **Quick Reference**: `BUNNYCDN_QUICK_REFERENCE.md`

---

## ✅ Checklist

- [ ] حصلت على Global API Key من Account → API
- [ ] ظبطت `.env` بالإعدادات الصحيحة
- [ ] تأكدت من الـ Region
- [ ] جربت `node test-bunnycdn.js`
- [ ] شغلت السيرفر `npm run dev`
- [ ] اختبرت الرفع من Postman
- [ ] شفت الـ logs في console

---

## 🎉 كل حاجة جاهزة!

لما تخلص الخطوات دي، BunnyCDN هيشتغل 100% بدون أي مشاكل! 🔥

**لو في أي مشكلة:**
1. شوف الـ logs في console
2. راجع `BUNNYCDN_TROUBLESHOOTING_AR.md`
3. جرب test script: `node test-bunnycdn.js`

---

**تم الإصلاح بنجاح! 🚀**

الكود دلوقتي:
- ✅ Production-level
- ✅ Error handling شامل
- ✅ Logging مفصل
- ✅ Functions متخصصة
- ✅ Validation كامل
- ✅ جاهز للاستخدام

**يلا نرفع ملفات! 🔥**
