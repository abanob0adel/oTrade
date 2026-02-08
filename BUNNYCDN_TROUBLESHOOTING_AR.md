# 🔥 حل مشاكل BunnyCDN - دليل شامل

## ❌ مشكلة 401 Unauthorized

### السبب الرئيسي:
استخدام **FTP Password** بدلاً من **Global API Key**

### الحل:

#### 1️⃣ احصل على Global API Key الصحيح

**الطريقة الصحيحة:**
1. اذهب إلى https://dash.bunny.net/
2. اضغط على **Account** (أعلى اليمين)
3. اضغط على **API**
4. انسخ **Global API Key** (ليس FTP Password!)

**⚠️ لا تستخدم:**
- FTP Password من Storage Zone
- Storage Zone Password
- Pull Zone API Key

**✅ استخدم:**
- Global API Key من Account → API

#### 2️⃣ تأكد من الـ Region

افتح Storage Zone في BunnyCDN وشوف الـ Region:

```
Storage Zone: otrade
Region: Falkenstein, Germany → استخدم: de
Region: New York, USA → استخدم: ny
Region: Los Angeles, USA → استخدم: la
Region: Singapore → استخدم: sg
```

#### 3️⃣ ظبط ملف .env

```env
# ✅ الإعدادات الصحيحة
BUNNY_STORAGE_ZONE=otrade
BUNNY_API_KEY=your-global-api-key-here-very-long-string
BUNNY_STORAGE_REGION=de
BUNNY_CDN_URL=https://otrade.b-cdn.net
```

**⚠️ ملاحظات مهمة:**
- الـ API Key طويل جداً (حوالي 60-80 حرف)
- لا تضع مسافات قبل أو بعد القيم
- تأكد إن الملف اسمه `.env` بالضبط

---

## 🧪 اختبار الاتصال

### الطريقة 1: Test Script

```bash
node test-bunnycdn.js
```

**النتيجة المتوقعة:**
```
🐰 BunnyCDN Service Initialized:
   Storage Zone: otrade
   Region: de
   Endpoint: storage.bunnycdn.com
   CDN URL: https://otrade.b-cdn.net
   API Key: y41d31714-d537-4a4f...

🧪 Testing BunnyCDN connection...
📤 Uploading file: test-1707398400000.txt to test/
🔗 Upload URL: https://storage.bunnycdn.com/otrade/test/test-1707398400000.txt
📦 File size: 0.02 KB
✅ Upload successful! Status: 201
✅ Upload test successful
🗑️ Deleting file: test/test-1707398400000.txt
✅ Delete successful! Status: 200
✅ Delete test successful
✅ BunnyCDN connection test passed!

✅ SUCCESS! BunnyCDN is working correctly!
```

### الطريقة 2: من Postman

استورد `bunnycdn_postman_collection.json` واختبر:
- Upload Single Image
- Upload Book

---

## 🔍 تشخيص المشاكل

### المشكلة: 401 Unauthorized

**الأسباب المحتملة:**

#### 1. API Key خطأ
```bash
# تحقق من الـ API Key
echo $BUNNY_API_KEY

# يجب أن يكون طويل جداً (60-80 حرف)
# مثال: y41d31714-d537-4a4f-9f32-6cb4f5196b1cd395ac5b-77f0-4cec-91d1-99a828422a16
```

**الحل:**
- احصل على Global API Key من Account → API
- ليس من Storage Zone!

#### 2. Region خطأ
```bash
# تحقق من الـ Region
echo $BUNNY_STORAGE_REGION

# يجب أن يطابق region الـ Storage Zone
```

**الحل:**
- افتح Storage Zone في BunnyCDN
- شوف الـ Region
- ظبط `BUNNY_STORAGE_REGION` في `.env`

#### 3. Storage Zone Name خطأ
```bash
# تحقق من اسم الـ Storage Zone
echo $BUNNY_STORAGE_ZONE

# يجب أن يكون: otrade
```

---

### المشكلة: 404 Not Found

**السبب:** Storage Zone غير موجود أو الاسم خطأ

**الحل:**
1. تأكد من اسم Storage Zone صحيح
2. تأكد إن Storage Zone موجود في حسابك
3. تأكد من كتابة الاسم بدون أخطاء إملائية

---

### المشكلة: 413 Payload Too Large

**السبب:** الملف أكبر من الحد المسموح (100MB)

**الحل:**
1. قلل حجم الملف
2. أو عدل الحد في `src/middlewares/upload.middleware.js`:

```javascript
const uploadVideos = multer({ 
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB
  }
});
```

---

### المشكلة: Timeout

**السبب:** الملف كبير والاتصال بطيء

**الحل:**
عدل timeout في `src/utils/bunnycdn.js`:

```javascript
timeout: 120000, // 2 minutes
```

---

### المشكلة: Invalid Buffer

**السبب:** الملف فاضي أو تالف

**الحل:**
تأكد من:
- الملف موجود
- الملف غير فاضي
- multer شغال صح

---

## 📋 Checklist للتأكد

