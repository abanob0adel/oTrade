import Article from './article.model.js';
import Plan from '../plans/plan.model.js';
import Translation from '../translations/translation.model.js';
import { createOrUpdateTranslation, getTranslationsByEntity } from '../translations/translation.service.js';
import { validateTranslationsForCreate, validateContentUrl } from '../../utils/translationValidator.js';
import { formatAdminResponse } from '../../utils/accessControl.js';
import { uploadImage, uploadFile } from '../../utils/cloudinary.js';
import { generateSlug } from '../../utils/translationHelper.js';
import mongoose from 'mongoose';

// Helper function to format article content response for free access
const formatArticleContentResponse = async (article, translations, requestedLang) => {
  // Find the translation matching the requested language, fallback to English
  const requestedTranslation = 
    translations.find(t => t.language === requestedLang) ||
    translations.find(t => t.language === 'en');
  
  // Base content object with full content always available
  const content = {
    id: article._id,
    title: article.title,
    description: '', 
    content: '', 
    coverImageUrl: article.coverImageUrl || undefined,
    fileUrl: article.fileUrl || undefined,
    videoUrl: article.videoUrl || undefined,
    pdfUrl: article.pdfUrl || undefined,
    contentUrl: article.contentUrl || undefined
  };
  
  // Add translated content for all users (free access)
  if (requestedTranslation) {
    content.title = requestedTranslation.title || article.title;
    content.description = requestedTranslation.description || '';
    content.content = requestedTranslation.content || '';
  }
  
  return content;
};

const createArticle = async (req, res) => {
  try {
    console.log('\n===== CREATE ARTICLE DEBUG =====');
    console.log('BODY:', req.body);
    console.log('FILES:', req.files);
    console.log('================================\n');

    // ===== Basic Fields =====
    // Title will be taken from translations

    const isFree = true; // All articles are free by default
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
      if (!urlValidation.valid) return res.status(400).json({ error: urlValidation.error });
    }

    // ===== File Uploads =====
    // Cover Image
    if (req.files?.coverImage) {
      coverImageUrl = await uploadImage(req.files.coverImage[0], 'articles');
    } else if (req.body.coverImageUrl?.startsWith('data:image')) {
      coverImageUrl = await uploadImage(req.body.coverImageUrl, 'articles');
    } else {
      coverImageUrl = req.body.coverImageUrl || '';
    }

    // File Upload
    if (req.files?.file) {
      fileUrl = await uploadFile(req.files.file[0], 'articles');
    } else {
      fileUrl = req.body.fileUrl || '';
    }

    // ===== Translations =====
    const titles = req.body.title || {};
    const descriptions = req.body.description || {};
    const contents = req.body.content || {};

    if (titles.en || descriptions.en || contents.en)
      translations.push({ language: 'en', title: titles.en || '', description: descriptions.en || '', content: contents.en || '' });

    if (titles.ar || descriptions.ar || contents.ar)
      translations.push({ language: 'ar', title: titles.ar || '', description: descriptions.ar || '', content: contents.ar || '' });

    const validation = validateTranslationsForCreate(translations);
    if (!validation.valid)
      return res.status(400).json({ error: validation.error });

    const { en, ar } = validation.data;
    
    // Use English title as main title, fallback to Arabic if no English
    const mainTitle = en?.title || ar?.title;
    if (!mainTitle) {
      return res.status(400).json({ error: 'Title is required in at least one language' });
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

    // ===== Create Article =====
    const article = new Article({
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

    await article.save();

    // ===== Save Translations =====
    await createOrUpdateTranslation('articles', article._id, 'en', en.title, en.description, en.content);
    if (ar.title || ar.description || ar.content) {
      await createOrUpdateTranslation('articles', article._id, 'ar', ar.title, ar.description, ar.content);
    }

    const createdTranslations = await getTranslationsByEntity('articles', article._id);
    const response = formatAdminResponse(article, createdTranslations);

    res.status(201).json({
      message: 'Article created successfully',
      article: response
    });

  } catch (error) {
    console.error('CREATE ARTICLE ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid article ID.' });
    }
    
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
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
      article.coverImageUrl = await uploadImage(
        req.files.coverImage[0],
        'articles'
      );
    }

    if (req.files?.file?.length) {
      article.fileUrl = await uploadFile(
        req.files.file[0],
        'articles'
      );
    }

    // 📌 Update fields safely
    // Title will be updated through translations

    article.isFree = true; // 🔥 articles are always free

    if (isActive !== undefined) {
      article.isActive = isActive === 'true' || isActive === true;
    }

    if (contentUrl?.trim()) article.contentUrl = contentUrl.trim();
    if (videoUrl?.trim()) article.videoUrl = videoUrl.trim();
    if (pdfUrl?.trim()) article.pdfUrl = pdfUrl.trim();

    // ❗ only use URL fields if NO upload happened
    if (!req.files?.coverImage && coverImageUrl?.trim()) {
      article.coverImageUrl = coverImageUrl.trim();
    }

    if (!req.files?.file && req.body.fileUrl?.trim()) {
      article.fileUrl = req.body.fileUrl.trim();
    }

    await article.save();

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
            'articles',
            article._id,
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
            'articles',
            article._id,
            translation.language,
            translation.title,
            translation.description,
            translation.content
          );
        }
        
        // Update article title and slug if English title is provided
        if (titles.en) {
          article.title = titles.en;
          article.slug = generateSlug(titles.en);
        } else if (titles.ar && !article.title) {
          // Fallback to Arabic title if no English and no existing title
          article.title = titles.ar;
          article.slug = generateSlug(titles.ar);
        }
      }
    }

    const updatedTranslations = await getTranslationsByEntity(
      'articles',
      article._id
    );

    const response = formatAdminResponse(article, updatedTranslations);

    return res.status(200).json({
      message: 'Article updated successfully.',
      article: response
    });
  } catch (error) {
    console.error('Error updating article:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid article ID.' });
    }
    
    // Find article
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }
    
    // Delete associated translations
    await Translation.deleteMany({
      entityType: 'articles',
      entityId: id
    });
    
    // Delete article
    await Article.findByIdAndDelete(id);
    
    res.status(200).json({
      message: 'Article deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });

    const response = await Promise.all(
      articles.map(async (article) => {
        const translations = await getTranslationsByEntity('articles', article._id);
        const formatted = formatAdminResponse(article, translations);
        return {
          ...formatted,
          title: article.title
        };
      })
    );

    res.status(200).json({ articles: response });
  } catch (error) {
    console.error('GET ALL ARTICLES ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getArticleById = async (req, res) => {
  try {
    const rawId = req.params.id;
    const id = rawId?.trim();

    // 🛑 ID not sent (":id" bug protection)
    if (!id || id === ':id') {
      return res.status(400).json({
        error: 'Article ID not provided.'
      });
    }

    // 🛑 Invalid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid article ID.',
        receivedId: id
      });
    }

    const requestedLang = req.get('Accept-Language') || 'en';

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({
        error: 'Article not found.'
      });
    }

    // 🔒 Inactive check
    if (article.isActive === false) {
      return res.status(403).json({
        error: 'Article is inactive.'
      });
    }

    const translations = await getTranslationsByEntity('articles', article._id);

    const content = await formatArticleContentResponse(
      article,
      translations,
      requestedLang
    );

    return res.status(200).json({
      article: content
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return res.status(500).json({
      error: 'Internal server error.'
    });
  }
};

export { createArticle, updateArticle, deleteArticle, getAllArticles, getArticleById };