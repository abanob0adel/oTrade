# Email Sender System - Postman Examples

## نظرة عامة
نظام إرسال البريد الإلكتروني الجماعي باستخدام Resend مع خيارات متعددة للمستلمين.

---

## 1️⃣ الحصول على عدد المستلمين

### 1.1 عدد جميع المستخدمين
```
POST http://localhost:3000/api/emails/recipients/count
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "recipientType": "all"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recipientType": "all",
    "count": 150
  }
}
```

---

### 1.2 عدد المشتركين فقط
```
POST http://localhost:3000/api/emails/recipients/count
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "recipientType": "subscribed"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recipientType": "subscribed",
    "count": 45
  }
}
```

---

### 1.3 عدد غير المشتركين
```
POST http://localhost:3000/api/emails/recipients/count
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "recipientType": "unsubscribed"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recipientType": "unsubscribed",
    "count": 105
  }
}
```

---

### 1.4 عدد المستخدمين المحددين
```
POST http://localhost:3000/api/emails/recipients/count
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "recipientType": "selected",
  "selectedUserIds": [
    "65f1234567890abcdef12345",
    "65f1234567890abcdef12346",
    "65f1234567890abcdef12347"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recipientType": "selected",
    "count": 3
  }
}
```

---

## 2️⃣ الحصول على قائمة المستخدمين

```
GET http://localhost:3000/api/emails/users
Authorization: Bearer {{admin_token}}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1234567890abcdef12345",
      "name": "Ahmed Mohamed",
      "email": "ahmed@example.com",
      "subscriptionStatus": "active"
    },
    {
      "_id": "65f1234567890abcdef12346",
      "name": "Sara Ali",
      "email": "sara@example.com",
      "subscriptionStatus": "inactive"
    }
  ]
}
```

---

## 3️⃣ إرسال البريد الإلكتروني

### 3.1 إرسال لجميع المستخدمين
```
POST http://localhost:3000/api/emails/send
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "subject": "عرض خاص - خصم 50% على جميع الباقات",
  "htmlContent": "<html><body><h1>مرحباً بك في OTrade</h1><p>نقدم لك عرض خاص بخصم 50% على جميع باقات الاشتراك.</p><a href='https://otrade.com/plans'>اشترك الآن</a></body></html>",
  "recipientType": "all"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent to 150 recipients in 3 batches",
  "data": {
    "totalRecipients": 150,
    "totalBatches": 3,
    "successfulBatches": 3,
    "failedBatches": 0,
    "results": [
      {
        "batch": 1,
        "data": {
          "id": "abc123..."
        }
      },
      {
        "batch": 2,
        "data": {
          "id": "def456..."
        }
      },
      {
        "batch": 3,
        "data": {
          "id": "ghi789..."
        }
      }
    ]
  }
}
```

---

### 3.2 إرسال للمشتركين فقط
```
POST http://localhost:3000/api/emails/send
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "subject": "تحديثات حصرية للمشتركين",
  "htmlContent": "<html><body><h1>محتوى حصري</h1><p>شكراً لاشتراكك معنا! إليك آخر التحديثات...</p></body></html>",
  "recipientType": "subscribed"
}
```

---

### 3.3 إرسال لغير المشتركين
```
POST http://localhost:3000/api/emails/send
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "subject": "اشترك الآن واحصل على 7 أيام مجاناً",
  "htmlContent": "<html><body><h1>جرب OTrade مجاناً</h1><p>احصل على 7 أيام تجريبية مجانية عند الاشتراك الآن.</p><a href='https://otrade.com/signup'>ابدأ الآن</a></body></html>",
  "recipientType": "unsubscribed"
}
```

---

### 3.4 إرسال لمستخدمين محددين
```
POST http://localhost:3000/api/emails/send
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "subject": "رسالة خاصة",
  "htmlContent": "<html><body><h1>رسالة مخصصة</h1><p>هذه رسالة خاصة لك...</p></body></html>",
  "recipientType": "selected",
  "selectedUserIds": [
    "65f1234567890abcdef12345",
    "65f1234567890abcdef12346",
    "65f1234567890abcdef12347"
  ]
}
```

---

## 4️⃣ أمثلة HTML Content

