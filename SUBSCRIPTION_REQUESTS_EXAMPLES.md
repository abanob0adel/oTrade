# Subscription Requests API Examples

## Overview
نظام طلبات الاشتراك يسمح للمستخدمين بطلب الاشتراك في خطة معينة، ثم يقوم الأدمن بالموافقة أو الرفض.

---

## 1. Create Subscription Request (User)
**Endpoint:** `POST /api/subscription-requests`  
**Auth:** Bearer Token (User)

### Request Body:
```json
{
  "planId": "65f8a1b2c3d4e5f6a7b8c9d0",
  "duration": "monthly"
}
```

**Duration Options:**
- `monthly` - شهر واحد
- `quarterly` - 3 أشهر
- `semiAnnual` - 6 أشهر
- `yearly` - سنة

**Note:** السعر يتم حسابه تلقائياً من الخطة حسب الفترة المختارة

### Response (201):
```json
{
  "success": true,
  "message": "Subscription request created successfully",
  "data": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d1",
    "user": {
      "id": "65f8a1b2c3d4e5f6a7b8c9d2",
      "name": "Ahmed Ali",
      "email": "ahmed@example.com",
      "phone": "+201234567890",
      "profileImage": "https://cdn.example.com/profile.jpg"
    },
    "plan": {
      "id": "65f8a1b2c3d4e5f6a7b8c9d0",
      "key": "pro",
      "translations": {
        "en": {
          "title": "Pro Plan",
          "description": "Professional trading features"
        },
        "ar": {
          "title": "خطة برو",
          "description": "ميزات التداول الاحترافية"
        }
      }
    },
    "duration": "monthly",
    "price": 49,
    "status": "pending",
    "createdAt": "2024-03-20T10:00:00.000Z"
  }
}
```

---

## 2. Get My Subscription Requests (User)
**Endpoint:** `GET /api/subscription-requests/my-requests`  
**Auth:** Bearer Token (User)

