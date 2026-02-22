# User Management System - Postman Examples

## 📋 Overview

نظام إدارة المستخدمين يوفر endpoints للـ Admin لإدارة المستخدمين واشتراكاتهم.

**Base URL:** `/api/user`

---

## 1. Get All Users (with Plans & Newsletter Info)

### Endpoint
```
GET http://localhost:3000/api/user
```

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Response (Success - 200)
```json
{
  "success": true,
  "count": 3,
  "users": [
    {
      "id": "65d1234567890abcdef12345",
      "name": "Ahmed Mohamed",
      "email": "ahmed@example.com",
      "profileImage": "https://otrade.b-cdn.net/profiles/ahmed.jpg",
      "role": "user",
      "subscriptionPlan": "pro",
      "subscriptionStatus": "active",
      "subscriptionExpiry": "2024-12-31T00:00:00.000Z",
      "subscribedPlans": [
        {
          "_id": "65d1234567890abcdef11111",
          "name": "Pro Plan",
          "price": 99,
          "duration": "monthly"
        },
        {
          "_id": "65d1234567890abcdef22222",
          "name": "Master Plan",
          "price": 199,
          "duration": "monthly"
        }
      ],
      "activeSubscriptions": [
        {
          "type": "monthly",
          "startDate": "2024-01-01T00:00:00.000Z",
          "endDate": "2024-12-31T00:00:00.000Z"
        }
      ],
      "isNewsletterSubscribed": true,
      "createdAt": "2024-01-01T10:30:00.000Z",
      "updatedAt": "2024-02-22T15:45:00.000Z"
    },
    {
      "id": "65d1234567890abcdef12346",
      "name": "Sara Ali",
      "email": "sara@example.com",
      "profileImage": null,
      "role": "user",
      "subscriptionPlan": "free",
      "subscriptionStatus": "inactive",
      "subscriptionExpiry": null,
      "subscribedPlans": [],
      "activeSubscriptions": [],
      "isNewsletterSubscribed": false,
      "createdAt": "2024-02-15T08:20:00.000Z",
      "updatedAt": "2024-02-15T08:20:00.000Z"
    },
    {
      "id": "65d1234567890abcdef12347",
      "name": "Mohamed Hassan",
      "email": "mohamed@example.com",
      "profileImage": "https://otrade.b-cdn.net/profiles/mohamed.jpg",
      "role": "admin",
      "subscriptionPlan": "otrade",
      "subscriptionStatus": "active",
      "subscriptionExpiry": "2025-12-31T00:00:00.000Z",
      "subscribedPlans": [
        {
          "_id": "65d1234567890abcdef33333",
          "name": "OTrade Plan",
          "price": 299,
          "duration": "yearly"
        }
      ],
      "activeSubscriptions": [
        {
          "type": "yearly",
          "startDate": "2024-01-01T00:00:00.000Z",
          "endDate": "2025-12-31T00:00:00.000Z"
        }
      ],
      "isNewsletterSubscribed": true,
      "createdAt": "2023-12-01T12:00:00.000Z",
      "updatedAt": "2024-02-20T09:15:00.000Z"
    }
  ]
}
```

### Notes
- `subscribedPlans`: جميع الـ plans اللي اليوزر مشترك فيها
- `activeSubscriptions`: الاشتراكات النشطة حالياً مع تواريخها
- `isNewsletterSubscribed`: هل اليوزر مشترك في الـ newsletter
- `subscriptionStatus`: حالة الاشتراك (active/inactive)
- `subscriptionExpiry`: تاريخ انتهاء الاشتراك

---

## 2. Get User by ID

### Endpoint
```
GET http://localhost:3000/api/user/:id
```

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Example
```
GET http://localhost:3000/api/user/65d1234567890abcdef12345
```

### Response (Success - 200)
```json
{
  "user": {
    "_id": "65d1234567890abcdef12345",
    "name": "Ahmed Mohamed",
    "email": "ahmed@example.com",
    "profileImage": "https://otrade.b-cdn.net/profiles/ahmed.jpg",
    "role": "user",
    "subscriptionPlan": "pro",
    "subscriptionStatus": "active",
    "subscriptionExpiry": "2024-12-31T00:00:00.000Z",
    "subscribedPlans": [
      "65d1234567890abcdef11111",
      "65d1234567890abcdef22222"
    ],
    "subscription": {
      "plan": "65d1234567890abcdef11111",
      "duration": "monthly",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T00:00:00.000Z"
    },
    "createdAt": "2024-01-01T10:30:00.000Z",
    "updatedAt": "2024-02-22T15:45:00.000Z"
  }
}
```