- [ ] استخدمت **Global API Key** (ليس FTP Password)
- [ ] الـ API Key طويل (60-80 حرف)
- [ ] `BUNNY_STORAGE_ZONE=otrade` صحيح
- [ ] `BUNNY_STORAGE_REGION` يطابق region الـ Storage Zone
- [ ] ملف `.env` في المكان الصحيح
- [ ] لا توجد مسافات في `.env`
- [ ] السيرفر متشغل بعد تعديل `.env`
- [ ] جربت test script: `node test-bunnycdn.js`

---

## 🔑 كيف تحصل على Global API Key

### خطوة بخطوة:

1. **اذهب إلى BunnyCDN Dashboard**
   ```
   https://dash.bunny.net/
   ```

2. **اضغط على Account**
   - أعلى اليمين
   - أيقونة المستخدم

3. **اضغط على API**
   - من القائمة الجانبية

4. **انسخ Global API Key**
   - ستجد "Global API Key"
   - اضغط "Copy"
   - الصقه في `.env`

**⚠️ لا تخلط بين:**
- ❌ Storage Zone Password (FTP)
- ❌ Pull Zone API Key
- ✅ Global API Key (هذا الصحيح!)

---

## 🌍 Regions المتاحة

| Region Code | Location | Endpoint |
|-------------|----------|----------|
| `de` | Falkenstein, Germany | `storage.bunnycdn.com` |
| `ny` | New York, USA | `ny.storage.bunnycdn.com` |
| `la` | Los Angeles, USA | `la.storage.bunnycdn.com` |
| `sg` | Singapore | `sg.storage.bunnycdn.com` |
| `syd` | Sydney, Australia | `syd.storage.bunnycdn.com` |
| `uk` | London, UK | `uk.storage.bunnycdn.com` |

**كيف تعرف الـ Region:**
1. افتح Storage Zone في BunnyCDN
2. شوف "Replication Regions" أو "Main Region"
3. استخدم الكود المناسب في `.env`

---

## 🛠️ أدوات المساعدة

### 1. Test Script
```bash
node test-bunnycdn.js
```

### 2. Check Logs
شغل السيرفر وشوف الـ logs:
```bash
npm run dev
```

ابحث عن:
```
🐰 BunnyCDN Service Initialized:
   Storage Zone: otrade
   Region: de
   Endpoint: storage.bunnycdn.com
```

### 3. Test Upload
```bash
curl -X POST http://localhost:3000/api/upload/image \
  -F "image=@test.jpg"
```

---

## 💡 نصائح مهمة

1. **استخدم Global API Key دائماً**
   - ليس FTP Password
   - من Account → API

2. **تأكد من الـ Region**
   - يجب أن يطابق Storage Zone region
   - استخدم `de` للـ default region

3. **أعد تشغيل السيرفر**
   - بعد تعديل `.env`
   - `npm run dev`

4. **اختبر أولاً**
   - `node test-bunnycdn.js`
   - قبل استخدام الـ API

5. **راقب الـ Logs**
   - شوف console logs
   - ابحث عن أخطاء واضحة

---

## 🆘 لو لسه مش شغال

### جرب الخطوات دي بالترتيب:

1. **تأكد من الـ API Key**
   ```bash
   # اطبع الـ API Key
   node -e "require('dotenv').config(); console.log(process.env.BUNNY_API_KEY)"
   
   # يجب أن يطبع API Key طويل
   ```

2. **اختبر الاتصال يدوياً**
   ```bash
   curl -X PUT \
     -H "AccessKey: your-api-key-here" \
     -H "Content-Type: application/octet-stream" \
     --data-binary "@test.txt" \
     "https://storage.bunnycdn.com/otrade/test.txt"
   ```

3. **تحقق من الـ Storage Zone**
   - افتح https://dash.bunny.net/
   - Storage → otrade
   - تأكد إنه موجود وactive

4. **تحقق من الـ Permissions**
   - API Key يجب أن يكون له write permissions
   - تحقق من Account → API → Permissions

5. **جرب region تاني**
   ```env
   # جرب بدون region (default)
   BUNNY_STORAGE_REGION=de
   ```

---

## ✅ النتيجة المتوقعة

لما كل حاجة تشتغل صح، هتشوف:

```
🐰 BunnyCDN Service Initialized:
   Storage Zone: otrade
   Region: de
   Endpoint: storage.bunnycdn.com
   CDN URL: https://otrade.b-cdn.net
   API Key: y41d31714-d537-4a4f...

📸 Uploading image: cover.jpg to books/covers/
🔗 Upload URL: https://storage.bunnycdn.com/otrade/books/covers/cover-1707398400000.jpg
📦 File size: 256.50 KB
🔑 Using API Key: y41d31714-d537-4a4f...
✅ Upload successful! Status: 201
🌐 CDN URL: https://otrade.b-cdn.net/books/covers/cover-1707398400000.jpg
✅ Cover uploaded: https://otrade.b-cdn.net/books/covers/cover-1707398400000.jpg
```

---

**كل حاجة واضحة دلوقتي! 🔥**

لو لسه في مشكلة، ابعتلي الـ error message كامل وهساعدك.
