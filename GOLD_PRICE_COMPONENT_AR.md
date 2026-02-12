# 🏆 Gold Price Live Component - دليل الاستخدام

## المكونات المُنشأة

### 1. `GoldPriceCard.jsx` - الكومبوننت الرئيسي
Component احترافي لعرض سعر الذهب live مع auto-refresh كل 30 ثانية.

### 2. `GoldPriceCard.css` - التصميم
تصميم احترافي بستايل trading platform مع animations وتأثيرات.

### 3. `GoldPriceExample.jsx` - مثال الاستخدام
مثال على كيفية استخدام الكومبوننت في التطبيق.

---

## ✨ المميزات

### 🔄 Auto-Refresh
- يجلب السعر تلقائياً كل 30 ثانية
- يعرض وقت آخر تحديث (relative time)
- مؤشر "Live" متحرك

### 📊 عرض البيانات
- السعر الحالي للذهب (XAU/USD)
- العملة (USD)
- وقت آخر تحديث
- تنسيق الأرقام بالفواصل (1,234.56)

### 🎨 حالات مختلفة
- **Loading State**: Spinner أثناء التحميل
- **Success State**: عرض السعر مع animations
- **Error State**: رسالة خطأ مع زر Retry

### 🎯 تصميم احترافي
- Gradient backgrounds
- Smooth animations
- Hover effects
- Responsive design
- Dark mode support

---

## 🚀 كيفية الاستخدام

### 1. نسخ الملفات

```bash
# نسخ الملفات لمشروعك
src/
  components/
    GoldPriceCard/
      GoldPriceCard.jsx
      GoldPriceCard.css
```

### 2. استيراد الكومبوننت

```jsx
import GoldPriceCard from './components/GoldPriceCard/GoldPriceCard';

function App() {
  return (
    <div className="app">
      <GoldPriceCard />
    </div>
  );
}
```

### 3. تشغيل المشروع

```bash
npm start
# أو
yarn start
```

---

## 📡 API المستخدم

### Endpoint
```
GET https://api.gold-api.com/price/XAU
```

### Response Format
```json
{
  "price": 2034.56,
  "currency": "USD",
  "updatedAt": "2026-02-11T10:30:00Z"
}
```

### معدل التحديث
- Auto-refresh كل 30 ثانية
- يمكن تغييره من الكود (سطر 48)

---

## 🎨 التخصيص

### تغيير معدل التحديث

```jsx
// في GoldPriceCard.jsx - سطر 48
const interval = setInterval(() => {
  fetchGoldPrice();
}, 30000); // 30 ثانية

// غيره لـ 60 ثانية:
}, 60000); // 60 ثانية
```

### تغيير الألوان

```css
/* في GoldPriceCard.css */

/* لون الذهب */
.currency-symbol {
  color: #ffd700; /* غير اللون هنا */
}

/* لون الخلفية */
.gold-price-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  /* غير الـ gradient هنا */
}
```

### تغيير حجم الكارت

```css
.gold-price-card {
  max-width: 400px; /* غير العرض هنا */
  padding: 24px;    /* غير الـ padding هنا */
}
```

---

## 🔧 الكود الداخلي

### State Management

```jsx
const [goldData, setGoldData] = useState(null);      // بيانات الذهب
const [loading, setLoading] = useState(true);        // حالة التحميل
const [error, setError] = useState(null);            // حالة الخطأ
const [lastUpdate, setLastUpdate] = useState(null);  // وقت آخر تحديث
```

### Fetch Function

```jsx
const fetchGoldPrice = useCallback(async () => {
  try {
    const response = await fetch('https://api.gold-api.com/price/XAU');
    const data = await response.json();
    
    setGoldData({
      price: data.price,
      currency: data.currency,
      updatedAt: data.updatedAt
    });
    
    setLastUpdate(new Date());
    setLoading(false);
  } catch (err) {
    setError('Failed to load gold price');
    setLoading(false);
  }
}, []);
```

### Auto-Refresh Logic

```jsx
useEffect(() => {
  // Fetch فوراً عند التحميل
  fetchGoldPrice();

  // Auto-refresh كل 30 ثانية
  const interval = setInterval(() => {
    fetchGoldPrice();
  }, 30000);

  // Cleanup عند unmount
  return () => clearInterval(interval);
}, [fetchGoldPrice]);
```

---

## 🎯 الحالات المختلفة

### 1. Loading State

```jsx
if (loading) {
  return (
    <div className="gold-price-card loading">
      <div className="spinner"></div>
      <p>Loading gold price...</p>
    </div>
  );
}
```

### 2. Error State

```jsx
if (error) {
  return (
    <div className="gold-price-card error">
      <div className="error-icon">⚠️</div>
      <p className="error-message">{error}</p>
      <button onClick={fetchGoldPrice} className="retry-btn">
        Retry
      </button>
    </div>
  );
}
```

### 3. Success State

