# 🐰 دليل استخدام BunnyCDN - بالعربية

## ✅ تم الانتهاء من التكامل

تم استبدال Cloudinary بـ BunnyCDN بنجاح في مشروعك!

---

## 🚀 البدء السريع (3 خطوات)

### الخطوة 1: إضافة مفتاح API (30 ثانية)

1. افتح ملف `.env`
2. ابحث عن هذا السطر:
   ```env
   BUNNY_API_KEY=your_bunnycdn_api_key_here
   ```
3. استبدل `your_bunnycdn_api_key_here` بمفتاح API الخاص بك

**كيف تحصل على مفتاح API:**
1. اذهب إلى https://dash.bunny.net/
2. اضغط على **Storage** من القائمة اليسرى
3. اضغط على **otrade** (منطقة التخزين الخاصة بك)
4. انسخ **Password** (هذا هو مفتاح API)
5. الصقه في ملف `.env`

### الخطوة 2: تشغيل السيرفر

```bash
npm run dev
```

يجب أن ترى:
```
Server running on port 3000
```

### الخطوة 3: اختبار الرفع

استخدم Postman:
1. استورد ملف `bunnycdn_postman_collection.json`
2. افتح طلب "Upload Single Image"
3. اختر صورة
4. اضغط Send
5. ستحصل على رابط CDN!

---

## 📝 ما الذي تم تغييره؟

### ✅ تم استبدال Cloudinary بـ BunnyCDN في:

1. **`src/modules/books/books.controller.js`**
   - ✅ رفع صورة الغلاف → BunnyCDN
   - ✅ رفع ملف PDF → BunnyCDN
   - ✅ حذف الملفات عند حذف الكتاب → BunnyCDN
   - ✅ تحديث الملفات → حذف القديم ورفع الجديد

### 📦 الملفات الجديدة:

1. **`src/utils/bunnycdn.js`** - خدمة BunnyCDN الرئيسية
2. **`src/controllers/upload.controller.js`** - متحكمات الرفع
3. **`src/routes/upload.routes.js`** - مسارات API
4. **`src/scripts/migrate-to-bunnycdn.js`** - سكريبت الترحيل

---

## 🎯 كيف يعمل الآن؟

### رفع كتاب جديد

```javascript
// عند رفع كتاب جديد
POST /api/books

// الملفات:
- file: ملف PDF
- coverImage: صورة الغلاف

// النتيجة:
{
  "pdfUrl": "https://otrade.b-cdn.net/books/pdfs/book-123.pdf",
  "coverImageUrl": "https://otrade.b-cdn.net/books/covers/cover-123.jpg"
}
```

### تحديث كتاب

```javascript
// عند تحديث كتاب
PUT /api/books/:id

// إذا رفعت ملف جديد:
// 1. يحذف الملف القديم من BunnyCDN
// 2. يرفع الملف الجديد
// 3. يحدث قاعدة البيانات
```

### حذف كتاب

```javascript
// عند حذف كتاب
DELETE /api/books/:id

// تلقائياً:
// 1. يحذف صورة الغلاف من BunnyCDN
// 2. يحذف ملف PDF من BunnyCDN
// 3. يحذف من قاعدة البيانات
```

---

## 📁 تنظيم الملفات

الملفات منظمة تلقائياً في BunnyCDN:

```
otrade/  (منطقة التخزين)
├── books/
│   ├── pdfs/          ← ملفات PDF للكتب
│   └── covers/        ← صور أغلفة الكتب
├── images/
│   ├── articles/      ← صور المقالات
│   ├── courses/       ← صور الدورات
│   └── general/       ← صور عامة
├── videos/
│   ├── courses/       ← فيديوهات الدورات
│   └── webinars/      ← فيديوهات الندوات
└── uploads/           ← رفوعات عامة
```

---

## 🔄 ترحيل الملفات من Cloudinary

إذا كان لديك ملفات قديمة على Cloudinary، يمكنك ترحيلها:

### اختبار الترحيل (بدون تغيير)

```bash
export DRY_RUN=true
node src/scripts/migrate-to-bunnycdn.js
```

### الترحيل الفعلي

```bash
export DRY_RUN=false
node src/scripts/migrate-to-bunnycdn.js
```

**ماذا يفعل السكريبت:**
- يبحث عن جميع الكتب التي تستخدم Cloudinary
- ينزل الملفات من Cloudinary
- يرفعها إلى BunnyCDN
- يحدث قاعدة البيانات
- يعرض تقرير مفصل

---

## 🎨 استخدام من Frontend

### React مثال

