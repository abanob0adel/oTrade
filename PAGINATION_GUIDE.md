# Pagination Middleware - دليل الاستخدام

## نظرة عامة
Pagination middleware يوفر نظام ترقيم صفحات سهل الاستخدام لجميع endpoints في المشروع.

**الإعدادات الافتراضية:**
- عدد العناصر في الصفحة: 6
- الحد الأقصى للعناصر: 100

---

## 1️⃣ كيفية الاستخدام

### في الـ Routes
```javascript
import { pagination } from '../../middlewares/pagination.middleware.js';

// استخدام الإعدادات الافتراضية (6 items)
router.get('/items', pagination(), getItems);

// تخصيص عدد العناصر
router.get('/items', pagination({ defaultLimit: 10 }), getItems);

// تخصيص الحد الأقصى
router.get('/items', pagination({ defaultLimit: 6, maxLimit: 50 }), getItems);
```

### في الـ Controller
```javascript
export const getItems = async (req, res) => {
  try {
    // الحصول على معلومات الـ pagination
    const { skip, limit, page } = req.pagination;
    
    // حساب العدد الكلي
    const total = await Item.countDocuments({ isActive: true });
    
    // جلب البيانات مع pagination
    const items = await Item.find({ isActive: true })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // إرسال الـ response مع pagination info
    res.status(200).json(req.paginatedResponse(items, total));
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
```

---

## 2️⃣ Query Parameters

### page (رقم الصفحة)
```
GET /api/items?page=1
GET /api/items?page=2
GET /api/items?page=3
```
- القيمة الافتراضية: 1
- الحد الأدنى: 1

### limit (عدد العناصر في الصفحة)
```
GET /api/items?limit=6
GET /api/items?limit=10
GET /api/items?limit=20
```
- القيمة الافتراضية: 6
- الحد الأدنى: 1
- الحد الأقصى: 100 (قابل للتخصيص)

### الجمع بين المعاملات
```
GET /api/items?page=2&limit=10
```

---

## 3️⃣ Response Format

### مع Pagination
```json
{
  "success": true,
  "data": [
    {
      "id": "65f1234567890abcdef12345",
      "title": "Item 1",
      "description": "Description..."
    },
    {
      "id": "65f1234567890abcdef12346",
      "title": "Item 2",
      "description": "Description..."
    }
  ],
  "pagination": {
    "currentPage": 2,
    "totalPages": 10,
    "totalItems": 58,
    "itemsPerPage": 6,
    "hasNextPage": true,
    "hasPrevPage": true,
    "nextPage": 3,
    "prevPage": 1
  }
}
```

### بدون Pagination (إذا لم يتم استخدام الـ middleware)
```json
{
  "success": true,
  "data": [
    // جميع العناصر
  ]
}
```

---

## 4️⃣ أمثلة عملية

