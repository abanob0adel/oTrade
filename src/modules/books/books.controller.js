import Book from './book.model.js';
import Plan from '../plans/plan.model.js';
import Translation from '../translations/translation.model.js';
import { createOrUpdateTranslation, getTranslationsByEntity } from '../translations/translation.service.js';
import { validateTranslationsForCreate, validateContentUrl } from '../../utils/translationValidator.js';
import { formatAdminResponse } from '../../utils/accessControl.js';
import bunnyCDN from '../../utils/bunnycdn.js';
import { generateSlug } from '../../utils/translationHelper.js';
import mongoose from 'mongoose';


// Helper function to check if user has access to a book

// Helper function to format book content response for free access

const formatBookContentResponse = async (book, translations, requestedLang) => {

  // Find the translation matching the requested language, fallback to English
 
  const requestedTranslation = 
    translations.find(t => t.language === requestedLang) ||
    translations.find(t => t.language === 'en');

    // Base content object with full content always available

  const content = {
    id: book._id,
    title: book.title,
    description: '', 
    content: '', 
    coverImageUrl: book.coverImageUrl || undefined, 
    fileUrl: book.fileUrl || undefined,
    videoUrl: book.videoUrl || undefined,
    pdfUrl: book.pdfUrl || undefined,
    contentUrl: book.contentUrl || undefined
  };
  
  // Add translated content for all users (free access)
  if (requestedTranslation) {
    content.title = requestedTranslation.title || book.title;
    content.description = requestedTranslation.description || '';
    content.content = requestedTranslation.content || '';
  }
  
  return content;
};