```jsx
const UploadBook = () => {
  const [pdf, setPdf] = useState(null);
  const [cover, setCover] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', pdf);
    formData.append('coverImage', cover);

    const response = await fetch('http://localhost:3000/api/upload/book', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    console.log('رابط PDF:', result.data.pdf.url);
    console.log('رابط الغلاف:', result.data.coverImage.url);
  };

  return (
    <div>
      <input 
        type="file" 
        accept=".pdf" 
        onChange={(e) => setPdf(e.target.files[0])} 
      />
      <input 
        type="file" 
        accept="image/*" 
        onChange={(e) => setCover(e.target.files[0])} 
      />
      <button onClick={handleUpload}>رفع</button>
    </div>
  );
};
```

---

## 🛠️ API الجديدة

### رفع كتاب (PDF + غلاف)

```http
POST /api/upload/book
Content-Type: multipart/form-data

الحقول:
- file: ملف PDF
- coverImage: صورة الغلاف
```

### رفع صورة

```http
POST /api/upload/image
Content-Type: multipart/form-data

الحقول:
- image: ملف الصورة
- folder: مجلد مخصص (اختياري)
```

### رفع فيديو

```http
POST /api/upload/video
Content-Type: multipart/form-data

الحقول:
- video: ملف الفيديو
- folder: مجلد مخصص (اختياري)
```

### حذف ملف

```http
DELETE /api/upload/delete
Content-Type: application/json

{
  "url": "https://otrade.b-cdn.net/books/pdfs/book-123.pdf"
}
```

---

## 🐛 حل المشاكل

### "BUNNY_API_KEY is required"
→ أضف مفتاح API في ملف `.env`

### الرفع يعمل لكن الرابط لا يفتح
→ انتظر 10-30 ثانية لنشر الملف على CDN  
→ تأكد من ربط Pull Zone بـ Storage Zone

### 401 Unauthorized
→ تأكد من صحة مفتاح API  
→ تأكد من نسخ Password وليس اسم Storage Zone

### الملف كبير جداً
→ عدل الحد الأقصى في `src/middlewares/upload.middleware.js`

---

## ✨ المميزات

### 🚀 سرعة أعلى
- توزيع عالمي عبر CDN
- تخزين مؤقت تلقائي
- زمن استجابة أقل

### 💰 تكلفة أقل
- أرخص من Cloudinary
- تسعير واضح ومباشر
- لا فواتير مفاجئة

### 🎯 تحكم أفضل
- وصول مباشر للتخزين
- تنظيم مرن للملفات
- سهولة التكامل

---

## 📊 الفرق بين Cloudinary و BunnyCDN

| الميزة | Cloudinary | BunnyCDN |
|--------|-----------|----------|
| **الرفع** | `uploadImage(file, folder)` | `uploadFile(buffer, name, folder)` |
| **النتيجة** | رابط نصي | كائن مع url, path, size |
| **الحذف** | بواسطة public_id | بواسطة URL أو path |
| **المجلدات** | تلقائي | يدوي منظم |
| **السرعة** | سريع | أسرع |
| **التكلفة** | أعلى | أقل |

---

## 📚 التوثيق الكامل

### بالإنجليزية:
- **البدء السريع**: `GETTING_STARTED.md`
- **مرجع سريع**: `BUNNYCDN_QUICK_REFERENCE.md`
- **توثيق كامل**: `docs/bunnycdn_integration.md`
- **دليل الترحيل**: `docs/migration_guide.md`

### ملفات الاختبار:
- **Postman**: `bunnycdn_postman_collection.json`

---

## ✅ قائمة التحقق

- [ ] إضافة `BUNNY_API_KEY` في `.env`
- [ ] التأكد من صحة `BUNNY_CDN_URL`
- [ ] اختبار الرفع بـ Postman
- [ ] اختبار رفع كتاب جديد
- [ ] اختبار تحديث كتاب
- [ ] اختبار حذف كتاب
- [ ] تحديث Frontend
- [ ] ترحيل الملفات القديمة (إن وجدت)
- [ ] الاختبار في الإنتاج

---

## 🎉 كل شيء جاهز!

تم استبدال Cloudinary بـ BunnyCDN بنجاح. الآن:

1. ✅ **أضف مفتاح API** في `.env`
2. ✅ **شغل السيرفر**: `npm run dev`
3. ✅ **اختبر الرفع** بـ Postman
4. ✅ **استمتع بالسرعة والتكلفة الأقل!**

---

## 💡 نصائح مهمة

1. **احتفظ بنسخة احتياطية** من قاعدة البيانات قبل الترحيل
2. **اختبر أولاً** باستخدام DRY_RUN=true
3. **نظم الملفات** في مجلدات واضحة
4. **احذف الملفات القديمة** عند التحديث
5. **راقب الاستخدام** في لوحة BunnyCDN

---

## 🆘 تحتاج مساعدة؟

- راجع ملفات التوثيق
- اختبر بـ Postman
- تحقق من متغيرات البيئة
- راجع الأمثلة في الكود

**كل شيء موثق وجاهز للاستخدام!**

---

**صُنع بـ ❤️ لتوصيل سريع وبأسعار معقولة**