---

## 3. Get Current User Profile

### Endpoint
```
GET http://localhost:3000/api/user/profile
```

### Headers
```
Authorization: Bearer YOUR_USER_TOKEN
```

### Response (Success - 200)
```json
{
  "user": {
    "id": "65d1234567890abcdef12345",
    "name": "Ahmed Mohamed",
    "email": "ahmed@example.com",
    "role": "user",
    "subscriptionStatus": "active",
    "subscriptionExpiry": "2024-12-31T00:00:00.000Z",
    "createdAt": "2024-01-01T10:30:00.000Z",
    "updatedAt": "2024-02-22T15:45:00.000Z"
  }
}
```

---

## 4. Admin Subscribe User to Plan

يسمح للـ Admin بإشتراك أي user في أي plan متاح.

### Endpoint
```
POST http://localhost:3000/api/user/:userId/subscribe
```

### Headers
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

### Body (JSON)
```json
{
  "planId": "65d1234567890abcdef11111",
  "duration": "monthly"
}
```

### Parameters
- `userId` (in URL): ID الـ user اللي هيتم اشتراكه
- `planId` (in body): ID الـ plan اللي هيشترك فيه
- `duration` (in body): مدة الاشتراك (`monthly` أو `yearly`)

### Example
```
POST http://localhost:3000/api/user/65d1234567890abcdef12345/subscribe
```

Body:
```json
{
  "planId": "65d1234567890abcdef11111",
  "duration": "monthly"
}
```

### Response (Success - 201)
```json
{
  "success": true,
  "message": "User subscribed to plan successfully",
  "data": {
    "subscription": {
      "id": "65d1234567890abcdef99999",
      "userId": "65d1234567890abcdef12345",
      "type": "monthly",
      "startDate": "2024-02-22T10:00:00.000Z",
      "endDate": "2024-03-22T10:00:00.000Z",
      "status": "active"
    },
    "plan": {
      "id": "65d1234567890abcdef11111",
      "key": "pro",
      "title": {
        "en": "Pro Plan",
        "ar": "خطة برو"
      }
    },
    "user": {
      "id": "65d1234567890abcdef12345",
      "name": "Ahmed Mohamed",
      "email": "ahmed@example.com",
      "subscriptionPlan": "pro",
      "subscriptionStatus": "active",
      "subscriptionExpiry": "2024-03-22T10:00:00.000Z"
    }
  }
}
```

### Duration Calculation
- **monthly**: يضيف شهر واحد من تاريخ الاشتراك
- **yearly**: يضيف سنة كاملة من تاريخ الاشتراك

---

## 📝 Complete Workflow Example

### Step 1: Get All Users
```
GET http://localhost:3000/api/user
Authorization: Bearer ADMIN_TOKEN
```

### Step 2: Find User to Subscribe
من الـ response، اختار الـ user اللي عايز تشتركه:
```json
{
  "id": "65d1234567890abcdef12345",
  "name": "Ahmed Mohamed",
  "email": "ahmed@example.com",
  "subscriptionStatus": "inactive"
}
```

### Step 3: Get Available Plans
```
GET http://localhost:3000/api/plans
```

### Step 4: Subscribe User to Plan
```
POST http://localhost:3000/api/user/65d1234567890abcdef12345/subscribe
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
```

Body:
```json
{
  "planId": "65d1234567890abcdef11111",
  "duration": "monthly"
}
```

### Step 5: Verify Subscription
```
GET http://localhost:3000/api/user/65d1234567890abcdef12345
Authorization: Bearer ADMIN_TOKEN
```

الـ response هيوضح إن اليوزر دلوقتي مشترك:
```json
{
  "user": {
    "subscriptionPlan": "pro",
    "subscriptionStatus": "active",
    "subscriptionExpiry": "2024-03-22T10:00:00.000Z",
    "subscribedPlans": ["65d1234567890abcdef11111"]
  }
}
```

---

## 🔑 Important Notes

