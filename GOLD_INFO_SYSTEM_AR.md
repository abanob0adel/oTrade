# 🏆 Gold Info System - النظام الجديد

## نظرة عامة

نظام كامل لإدارة معلومات الذهب مع:
- Title
- Description  
- Cover Image
- FAQs (أسئلة وأجوبة)

---

## 📡 Endpoints

### 1. GET /api/gold/info (Public)

يجلب معلومات الذهب الكاملة

#### Request

```bash
GET /api/gold/info
```

#### Response

```json
{
  "success": true,
  "data": {
    "title": "Gold Trading",
    "description": "Gold is one of the most traded precious metals in the world...",
    "coverImage": "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80",
    "faqs": [
      {
        "_id": "...",
        "question": "What is gold trading?",
        "answer": "Gold trading involves buying and selling gold...",
        "order": 1
      },
      {
        "_id": "...",
        "question": "How to start trading gold?",
        "answer": "To start trading gold, you need...",
        "order": 2
      }
    ],
    "updatedAt": "2026-02-11T10:30:00.000Z"
  }
}
```

---

### 2. POST /api/gold/info (Admin Only)

ينشئ أو يحدث معلومات الذهب (نفس الـ endpoint للإنشاء والتعديل)

#### Request

```bash
POST /api/gold/info
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
```

#### Body

```json
{
  "title": "Gold Trading - Updated",
  "description": "New description about gold trading...",
  "coverImage": "https://new-image-url.com/gold.jpg",
  "faqs": [
    {
      "question": "What is gold?",
      "answer": "Gold is a precious metal...",
      "order": 1
    },
    {
      "question": "Why invest in gold?",
      "answer": "Gold is a safe haven asset...",
      "order": 2
    }
  ]
}
```

#### Response

```json
{
  "success": true,
  "message": "Gold information updated successfully",
  "data": {
    "title": "Gold Trading - Updated",
    "description": "New description about gold trading...",
    "coverImage": "https://new-image-url.com/gold.jpg",
    "faqs": [
      {
        "_id": "...",
        "question": "What is gold?",
        "answer": "Gold is a precious metal...",
        "order": 1
      },
      {
        "_id": "...",
        "question": "Why invest in gold?",
        "answer": "Gold is a safe haven asset...",
        "order": 2
      }
    ],
    "updatedAt": "2026-02-11T10:35:00.000Z"
  }
}
```

---

## 🗄️ Database Model

### GoldInfo Schema

```javascript
{
  title: String (required),
  description: String (required),
  coverImage: String (required),
  faqs: [
    {
      question: String (required),
      answer: String (required),
      order: Number (default: 0)
    }
  ],
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 كيف يعمل POST؟

### الحالة 1: أول مرة (إنشاء)

```bash
POST /api/gold/info
{
  "title": "Gold Trading",
  "description": "...",
  "coverImage": "...",
  "faqs": [...]
}
```

**النتيجة:** ينشئ document جديد

---

### الحالة 2: تحديث موجود

```bash
POST /api/gold/info
{
  "title": "Updated Title"
}
```

**النتيجة:** يحدث الـ title فقط، الباقي يبقى كما هو

---

### الحالة 3: تحديث FAQs

```bash
POST /api/gold/info
{
  "faqs": [
    {
      "question": "New question?",
      "answer": "New answer",
      "order": 1
    }
  ]
}
```

**النتيجة:** يستبدل كل الـ FAQs بالجديدة

---

## 📝 أمثلة الاستخدام

### مثال 1: جلب المعلومات (Public)

```javascript
const response = await fetch('http://localhost:3000/api/gold/info');
const data = await response.json();

console.log('Title:', data.data.title);
console.log('Description:', data.data.description);
console.log('FAQs:', data.data.faqs);
```

---

### مثال 2: تحديث Title فقط (Admin)

```javascript
const response = await fetch('http://localhost:3000/api/gold/info', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ADMIN_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'New Gold Trading Title'
  })
});

const data = await response.json();
console.log(data.message); // "Gold information updated successfully"
```

---

### مثال 3: تحديث كل شيء (Admin)

```javascript
const response = await fetch('http://localhost:3000/api/gold/info', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ADMIN_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Gold Trading Platform',
    description: 'Complete guide to gold trading...',
    coverImage: 'https://cdn.example.com/gold-new.jpg',
    faqs: [
      {
        question: 'What is gold trading?',
        answer: 'Gold trading is...',
        order: 1
      },
      {
        question: 'How to start?',
        answer: 'To start trading gold...',
        order: 2
      },
      {
        question: 'What are the risks?',
        answer: 'Gold trading risks include...',
        order: 3
      }
    ]
  })
});
```

---

### مثال 4: إضافة FAQ جديد

```javascript
// 1. جلب الـ FAQs الحالية
const current = await fetch('http://localhost:3000/api/gold/info');
const currentData = await current.json();
const currentFaqs = currentData.data.faqs;

// 2. إضافة FAQ جديد
const newFaq = {
  question: 'Is gold trading safe?',
  answer: 'Gold trading can be safe if...',
  order: currentFaqs.length + 1
};

