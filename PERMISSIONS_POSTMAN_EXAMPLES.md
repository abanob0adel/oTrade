# Permissions API - Postman Examples

Base URL: `https://api.otrade.ae`

---

## 1. Get Current User Permissions
**GET** `/api/auth/me/permissions`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "id": "664f1a2b3c4d5e6f7a8b9c0d",
  "role": "admin",
  "permissions": {
    "courses":       ["view", "create", "update", "delete"],
    "plans":         ["view", "create", "update", "delete"],
    "webinars":      ["view", "create", "update", "delete"],
    "psychology":    ["view", "create", "update", "delete"],
    "analysis":      ["view", "create", "update", "delete"],
    "users":         ["view", "create", "update", "delete"],
    "admins":        ["view", "create", "update", "delete"],
    "subscriptions": ["view", "create", "update", "delete"],
    "support":       ["view", "create", "update", "delete"],
    "calendar":      ["view", "create", "update", "delete"],
    "strategies":    ["view", "create", "update", "delete"],
    "testimonials":  ["view", "create", "update", "delete"],
    "books":         ["view", "create", "update", "delete"],
    "articles":      ["view", "create", "update", "delete"],
    "partners":      ["view", "create", "update", "delete"],
    "brokers":       ["view", "create", "update", "delete"],
    "news":          ["view", "create", "update", "delete"],
    "emails":        ["view", "create", "update", "delete"]
  }
}
```

---

## 2. Get All Available Permissions
**GET** `/api/auth/permissions/all`

> Public endpoint - no token required

Response:
```json
{
  "courses":       ["view", "create", "update", "delete"],
  "plans":         ["view", "create", "update", "delete"],
  "webinars":      ["view", "create", "update", "delete"],
  "psychology":    ["view", "create", "update", "delete"],
  "analysis":      ["view", "create", "update", "delete"],
  "users":         ["view", "create", "update", "delete"],
  "admins":        ["view", "create", "update", "delete"],
  "subscriptions": ["view", "create", "update", "delete"],
  "support":       ["view", "create", "update", "delete"],
  "calendar":      ["view", "create", "update", "delete"],
  "strategies":    ["view", "create", "update", "delete"],
  "testimonials":  ["view", "create", "update", "delete"],
  "books":         ["view", "create", "update", "delete"],
  "articles":      ["view", "create", "update", "delete"],
  "partners":      ["view", "create", "update", "delete"],
  "brokers":       ["view", "create", "update", "delete"],
  "news":          ["view", "create", "update", "delete"],
  "emails":        ["view", "create", "update", "delete"]
}
```

---

## 3. Create Admin with Specific Permissions
**POST** `/api/admin/admins`

> Super Admin only

Headers:
```
Authorization: Bearer <super_admin_token>
Content-Type: application/json
```

Body:
```json
{
  "fullName": "Ahmed Admin",
  "email": "ahmed@otrade.ae",
  "password": "StrongPass123!",
  "permissions": [
    { "courses":       ["view", "create", "update", "delete"] },
    { "plans":         ["view"] },
    { "webinars":      ["view", "create", "update", "delete"] },
    { "psychology":    ["view", "create", "update", "delete"] },
    { "analysis":      ["view", "create", "update", "delete"] },
    { "users":         ["view"] },
    { "admins":        [] },
    { "subscriptions": ["view"] },
    { "support":       ["view", "update"] },
    { "calendar":      ["view", "create", "update", "delete"] },
    { "strategies":    ["view", "create", "update", "delete"] },
    { "testimonials":  ["view", "create", "update", "delete"] },
    { "books":         ["view", "create", "update", "delete"] },
    { "articles":      ["view", "create", "update", "delete"] },
    { "partners":      ["view", "create", "update", "delete"] },
    { "brokers":       ["view", "create", "update", "delete"] },
    { "news":          ["view", "create", "update", "delete"] },
    { "emails":        ["view", "create", "update", "delete"] }
  ]
}
```

---

## 4. Update Admin Permissions
**PUT** `/api/admin/admins/:id`

> Super Admin only

Headers:
```
Authorization: Bearer <super_admin_token>
Content-Type: application/json
```

Body:
```json
{
  "permissions": [
    { "courses":       ["view"] },
    { "plans":         [] },
    { "webinars":      ["view", "create"] },
    { "psychology":    ["view"] },
    { "analysis":      ["view", "create", "update", "delete"] },
    { "users":         [] },
    { "admins":        [] },
    { "subscriptions": [] },
    { "support":       ["view"] },
    { "calendar":      ["view"] },
    { "strategies":    ["view"] },
    { "testimonials":  ["view", "create", "update", "delete"] },
    { "books":         ["view"] },
    { "articles":      ["view"] },
    { "partners":      ["view"] },
    { "brokers":       ["view"] },
    { "news":          ["view"] },
    { "emails":        [] }
  ]
}
```
