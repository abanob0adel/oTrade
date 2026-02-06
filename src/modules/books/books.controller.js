import Book from './book.model.js';
import Plan from '../plans/plan.model.js';
import Translation from '../translations/translation.model.js';
import { createOrUpdateTranslation, getTranslationsByEntity } from '../translations/translation.service.js';
import { validateTranslationsForCreate, validateContentUrl } from '../../utils/translationValidator.js';
import { formatAdminResponse } from '../../utils/accessControl.js';
import { uploadImage, uploadFile } from '../../utils/cloudinary.js';
import { generateSlug } from '../../utils/translationHelper.js';
import mongoose from 'mongoose';
import { 
  ValidationError, 
  FileUploadError, 
  TranslationError,
  createErrorResponse 
} from './books.errors.js';

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
    console.log('USER:', req.auth?.id || 'Anonymous');
    console.log('================================\n');
 
    // ===== Validation Phase =====
    const validationErrors = [];
    
    // Validate required fields from translations
    const inputTitles = req.body.title || {};
    const hasTitle = inputTitles.en?.trim() || inputTitles.ar?.trim();
    
    if (!hasTitle) {
      validationErrors.push({
        field: 'title',
        message: 'Title is required in at least one language (English or Arabic)'
      });
    }

    const isFree = true; // All books are free by default
    const isActive = req.body.isActive !== undefined ? 
      (req.body.isActive === true || req.body.isActive === 'true') : true;

    let contentUrl;
    let coverImageUrl;
    let fileUrl;
    let videoUrl;
    let pdfUrl;
    let translations = [];

    // ===== Content URLs =====
    contentUrl = req.body.contentUrl?.trim() || '';
    videoUrl = req.body.videoUrl?.trim() || '';
    pdfUrl = req.body.pdfUrl?.trim() || '';

    if (contentUrl) {
      const urlValidation = validateContentUrl(contentUrl);
      if (!urlValidation.valid) {
        validationErrors.push({
          field: 'contentUrl',
          message: urlValidation.error
        });
      }
    }

    // Throw validation error if any validation failed
    if (validationErrors.length > 0) {
      throw new ValidationError('Validation failed', validationErrors);
    }

    // ===== File Uploads =====
    try {
      // Cover Image
      if (req.files?.coverImage) {
        coverImageUrl = await uploadImage(req.files.coverImage[0], 'books');
      } else if (req.body.coverImageUrl?.startsWith('data:image')) {
        coverImageUrl = await uploadImage(req.body.coverImageUrl, 'books');
      } else {
        coverImageUrl = req.body.coverImageUrl || '';
      }

      // File Upload
      if (req.files?.file) {
        fileUrl = await uploadFile(req.files.file[0], 'books');
      } else {
        fileUrl = req.body.fileUrl || '';
      }
    } catch (uploadError) {
      console.error('File upload error:', uploadError);
      throw new FileUploadError(`File upload failed: ${uploadError.message}`);
    }

    // ===== Translations =====
    const translationTitles = req.body.title || {};
    const descriptions = req.body.description || {};
    const contents = req.body.content || {};

    if (translationTitles.en || descriptions.en || contents.en)
      translations.push({ language: 'en', title: translationTitles.en || '', description: descriptions.en || '', content: contents.en || '' });

    if (translationTitles.ar || descriptions.ar || contents.ar)
      translations.push({ language: 'ar', title: translationTitles.ar || '', description: descriptions.ar || '', content: contents.ar || '' });

    const validation = validateTranslationsForCreate(translations);
    if (!validation.valid)
      throw new TranslationError(validation.error);

    const { en, ar } = validation.data;
    
    // Use English title as main title, fallback to Arabic if no English
    const mainTitle = en?.title || ar?.title;
    if (!mainTitle) {
      throw new ValidationError('Title is required in at least one language');
    }
    
    const slug = generateSlug(mainTitle);

    // ===== Payment flags =====
    let isPaid = false;
    let isInSubscription = false;

    if (!isFree) {
      const plansData = await Plan.find({ _id: { $in: plans } });

      isInSubscription = plansData.some(plan =>
        plan.subscriptionOptions &&
        (
          plan.subscriptionOptions.monthly?.price > 0 ||
          plan.subscriptionOptions.quarterly?.price > 0 ||
          plan.subscriptionOptions.semiAnnual?.price > 0 ||
          plan.subscriptionOptions.yearly?.price > 0
        )
      );

      isPaid = plansData.some(plan => plan.price > 0) || isInSubscription;
    }

    // ===== Create Book =====
    const book = new Book({
      title: mainTitle,
      isFree,
      plans: isFree ? [] : plans,
      contentUrl,
      coverImageUrl,
      fileUrl,
      videoUrl,
      pdfUrl,
      isActive,
      slug,
      isPaid,
      isInSubscription
    });

    await book.save();

    // ===== Save Translations =====
    await createOrUpdateTranslation('books', book._id, 'en', en.title, en.description, en.content);
    if (ar.title || ar.description || ar.content) {
      await createOrUpdateTranslation('books', book._id, 'ar', ar.title, ar.description, ar.content);
    }



    const createdTranslations = await getTranslationsByEntity('books', book._id);
    const response = formatAdminResponse(book, createdTranslations);

    res.status(201).json({
      message: 'Book created successfully',
      book: response
    });

  } catch (error) {
    console.error('CREATE BOOK ERROR:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      user: req.auth?.id || 'Anonymous',
      timestamp: new Date().toISOString()
    });
    
    // Use global error handler or send custom response
    const errorResponse = createErrorResponse(error);
    res.status(error.statusCode || 500).json(errorResponse);
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

    // 📌 Handle uploads FIRST
    if (req.files?.coverImage?.length) {
      book.coverImageUrl = await uploadImage(
        req.files.coverImage[0],
        'books'
      );
    }

    if (req.files?.file?.length) {
      book.fileUrl = await uploadFile(
        req.files.file[0],
        'books'
      );
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
    
    // Delete associated translations
    await Translation.deleteMany({
      entityType: 'books',
      entityId: id
    });
    
    // Delete book
    await Book.findByIdAndDelete(id);
    
    res.status(200).json({
      message: 'Book deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting book:', error);
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