const createBook = async (req, res) => {
  try {
    console.log('\n===== CREATE BOOK DEBUG =====');
    console.log('BODY:', req.body);
    console.log('FILES:', req.files);
    console.log('================================\n');

    // ===== Basic Fields =====
    const isFree = true; // all books free
    const isActive =
      req.body.isActive !== undefined
        ? req.body.isActive === true || req.body.isActive === 'true'
        : true;

    let contentUrl = req.body.contentUrl?.trim() || '';
    let videoUrl = req.body.videoUrl?.trim() || '';
    let pdfUrl = req.body.pdfUrl?.trim() || '';
    let coverImageUrl = '';
    let fileUrl = '';
    let translations = [];

    // ===== Validate URLs =====
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

    // ===== Cover Image Upload - Direct URL or Upload =====
    try {
      if (req.body.coverImageUrl && req.body.coverImageUrl.trim()) {
        // Frontend uploaded directly, use provided URL
        coverImageUrl = req.body.coverImageUrl.trim();
        console.log('✅ Using direct upload cover URL:', coverImageUrl);
      } else if (req.files?.coverImage) {
        // Fallback: Backend upload (for backward compatibility)
        console.log('📸 Uploading cover image from backend...');
        coverImageUrl = await bunnyCDN.uploadBookCover(
          req.files.coverImage[0].buffer,
          req.files.coverImage[0].originalname
        );
        console.log('✅ Cover uploaded:', coverImageUrl);
      }
    } catch (err) {
      console.error('❌ Cover image error:', err.message);
      return res.status(500).json({ error: `Cover upload failed: ${err.message}` });
    }

    // ===== File Upload - Direct URL or Upload =====
    try { 
      if (req.body.fileUrl && req.body.fileUrl.trim()) {
        // Frontend uploaded directly, use provided URL
        fileUrl = req.body.fileUrl.trim();
        pdfUrl = fileUrl;
        console.log('✅ Using direct upload file URL:', fileUrl);
      } else if (req.body.pdfUrl && req.body.pdfUrl.trim()) {
        // Alternative: pdfUrl field
        pdfUrl = req.body.pdfUrl.trim();
        fileUrl = pdfUrl;
        console.log('✅ Using direct upload PDF URL:', pdfUrl);
      } else if (req.files?.file) {
        // Fallback: Backend upload (for backward compatibility)
        console.log('📄 Uploading PDF file from backend...');
        fileUrl = await bunnyCDN.uploadPDF(
          req.files.file[0].buffer,
          req.files.file[0].originalname
        );
        pdfUrl = fileUrl;
        console.log('✅ PDF uploaded:', fileUrl);
      }
    } catch (err) {
      console.error('❌ PDF upload error:', err.message);
      return res.status(500).json({ error: `PDF upload failed: ${err.message}` });
    }

    // ===== Translations =====
    const titles =
      typeof req.body.title === 'object' ? req.body.title : {};
    const descriptions =
      typeof req.body.description === 'object' ? req.body.description : {};
    const contents =
      typeof req.body.content === 'object' ? req.body.content : {};

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

    // ===== Main title =====
    const mainTitle = en?.title || ar?.title;
    if (!mainTitle) {
      return res
        .status(400)
        .json({ error: 'Title is required in at least one language' });
    }

    // ===== Slug generate + duplicate fix =====
    let slug = generateSlug(mainTitle);
    const existingSlug = await Book.findOne({ slug });
    if (existingSlug) slug = slug + '-' + Date.now();

    // ===== Prevent empty book =====
    if (
      !contentUrl &&
      !videoUrl &&
      !pdfUrl &&
      !fileUrl &&
      !contents.en &&
      !contents.ar
    ) {
      return res.status(400).json({
        error: 'Book must contain at least one content source'
      });
    }

    // ===== Create Book =====
    const book = new Book({
      title: mainTitle,
      isFree: true,
      plans: [], // removed plans logic
      contentUrl,
      coverImageUrl,
      fileUrl,
      videoUrl,
      pdfUrl,
      isActive,
      slug,
      isPaid: false,
      isInSubscription: false
    });

    await book.save();

    // ===== Save Translations =====
    await Promise.all([
      createOrUpdateTranslation(
        'books',
        book._id,
        'en',
        en.title,
        en.description,
        en.content
      ),
      ar.title || ar.description || ar.content
        ? createOrUpdateTranslation(
            'books',
            book._id,
            'ar',
            ar.title,
            ar.description,
            ar.content
          )
        : null
    ]);

    const createdTranslations = await getTranslationsByEntity(
      'books',
      book._id
    );
    const response = formatAdminResponse(book, createdTranslations);

    res.status(201).json({
      message: 'Book created successfully',
      book: response
    });

  } catch (error) {
    console.error('CREATE BOOK ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

  




const updateBook = async (req, res) => {
  try {
    const { id } = req.params;

    // 🛑 Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid book ID.' });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    const {
      isActive,
      contentUrl,
      coverImageUrl,
      videoUrl,
      pdfUrl
    } = req.body;

    // 📌 Handle uploads FIRST - BunnyCDN
    if (req.files?.coverImage?.length) {
      console.log('📸 Updating cover image...');
      
      // Delete old cover if exists
      if (book.coverImageUrl) {
        try {
          console.log('🗑️ Deleting old cover...');
          await bunnyCDN.deleteFileByUrl(book.coverImageUrl);
          console.log('✅ Old cover deleted');
        } catch (err) {
          console.warn('⚠️ Failed to delete old cover:', err.message);
        }
      }
      
      book.coverImageUrl = await bunnyCDN.uploadBookCover(
        req.files.coverImage[0].buffer,
        req.files.coverImage[0].originalname
      );
      console.log('✅ New cover uploaded:', book.coverImageUrl);
    }

    if (req.files?.file?.length) {
      console.log('📄 Updating PDF file...');
      
      // Delete old PDF if exists
      if (book.fileUrl) {
        try {
          console.log('🗑️ Deleting old PDF...');
          await bunnyCDN.deleteFileByUrl(book.fileUrl);
          console.log('✅ Old PDF deleted');
        } catch (err) {
          console.warn('⚠️ Failed to delete old PDF:', err.message);
        }
      }
      
      book.fileUrl = await bunnyCDN.uploadPDF(
        req.files.file[0].buffer,
        req.files.file[0].originalname
      );
      book.pdfUrl = book.fileUrl;
      console.log('✅ New PDF uploaded:', book.fileUrl);
    }

    // 📌 Update fields safely
    // Title will be updated through translations

    book.isFree = true; // 🔥 books are always free

    if (isActive !== undefined) {
      book.isActive = isActive === 'true' || isActive === true;
    }

    if (contentUrl?.trim()) book.contentUrl = contentUrl.trim();
    if (videoUrl?.trim()) book.videoUrl = videoUrl.trim();
    if (pdfUrl?.trim()) book.pdfUrl = pdfUrl.trim();

    // ❗ only use URL fields if NO upload happened
    if (!req.files?.coverImage && coverImageUrl?.trim()) {
      book.coverImageUrl = coverImageUrl.trim();
    }

    if (!req.files?.file && req.body.fileUrl?.trim()) {
      book.fileUrl = req.body.fileUrl.trim();
    }

    await book.save();

    // 🌍 Handle translations (FormData safe)
    // First, handle the array format if provided
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
      // Handle individual translation fields format
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
      
      // Update translations if any found
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
        
        // Update book title and slug if English title is provided
        if (titles.en) {
          book.title = titles.en;
          book.slug = generateSlug(titles.en);
        } else if (titles.ar && !book.title) {
          // Fallback to Arabic title if no English and no existing title
          book.title = titles.ar;
          book.slug = generateSlug(titles.ar);
        }
      }
    }

    const updatedTranslations = await getTranslationsByEntity(
      'books',
      book._id
    );

    const response = formatAdminResponse(book, updatedTranslations);

    return res.status(200).json({
      message: 'Book updated successfully.',
      book: response
    });
  } catch (error) {
    console.error('Error updating book:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};


const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid book ID.' });
    }
    
    // Find book
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }
    
    console.log(`🗑️ Deleting book: ${book.title}`);
    
    // Delete files from BunnyCDN
    const deletePromises = [];
    
    if (book.coverImageUrl) {
      console.log('🗑️ Deleting cover image from BunnyCDN...');
      deletePromises.push(
        bunnyCDN.deleteFileByUrl(book.coverImageUrl)
          .then(() => console.log('✅ Cover deleted'))
          .catch(err => console.warn('⚠️ Failed to delete cover:', err.message))
      );
    }
    
    if (book.fileUrl) {
      console.log('🗑️ Deleting PDF from BunnyCDN...');
      deletePromises.push(
        bunnyCDN.deleteFileByUrl(book.fileUrl)
          .then(() => console.log('✅ PDF deleted'))
          .catch(err => console.warn('⚠️ Failed to delete PDF:', err.message))
      );
    }
    
    if (book.pdfUrl && book.pdfUrl !== book.fileUrl) {
      deletePromises.push(
        bunnyCDN.deleteFileByUrl(book.pdfUrl)
          .catch(err => console.warn('⚠️ Failed to delete PDF:', err.message))
      );
    }
    
    // Wait for all deletions (non-blocking if they fail)
    await Promise.allSettled(deletePromises);
    
    // Delete associated translations
    await Translation.deleteMany({
      entityType: 'books',
      entityId: id
    });
    
    // Delete book
    await Book.findByIdAndDelete(id);
    
    console.log('✅ Book deleted successfully');
    
    res.status(200).json({
      message: 'Book deleted successfully.'
    });
  } catch (error) {
    console.error('❌ Error deleting book:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });

    const response = await Promise.all(
      books.map(async (book) => {
        const translations = await getTranslationsByEntity('books', book._id);
        const formatted = formatAdminResponse(book, translations);
        return {
          ...formatted,
          title: book.title
        };
      })
    );

    res.status(200).json({ books: response });
  } catch (error) {
    console.error('GET ALL BOOKS ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getBookById = async (req, res) => {
  try {
    const rawId = req.params.id;
    const id = rawId?.trim();

    // 🛑 ID not sent (":id" bug protection)
    if (!id || id === ':id') {
      return res.status(400).json({
        error: 'Book ID not provided.'
      });
    }

    // 🛑 Invalid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid book ID.',
        receivedId: id
      });
    }

    const requestedLang = req.get('Accept-Language') || 'en';

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({
        error: 'Book not found.'
      });
    }

    // 🔒 Inactive check
    if (book.isActive === false) {
      return res.status(403).json({
        error: 'Book is inactive.'
      });
    }

    const translations = await getTranslationsByEntity('books', book._id);

    const content = await formatBookContentResponse(
      book,
      translations,
      requestedLang
    );


    return res.status(200).json({
      book: content
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    return res.status(500).json({
      error: 'Internal server error.'
    });
  }
};

export { createBook, updateBook, deleteBook, getAllBooks, getBookById };