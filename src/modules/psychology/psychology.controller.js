import Psychology from './psychology.model.js';
import Plan from '../plans/plan.model.js';
import Translation from '../translations/translation.model.js';
import { createOrUpdateTranslation, getTranslationsByEntity, formatContentResponseMultiLang } from '../translations/translation.service.js';
import { validateTranslationsForCreate, validateContentUrl } from '../../utils/translationValidator.js';
import { formatAdminResponse, formatPsychologyContentResponse } from '../../utils/accessControl.js';
import { uploadImage, uploadFile } from '../../utils/cloudinary.js';
import { generateSlug } from '../../utils/translationHelper.js';
import mongoose from 'mongoose';



 const createPsychology = async (req, res) => {
  try {
    console.log('\n===== CREATE PSYCHOLOGY DEBUG =====');
    console.log('BODY:', req.body);
    console.log('FILES:', req.files);
    console.log('=================================\n');

    // ===== Basic =====
    const key = req.body.key;
    if (!key || !['book', 'video', 'article'].includes(key)) {
      return res.status(400).json({ error: 'Invalid psychology key' });
    }

    const isFree = req.body.isFree === true || req.body.isFree === 'true';

    let plans = [];
    let contentUrl;
    let coverImageUrl;
    let fileUrl;
    let videoUrl;
    let translations = [];

    // ===== Plans Logic (نفس Course) =====
    if (!isFree) {
      if (req.body.plans)
        plans = Array.isArray(req.body.plans) ? req.body.plans : [req.body.plans];
      else if (req.body['plans[]'])
        plans = Array.isArray(req.body['plans[]']) ? req.body['plans[]'] : [req.body['plans[]']];

      plans = plans.map(p => p.toString().trim()).filter(Boolean);

      if (!plans.length)
        return res.status(400).json({ error: 'Plans are required when psychology is not free' });

      const fetchedPlans = await Plan.find({ _id: { $in: plans } });
      if (fetchedPlans.length !== plans.length)
        return res.status(400).json({ error: 'Invalid Plan ID found' });
    }

    // ===== Content URL =====
    contentUrl = req.body.contentUrl?.trim() || '';

    // ===== Type-specific =====
    if (key === 'book') {
      if (req.files?.file) {
        fileUrl = await uploadFile(req.files.file[0], 'psychology/books');
      } else {
        return res.status(400).json({ error: 'PDF file is required for book' });
      }
    }

    if (key === 'video') {
      videoUrl = req.body.videoUrl?.trim();
      if (!videoUrl)
        return res.status(400).json({ error: 'Video URL is required' });
    }

    // ===== Cover Image =====
    if (req.files?.coverImage) {
      coverImageUrl = await uploadImage(req.files.coverImage[0], 'psychology');
    } else if (req.body.coverImageUrl?.startsWith('data:image')) {
      coverImageUrl = await uploadImage(req.body.coverImageUrl, 'psychology');
    } else {
      coverImageUrl = req.body.coverImageUrl || '';
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
    const slug = en?.title ? generateSlug(en.title) : undefined;

    // ===== Paid / Subscription Flags =====
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

    // ===== Create Psychology =====
    const psychology = new Psychology({
      key,
      isFree,
      plans: isFree ? [] : plans,
      contentUrl,
      coverImageUrl,
      fileUrl,
      videoUrl,
      slug,
      isPaid,
      isInSubscription
    });

    await psychology.save();

    // ===== Save Translations =====
    await createOrUpdateTranslation('psychology', psychology._id, 'en', en.title, en.description, en.content);
    await createOrUpdateTranslation('psychology', psychology._id, 'ar', ar.title, ar.description, ar.content);

    // ===== Link to Plans =====
    if (!isFree) {
      for (const planId of plans) {
        const plan = await Plan.findById(planId);
        if (plan && !plan.allowedContent.psychology.includes(psychology._id)) {
          plan.allowedContent.psychology.push(psychology._id);
          await plan.save();
        }
      }
    }

    const createdTranslations = await getTranslationsByEntity('psychology', psychology._id);
    const response = formatAdminResponse(psychology, createdTranslations);

    res.status(201).json({
      message: 'Psychology created successfully',
      psychology: response
    });

  } catch (error) {
    console.error('CREATE PSYCHOLOGY ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const updatePsychology = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid psychology ID.' });
    }

    const psychology = await Psychology.findById(id);
    if (!psychology) {
      return res.status(404).json({ error: 'Psychology not found.' });
    }

    const {
      contentUrl,
      coverImageUrl,
      videoUrl,
      key,
      isFree,
      plans,
      translations // 🔥 ده كان ناقص
    } = req.body;

    /* ================= FILE ================= */
    let fileUrl = psychology.fileUrl;

    if (req.files?.file && (psychology.key === 'book' || key === 'book')) {
      const file = req.files.file[0];
      if (file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: 'Only PDF files are allowed' });
      }
      fileUrl = await uploadFile(file, 'psychology/books');
    }

    /* ================= COVER ================= */
    let finalCoverImageUrl = coverImageUrl || psychology.coverImageUrl;
    if (req.files?.coverImage) {
      finalCoverImageUrl = await uploadImage(
        req.files.coverImage[0],
        'psychology'
      );
    }

    /* ================= UPDATE ================= */
    psychology.key = key ?? psychology.key;
    psychology.isFree = isFree ?? psychology.isFree;
    psychology.plans = Array.isArray(plans) && plans.length ? plans : psychology.plans;
    psychology.contentUrl = contentUrl ?? psychology.contentUrl;
    psychology.videoUrl = videoUrl ?? psychology.videoUrl;
    psychology.coverImageUrl = finalCoverImageUrl;
    psychology.fileUrl = fileUrl;

    /* ================= FLAGS ================= */
    psychology.isPaid = !psychology.isFree;
    psychology.isInSubscription = !psychology.isFree;

    await psychology.save();

    /* ================= TRANSLATIONS ================= */
    // Handle translations if provided in array format
    if (translations) {
      if (typeof translations === 'string') {
        try {
          const parsedTranslations = JSON.parse(translations);
          if (Array.isArray(parsedTranslations)) {
            for (const t of parsedTranslations) {
              await createOrUpdateTranslation(
                'psychology',
                psychology._id,
                t.language,
                t.title,
                t.description,
                t.content
              );
            }
          }
        } catch (e) {
          console.error('Error parsing translations:', e);
        }
      } else if (Array.isArray(translations)) {
        for (const t of translations) {
          await createOrUpdateTranslation(
            'psychology',
            psychology._id,
            t.language,
            t.title,
            t.description,
            t.content
          );
        }
      }
    } else {
      // Handle individual translation fields format (title[en], description[en], etc.)
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
            'psychology',
            psychology._id,
            translation.language,
            translation.title,
            translation.description,
            translation.content
          );
        }
      }
    }

    res.status(200).json({
      message: 'Psychology updated successfully',
      psychology
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




const deletePsychology = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid psychology ID.' });
    }
    
    // Find psychology
    const psychology = await Psychology.findById(id);
    if (!psychology) {
      return res.status(404).json({ error: 'Psychology not found.' });
    }
    
    // Delete associated translations
    await Translation.deleteMany({
      entityType: 'psychology',
      entityId: id
    });
    
    // Delete psychology
    await Psychology.findByIdAndDelete(id);
    
    res.status(200).json({
      message: 'Psychology deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting psychology:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};



const getAllPsychology = async (req, res) => {
  try {
    const psychologies = await Psychology.find().sort({ createdAt: -1 });

    const response = await Promise.all(
      psychologies.map(async (psych) => {
        const translations = await getTranslationsByEntity('psychology', psych._id);

        // نفس الكود القديم بس ضفنا key
        const formatted = formatAdminResponse(psych, translations);
        return {
          ...formatted,
          key: psych.key // 👈 هنا ضفنا key
        };
      })
    );

    res.status(200).json({ psychologies: response });
  } catch (error) {
    console.error('GET ALL PSYCHOLOGIES ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const getPsychologyById = async (req, res) => {
  try {
    const rawId = req.params.id;
    const id = rawId?.trim();
    console.log('[DEBUG] rawId:', rawId);
    console.log('[DEBUG] trimmed id:', id);

    // 🛑 ID not sent
    if (!id || id === ':id') {
      console.log('[ERROR] Psychology ID not provided.');
      return res.status(400).json({
        error: 'Psychology ID not provided.'
      });
    }

    // 🛑 Invalid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('[ERROR] Invalid ObjectId:', id);
      return res.status(400).json({
        error: 'Invalid psychology ID.',
        receivedId: id
      });
    }

    const requestedLang = req.get('Accept-Language') || 'en';
    console.log('[DEBUG] requestedLang:', requestedLang);

    // 🔹 البحث بدون أي شروط إضافية
    const psychology = await Psychology.findOne({ _id: id });
    console.log('[DEBUG] psychology found:', psychology);

    if (!psychology) {
      console.log('[ERROR] Psychology not found for id:', id);
      return res.status(404).json({
        error: 'Psychology not found.'
      });
    }

    const translations = await getTranslationsByEntity(
      'psychology',
      psychology._id
    );
    console.log('[DEBUG] translations:', translations);

    const isAdmin =
      req.userType === 'admin' &&
      (req.role === 'admin' || req.role === 'super_admin');
    console.log('[DEBUG] isAdmin:', isAdmin);

    const userPlans =
      req.user?.subscribedPlans?.map(p => p.toString()) || [];
    console.log('[DEBUG] userPlans:', userPlans);

    const content = await formatPsychologyContentResponse(
      psychology,
      translations,
      requestedLang,
      userPlans,
      isAdmin
    );
    console.log('[DEBUG] formatted content:', content);

    // 📎 Attach assets safely
    if (psychology.coverImageUrl) content.coverImageUrl = psychology.coverImageUrl;
    if (psychology.contentUrl) content.contentUrl = psychology.contentUrl;
    if (psychology.fileUrl) content.fileUrl = psychology.fileUrl;
    if (psychology.videoUrl) content.videoUrl = psychology.videoUrl;
    if (psychology.key) content.key = psychology.key;

    // 👑 Admin-only fields
    if (isAdmin && psychology.plans) {
      content.plans = psychology.plans;
    }

    console.log('[DEBUG] final response content:', content);

    return res.status(200).json({
      psychology: content
    });
  } catch (error) {
    console.error('[ERROR] Error fetching psychology:', error);
    return res.status(500).json({
      error: 'Internal server error.'
    });
  }
};






export { createPsychology, updatePsychology, deletePsychology, getAllPsychology, getPsychologyById };