### Permissions Required
- **Get All Users**: `users:view` permission
- **Get User by ID**: `users:view` permission
- **Subscribe User to Plan**: `subscriptions:create` permission

### Roles
- **Admin** و **Super Admin** فقط يمكنهم:
  - عرض جميع المستخدمين
  - عرض تفاصيل أي مستخدم
  - إشتراك المستخدمين في الـ plans

### User Information Returned
- **Basic Info**: name, email, role, profileImage
- **Subscription Info**: status, expiry, current plan
- **Plans**: جميع الـ plans المشترك فيها
- **Active Subscriptions**: الاشتراكات النشطة مع تواريخها
- **Newsletter**: هل مشترك في الـ newsletter

### Subscribe User Notes
1. يتم إنشاء subscription جديد في الـ database
2. يتم تحديث الـ user's `subscribedPlans` array
3. يتم تحديث الـ user's `subscription` object
4. يتم تحديث الـ `subscriptionPlan` بناءً على key أو title الـ plan:
   - Plan key/title contains "pro" → `subscriptionPlan: "pro"`
   - Plan key/title contains "master" → `subscriptionPlan: "master"`
   - Plan key/title contains "otrade" → `subscriptionPlan: "otrade"`
   - Otherwise → `subscriptionPlan: "free"`
5. يتم تحديث الـ `subscriptionStatus` إلى `active`
6. يتم حساب الـ `subscriptionExpiry` بناءً على الـ duration

---

## 🎯 Testing Checklist

### Get All Users
- [ ] Get all users as admin
- [ ] Verify subscribedPlans are populated
- [ ] Verify activeSubscriptions are shown
- [ ] Verify isNewsletterSubscribed is correct
- [ ] Try as regular user (should fail)

### Get User by ID
- [ ] Get user by valid ID
- [ ] Try with invalid ID (should fail)
- [ ] Try as regular user (should fail)

### Get Profile
- [ ] Get own profile as user
- [ ] Verify password is not returned

### Subscribe User to Plan
- [ ] Subscribe user to monthly plan
- [ ] Subscribe user to yearly plan
- [ ] Try with invalid user ID (should fail)
- [ ] Try with invalid plan ID (should fail)
- [ ] Try with invalid duration (should fail)
- [ ] Try as regular user (should fail)
- [ ] Verify subscription dates are correct
- [ ] Verify user status updated to active

---

## 💡 Use Cases

### 1. Admin Dashboard - View All Users
```
GET /api/user
Authorization: Bearer ADMIN_TOKEN
```
يعرض جميع المستخدمين مع معلومات الاشتراكات والـ newsletter

### 2. Admin - Subscribe Free User to Plan
```
POST /api/user/USER_ID/subscribe
Authorization: Bearer ADMIN_TOKEN
```
Body:
```json
{
  "planId": "PLAN_ID",
  "duration": "monthly"
}
```

### 3. Admin - Extend User Subscription
نفس الـ endpoint، بس بـ plan جديد أو نفس الـ plan:
```
POST /api/user/USER_ID/subscribe
```

### 4. User - Check Own Profile
```
GET /api/user/profile
Authorization: Bearer USER_TOKEN
```

---

## 🚀 Quick Start (cURL)

### Get All Users
```bash
curl -X GET http://localhost:3000/api/user \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Subscribe User to Plan
```bash
curl -X POST http://localhost:3000/api/user/USER_ID/subscribe \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "PLAN_ID",
    "duration": "monthly"
  }'
```

### Get User Profile
```bash
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

---

## 📊 Response Fields Explanation

### subscribedPlans
Array من الـ plans اللي اليوزر مشترك فيها (populated with plan details)

### activeSubscriptions
Array من الاشتراكات النشطة حالياً مع:
- `type`: نوع الاشتراك (monthly/yearly)
- `startDate`: تاريخ بداية الاشتراك
- `endDate`: تاريخ نهاية الاشتراك

### isNewsletterSubscribed
Boolean يوضح هل الـ email بتاع اليوزر موجود في الـ newsletter subscriptions

### subscriptionStatus
- `active`: الاشتراك نشط
- `inactive`: لا يوجد اشتراك نشط

### subscriptionExpiry
تاريخ انتهاء الاشتراك الحالي (null إذا لم يكن هناك اشتراك)