```jsx
return (
  <div className="gold-price-card">
    <div className="card-header">
      <div className="gold-icon">🏆</div>
      <h3>Gold Price (XAU/USD)</h3>
    </div>

    <div className="price-section">
      <div className="price-value">
        <span className="currency-symbol">$</span>
        <span className="price">{formatPrice(goldData.price)}</span>
      </div>
    </div>

    <div className="card-footer">
      <div className="update-info">
        Updated {formatTime(lastUpdate)}
      </div>
      <div className="live-indicator">
        <span className="live-dot"></span>
        <span>Live</span>
      </div>
    </div>
  </div>
);
```

---

## 🎨 Animations

### 1. Shimmer Effect (الخط الذهبي العلوي)

```css
@keyframes shimmer {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
```

### 2. Pulse Effect (النقطة الخضراء)

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}
```

### 3. Rotate Effect (أيقونة التحديث)

```css
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### 4. Spinner (أثناء التحميل)

```css
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## 📱 Responsive Design

### Desktop (> 480px)
- عرض كامل: 400px
- سعر كبير: 48px
- Footer أفقي

### Mobile (≤ 480px)
- عرض كامل: 100%
- سعر متوسط: 40px
- Footer عمودي

```css
@media (max-width: 480px) {
  .gold-price-card {
    padding: 20px;
    max-width: 100%;
  }

  .price {
    font-size: 40px;
  }

  .card-footer {
    flex-direction: column;
    gap: 12px;
  }
}
```

---

## 🌙 Dark Mode Support

```css
@media (prefers-color-scheme: light) {
  .gold-price-card {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  }

  .card-title,
  .price {
    color: #1a1a2e;
  }
}
```

---

## 🔍 Helper Functions

### 1. Format Price (تنسيق السعر)

```jsx
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

// Input: 2034.5
// Output: "2,034.50"
```

### 2. Format Time (تنسيق الوقت)

```jsx
const formatTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Examples:
// 15s ago
// 2m ago
// 10:30 AM
```

---

## 🚨 Error Handling

### Network Errors

```jsx
try {
  const response = await fetch('https://api.gold-api.com/price/XAU');
  
  if (!response.ok) {
    throw new Error('Failed to fetch gold price');
  }
  
  const data = await response.json();
  // ...
} catch (err) {
  console.error('Gold API Error:', err);
  setError('Failed to load gold price');
}
```

### Retry Mechanism

```jsx
<button onClick={fetchGoldPrice} className="retry-btn">
  Retry
</button>
```

---

## 🎯 Best Practices

### 1. useCallback للـ Fetch Function
```jsx
const fetchGoldPrice = useCallback(async () => {
  // ...
}, []);
```
يمنع إعادة إنشاء الـ function في كل render.

### 2. Cleanup في useEffect
```jsx
return () => clearInterval(interval);
```
يوقف الـ interval عند unmount.

### 3. Error Handling
```jsx
try {
  // fetch logic
} catch (err) {
  // error handling
}
```
يمنع crash التطبيق.

### 4. Loading State
```jsx
if (loading) return <LoadingComponent />;
```
يحسن UX أثناء التحميل.

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

لا يحتاج libraries إضافية! ✅

---

## 🧪 Testing

### Test في المتصفح

1. افتح المشروع
2. شوف الكارت يظهر مع loading spinner
3. بعد ثواني، السعر يظهر
4. انتظر 30 ثانية، السعر يتحدث تلقائياً
5. افصل الإنترنت، شوف error message
6. اضغط Retry، السعر يرجع

### Console Logs

```jsx
console.log('Gold Data:', goldData);
console.log('Last Update:', lastUpdate);
console.log('Error:', error);
```

---

## 🎨 مثال كامل للاستخدام

```jsx
import React from 'react';
import GoldPriceCard from './components/GoldPriceCard/GoldPriceCard';
import './App.css';

function App() {
  return (
    <div className="trading-dashboard">
      <header>
        <h1>Trading Platform</h1>
      </header>

      <main>
        <div className="cards-container">
          {/* Gold Price Card */}
          <GoldPriceCard />

          {/* يمكنك إضافة كروت أخرى */}
          <div className="other-cards">
            {/* Bitcoin, Stocks, etc. */}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
```

---

## ✅ الخلاصة

### ما تم إنشاؤه:
- ✅ Component احترافي لعرض سعر الذهب
- ✅ Auto-refresh كل 30 ثانية
- ✅ Loading, Error, Success states
- ✅ تصميم modern مع animations
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Clean & reusable code

### الملفات:
1. `GoldPriceCard.jsx` - الكومبوننت
2. `GoldPriceCard.css` - التصميم
3. `GoldPriceExample.jsx` - مثال الاستخدام
4. `GOLD_PRICE_COMPONENT_AR.md` - الدليل (هذا الملف)

### الاستخدام:
```jsx
import GoldPriceCard from './GoldPriceCard';

<GoldPriceCard />
```

**جاهز للاستخدام في production! 🚀**

---

**آخر تحديث:** 11 فبراير 2026
