# BunnyCDN Integration Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React/JS)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Upload Form  │  │ Image Upload │  │ Video Upload │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          │ FormData         │ FormData         │ FormData
          │ (multipart)      │ (multipart)      │ (multipart)
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express.js Backend                            │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    API Routes Layer                         │ │
│  │  /api/upload/book    /api/upload/image   /api/upload/video │ │
│  │  /api/upload/multiple    /api/upload/delete                │ │
│  └────────────────┬───────────────────────────────────────────┘ │
│                   │                                              │
│  ┌────────────────▼───────────────────────────────────────────┐ │
│  │              Multer Middleware                              │ │
│  │  • Memory Storage (no disk writes)                          │ │
│  │  • File Type Validation (PDF, image, video)                 │ │
│  │  • File Size Limits (5MB-100MB)                             │ │
│  │  • Multiple File Handling                                   │ │
│  └────────────────┬───────────────────────────────────────────┘ │
│                   │                                              │
│  ┌────────────────▼───────────────────────────────────────────┐ │
│  │            Upload Controllers                               │ │
│  │  • uploadBookPDF()                                          │ │
│  │  • uploadImage()                                            │ │
│  │  • uploadVideo()                                            │ │
│  │  • deleteFile()                                             │ │
│  └────────────────┬───────────────────────────────────────────┘ │
│                   │                                              │
│  ┌────────────────▼───────────────────────────────────────────┐ │
│  │            BunnyCDN Service                                 │ │
│  │  • uploadFile(buffer, name, folder)                         │ │
│  │  • deleteFile(path)                                         │ │
│  │  • deleteFileByUrl(url)                                     │ │
│  │  • uploadMultipleFiles(files, folder)                       │ │
│  └────────────────┬───────────────────────────────────────────┘ │
└───────────────────┼─────────────────────────────────────────────┘
                    │
                    │ HTTPS PUT/DELETE
                    │ (with API Key)
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                  BunnyCDN Storage API                            │
│              storage.bunnycdn.com/otrade/                        │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   books/     │  │   images/    │  │   videos/    │          │
│  │  ├─ pdfs/    │  │  ├─ articles/│  │  ├─ courses/ │          │
│  │  └─ covers/  │  │  └─ general/ │  │  └─ webinars/│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    │ Automatic Sync
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BunnyCDN Edge Network                         │
│                  https://otrade.b-cdn.net/                       │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Edge USA    │  │  Edge Europe │  │  Edge Asia   │          │
│  │  (Cached)    │  │  (Cached)    │  │  (Cached)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    │ Fast CDN Delivery
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                         End Users                                │
│  📱 Mobile      💻 Desktop      🌐 Web Browsers                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Upload Flow

```
1. User selects file in frontend
   ↓
2. Frontend sends FormData to /api/upload/*
   ↓
3. Multer middleware intercepts request
   • Validates file type
   • Checks file size
   • Stores in memory buffer
   ↓
4. Controller receives file buffer
   ↓
5. BunnyCDN service processes upload
   • Generates unique filename (timestamp)
   • Builds storage path (folder/filename)
   • Sends PUT request to BunnyCDN Storage API
   ↓
6. BunnyCDN Storage saves file
   ↓
7. BunnyCDN automatically syncs to edge network
   ↓
8. Service returns CDN URL
   ↓
9. Controller saves URL to database
   ↓
10. Response sent to frontend with CDN URL
```

### Delete Flow

```
1. Frontend sends DELETE request with URL
   ↓
2. Controller receives URL or path
   ↓
3. BunnyCDN service extracts file path from URL
   ↓
4. Service sends DELETE request to BunnyCDN Storage API
   ↓
5. BunnyCDN removes file from storage
   ↓
6. File automatically removed from edge cache
   ↓
7. Success response sent to frontend
```

## File Organization

```
BunnyCDN Storage Zone: otrade
│
├── books/
│   ├── pdfs/
│   │   ├── trading-basics-1707398400000.pdf
│   │   ├── advanced-strategies-1707398500000.pdf
│   │   └── market-analysis-1707398600000.pdf
│   │
│   └── covers/
│       ├── trading-basics-cover-1707398400000.jpg
│       ├── advanced-strategies-cover-1707398500000.jpg
│       └── market-analysis-cover-1707398600000.jpg
│
├── images/
│   ├── articles/
│   │   ├── article-hero-1707398700000.jpg
│   │   └── article-thumbnail-1707398800000.jpg
│   │
│   ├── courses/
│   │   ├── course-banner-1707398900000.jpg
│   │   └── course-preview-1707399000000.jpg
│   │
│   └── general/
│       └── logo-1707399100000.png
│
├── videos/
│   ├── courses/
│   │   ├── lesson-1-intro-1707399200000.mp4
│   │   └── lesson-2-basics-1707399300000.mp4
│   │
│   └── webinars/
│       ├── webinar-2024-01-1707399400000.mp4
│       └── webinar-2024-02-1707399500000.mp4
│
└── uploads/
    └── misc-file-1707399600000.pdf
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────────┐
│                      Your Application                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Books Controller                                         │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ createBook()                                        │  │   │
│  │  │  1. Receive files from multer                       │  │   │
│  │  │  2. Call bunnyCDN.uploadFile()                      │  │   │
│  │  │  3. Get CDN URL                                     │  │   │
│  │  │  4. Save to database                                │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                            │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ updateBook()                                        │  │   │
│  │  │  1. Delete old file (if exists)                     │  │   │
│  │  │  2. Upload new file                                 │  │   │
│  │  │  3. Update database with new URL                    │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                            │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ deleteBook()                                        │  │   │
│  │  │  1. Call bunnyCDN.deleteFileByUrl()                 │  │   │
│  │  │  2. Delete from database                            │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Articles Controller                                      │   │
│  │  • Uses same bunnyCDN service                             │   │
│  │  • Uploads to images/articles/                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Courses Controller                                       │   │
│  │  • Uses same bunnyCDN service                             │   │
│  │  • Uploads videos to videos/courses/                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ All use same service
                              ▼
                    ┌──────────────────┐
                    │ BunnyCDN Service │
                    │  (Singleton)     │
                    └──────────────────┘
```

