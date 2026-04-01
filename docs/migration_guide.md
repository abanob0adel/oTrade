# Migration Guide: Cloudinary to BunnyCDN

## Overview

This guide helps you migrate existing files from Cloudinary to BunnyCDN storage.

## Migration Script

Location: `src/scripts/migrate-to-bunnycdn.js`

### Features

✅ **Safe Migration**
- Dry run mode to test before actual migration
- Batch processing to avoid overwhelming the server
- Error handling and retry logic
- Detailed progress logging

✅ **Smart Processing**
- Only migrates files with Cloudinary URLs
- Skips already migrated files
- Preserves file organization
- Updates database automatically

✅ **Statistics**
- Total files processed
- Success/failure counts
- Detailed error reporting
- Progress tracking

## Before You Start

### 1. Backup Your Database
```bash
# MongoDB backup
mongodump --uri="your_mongodb_uri" --out=./backup
```

### 2. Verify BunnyCDN Setup
```bash
# Check environment variables
cat .env | grep BUNNY

# Should show:
# BUNNY_STORAGE_ZONE=otrade
# BUNNY_API_KEY=your_api_key
# BUNNY_STORAGE_ENDPOINT=storage.bunnycdn.com
# BUNNY_CDN_URL=https://otrade.b-cdn.net
```

### 3. Test BunnyCDN Connection
```bash
# Test upload
curl -X POST http://localhost:3000/api/upload/image \
  -F "image=@test-image.jpg"

# Should return success with BunnyCDN URL
```

## Migration Steps

### Step 1: Dry Run (Test Mode)

Test the migration without making any changes:

```bash
# Set dry run mode
export DRY_RUN=true

# Run migration script
node src/scripts/migrate-to-bunnycdn.js
```

**What happens:**
- Script finds all books with Cloudinary URLs
- Shows what would be migrated
- No actual files are uploaded
- No database changes are made

**Expected output:**
```
🚀 Starting Cloudinary to BunnyCDN Migration
============================================================
⚠️  DRY RUN MODE - No actual changes will be made
============================================================

📡 Connecting to database...
✅ Connected to database

🔍 Finding books with Cloudinary URLs...
📚 Found 25 books to migrate
📦 Processing in batches of 5

📦 Processing batch 1/5 (5 books)...

📖 [1/25] Trading Basics
  🔍 [DRY RUN] Would migrate cover
  🔍 [DRY RUN] Would migrate PDF

...

============================================================
📊 Migration Summary
============================================================
Total books:      25
Processed:        25
✅ Success:       0
⏭️  Skipped:       0
❌ Failed:        0
============================================================

⚠️  This was a DRY RUN - no changes were made
```

### Step 2: Review Dry Run Results

Check the output for:
- Number of files to be migrated
- Any potential errors
- Estimated time (based on file count)

### Step 3: Actual Migration

Run the real migration:

```bash
# Disable dry run mode
export DRY_RUN=false

# Run migration script
node src/scripts/migrate-to-bunnycdn.js
```

**What happens:**
- Downloads files from Cloudinary
- Uploads to BunnyCDN
- Updates database with new URLs
- Shows progress for each file

**Expected output:**
```
🚀 Starting Cloudinary to BunnyCDN Migration
============================================================

📡 Connecting to database...
✅ Connected to database

🔍 Finding books with Cloudinary URLs...
📚 Found 25 books to migrate
📦 Processing in batches of 5

📦 Processing batch 1/5 (5 books)...

📖 [1/25] Trading Basics
  📸 Migrating cover image...
  ✅ Cover migrated: https://otrade.b-cdn.net/books/covers/trading-basics-cover-1707398400000.jpg
  📄 Migrating PDF...
  ✅ PDF migrated: https://otrade.b-cdn.net/books/pdfs/trading-basics-1707398400000.pdf
  💾 Book saved to database

📖 [2/25] Advanced Strategies
  📸 Migrating cover image...
  ✅ Cover migrated: https://otrade.b-cdn.net/books/covers/advanced-strategies-cover-1707398500000.jpg
  📄 Migrating PDF...
  ✅ PDF migrated: https://otrade.b-cdn.net/books/pdfs/advanced-strategies-1707398500000.pdf
  💾 Book saved to database

...

⏳ Waiting 2s before next batch...

============================================================
📊 Migration Summary
============================================================
Total books:      25
Processed:        25
✅ Success:       25
⏭️  Skipped:       0
❌ Failed:        0
============================================================

✅ Migration completed!
   All successful migrations have been saved to the database
```

### Step 4: Verify Migration

Check that files are accessible:

```bash
# Test a migrated book
curl -I https://otrade.b-cdn.net/books/pdfs/trading-basics-1707398400000.pdf

# Should return 200 OK
```

Query database to verify URLs:

```javascript
// In MongoDB shell or Compass
db.books.find({ 
  coverImageUrl: { $regex: 'otrade.b-cdn.net' } 
}).count()

// Should show migrated count
```

## Configuration Options

### Batch Size

Control how many books are processed at once:

```javascript
// In src/scripts/migrate-to-bunnycdn.js
const BATCH_SIZE = 5; // Change to 10 for faster processing
```

**Recommendations:**
- Small files (< 5MB): 10-20 per batch
- Large files (> 10MB): 3-5 per batch
- Slow connection: 1-3 per batch

### Delay Between Batches

