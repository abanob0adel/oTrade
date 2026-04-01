/**
 * EXAMPLE: Books Controller with BunnyCDN Integration
 * 
 * This file shows how to replace Cloudinary with BunnyCDN in your books controller.
 * Copy the relevant parts to your actual books.controller.js
 */

import Book from './book.model.js';
import Translation from '../translations/translation.model.js';
import { createOrUpdateTranslation, getTranslationsByEntity } from '../translations/translation.service.js';
import { validateTranslationsForCreate, validateContentUrl } from '../../utils/translationValidator.js';
import { formatAdminResponse } from '../../utils/accessControl.js';
import { generateSlug } from '../../utils/translationHelper.js';
import mongoose from 'mongoose';

// 🔥 REPLACE THIS: import { uploadImage, uploadFile } from '../../utils/cloudinary.js';
// 🔥 WITH THIS:
import bunnyCDN from '../../utils/bunnycdn.js';

/**
 * CREATE BOOK - BunnyCDN Version
 * Shows how to upload files to BunnyCDN instead of Cloudinary
 */
const createBookWithBunnyCDN = async (req, res) => {
  try {
    console.log('\n===== CREATE BOOK WITH BUNNYCDN =====');
    console.log('BODY:', req.body);
    console.log('FILES:', req.files);
    console.log('====================================\n');

    const isFree = true;
    const isActive = req.body.isActive !== undefined
      ? req.body.isActive === true || req.body.isActive === 'true'
      : true;

    let contentUrl = req.body.contentUrl?.trim() || '';
    let videoUrl = req.body.videoUrl?.trim() || '';
    let pdfUrl = req.body.pdfUrl?.trim() || '';
    let coverImageUrl = '';
    let fileUrl = '';
    let translations = [];

    // Validate URLs
    if (contentUrl) {
      const urlValidation = validateContentUrl(contentUrl);
      if (!urlValidation.valid)
        return res.status(400).json({ error: urlValidation.error });
    }

    if (videoUrl) {
      const urlValidation = validateContentUrl(videoUrl);
      if (!urlValidation.valid)
        return res.status(400).json({ error: urlValidation.error });
    }

    if (pdfUrl) {
      const urlValidation = validateContentUrl(pdfUrl);
      if (!urlValidation.valid)
        return res.status(400).json({ error: urlValidation.error });
    }

    // ===== 🔥 BUNNYCDN: Cover Image Upload =====
    try {
      if (req.files?.coverImage) {
        const result = await bunnyCDN.uploadFile(
          req.files.coverImage[0].buffer,
          req.files.coverImage[0].originalname,
          'books/covers' // Organized folder structure
        );
        coverImageUrl = result.url; // CDN URL ready to use
      } else {
        coverImageUrl = req.body.coverImageUrl || '';
      }
    } catch (err) {
      console.error('Cover image upload error:', err);
      return res.status(500).json({ error: 'Cover upload failed' });
    }

    // ===== 🔥 BUNNYCDN: PDF File Upload =====
    try {
      if (req.files?.file) {
        const result = await bunnyCDN.uploadFile(
          req.files.file[0].buffer,
          req.files.file[0].originalname,
          'books/pdfs' // Organized folder structure
        );
        fileUrl = result.url; // CDN URL ready to use
        pdfUrl = result.url; // Also set pdfUrl for compatibility
      } else {
        fileUrl = req.body.fileUrl || '';
      }
    } catch (err) {
      console.error('PDF upload error:', err);
      return res.status(500).json({ error: 'PDF upload failed' });
    }

    // ===== Translations (same as before) =====
    const titles = typeof req.body.title === 'object' ? req.body.title : {};
    const descriptions = typeof req.body.description === 'object' ? req.body.description : {};
    const contents = typeof req.body.content === 'object' ? req.body.content : {};

    if (titles.en || descriptions.en || contents.en) {
      translations.push({
        language: 'en',
        title: titles.en || '',
        description: descriptions.en || '',
        content: contents.en || ''
      });
    }

    if (titles.ar || descriptions.ar || contents.ar) {
      translations.push({
        language: 'ar',
        title: titles.ar || '',
        description: descriptions.ar || '',
        content: contents.ar || ''
      });
    }

    const validation = validateTranslationsForCreate(translations);
    if (!validation.valid)
      return res.status(400).json({ error: validation.error });

    const { en, ar } = validation.data;

    const mainTitle = en?.title || ar?.title;
    if (!mainTitle) {
      return res.status(400).json({ error: 'Title is required in at least one language' });
    }

    let slug = generateSlug(mainTitle);
    const existingSlug = await Book.findOne({ slug });
    if (existingSlug) slug = slug + '-' + Date.now();

    if (!contentUrl && !videoUrl && !pdfUrl && !fileUrl && !contents.en && !contents.ar) {
      return res.status(400).json({
        error: 'Book must contain at least one content source'
      });
    }

    // ===== Create Book =====
    const book = new Book({
      title: mainTitle,
      isFree: true,
      plans: [],
      contentUrl,
      coverImageUrl, // BunnyCDN URL
      fileUrl,        // BunnyCDN URL
      videoUrl,
      pdfUrl,         // BunnyCDN URL
      isActive,
      slug,
      isPaid: false,
      isInSubscription: false
    });

    await book.save();

    // ===== Save Translations =====
    await Promise.all([
      createOrUpdateTranslation('books', book._id, 'en', en.title, en.description, en.content),
      ar.title || ar.description || ar.content
        ? createOrUpdateTranslation('books', book._id, 'ar', ar.title, ar.description, ar.content)
        : null
    ]);

    const createdTranslations = await getTranslationsByEntity('books', book._id);
    const response = formatAdminResponse(book, createdTranslations);

    res.status(201).json({
      message: 'Book created successfully with BunnyCDN',
      book: response
    });

  } catch (error) {
    console.error('CREATE BOOK ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * UPDATE BOOK - BunnyCDN Version
 * Shows how to update files with BunnyCDN
 */
const updateBookWithBunnyCDN = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid book ID.' });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    const { isActive, contentUrl, coverImageUrl, videoUrl, pdfUrl } = req.body;

    // ===== 🔥 BUNNYCDN: Handle Cover Image Upload =====
    if (req.files?.coverImage?.length) {
      // Delete old cover image if exists
      if (book.coverImageUrl) {
        try {
          await bunnyCDN.deleteFileByUrl(book.coverImageUrl);
        } catch (err) {
          console.warn('Failed to delete old cover:', err.message);
        }
      }

      // Upload new cover
      const result = await bunnyCDN.uploadFile(
        req.files.coverImage[0].buffer,
        req.files.coverImage[0].originalname,
        'books/covers'
      );
      book.coverImageUrl = result.url;
    }

    // ===== 🔥 BUNNYCDN: Handle PDF Upload =====
    if (req.files?.file?.length) {
      // Delete old PDF if exists
      if (book.fileUrl) {
        try {
          await bunnyCDN.deleteFileByUrl(book.fileUrl);
        } catch (err) {
          console.warn('Failed to delete old PDF:', err.message);
        }
      }

      // Upload new PDF
      const result = await bunnyCDN.uploadFile(
        req.files.file[0].buffer,
        req.files.file[0].originalname,
        'books/pdfs'
      );
      book.fileUrl = result.url;
      book.pdfUrl = result.url;
    }

    // Update other fields
    book.isFree = true;

    if (isActive !== undefined) {
      book.isActive = isActive === 'true' || isActive === true;
    }

    if (contentUrl?.trim()) book.contentUrl = contentUrl.trim();
    if (videoUrl?.trim()) book.videoUrl = videoUrl.trim();
    if (pdfUrl?.trim()) book.pdfUrl = pdfUrl.trim();

    // Only use URL fields if NO upload happened
    if (!req.files?.coverImage && coverImageUrl?.trim()) {
      book.coverImageUrl = coverImageUrl.trim();
    }

    if (!req.files?.file && req.body.fileUrl?.trim()) {
      book.fileUrl = req.body.fileUrl.trim();
    }

    await book.save();

    // Handle translations (same as before)
    if (req.body.translations) {
      let parsedTranslations = req.body.translations;

      if (typeof parsedTranslations === 'string') {
        parsedTranslations = JSON.parse(parsedTranslations);
      }

      if (Array.isArray(parsedTranslations)) {
        for (const t of parsedTranslations) {
          await createOrUpdateTranslation(
            'books',
            book._id,
            t.language,
            t.title,
            t.description,
            t.content
          );
        }
      }
    } else {
      const titles = req.body.title || {};
      const descriptions = req.body.description || {};
      const contents = req.body.content || {};
      
      const translationUpdates = [];
      
      if (titles.en || descriptions.en || contents.en) {
        translationUpdates.push({ 
          language: 'en', 
          title: titles.en || '', 
          description: descriptions.en || '', 
          content: contents.en || '' 
        });
      }
      
      if (titles.ar || descriptions.ar || contents.ar) {
        translationUpdates.push({ 
          language: 'ar', 
          title: titles.ar || '', 
          description: descriptions.ar || '', 
          content: contents.ar || '' 
        });
      }
      
      if (translationUpdates.length > 0) {
        for (const translation of translationUpdates) {
          await createOrUpdateTranslation(
            'books',
            book._id,
            translation.language,
            translation.title,
            translation.description,
            translation.content
          );
        }
        
        if (titles.en) {
          book.title = titles.en;
          book.slug = generateSlug(titles.en);
        } else if (titles.ar && !book.title) {
          book.title = titles.ar;
          book.slug = generateSlug(titles.ar);
        }
      }
    }

    const updatedTranslations = await getTranslationsByEntity('books', book._id);
    const response = formatAdminResponse(book, updatedTranslations);

    return res.status(200).json({
      message: 'Book updated successfully with BunnyCDN.',
      book: response
    });
  } catch (error) {
    console.error('Error updating book:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * DELETE BOOK - BunnyCDN Version
 * Shows how to delete files from BunnyCDN when deleting a book
 */
const deleteBookWithBunnyCDN = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid book ID.' });
    }
    
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }
    
    // ===== 🔥 BUNNYCDN: Delete files from storage =====
    const deletePromises = [];
    
    if (book.coverImageUrl) {
      deletePromises.push(
        bunnyCDN.deleteFileByUrl(book.coverImageUrl)
          .catch(err => console.warn('Failed to delete cover:', err.message))
      );
    }
    
    if (book.fileUrl) {
      deletePromises.push(
        bunnyCDN.deleteFileByUrl(book.fileUrl)
          .catch(err => console.warn('Failed to delete PDF:', err.message))
      );
    }
    
    if (book.pdfUrl && book.pdfUrl !== book.fileUrl) {
      deletePromises.push(
        bunnyCDN.deleteFileByUrl(book.pdfUrl)
          .catch(err => console.warn('Failed to delete PDF:', err.message))
      );
    }
    
    // Wait for all deletions (non-blocking if they fail)
    await Promise.allSettled(deletePromises);
    
    // Delete associated translations
    await Translation.deleteMany({
      entityType: 'books',
      entityId: id
    });
    
    // Delete book from database
    await Book.findByIdAndDelete(id);
    
    res.status(200).json({
      message: 'Book and associated files deleted successfully from BunnyCDN.'
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * MIGRATION HELPER
 * Use this to migrate existing books from Cloudinary to BunnyCDN
 */
const migrateBooksToBunnyCDN = async (req, res) => {
  try {
    const books = await Book.find({
      $or: [
        { coverImageUrl: { $regex: 'cloudinary' } },
        { fileUrl: { $regex: 'cloudinary' } },
        { pdfUrl: { $regex: 'cloudinary' } }
      ]
    });

    console.log(`Found ${books.length} books to migrate`);

    const results = {
      success: [],
      failed: []
    };

    for (const book of books) {
      try {
        let updated = false;

        // Migrate cover image
        if (book.coverImageUrl && book.coverImageUrl.includes('cloudinary')) {
          try {
            const axios = (await import('axios')).default;
            const response = await axios.get(book.coverImageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data);
            
            const result = await bunnyCDN.uploadFile(
              buffer,
              `${book.slug}-cover.jpg`,
              'books/covers'
            );
            
            book.coverImageUrl = result.url;
            updated = true;
            console.log(`✅ Migrated cover for: ${book.title}`);
          } catch (err) {
            console.error(`❌ Failed to migrate cover for ${book.title}:`, err.message);
          }
        }

        // Migrate PDF
        if (book.fileUrl && book.fileUrl.includes('cloudinary')) {
          try {
            const axios = (await import('axios')).default;
            const response = await axios.get(book.fileUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data);
            
            const result = await bunnyCDN.uploadFile(
              buffer,
              `${book.slug}.pdf`,
              'books/pdfs'
            );
            
            book.fileUrl = result.url;
            book.pdfUrl = result.url;
            updated = true;
            console.log(`✅ Migrated PDF for: ${book.title}`);
          } catch (err) {
            console.error(`❌ Failed to migrate PDF for ${book.title}:`, err.message);
          }
        }

        if (updated) {
          await book.save();
          results.success.push(book.title);
        }
      } catch (error) {
        console.error(`Error migrating book ${book.title}:`, error);
        results.failed.push({ title: book.title, error: error.message });
      }
    }

    res.status(200).json({
      message: 'Migration completed',
      total: books.length,
      success: results.success.length,
      failed: results.failed.length,
      results
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: 'Migration failed' });
  }
};

export {
  createBookWithBunnyCDN,
  updateBookWithBunnyCDN,
  deleteBookWithBunnyCDN,
  migrateBooksToBunnyCDN
};