// 3. تحديث مع الـ FAQs الجديدة
const response = await fetch('http://localhost:3000/api/gold/info', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ADMIN_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    faqs: [...currentFaqs, newFaq]
  })
});
```

---

## 🔄 التكامل مع Gold Price

### GET /api/gold (يستخدم المعلومات الجديدة)

```bash
GET /api/gold
```

**Response:**
```json
{
  "success": true,
  "data": {
    "price": "2034.56",
    "currency": "USD",
    "lastUpdate": "2026-02-11T10:30:00.000Z",
    "title": "Gold Trading",           // ← من GoldInfo
    "description": "Gold is...",        // ← من GoldInfo
    "coverImage": "https://..."         // ← من GoldInfo
  }
}
```

---

## 🧪 الاختبار

### Test 1: Get Info (Public)

```bash
curl http://localhost:3000/api/gold/info
```

**Expected:** 200 OK مع كل المعلومات

---

### Test 2: Create Info (Admin - أول مرة)

```bash
curl -X POST http://localhost:3000/api/gold/info \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Gold Trading",
    "description": "Complete guide...",
    "coverImage": "https://...",
    "faqs": [
      {
        "question": "What is gold?",
        "answer": "Gold is a precious metal",
        "order": 1
      }
    ]
  }'
```

**Expected:** 200 OK مع "Gold information created successfully"

---

### Test 3: Update Info (Admin)

```bash
curl -X POST http://localhost:3000/api/gold/info \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Gold Trading Title"
  }'
```

**Expected:** 200 OK مع "Gold information updated successfully"

---

### Test 4: Update FAQs Only

```bash
curl -X POST http://localhost:3000/api/gold/info \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "faqs": [
      {
        "question": "New question?",
        "answer": "New answer",
        "order": 1
      }
    ]
  }'
```

---

## 🎨 Frontend Example (React)

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function GoldInfoPage() {
  const [goldInfo, setGoldInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoldInfo();
  }, []);

  const fetchGoldInfo = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/gold/info');
      setGoldInfo(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="gold-info-page">
      <h1>{goldInfo.title}</h1>
      <img src={goldInfo.coverImage} alt={goldInfo.title} />
      <p>{goldInfo.description}</p>

      <div className="faqs">
        <h2>Frequently Asked Questions</h2>
        {goldInfo.faqs.map((faq, index) => (
          <div key={faq._id} className="faq-item">
            <h3>{index + 1}. {faq.question}</h3>
            <p>{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GoldInfoPage;
```

---

## 🎯 Admin Panel Example

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function GoldInfoAdmin() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    loadGoldInfo();
  }, []);

  const loadGoldInfo = async () => {
    const response = await axios.get('http://localhost:3000/api/gold/info');
    const data = response.data.data;
    setTitle(data.title);
    setDescription(data.description);
    setCoverImage(data.coverImage);
    setFaqs(data.faqs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('adminToken');
      
      await axios.post(
        'http://localhost:3000/api/gold/info',
        {
          title,
          description,
          coverImage,
          faqs
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert('Gold info updated successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update gold info');
    }
  };

  const addFaq = () => {
    setFaqs([
      ...faqs,
      {
        question: '',
        answer: '',
        order: faqs.length + 1
      }
    ]);
  };

  const updateFaq = (index, field, value) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  const removeFaq = (index) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Gold Info Management</h2>

      <div>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
        />
      </div>

      <div>
        <label>Cover Image URL:</label>
        <input
          type="text"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
        />
      </div>

      <div>
        <h3>FAQs</h3>
        {faqs.map((faq, index) => (
          <div key={index} className="faq-editor">
            <input
              type="text"
              placeholder="Question"
              value={faq.question}
              onChange={(e) => updateFaq(index, 'question', e.target.value)}
            />
            <textarea
              placeholder="Answer"
              value={faq.answer}
              onChange={(e) => updateFaq(index, 'answer', e.target.value)}
              rows={3}
            />
            <button type="button" onClick={() => removeFaq(index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addFaq}>
          Add FAQ
        </button>
      </div>

      <button type="submit">Save Changes</button>
    </form>
  );
}

export default GoldInfoAdmin;
```

---

## ✅ الخلاصة

### ما تم إنشاؤه:

- ✅ Model جديد: `GoldInfo` مع title, description, coverImage, FAQs
- ✅ Endpoint: `GET /api/gold/info` (Public)
- ✅ Endpoint: `POST /api/gold/info` (Admin - Create/Update)
- ✅ تحديث `GET /api/gold` ليستخدم المعلومات الجديدة
- ✅ FAQs مع order للترتيب

### الملفات المحدثة:

1. `src/modules/gold/gold.model.js` - Model جديد
2. `src/modules/gold/gold.controller.js` - Functions جديدة
3. `src/modules/gold/gold.routes.js` - Routes محدثة
4. `GOLD_INFO_SYSTEM_AR.md` - هذا الملف

### الاستخدام:

```bash
# Get info (public)
curl http://localhost:3000/api/gold/info

# Update info (admin)
curl -X POST http://localhost:3000/api/gold/info \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "New Title", "faqs": [...]}'
```

**جاهز للاستخدام! 🚀**

---

**آخر تحديث:** 11 فبراير 2026
