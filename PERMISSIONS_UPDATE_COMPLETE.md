# ✅ RBAC Permissions Update - Books & Articles

## 📋 Overview

Successfully added Books and Articles permissions to the RBAC (Role-Based Access Control) system.

---

## 🎯 New Permissions Added

### Books Module
- `view` - View books
- `create` - Create new book
- `update` - Update existing book
- `delete` - Delete book

### Articles Module
- `view` - View articles
- `create` - Create new article
- `update` - Update existing article
- `delete` - Delete article

---

## 📡 Protected Endpoints

### Books Routes
```
GET    /api/books/admin          - Requires: books:view
POST   /api/books                - Requires: books:create
PUT    /api/books/:id            - Requires: books:update
DELETE /api/books/:id            - Requires: books:delete
```

### Articles Routes
```
GET    /api/articles/admin       - Requires: articles:view
POST   /api/articles             - Requires: articles:create
PUT    /api/articles/:id         - Requires: articles:update
DELETE /api/articles/:id         - Requires: articles:delete
```

---

## 📁 Modified Files

1. **src/config/permissions.config.js**
   - Added `books: ['view', 'create', 'update', 'delete']`
   - Added `articles: ['view', 'create', 'update', 'delete']`

2. **src/modules/admin/admin.model.js**
   - Added `books: [String]` to permissions schema
   - Added `articles: [String]` to permissions schema

3. **src/modules/auth/rbac.controller.js**
   - Added `books: []` to normalizedPermissions
   - Added `articles: []` to normalizedPermissions

---

## 🔧 How to Grant Permissions

### When Creating New Admin

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

### Update Existing Admin Permissions

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

## 🧪 Testing Permissions

### 1. Get Current User Permissions
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

### 2. Get All Available Permissions
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

## 🔒 How It Works

### 1. Super Admin
- Has full access to everything
- No need to specify permissions
- Bypasses all permission checks

### 2. Regular Admin
- Needs specific permissions
- Permissions are checked before each operation
- If permission missing → 403 Forbidden

### 3. Regular User
- Cannot access admin routes
- Can only access public routes

---

## 💡 Practical Examples

### Example 1: Admin Can Only View Books
```json
{
  "permissions": [
    {
      "books": ["view"]
    }
  ]
}
```
- ✅ Can: `GET /api/books/admin`
- ❌ Cannot: `POST /api/books` (403 Forbidden)
- ❌ Cannot: `PUT /api/books/:id` (403 Forbidden)
- ❌ Cannot: `DELETE /api/books/:id` (403 Forbidden)

### Example 2: Admin Can Manage Books and Articles
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
- ✅ Can: All Books operations
- ✅ Can: All Articles operations
- ❌ Cannot: Courses operations (no permission granted)

---

## 🧪 Test Scripts

### Run Automated Test
```bash
node test-books-articles-permissions.js
```

### Import Postman Collection
```
File: books_articles_permissions_postman.json
```

The collection includes:
- Get all permissions
- Get my permissions
- Books CRUD operations (with permission checks)
- Articles CRUD operations (with permission checks)
- Admin management examples

---

## 📚 Related Documentation

- **Arabic Guide:** `PERMISSIONS_UPDATE_AR.md`
- **RBAC Examples:** `src/examples/rbac_example.js`
- **Permissions Config:** `src/config/permissions.config.js`

---

## ✅ Status: COMPLETE

Books and Articles permissions successfully added to RBAC system. All routes are properly protected.

**Last Updated:** February 11, 2026