### مثال 1: Market Analysis
```
GET http://localhost:3000/api/market-analysis/gulf-stocks?page=1&limit=6
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "65f1234567890abcdef12345",
      "categoryId": "65f1234567890abcdef12340",
      "slug": "saudi-market-analysis",
      "title": "تحليل السوق السعودي",
      "description": "تحليل شامل...",
      "coverImage": "https://...",
      "updatedAt": "2024-02-15T10:30:00.000Z"
    }
    // ... 5 more items
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 28,
    "itemsPerPage": 6,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

---

### مثال 2: الصفحة الثانية
```
GET http://localhost:3000/api/market-analysis/forex?page=2&limit=6
```

**Response:**
```json
{
  "success": true,
  "data": [
    // Items 7-12
  ],
  "pagination": {
    "currentPage": 2,
    "totalPages": 5,
    "totalItems": 28,
    "itemsPerPage": 6,
    "hasNextPage": true,
    "hasPrevPage": true,
    "nextPage": 3,
    "prevPage": 1
  }
}
```

---

### مثال 3: تخصيص عدد العناصر
```
GET http://localhost:3000/api/market-analysis/bitcoin?page=1&limit=12
```

**Response:**
```json
{
  "success": true,
  "data": [
    // 12 items
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 28,
    "itemsPerPage": 12,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

---

## 5️⃣ إضافة Pagination لـ Endpoints موجودة

### الخطوة 1: Import الـ Middleware
```javascript
import { pagination } from '../../middlewares/pagination.middleware.js';
```

### الخطوة 2: إضافة الـ Middleware للـ Route
```javascript
// قبل
router.get('/courses', getCourses);

// بعد
router.get('/courses', pagination(), getCourses);
```

### الخطوة 3: تعديل الـ Controller
```javascript
export const getCourses = async (req, res) => {
  try {
    // إضافة pagination support
    const { skip, limit } = req.pagination;
    
    // حساب العدد الكلي
    const total = await Course.countDocuments({ isActive: true });
    
    // جلب البيانات مع pagination
    const courses = await Course.find({ isActive: true })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // استخدام paginatedResponse بدل response عادي
    res.status(200).json(req.paginatedResponse(courses, total));
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

---

## 6️⃣ إيقاف Pagination

### الطريقة 1: إزالة الـ Middleware من الـ Route
```javascript
// مع pagination
router.get('/items', pagination(), getItems);

// بدون pagination
router.get('/items', getItems);
```

### الطريقة 2: جعل الـ Controller يدعم الحالتين
```javascript
export const getItems = async (req, res) => {
  try {
    // التحقق من وجود pagination
    const skip = req.pagination?.skip || 0;
    const limit = req.pagination?.limit || 0;
    
    const total = await Item.countDocuments();
    
    let query = Item.find().sort({ createdAt: -1 });
    
    // تطبيق pagination فقط إذا كان موجود
    if (limit > 0) {
      query = query.skip(skip).limit(limit);
    }
    
    const items = await query;
    
    // إرسال response مع أو بدون pagination
    if (req.paginatedResponse) {
      res.status(200).json(req.paginatedResponse(items, total));
    } else {
      res.status(200).json({ success: true, data: items });
    }
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

---

## 7️⃣ Endpoints المدعومة حالياً

✅ **Market Analysis**
- `GET /api/market-analysis/:category` - مع pagination (6 items)

### لإضافة pagination لـ endpoints أخرى:
1. Courses: `GET /api/courses`
2. Strategies: `GET /api/strategies`
3. Books: `GET /api/books`
4. Articles: `GET /api/articles`
5. News: `GET /api/news`
6. Analysts: `GET /api/analysts`
7. Psychology: `GET /api/psychology`

---

## 8️⃣ Best Practices

### 1. استخدم الإعدادات الافتراضية
```javascript
// جيد - استخدام الإعدادات الافتراضية
router.get('/items', pagination(), getItems);

// تجنب - تخصيص غير ضروري
router.get('/items', pagination({ defaultLimit: 6 }), getItems);
```

### 2. احسب العدد الكلي بكفاءة
```javascript
// جيد - استخدام countDocuments
const total = await Item.countDocuments({ isActive: true });

// تجنب - استخدام find().length
const total = (await Item.find({ isActive: true })).length;
```

### 3. استخدم Indexes للـ sorting
```javascript
// في الـ Model
itemSchema.index({ createdAt: -1 });
itemSchema.index({ updatedAt: -1 });
```

### 4. تحقق من صحة الـ page number
```javascript
// الـ middleware يتعامل مع هذا تلقائياً
// page < 1 → يصبح 1
// page > totalPages → يرجع صفحة فارغة
```

---

## 9️⃣ Frontend Integration

### React Example
```javascript
const [currentPage, setCurrentPage] = useState(1);
const [data, setData] = useState([]);
const [pagination, setPagination] = useState(null);

const fetchData = async (page) => {
  const response = await fetch(
    `http://localhost:3000/api/market-analysis/forex?page=${page}&limit=6`
  );
  const result = await response.json();
  
  setData(result.data);
  setPagination(result.pagination);
};

// Pagination UI
<div className="pagination">
  <button 
    disabled={!pagination?.hasPrevPage}
    onClick={() => fetchData(pagination.prevPage)}
  >
    السابق
  </button>
  
  <span>صفحة {pagination?.currentPage} من {pagination?.totalPages}</span>
  
  <button 
    disabled={!pagination?.hasNextPage}
    onClick={() => fetchData(pagination.nextPage)}
  >
    التالي
  </button>
</div>
```

---

## 🔟 Troubleshooting

### المشكلة: لا يظهر pagination في الـ response
**الحل:** تأكد من إضافة `pagination()` middleware في الـ route

### المشكلة: العدد الكلي غير صحيح
**الحل:** تأكد من استخدام نفس الـ query في `countDocuments` و `find`

### المشكلة: الصفحة الأخيرة فارغة
**الحل:** هذا طبيعي إذا كان `page > totalPages`

### المشكلة: بطء في الأداء
**الحل:** 
1. أضف indexes على الحقول المستخدمة في sorting
2. استخدم `select()` لتحديد الحقول المطلوبة فقط
3. استخدم `lean()` للحصول على plain objects

---

## الخلاصة

✅ Default: 6 items per page
✅ سهل التفعيل والإيقاف
✅ Response format موحد
✅ يدعم تخصيص الإعدادات
✅ متوافق مع الـ controllers الموجودة