## Request/Response Examples

### Upload Book Request
```http
POST /api/upload/book HTTP/1.1
Host: localhost:3000
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="trading-guide.pdf"
Content-Type: application/pdf

[PDF binary data]
------WebKitFormBoundary
Content-Disposition: form-data; name="coverImage"; filename="cover.jpg"
Content-Type: image/jpeg

[Image binary data]
------WebKitFormBoundary--
```

### Upload Book Response
```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "data": {
    "pdf": {
      "success": true,
      "url": "https://otrade.b-cdn.net/books/pdfs/trading-guide-1707398400000.pdf",
      "fileName": "trading-guide-1707398400000.pdf",
      "path": "books/pdfs/trading-guide-1707398400000.pdf",
      "size": 2048576
    },
    "coverImage": {
      "success": true,
      "url": "https://otrade.b-cdn.net/books/covers/cover-1707398400000.jpg",
      "fileName": "cover-1707398400000.jpg",
      "path": "books/covers/cover-1707398400000.jpg",
      "size": 512000
    }
  }
}
```

### Delete File Request
```http
DELETE /api/upload/delete HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "url": "https://otrade.b-cdn.net/books/pdfs/trading-guide-1707398400000.pdf"
}
```

### Delete File Response
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": {
    "success": true,
    "message": "File deleted successfully",
    "path": "books/pdfs/trading-guide-1707398400000.pdf"
  }
}
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                      Security Layers                             │
│                                                                   │
│  1. Frontend Validation                                          │
│     • File type check (client-side)                              │
│     • File size check (client-side)                              │
│     • User authentication                                        │
│                                                                   │
│  2. Express Middleware                                           │
│     • CORS configuration                                         │
│     • Body parser limits                                         │
│     • Rate limiting (optional)                                   │
│                                                                   │
│  3. Multer Middleware                                            │
│     • File type validation (server-side)                         │
│     • File size limits (server-side)                             │
│     • Memory storage (no disk access)                            │
│                                                                   │
│  4. Controller Validation                                        │
│     • Additional file type checks                                │
│     • Business logic validation                                  │
│     • User permission checks                                     │
│                                                                   │
│  5. BunnyCDN Service                                             │
│     • API key authentication                                     │
│     • HTTPS encryption                                           │
│     • Unique filename generation                                 │
│                                                                   │
│  6. BunnyCDN Storage                                             │
│     • API key validation                                         │
│     • Storage zone isolation                                     │
│     • Access control                                             │
│                                                                   │
│  7. BunnyCDN CDN                                                 │
│     • DDoS protection                                            │
│     • Edge caching                                               │
│     • Geographic distribution                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────────┐
│                   Performance Features                           │
│                                                                   │
│  1. Memory Storage                                               │
│     • No disk I/O overhead                                       │
│     • Faster processing                                          │
│     • Direct buffer to BunnyCDN                                  │
│                                                                   │
│  2. Unique Filenames                                             │
│     • Timestamp-based (Date.now())                               │
│     • No database lookups needed                                 │
│     • Prevents conflicts                                         │
│                                                                   │
│  3. CDN Edge Caching                                             │
│     • Files cached at edge locations                             │
│     • Reduced latency                                            │
│     • Global distribution                                        │
│                                                                   │
│  4. Parallel Uploads                                             │
│     • Multiple files uploaded concurrently                       │
│     • Promise.all() for batch operations                         │
│     • Faster total upload time                                   │
│                                                                   │
│  5. Organized Folders                                            │
│     • Better file management                                     │
│     • Easier to locate files                                     │
│     • Logical structure                                          │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Error Handling                              │
│                                                                   │
│  Frontend                                                        │
│    ↓ (try/catch)                                                 │
│  API Request                                                     │
│    ↓ (error response)                                            │
│  Express Route                                                   │
│    ↓ (next(error))                                               │
│  Controller                                                      │
│    ↓ (try/catch)                                                 │
│  BunnyCDN Service                                                │
│    ↓ (try/catch)                                                 │
│  Axios Request                                                   │
│    ↓ (error response)                                            │
│  BunnyCDN API                                                    │
│    ↓                                                              │
│  Error Response                                                  │
│    • 400: Bad Request (invalid file)                             │
│    • 401: Unauthorized (invalid API key)                         │
│    • 404: Not Found (file doesn't exist)                         │
│    • 500: Server Error (upload failed)                           │
│    ↓                                                              │
│  Logged & Returned to Frontend                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Scalability

```
┌─────────────────────────────────────────────────────────────────┐
│                    Scalability Features                          │
│                                                                   │
│  • Stateless Design                                              │
│    - No server-side file storage                                 │
│    - Can scale horizontally                                      │
│    - Load balancer friendly                                      │
│                                                                   │
│  • CDN Distribution                                              │
│    - Global edge network                                         │
│    - Automatic scaling                                           │
│    - Handles traffic spikes                                      │
│                                                                   │
│  • Async Operations                                              │
│    - Non-blocking uploads                                        │
│    - Concurrent requests                                         │
│    - Efficient resource usage                                    │
│                                                                   │
│  • Organized Storage                                             │
│    - Folder-based structure                                      │
│    - Easy to manage at scale                                     │
│    - Clear organization                                          │
└─────────────────────────────────────────────────────────────────┘
```

This architecture provides a robust, scalable, and performant file upload system using BunnyCDN!