Control delay between batches:

```javascript
// In src/scripts/migrate-to-bunnycdn.js
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds (in milliseconds)
```

**Recommendations:**
- Fast connection: 1000ms (1 second)
- Normal connection: 2000ms (2 seconds)
- Slow connection: 5000ms (5 seconds)

## Handling Errors

### Common Errors

#### 1. Download Failed
```
❌ PDF failed: Failed to download: timeout of 30000ms exceeded
```

**Solution:**
- Check Cloudinary URL is still valid
- Increase timeout in script
- Check internet connection

#### 2. Upload Failed
```
❌ Cover failed: Failed to upload file to BunnyCDN: 401 Unauthorized
```

**Solution:**
- Verify BUNNY_API_KEY is correct
- Check API key has write permissions
- Verify storage zone name

#### 3. File Too Large
```
❌ PDF failed: maxContentLength size of 104857600 exceeded
```

**Solution:**
- Increase maxContentLength in script
- Process large files separately
- Check BunnyCDN storage limits

### Retry Failed Migrations

If some files fail, you can re-run the script:

```bash
# Script automatically skips already migrated files
node src/scripts/migrate-to-bunnycdn.js
```

Only files still using Cloudinary URLs will be processed.

## Manual Migration

For individual files or special cases:

```javascript
import bunnyCDN from './utils/bunnycdn.js';
import axios from 'axios';

// Download from Cloudinary
const response = await axios.get('https://cloudinary-url.jpg', {
  responseType: 'arraybuffer'
});
const buffer = Buffer.from(response.data);

// Upload to BunnyCDN
const result = await bunnyCDN.uploadFile(
  buffer,
  'filename.jpg',
  'books/covers'
);

console.log('New URL:', result.url);

// Update database manually
await Book.updateOne(
  { _id: bookId },
  { coverImageUrl: result.url }
);
```

## Post-Migration

### 1. Verify All Files

Check that all books have BunnyCDN URLs:

```javascript
// Books still using Cloudinary
db.books.find({
  $or: [
    { coverImageUrl: { $regex: 'cloudinary' } },
    { fileUrl: { $regex: 'cloudinary' } }
  ]
}).count()

// Should return 0
```

### 2. Test Frontend

- Load books in your frontend
- Verify images display correctly
- Test PDF downloads
- Check video playback (if applicable)

### 3. Monitor Performance

- Check CDN delivery speed
- Monitor BunnyCDN bandwidth usage
- Verify edge caching is working

### 4. Clean Up Cloudinary (Optional)

Once migration is verified:

1. Keep Cloudinary files for 30 days as backup
2. After 30 days, delete from Cloudinary
3. Cancel Cloudinary subscription (if no longer needed)

## Rollback Plan

If you need to rollback:

### Option 1: Restore Database Backup

```bash
# Restore from backup
mongorestore --uri="your_mongodb_uri" ./backup
```

### Option 2: Manual Rollback

Keep a list of original Cloudinary URLs and restore them:

```javascript
// Save original URLs before migration
const originalUrls = await Book.find().select('_id coverImageUrl fileUrl');
fs.writeFileSync('original-urls.json', JSON.stringify(originalUrls));

// Restore if needed
const urls = JSON.parse(fs.readFileSync('original-urls.json'));
for (const item of urls) {
  await Book.updateOne(
    { _id: item._id },
    { 
      coverImageUrl: item.coverImageUrl,
      fileUrl: item.fileUrl
    }
  );
}
```

## Troubleshooting

### Script Hangs

**Symptoms:** Script stops responding

**Solutions:**
- Reduce BATCH_SIZE
- Increase DELAY_BETWEEN_BATCHES
- Check network connection
- Restart script (it will skip completed files)

### Database Connection Issues

**Symptoms:** "Failed to connect to MongoDB"

**Solutions:**
- Verify MONGODB_URI in .env
- Check database is running
- Verify network access to database

### Memory Issues

**Symptoms:** "JavaScript heap out of memory"

**Solutions:**
- Reduce BATCH_SIZE
- Process files in smaller groups
- Increase Node.js memory: `node --max-old-space-size=4096 src/scripts/migrate-to-bunnycdn.js`

## Best Practices

1. **Always run dry run first**
2. **Backup database before migration**
3. **Start with small batch size**
4. **Monitor first few batches**
5. **Keep Cloudinary files as backup for 30 days**
6. **Verify migration before deleting old files**
7. **Test frontend after migration**
8. **Monitor BunnyCDN usage and costs**

## Estimated Time

Migration time depends on:
- Number of files
- File sizes
- Internet speed
- Batch size and delay

**Example estimates:**
- 10 books (5MB each): ~5 minutes
- 50 books (10MB each): ~30 minutes
- 100 books (20MB each): ~2 hours

## Support

If you encounter issues:

1. Check error messages in console
2. Review this guide
3. Check BunnyCDN documentation
4. Verify environment variables
5. Test with single file first

## Summary Checklist

- [ ] Backup database
- [ ] Verify BunnyCDN setup
- [ ] Run dry run migration
- [ ] Review dry run results
- [ ] Run actual migration
- [ ] Verify migrated files
- [ ] Test frontend
- [ ] Monitor performance
- [ ] Keep Cloudinary backup (30 days)
- [ ] Clean up after verification

---

**Ready to migrate?** Start with the dry run and follow the steps above!
