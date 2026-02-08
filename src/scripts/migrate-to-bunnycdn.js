/**
 * Migration Script: Cloudinary to BunnyCDN
 * 
 * This script migrates existing files from Cloudinary to BunnyCDN
 * Run with: node src/scripts/migrate-to-bunnycdn.js
 */

import mongoose from 'mongoose';
import axios from 'axios';
import 'dotenv/config';
import bunnyCDN from '../utils/bunnycdn.js';
import Book from '../modules/books/book.model.js';
import connectDB from '../config/db.js';

// Configuration
const DRY_RUN = process.env.DRY_RUN === 'true'; // Set to true to test without actual migration
const BATCH_SIZE = 5; // Process 5 books at a time
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds delay between batches

// Statistics
const stats = {
  total: 0,
  processed: 0,
  success: 0,
  failed: 0,
  skipped: 0,
  errors: []
};

/**
 * Download file from URL
 */
async function downloadFile(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
      maxContentLength: 100 * 1024 * 1024 // 100MB max
    });
    return Buffer.from(response.data);
  } catch (error) {
    throw new Error(`Failed to download: ${error.message}`);
  }
}

/**
 * Get file extension from URL
 */
function getFileExtension(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const ext = pathname.substring(pathname.lastIndexOf('.'));
    return ext || '.jpg'; // Default to .jpg if no extension
  } catch {
    return '.jpg';
  }
}

/**
 * Migrate a single book
 */
async function migrateBook(book) {
  const result = {
    id: book._id,
    title: book.title,
    coverImage: { status: 'skipped', url: null },
    pdf: { status: 'skipped', url: null }
  };

  try {
    // Migrate cover image
    if (book.coverImageUrl && book.coverImageUrl.includes('cloudinary')) {
      console.log(`  📸 Migrating cover image...`);
      
      if (!DRY_RUN) {
        try {
          const buffer = await downloadFile(book.coverImageUrl);
          const ext = getFileExtension(book.coverImageUrl);
          const filename = `${book.slug}-cover${ext}`;
          
          const uploadResult = await bunnyCDN.uploadFile(
            buffer,
            filename,
            'books/covers'
          );
          
          book.coverImageUrl = uploadResult.url;
          result.coverImage = { status: 'success', url: uploadResult.url };
          console.log(`  ✅ Cover migrated: ${uploadResult.url}`);
        } catch (error) {
          result.coverImage = { status: 'failed', error: error.message };
          console.error(`  ❌ Cover failed: ${error.message}`);
        }
      } else {
        result.coverImage = { status: 'dry-run', url: 'would-be-migrated' };
        console.log(`  🔍 [DRY RUN] Would migrate cover`);
      }
    }

    // Migrate PDF
    if (book.fileUrl && book.fileUrl.includes('cloudinary')) {
      console.log(`  📄 Migrating PDF...`);
      
      if (!DRY_RUN) {
        try {
          const buffer = await downloadFile(book.fileUrl);
          const filename = `${book.slug}.pdf`;
          
          const uploadResult = await bunnyCDN.uploadFile(
            buffer,
            filename,
            'books/pdfs'
          );
          
          book.fileUrl = uploadResult.url;
          book.pdfUrl = uploadResult.url;
          result.pdf = { status: 'success', url: uploadResult.url };
          console.log(`  ✅ PDF migrated: ${uploadResult.url}`);
        } catch (error) {
          result.pdf = { status: 'failed', error: error.message };
          console.error(`  ❌ PDF failed: ${error.message}`);
        }
      } else {
        result.pdf = { status: 'dry-run', url: 'would-be-migrated' };
        console.log(`  🔍 [DRY RUN] Would migrate PDF`);
      }
    }

    // Save changes
    if (!DRY_RUN && (result.coverImage.status === 'success' || result.pdf.status === 'success')) {
      await book.save();
      console.log(`  💾 Book saved to database`);
    }

    return result;
  } catch (error) {
    console.error(`  ❌ Error migrating book: ${error.message}`);
    throw error;
  }
}

/**
 * Process books in batches
 */
async function processBatch(books, batchNumber) {
  console.log(`\n📦 Processing batch ${batchNumber} (${books.length} books)...`);
  
  const results = [];
  
  for (const book of books) {
    console.log(`\n📖 [${stats.processed + 1}/${stats.total}] ${book.title}`);
    
    try {
      const result = await migrateBook(book);
      results.push(result);
      
      if (result.coverImage.status === 'success' || result.pdf.status === 'success') {
        stats.success++;
      } else if (result.coverImage.status === 'skipped' && result.pdf.status === 'skipped') {
        stats.skipped++;
      }
    } catch (error) {
      stats.failed++;
      stats.errors.push({
        book: book.title,
        error: error.message
      });
      results.push({
        id: book._id,
        title: book.title,
        error: error.message
      });
    }
    
    stats.processed++;
  }
  
  return results;
}

/**
 * Delay helper
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('\n🚀 Starting Cloudinary to BunnyCDN Migration\n');
  console.log('='.repeat(60));
  
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No actual changes will be made');
    console.log('   Set DRY_RUN=false in environment to perform migration');
  }
  
  console.log('='.repeat(60));

  try {
    // Connect to database
    console.log('\n📡 Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database');

    // Find books with Cloudinary URLs
    console.log('\n🔍 Finding books with Cloudinary URLs...');
    const books = await Book.find({
      $or: [
        { coverImageUrl: { $regex: 'cloudinary', $options: 'i' } },
        { fileUrl: { $regex: 'cloudinary', $options: 'i' } },
        { pdfUrl: { $regex: 'cloudinary', $options: 'i' } }
      ]
    }).sort({ createdAt: 1 }); // Oldest first

    stats.total = books.length;

    if (books.length === 0) {
      console.log('✅ No books found with Cloudinary URLs');
      console.log('   All books are already using BunnyCDN or other storage');
      return;
    }

    console.log(`📚 Found ${books.length} books to migrate`);
    console.log(`📦 Processing in batches of ${BATCH_SIZE}`);

    // Process in batches
    const allResults = [];
    for (let i = 0; i < books.length; i += BATCH_SIZE) {
      const batch = books.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(books.length / BATCH_SIZE);
      
      const results = await processBatch(batch, `${batchNumber}/${totalBatches}`);
      allResults.push(...results);
      
      // Delay between batches (except for last batch)
      if (i + BATCH_SIZE < books.length) {
        console.log(`\n⏳ Waiting ${DELAY_BETWEEN_BATCHES / 1000}s before next batch...`);
        await delay(DELAY_BETWEEN_BATCHES);
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));
    console.log(`Total books:      ${stats.total}`);
    console.log(`Processed:        ${stats.processed}`);
    console.log(`✅ Success:       ${stats.success}`);
    console.log(`⏭️  Skipped:       ${stats.skipped}`);
    console.log(`❌ Failed:        ${stats.failed}`);
    console.log('='.repeat(60));

    if (stats.errors.length > 0) {
      console.log('\n❌ Errors:');
      stats.errors.forEach((err, index) => {
        console.log(`${index + 1}. ${err.book}: ${err.error}`);
      });
    }

    if (DRY_RUN) {
      console.log('\n⚠️  This was a DRY RUN - no changes were made');
      console.log('   Run with DRY_RUN=false to perform actual migration');
    } else {
      console.log('\n✅ Migration completed!');
      console.log('   All successful migrations have been saved to the database');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
