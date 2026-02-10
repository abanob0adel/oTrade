# ✅ تحديث نظام الصلاحيات - Books & Articles

## 📋 ما تم إضافته

تم إضافة صلاحيات الكتب (Books) والمقالات (Articles) إلى نظام RBAC.

---

## 🎯 الصلاحيات الجديدة

### Books (الكتب)
- `view` - عرض الكتب
- `create` - إنشاء كتاب جديد
- `update` - تعديل كتاب
- `delete` - حذف كتاب

### Articles (المقالات)
- `view` - عرض المقالات
- `create` - إنشاء مقال جديد
- `update` - تعديل مقال
- `delete` - حذف مقال

---

## 📡 Endpoints المحمية

### Books Routes
```
GET    /api/books/admin          - يتطلب: books:view
POST   /api/books                - يتطلب: books:create
PUT    /api/books/:id            - يتطلب: books:update
DELETE /api/books/:id            - يتطلب: books:delete
```

### Articles Routes
```
GET    /api/articles/admin       - يتطلب: articles:view
POST   /api/articles             - يتطلب: articles:create
PUT    /api/articles/:id         - يتطلب: articles:update
DELETE /api/articles/:id         - يتطلب: articles:delete
```

---

## 📁 الملفات المعدلة

1. **src/config/permissions.config.js**
   - أضيف `books: ['view', 'create', 'update', 'delete']`
   - أضيف `articles: ['view', 'create', 'update', 'delete']`

2. **src/modules/admin/admin.model.js**
   - أضيف `books: [String]` في permissions schema
   - أضيف `articles: [String]` في permissions schema

3. **src/modules/auth/rbac.controller.js**
   - أضيف `books: []` في normalizedPermissions
   - أضيف `articles: []` في normalizedPermissions

---

## 🔧 كيفية منح الصلاحيات

### عند إنشاء Admin جديد

```json
POST /api/admin/register

{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin",
  "permissions": [
    {
      "books": ["view", "create", "update", "delete"],
      "articles": ["view", "create", "update"]
    }
  ]
}
```

### تحديث صلاحيات Admin موجود

```json
PUT /api/admin/:id

{
  "permissions": [
    {
      "books": ["view", "create"],
      "articles": ["view"],
      "courses": ["view", "create", "update"]
    }
  ]
}
```

---

## 🧪 اختبار الصلاحيات

### 1. الحصول على صلاحيات المستخدم الحالي
```bash
GET /api/auth/me/permissions
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "id": "admin_id",
  "role": "admin",
  "permissions": {
    "books": ["view", "create", "update", "delete"],
    "articles": ["view", "create"],
    "courses": [],
    "webinars": []
  }
}
```

### 2. الحصول على جميع الصلاحيات المتاحة
```bash
GET /api/auth/permissions/all
```

**Response:**
```json
{
  "courses": ["view", "create", "update", "delete"],
  "books": ["view", "create", "update", "delete"],
  "articles": ["view", "create", "update", "delete"],
  "webinars": ["view", "create", "update", "delete"],
  ...
}
```

---

## 🔒 كيف يعمل النظام

### 1. Super Admin
- لديه صلاحيات كاملة على كل شيء
- لا يحتاج إلى تحديد permissions
- يتجاوز جميع فحوصات الصلاحيات

### 2. Admin عادي
- يحتاج إلى permissions محددة
- يتم فحص الصلاحيات قبل كل عملية
- إذا لم يكن لديه الصلاحية → 403 Forbidden

### 3. User عادي
- لا يمكنه الوصول إلى admin routes
- يمكنه فقط الوصول إلى public routes

---

## 💡 أمثلة عملية

### مثال 1: Admin يمكنه فقط عرض الكتب
```json
{
  "permissions": [
    {
      "books": ["view"]
    }
  ]
}
```
- ✅ يمكنه: `GET /api/books/admin`
- ❌ لا يمكنه: `POST /api/books` (403 Forbidden)
- ❌ لا يمكنه: `PUT /api/books/:id` (403 Forbidden)
- ❌ لا يمكنه: `DELETE /api/books/:id` (403 Forbidden)

### مثال 2: Admin يمكنه إدارة الكتب والمقالات
```json
{
  "permissions": [
    {
      "books": ["view", "create", "update", "delete"],
      "articles": ["view", "create", "update", "delete"]
    }
  ]
}
```
- ✅ يمكنه: جميع عمليات Books
- ✅ يمكنه: جميع عمليات Articles
- ❌ لا يمكنه: عمليات Courses (لم يتم منحه الصلاحية)

---

## 🎯 الحالة: مكتمل

تم إضافة صلاحيات Books و Articles بنجاح إلى نظام RBAC. جميع الـ routes محمية بشكل صحيح.

**آخر تحديث:** 11 فبراير 2026