### مثال 1: بريد ترحيبي
```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
    .container { background-color: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; }
    .header { text-align: center; color: #2c3e50; }
    .button { display: inline-block; padding: 15px 30px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; color: #7f8c8d; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="header">مرحباً بك في OTrade</h1>
    <p>نحن سعداء بانضمامك إلى منصتنا للتداول والتحليل المالي.</p>
    <p>ابدأ رحلتك الآن واستفد من:</p>
    <ul>
      <li>تحليلات يومية للأسواق</li>
      <li>استراتيجيات تداول احترافية</li>
      <li>دورات تعليمية شاملة</li>
      <li>دعم فني على مدار الساعة</li>
    </ul>
    <center>
      <a href="https://otrade.com/dashboard" class="button">ابدأ الآن</a>
    </center>
    <div class="footer">
      <p>© 2024 OTrade. جميع الحقوق محفوظة.</p>
      <p>إذا كنت لا ترغب في تلقي هذه الرسائل، <a href="#">إلغاء الاشتراك</a></p>
    </div>
  </div>
</body>
</html>
```

---

### مثال 2: إعلان عن تحليل جديد
```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #ecf0f1; padding: 20px; }
    .container { background-color: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .badge { background-color: #e74c3c; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; display: inline-block; margin-bottom: 15px; }
    .title { color: #2c3e50; font-size: 24px; margin: 15px 0; }
    .image { width: 100%; border-radius: 8px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 25px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">جديد</span>
    <h2 class="title">تحليل السوق السعودي - الربع الأول 2024</h2>
    <img src="https://otrade.b-cdn.net/market-analysis/gulf-stocks/cover.jpg" alt="تحليل السوق" class="image">
    <p>تم نشر تحليل شامل جديد لسوق الأسهم السعودي يتضمن:</p>
    <ul>
      <li>توقعات الأداء للربع القادم</li>
      <li>أفضل الفرص الاستثمارية</li>
      <li>تحليل فني مفصل للمؤشرات</li>
    </ul>
    <center>
      <a href="https://otrade.com/analysis/saudi-market-q1-2024" class="button">اقرأ التحليل الكامل</a>
    </center>
  </div>
</body>
</html>
```

---

### مثال 3: تذكير بانتهاء الاشتراك
```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px; }
    .container { background-color: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; border-top: 4px solid #f39c12; }
    .warning { background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 25px; background-color: #f39c12; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>تذكير: اشتراكك على وشك الانتهاء</h2>
    <div class="warning">
      <strong>⚠️ تنبيه:</strong> اشتراكك في OTrade سينتهي خلال 3 أيام.
    </div>
    <p>لا تفوت الفرصة! جدد اشتراكك الآن واستمر في الاستفادة من:</p>
    <ul>
      <li>التحليلات اليومية الحصرية</li>
      <li>الاستراتيجيات المتقدمة</li>
      <li>الدعم الفني المباشر</li>
    </ul>
    <center>
      <a href="https://otrade.com/renew" class="button">جدد الاشتراك الآن</a>
    </center>
  </div>
</body>
</html>
```

---

## 5️⃣ ملاحظات مهمة

### أنواع المستلمين (recipientType)
- `all`: جميع المستخدمين المسجلين
- `subscribed`: المستخدمين الذين لديهم اشتراك نشط فقط
- `unsubscribed`: المستخدمين الذين ليس لديهم اشتراك نشط
- `selected`: مستخدمين محددين بالـ IDs

### حدود Resend
- الحد الأقصى لكل batch: 50 مستلم
- النظام يقسم المستلمين تلقائياً إلى batches
- كل batch يرسل بشكل منفصل

### الصلاحيات
- جميع endpoints تحتاج Admin authentication
- استخدم Admin token في الـ Authorization header

### HTML Content
- يمكن استخدام HTML كامل مع CSS
- يفضل استخدام inline styles للتوافق مع email clients
- تأكد من اختبار الـ HTML في email clients مختلفة

### Best Practices
1. اختبر الـ HTML content قبل الإرسال
2. استخدم `recipients/count` للتحقق من عدد المستلمين قبل الإرسال
3. استخدم subject واضح وجذاب
4. أضف unsubscribe link في footer
5. استخدم responsive design للـ HTML

---

## 6️⃣ أخطاء شائعة

### خطأ: Missing required fields
```json
{
  "success": false,
  "error": "Subject and HTML content are required"
}
```
**الحل:** تأكد من إرسال subject و htmlContent

### خطأ: Invalid recipient type
```json
{
  "success": false,
  "error": "Invalid recipient type. Must be: all, subscribed, unsubscribed, or selected"
}
```
**الحل:** استخدم أحد القيم الصحيحة للـ recipientType

### خطأ: No recipients found
```json
{
  "success": false,
  "error": "No recipients found for the selected criteria"
}
```
**الحل:** تحقق من وجود مستخدمين يطابقون المعايير المحددة

### خطأ: Selected user IDs required
```json
{
  "success": false,
  "error": "Selected user IDs are required when recipientType is \"selected\""
}
```
**الحل:** أرسل selectedUserIds array عند استخدام recipientType: "selected"
