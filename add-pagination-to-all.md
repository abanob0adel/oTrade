# Pagination Added to All Modules

## ✅ Modules Updated

### 1. Market Analysis
- **Route**: `GET /api/market-analysis/:category`
- **File**: `src/modules/market-analysis/market-analysis.routes.js`
- **Status**: ✅ Done

### 2. Courses
- **Routes**: 
  - `GET /api/courses`
  - `GET /api/courses/free`
  - `GET /api/courses/paid`
- **Files**: 
  - `src/modules/courses/courses.routes.js`
  - `src/modules/courses/courses.controller.js`
- **Status**: ✅ Done

### 3. Strategies
- **Route**: `GET /api/strategies`
- **Files**: Need to update

### 4. Books
- **Route**: `GET /api/books`
- **Files**: Need to update

### 5. Articles
- **Route**: `GET /api/articles`
- **Files**: Need to update

### 6. News
- **Route**: `GET /api/news`
- **Files**: Need to update

### 7. Analysts
- **Route**: `GET /api/analysts`
- **Files**: Need to update

### 8. Psychology
- **Route**: `GET /api/psychology`
- **Files**: Need to update

### 9. Webinars
- **Route**: `GET /api/webinars`
- **Files**: Need to update

### 10. Partners
- **Route**: `GET /api/partners`
- **Files**: Need to update

---

## Quick Update Pattern

For each module, follow these steps:

### Step 1: Update Routes
```javascript
import { pagination } from '../../middlewares/pagination.middleware.js';

// Before
router.get('/', getAll);

// After
router.get('/', pagination(), getAll);
```

### Step 2: Update Controller
```javascript
// Add pagination support
const skip = req.pagination?.skip || 0;
const limit = req.pagination?.limit || 0;

// Get total count
const total = await Model.countDocuments(filter);

// Apply pagination
let query = Model.find(filter).sort({ createdAt: -1 });
if (limit > 0) {
  query = query.skip(skip).limit(limit);
}
const items = await query;

// Send response
if (req.paginatedResponse) {
  res.status(200).json(req.paginatedResponse(items, total));
} else {
  res.status(200).json({ success: true, data: items });
}
```

---

## Testing

Test each endpoint with:
```
GET /api/{module}?page=1&limit=6
GET /api/{module}?page=2&limit=6
GET /api/{module}?page=1&limit=12
```

Expected response:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 28,
    "itemsPerPage": 6,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```
