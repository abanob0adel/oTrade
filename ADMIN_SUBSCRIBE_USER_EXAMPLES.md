# Admin Subscribe User to Plan API

## Overview
الأدمن يمكنه اشتراك أي مستخدم في خطة معينة مباشرة بدون طلب.

---

## Endpoint
**POST** `/api/user/:userId/subscribe`

**Auth:** Bearer Token (Admin/Super Admin)

**Permissions:** `subscriptions:create`

---

## Request

### URL Parameters:
- `userId` (required): ID المستخدم

### Request Body:
```json
{
  "planId": "699d675caa09c78a3120737e",
  "duration": "monthly"
}
```

### Parameters:
- `planId` (required): ID الخطة
- `duration` (required): الفترة - يجب أن تكون واحدة من:
  - `monthly` - شهر واحد
  - `quarterly` - 3 أشهر
  - `semiAnnual` - 6 أشهر
  - `yearly` - سنة

---

## Response (201 Created)

```json
{
  "success": true,
  "message": "User subscribed to plan successfully",
  "data": {
    "subscription": {
      "id": "69a98780d4469347ed907c70",
      "userId": "69a986a2a557ced5dd4a382b",
      "planId": "699d675caa09c78a3120737e",
      "type": "monthly",
      "startDate": "2026-03-05T14:30:00.000Z",
      "endDate": "2026-04-05T14:30:00.000Z",
      "status": "active",
      "duration": "monthly"
    },
    "plan": {
      "id": "699d675caa09c78a3120737e",
      "key": "advanced_trading_strategy",
      "translations": {
        "en": {
          "title": "Advanced Pro Plan",
          "description": "Advanced Strategy Strict Management"
        },
        "ar": {
          "title": "خطة الاحتراف المتقدم",
          "description": "استراتيجية متقدمة إدارة صارمة"
        }
      },
      "price": 499
    },
    "user": {
      "id": "69a986a2a557ced5dd4a382b",
      "name": "Ahmed Ali",
      "email": "ahmed@example.com",
      "subscriptionStatus": "active"
    }
  }
}
```

---

## Error Responses

### 400 - Invalid User ID
```json
{
  "success": false,
  "error": "Invalid user ID"
}
```

### 400 - Invalid Plan ID
```json
{
  "success": false,
  "error": "Invalid plan ID"
}
```

### 400 - Invalid Duration
```json
{
  "success": false,
  "error": "Duration must be one of: monthly, quarterly, semiAnnual, yearly"
}
```

### 400 - Duration Not Available
```json
{
  "success": false,
  "error": "quarterly subscription is not available for this plan"
}
```

### 404 - User Not Found
```json
{
  "success": false,
  "error": "User not found"
}
```

### 404 - Plan Not Found
```json
{
  "success": false,
  "error": "Plan not found"
}
```

---

## Examples

### Example 1: Subscribe to Monthly Plan
```bash
POST /api/user/69a986a2a557ced5dd4a382b/subscribe
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "planId": "699d675caa09c78a3120737e",
  "duration": "monthly"
}
```

### Example 2: Subscribe to Yearly Plan
```bash
POST /api/user/69a986a2a557ced5dd4a382b/subscribe
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "planId": "699d675caa09c78a3120737e",
  "duration": "yearly"
}
```

### Example 3: Subscribe to Quarterly Plan
```bash
POST /api/user/69a986a2a557ced5dd4a382b/subscribe
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "planId": "699d675caa09c78a3120737e",
  "duration": "quarterly"
}
```

---

## Notes

- الأدمن يمكنه اشتراك أي مستخدم مباشرة بدون موافقة
- يتم التحقق من أن الفترة المختارة متاحة (enabled) في الخطة
- إذا كان المستخدم لديه subscription موجود، يتم تحديثه
- إذا لم يكن لديه subscription، يتم إنشاء واحد جديد
- التواريخ تُحسب تلقائياً بناءً على الفترة المختارة
- الـ `subscriptionStatus` يتم تحديثه إلى `active` تلقائياً
- المحتوى المرتبط بالخطة يفتح تلقائياً للمستخدم

---

## Differences from Subscription Request System

| Feature | Admin Subscribe | Subscription Request |
|---------|----------------|---------------------|
| Who initiates | Admin | User |
| Approval needed | No | Yes |
| Immediate access | Yes | After approval |
| Use case | Admin management | User self-service |