### Response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "65f8a1b2c3d4e5f6a7b8c9d1",
      "plan": {
        "id": "65f8a1b2c3d4e5f6a7b8c9d0",
        "key": "pro",
        "translations": {
          "en": {
            "title": "Pro Plan"
          },
          "ar": {
            "title": "خطة برو"
          }
        }
      },
      "duration": "monthly",
      "price": 49,
      "status": "pending",
      "reviewedBy": null,
      "reviewedAt": null,
      "rejectionReason": null,
      "createdAt": "2024-03-20T10:00:00.000Z"
    }
  ]
}
```

---

## 3. Get All Subscription Requests (Admin)
**Endpoint:** `GET /api/subscription-requests`  
**Auth:** Bearer Token (Admin/Super Admin)

### Query Parameters:
- `status` (optional): pending, approved, rejected
- `page` (optional): Page number
- `limit` (optional): Items per page

### Example:
```
GET /api/subscription-requests?status=pending&page=1&limit=10
```

### Response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "65f8a1b2c3d4e5f6a7b8c9d1",
      "user": {
        "id": "65f8a1b2c3d4e5f6a7b8c9d2",
        "name": "Ahmed Ali",
        "email": "ahmed@example.com",
        "phone": "+201234567890",
        "profileImage": "https://cdn.example.com/profile.jpg"
      },
      "plan": {
        "id": "65f8a1b2c3d4e5f6a7b8c9d0",
        "key": "pro",
        "translations": {
          "en": {
            "title": "Pro Plan"
          },
          "ar": {
            "title": "خطة برو"
          }
        }
      },
      "duration": "monthly",
      "price": 49,
      "status": "pending",
      "reviewedBy": null,
      "reviewedAt": null,
      "rejectionReason": null,
      "createdAt": "2024-03-20T10:00:00.000Z",
      "updatedAt": "2024-03-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

---

## 4. Get Single Subscription Request (Admin)
**Endpoint:** `GET /api/subscription-requests/:id`  
**Auth:** Bearer Token (Admin/Super Admin)

### Response (200):
```json
{
  "success": true,
  "data": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d1",
    "user": {
      "id": "65f8a1b2c3d4e5f6a7b8c9d2",
      "name": "Ahmed Ali",
      "email": "ahmed@example.com",
      "phone": "+201234567890",
      "profileImage": "https://cdn.example.com/profile.jpg"
    },
    "plan": {
      "id": "65f8a1b2c3d4e5f6a7b8c9d0",
      "key": "pro",
      "translations": {
        "en": {
          "title": "Pro Plan",
          "description": "Professional trading features"
        },
        "ar": {
          "title": "خطة برو",
          "description": "ميزات التداول الاحترافية"
        }
      },
      "subscriptionOptions": {
        "monthly": {
          "price": 49,
          "enabled": true
        },
        "quarterly": {
          "price": 119,
          "enabled": true
        },
        "semiAnnual": {
          "price": 239,
          "enabled": false
        },
        "yearly": {
          "price": 399,
          "enabled": true
        }
      }
    },
    "duration": "monthly",
    "price": 49,
    "status": "pending",
    "reviewedBy": null,
    "reviewedAt": null,
    "rejectionReason": null,
    "createdAt": "2024-03-20T10:00:00.000Z",
    "updatedAt": "2024-03-20T10:00:00.000Z"
  }
}
```

---

## 5. Approve Subscription Request (Admin)
**Endpoint:** `POST /api/subscription-requests/:id/approve`  
**Auth:** Bearer Token (Admin/Super Admin)

**Note:** لا يحتاج body - الفترة والسعر محفوظين في الطلب نفسه

### Response (200):
```json
{
  "success": true,
  "message": "Subscription request approved successfully",
  "data": {
    "requestId": "65f8a1b2c3d4e5f6a7b8c9d1",
    "userId": "65f8a1b2c3d4e5f6a7b8c9d2",
    "subscriptionId": "65f8a1b2c3d4e5f6a7b8c9d3",
    "duration": "monthly",
    "status": "approved"
  }
}
```

---

## 6. Reject Subscription Request (Admin)
**Endpoint:** `POST /api/subscription-requests/:id/reject`  
**Auth:** Bearer Token (Admin/Super Admin)

### Request Body:
```json
{
  "reason": "معلومات الدفع غير صحيحة"
}
```

### Response (200):
```json
{
  "success": true,
  "message": "Subscription request rejected",
  "data": {
    "requestId": "65f8a1b2c3d4e5f6a7b8c9d1",
    "status": "rejected"
  }
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "error": "Valid plan ID is required"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "error": "Subscription request not found"
}
```

### 400 - Already Exists
```json
{
  "success": false,
  "error": "You already have a pending request for this plan"
}
```

### 400 - Already Processed
```json
{
  "success": false,
  "error": "Request is already approved"
}
```

---

## Workflow

### User Flow:
1. User logs in and gets token
2. User views available plans: `GET /api/plans`
3. User selects plan and duration (monthly, quarterly, etc.)
4. User creates subscription request with planId and duration: `POST /api/subscription-requests`
5. User can check their requests: `GET /api/subscription-requests/my-requests`

### Admin Flow:
1. Admin logs in and gets token
2. Admin views all pending requests: `GET /api/subscription-requests?status=pending`
3. Admin views specific request details (including user contact info and selected duration/price): `GET /api/subscription-requests/:id`
4. Admin approves or rejects:
   - Approve: `POST /api/subscription-requests/:id/approve` (no body needed)
   - Reject: `POST /api/subscription-requests/:id/reject`

---

## Notes

- المستخدم يختار الفترة (monthly, quarterly, semiAnnual, yearly) والسعر يُحسب تلقائياً
- المستخدم لا يمكنه إنشاء أكثر من طلب واحد pending لنفس الخطة
- عند الموافقة، يتم تفعيل الاشتراك تلقائياً للمستخدم بالفترة والسعر المحددين في الطلب
- الأدمن لا يحتاج لإرسال duration عند الموافقة - يتم استخدام الفترة من الطلب نفسه
- يتم حفظ معلومات من قام بالموافقة/الرفض والتاريخ
- يمكن للأدمن رؤية بيانات المستخدم الكاملة للتواصل معه
