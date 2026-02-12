# 🏆 Gold Price Component - Quick Start

## What You Get

A professional, production-ready React component that displays live gold prices (XAU/USD) with auto-refresh every 30 seconds.

---

## Features

✅ Auto-refresh every 30 seconds  
✅ Real-time gold price (XAU/USD)  
✅ Loading, Error, and Success states  
✅ Professional trading platform design  
✅ Smooth animations and transitions  
✅ Responsive design (mobile + desktop)  
✅ Dark mode support  
✅ Clean, reusable code  

---

## Quick Setup

### 1. Copy Files

```
src/
  components/
    GoldPriceCard/
      GoldPriceCard.jsx
      GoldPriceCard.css
```

### 2. Import & Use

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

### 3. Run

```bash
npm start
```

That's it! 🚀

---

## API Used

**Endpoint:** `https://api.gold-api.com/price/XAU`

**Response:**
```json
{
  "price": 2034.56,
  "currency": "USD",
  "updatedAt": "2026-02-11T10:30:00Z"
}
```

**Update Frequency:** Every 30 seconds (configurable)

---

## Component States

### 1. Loading
Shows spinner while fetching data

### 2. Success
Displays:
- Current gold price ($2,034.56)
- Currency (USD)
- Last update time (2m ago)
- Live indicator (green dot)

### 3. Error
Shows error message with Retry button

---

## Customization

### Change Update Frequency

```jsx
// In GoldPriceCard.jsx - line 48
const interval = setInterval(() => {
  fetchGoldPrice();
}, 30000); // 30 seconds

// Change to 60 seconds:
}, 60000);
```

### Change Colors

```css
/* In GoldPriceCard.css */

/* Gold color */
.currency-symbol {
  color: #ffd700; /* Change here */
}

/* Background */
.gold-price-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}
```

### Change Card Size

```css
.gold-price-card {
  max-width: 400px; /* Change width */
  padding: 24px;    /* Change padding */
}
```

---

## Code Structure

### State Management
```jsx
const [goldData, setGoldData] = useState(null);      // Gold data
const [loading, setLoading] = useState(true);        // Loading state
const [error, setError] = useState(null);            // Error state
const [lastUpdate, setLastUpdate] = useState(null);  // Last update time
```

### Fetch Logic
```jsx
const fetchGoldPrice = useCallback(async () => {
  try {
    const response = await fetch('https://api.gold-api.com/price/XAU');
    const data = await response.json();
    setGoldData(data);
    setLastUpdate(new Date());
    setLoading(false);
  } catch (err) {
    setError('Failed to load gold price');
    setLoading(false);
  }
}, []);
```

### Auto-Refresh
```jsx
useEffect(() => {
  fetchGoldPrice(); // Initial fetch
  
  const interval = setInterval(() => {
    fetchGoldPrice(); // Auto-refresh
  }, 30000);
  
  return () => clearInterval(interval); // Cleanup
}, [fetchGoldPrice]);
```

---

## Animations

### Shimmer Effect
Gold line at the top of the card

### Pulse Effect
Green "Live" indicator dot

### Rotate Effect
Update icon rotation

### Hover Effect
Card lifts up on hover

---

## Responsive Design

### Desktop (> 480px)
- Full width: 400px
- Large price: 48px
- Horizontal footer

### Mobile (≤ 480px)
- Full width: 100%
- Medium price: 40px
- Vertical footer

---

## Helper Functions

### Format Price
```jsx
formatPrice(2034.5) → "2,034.50"
```

### Format Time
```jsx
formatTime(date) → "15s ago" | "2m ago" | "10:30 AM"
```

---

## Error Handling

### Network Errors
Catches fetch errors and displays error message

### Retry Mechanism
User can click "Retry" button to fetch again

### Graceful Degradation
Shows error state instead of crashing

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

No additional libraries needed! ✅

---

## Testing

1. Open app → See loading spinner
2. Wait → See gold price displayed
3. Wait 30s → Price auto-updates
4. Disconnect internet → See error message
5. Click Retry → Price loads again

---

## Files Created

1. **GoldPriceCard.jsx** - Main component
2. **GoldPriceCard.css** - Styling
3. **GoldPriceExample.jsx** - Usage example
4. **GOLD_PRICE_COMPONENT_AR.md** - Arabic documentation
5. **GOLD_PRICE_QUICK_START.md** - This file

---

## Example Usage

```jsx
import React from 'react';
import GoldPriceCard from './components/GoldPriceCard/GoldPriceCard';

function TradingDashboard() {
  return (
    <div className="dashboard">
      <h1>Trading Platform</h1>
      
      <div className="cards-grid">
        <GoldPriceCard />
        {/* Add more trading cards */}
      </div>
    </div>
  );
}

export default TradingDashboard;
```

---

## Production Ready ✅

- Clean code structure
- Error handling
- Loading states
- Responsive design
- Performance optimized
- Accessibility friendly
- Modern design

**Ready to deploy! 🚀**

---

**Last Updated:** February 11, 2026
