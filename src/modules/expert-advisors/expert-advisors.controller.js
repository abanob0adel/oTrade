import ExpertAdvisor from './expert-advisor.model.js';
import Translation from '../translations/translation.model.js';
import { createOrUpdateTranslation, getTranslationsByEntity } from '../translations/translation.service.js';
import { validateTranslationsForCreate } from '../../utils/translationValidator.js';
import { formatAdminResponse } from '../../utils/accessControl.js';
import bunnycdn from '../../utils/bunnycdn.js';
import mongoose from 'mongoose';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const parseTranslations = (body) => {
  if (body.translations) {
    if (typeof body.translations === 'string') {
      try { return JSON.parse(body.translations); } catch { return []; }
    }
    return body.translations;
  }
  const translations = [];
  const enTitle = body['title[en]'] || body.title_en || (body.title && body.title.en) || '';
  const arTitle = body['title[ar]'] || body.title_ar || (body.title && body.title.ar) || '';
  const enDesc = body['description[en]'] || body.description_en || (body.description && body.description.en) || '';
  const arDesc = body['description[ar]'] || body.description_ar || (body.description && body.description.ar) || '';
  const enContent = body['content[en]'] || body.content_en || (body.content && body.content.en) || '';
  const arContent = body['content[ar]'] || body.content_ar || (body.content && body.content.ar) || '';

  if (enTitle || enDesc || enContent)
    translations.push({ language: 'en', title: enTitle, description: enDesc, content: enContent });
  if (arTitle || arDesc || arContent)
    translations.push({ language: 'ar', title: arTitle, description: arDesc, content: arContent });
  return translations;
};

const parsePlans = (body) => {
  const raw = body.plans ?? body['plans[]'];
  if (!raw) return undefined;
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.filter(p => p !== '');
};

const getTranslationsMap = async (entityType, ids) => {
  const map = {};
  await Promise.all(ids.map(async (id) => {
    const translations = await getTranslationsByEntity(entityType, id);
    map[id.toString()] = translations;
  }));
  return map;
};

const formatTranslations = (translations, lang) => {
  const t = translations?.find(t => t.language === lang) || translations?.find(t => t.language === 'en') || translations?.[0];
  return { title: t?.title || '', description: t?.description || '', content: t?.content || '' };
};

// ─── CREATE ───────────────────────────────────────────────────────────────────

export const createExpertAdvisor = async (req, res) => {
  try {
    const plans = parsePlans(req.body);
    const translations = parseTranslations(req.body);

    if (!plans || plans.length === 0)
      return res.status(400).json({ error: 'Plans array is required.' });

    const validation = validateTranslationsForCreate(translations);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    let coverImageUrl = req.body.coverImageUrl;
    const imageFile = req.files?.coverImage?.[0] || (Array.isArray(req.files) ? req.files[0] : null);
    if (imageFile) {
      coverImageUrl = await bunnycdn.uploadFile(imageFile.buffer, imageFile.originalname, 'expert-advisors');
    }

    const ea = await new ExpertAdvisor({ plans, coverImageUrl, date: req.body.date }).save();

    const { ar, en } = validation.data;
    await createOrUpdateTranslation('expert-advisor', ea._id, 'ar', ar.title, ar.description, ar.content);
    await createOrUpdateTranslation('expert-advisor', ea._id, 'en', en.title, en.description, en.content);

    const createdTranslations = await getTranslationsByEntity('expert-advisor', ea._id);
    res.status(201).json({ message: 'Expert advisor created successfully.', expertAdvisor: formatAdminResponse(ea, createdTranslations) });
  } catch (error) {
    console.error('Error creating expert advisor:', error);
    res.status(500).json({ error: 'Internal server error.', message: error.message });
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export const updateExpertAdvisor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: 'Invalid ID.' });

    const ea = await ExpertAdvisor.findById(id);
    if (!ea) return res.status(404).json({ error: 'Expert advisor not found.' });

    const plans = parsePlans(req.body);
    const translations = parseTranslations(req.body);

    const imageFile = req.files?.coverImage?.[0] || (Array.isArray(req.files) ? req.files[0] : null);
    if (imageFile) {
      ea.coverImageUrl = await bunnycdn.uploadFile(imageFile.buffer, imageFile.originalname, 'expert-advisors');
    }
    if (plans) ea.plans = plans;
    if (req.body.date) ea.date = req.body.date;
    ea.updatedAt = new Date();
    await ea.save();

    if (translations?.length) {
      for (const t of translations)
        await createOrUpdateTranslation('expert-advisor', ea._id, t.language, t.title, t.description, t.content);
    }

    const updatedTranslations = await getTranslationsByEntity('expert-advisor', ea._id);
    res.status(200).json({ message: 'Expert advisor updated successfully.', expertAdvisor: formatAdminResponse(ea, updatedTranslations) });
  } catch (error) {
    console.error('Error updating expert advisor:', error);
    res.status(500).json({ error: 'Internal server error.', message: error.message });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────

export const deleteExpertAdvisor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: 'Invalid ID.' });

    const ea = await ExpertAdvisor.findById(id);
    if (!ea) return res.status(404).json({ error: 'Expert advisor not found.' });

    await Translation.deleteMany({ entityType: { $in: ['expert-advisor', 'ea-key-feature', 'ea-recommendation', 'ea-pro', 'ea-con', 'ea-update'] }, entityId: { $in: [id, ...ea.keyFeatures.map(k => k._id), ...ea.recommendations.map(r => r._id), ...ea.updates.map(u => u._id)] } });
    await ExpertAdvisor.findByIdAndDelete(id);

    res.status(200).json({ message: 'Expert advisor deleted successfully.' });
  } catch (error) {
    console.error('Error deleting expert advisor:', error);
    res.status(500).json({ error: 'Internal server error.', message: error.message });
  }
};

// ─── GET ALL ──────────────────────────────────────────────────────────────────

export const getAllExpertAdvisors = async (req, res) => {
  try {
    const lang = req.lang || 'en';
    const eas = await ExpertAdvisor.find().sort({ createdAt: -1 });

    const result = await Promise.all(eas.map(async (ea) => {
      const translations = await getTranslationsByEntity('expert-advisor', ea._id);
      const t = formatTranslations(translations, lang);
      return {
        id: ea._id,
        coverImageUrl: ea.coverImageUrl,
        date: ea.date,
        plans: ea.plans,
        title: t.title,
        description: t.description,
        createdAt: ea.createdAt,
        updatedAt: ea.updatedAt
      };
    }));

    res.status(200).json({ expertAdvisors: result });
  } catch (error) {
    console.error('Error fetching expert advisors:', error);
    res.status(500).json({ error: 'Internal server error.', message: error.message });
  }
};

// ─── GET BY ID ────────────────────────────────────────────────────────────────

export const getExpertAdvisorById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: 'Invalid ID.' });

    const ea = await ExpertAdvisor.findById(id);
    if (!ea) return res.status(404).json({ error: 'Expert advisor not found.' });

    const lang = req.lang || 'en';
    const translations = await getTranslationsByEntity('expert-advisor', ea._id);
    const t = formatTranslations(translations, lang);

    // Key Features with translations
    const keyFeatures = await Promise.all(ea.keyFeatures.map(async (kf) => {
      const kfTranslations = await getTranslationsByEntity('ea-key-feature', kf._id);
      const kft = formatTranslations(kfTranslations, lang);
      return { id: kf._id, title: kft.title, description: kft.description };
    }));

    // Pros & Cons
    const pros = await Promise.all(ea.pros.map(async (p) => {
      const pt = await getTranslationsByEntity('ea-pro', p._id);
      const ptt = formatTranslations(pt, lang);
      return { id: p._id, title: ptt.title, description: ptt.description };
    }));

    const cons = await Promise.all(ea.cons.map(async (c) => {
      const ct = await getTranslationsByEntity('ea-con', c._id);
      const ctt = formatTranslations(ct, lang);
      return { id: c._id, title: ctt.title, description: ctt.description };
    }));

    // Recommendations with translations
    const recommendations = await Promise.all(ea.recommendations.map(async (rec) => {
      const recTranslations = await getTranslationsByEntity('ea-recommendation', rec._id);
      const rect = formatTranslations(recTranslations, lang);
      return {
        id: rec._id,
        title: rect.title,
        performanceSummary: rec.performanceSummary || []
      };
    }));

    // Updates with translations
    const updates = await Promise.all(ea.updates.map(async (u) => {
      const ut = await getTranslationsByEntity('ea-update', u._id);
      const utt = formatTranslations(ut, lang);
      return { id: u._id, coverImageUrl: u.coverImageUrl || null, date: u.date, title: utt.title, description: utt.description };
    }));

    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);
    const base = { id: ea._id, coverImageUrl: ea.coverImageUrl, date: ea.date, title: t.title, description: t.description, content: t.content, keyFeatures, recommendations, pros, cons, updates };

    if (!ea.plans || ea.plans.length === 0)
      return res.status(200).json({ expertAdvisor: { ...base, locked: false } });

    if (!req.user)
      return res.status(403).json({ error: 'Access denied', message: 'Subscription required.', expertAdvisor: { id: ea._id, title: t.title, locked: true } });

    if (isAdmin)
      return res.status(200).json({ expertAdvisor: { ...base, plans: ea.plans, locked: false } });

    const Subscription = (await import('../subscriptions/subscription.model.js')).default;
    const sub = await Subscription.findOne({ userId: req.user._id, status: 'active' });
    const hasAccess = sub?.planId && ea.plans.some(p => p.toString() === sub.planId.toString());

    if (hasAccess) return res.status(200).json({ expertAdvisor: { ...base, locked: false } });

    return res.status(403).json({ error: 'Access denied', message: 'Subscription required.', expertAdvisor: { id: ea._id, title: t.title, locked: true }, requiredPlans: ea.plans });
  } catch (error) {
    console.error('Error fetching expert advisor:', error);
    res.status(500).json({ error: 'Internal server error.', message: error.message });
  }
};

// ─── UPDATES CRUD ─────────────────────────────────────────────────────────────

export const addUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: 'Invalid ID.' });

    const ea = await ExpertAdvisor.findById(id);
    if (!ea) return res.status(404).json({ error: 'Expert advisor not found.' });

    let coverImageUrl = req.body.coverImageUrl;
    const imageFile = req.files?.coverImage?.[0] || (Array.isArray(req.files) ? req.files[0] : null);
    if (imageFile) {
      coverImageUrl = await bunnycdn.uploadFile(imageFile.buffer, imageFile.originalname, 'expert-advisors/updates');
    }

    ea.updates.push({ coverImageUrl, date: req.body.date || new Date() });
    await ea.save();

    const update = ea.updates[ea.updates.length - 1];
    const translations = parseTranslations(req.body);
    for (const t of translations)
      await createOrUpdateTranslation('ea-update', update._id, t.language, t.title, t.description, '');

    res.status(201).json({ message: 'Update added.', update: { id: update._id, coverImageUrl: update.coverImageUrl, date: update.date } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.', message: error.message });
  }
};

export const editUpdate = async (req, res) => {
  try {
    const { id, updateId } = req.params;
    const ea = await ExpertAdvisor.findById(id);
    if (!ea) return res.status(404).json({ error: 'Expert advisor not found.' });

    const idx = ea.updates.findIndex(u => u._id.toString() === updateId);
    if (idx === -1) return res.status(404).json({ error: 'Update not found.' });

    if (req.files?.coverImage || req.files?.[0]) {
      const file = req.files?.coverImage?.[0] || (Array.isArray(req.files) ? req.files[0] : null);
      if (file) ea.updates[idx].coverImageUrl = await bunnycdn.uploadFile(file.buffer, file.originalname, 'expert-advisors/updates');
    }
    if (req.body.date) ea.updates[idx].date = req.body.date;
    ea.updates[idx].updatedAt = new Date();
    await ea.save();

    const translations = parseTranslations(req.body);
    for (const t of translations)
      await createOrUpdateTranslation('ea-update', updateId, t.language, t.title, t.description, '');

    res.status(200).json({ message: 'Update edited.', update: ea.updates[idx] });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.', message: error.message });
  }
};

export const deleteUpdate = async (req, res) => {
  try {
    const { id, updateId } = req.params;
    const ea = await ExpertAdvisor.findById(id);
    if (!ea) return res.status(404).json({ error: 'Expert advisor not found.' });

    ea.updates = ea.updates.filter(u => u._id.toString() !== updateId);
    await ea.save();
    await Translation.deleteMany({ entityType: 'ea-update', entityId: updateId });

    res.status(200).json({ message: 'Update deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.', message: error.message });
  }
};

// ─── KEY FEATURES CRUD ────────────────────────────────────────────────────────

export const addKeyFeature = async (req, res) => {
  try {
    const { id } = req.params;
    const ea = await ExpertAdvisor.findById(id);
    if (!ea) return res.status(404).json({ error: 'Expert advisor not found.' });

    ea.keyFeatures.push({});
    await ea.save();
    const kf = ea.keyFeatures[ea.keyFeatures.length - 1];

    const translations = parseTranslations(req.body);
    for (const t of translations)
      await createOrUpdateTranslation('ea-key-feature', kf._id, t.language, t.title, t.description, '');

    res.status(201).json({ message: 'Key feature added.', keyFeature: { id: kf._id } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.', message: error.message });
  }
};

export const editKeyFeature = async (req, res) => {
  try {
    const { id, featureId } = req.params;
    const ea = await ExpertAdvisor.findById(id);
    if (!ea) return res.status(404).json({ error: 'Expert advisor not found.' });

    const kf = ea.keyFeatures.find(k => k._id.toString() === featureId);
    if (!kf) return res.status(404).json({ error: 'Key feature not found.' });

    const translations = parseTranslations(req.body);
    for (const t of translations)
      await createOrUpdateTranslation('ea-key-feature', featureId, t.language, t.title, t.description, '');

    res.status(200).json({ message: 'Key feature updated.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.', message: error.message });
  }
};

export const deleteKeyFeature = async (req, res) => {
  try {
    const { id, featureId } = req.params;
    const ea = await ExpertAdvisor.findById(id);
    if (!ea) return res.status(404).json({ error: 'Expert advisor not found.' });

    ea.keyFeatures = ea.keyFeatures.filter(k => k._id.toString() !== featureId);
    await ea.save();
    await Translation.deleteMany({ entityType: 'ea-key-feature', entityId: featureId });

    res.status(200).json({ message: 'Key feature deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.', message: error.message });
  }
};

// ─── RECOMMENDATIONS CRUD ─────────────────────────────────────────────────────

export const addRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const ea = await ExpertAdvisor.findById(id);
    if (!ea) return res.status(404).json({ error: 'Expert advisor not found.' });

    ea.recommendations.push({ 
      performanceSummary: Array.isArray(req.body.performanceSummary) ? req.body.performanceSummary : []
    });
    await ea.save();
    const rec = ea.recommendations[ea.recommendations.length - 1];

    const translations = parseTranslations(req.body);
    for (const t of translations)
      await createOrUpdateTranslation('ea-recommendation', rec._id, t.language, t.title, '', '');

    res.status(201).json({ message: 'Recommendation added.', recommendation: { id: rec._id } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.', message: error.message });
  }
};

export const editRecommendation = async (req, res) => {
  try {
    const { id, recId } = req.params;
    const ea = await ExpertAdvisor.findById(id);
    if (!ea) return res.status(404).json({ error: 'Expert advisor not found.' });

    const rec = ea.recommendations.find(r => r._id.toString() === recId);
    if (!rec) return res.status(404).json({ error: 'Recommendation not found.' });

    if (req.body.performanceSummary !== undefined) {
      rec.performanceSummary = Array.isArray(req.body.performanceSummary) ? req.body.performanceSummary : [];
    }
    await ea.save();

    const translations = parseTranslations(req.body);
    for (const t of translations)
      await createOrUpdateTranslation('ea-recommendation', recId, t.language, t.title, '', '');

    res.status(200).json({ message: 'Recommendation updated.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.', message: error.message });
  }
};

export const deleteRecommendation = async (req, res) => {
  try {
    const { id, recId } = req.params;
    const ea = await ExpertAdvisor.findById(id);
    if (!ea) return res.status(404).json({ error: 'Expert advisor not found.' });

    await Translation.deleteMany({ entityType: 'ea-recommendation', entityId: recId });
    ea.recommendations = ea.recommendations.filter(r => r._id.toString() !== recId);
    await ea.save();

    res.status(200).json({ message: 'Recommendation deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.', message: error.message });
  }
};

// ─── PROS & CONS CRUD ─────────────────────────────────────────────────────────

export const addProCon = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    if (!['pro', 'con'].includes(type))
      return res.status(400).json({ error: 'type must be pro or con.' });

    const ea = await ExpertAdvisor.findById(id);
    if (!ea) return res.status(404).json({ error: 'Expert advisor not found.' });

    const item = { type };
    if (type === 'pro') ea.pros.push(item);
    else ea.cons.push(item);
    await ea.save();

    const arr = type === 'pro' ? ea.pros : ea.cons;
    const created = arr[arr.length - 1];
    const entityType = type === 'pro' ? 'ea-pro' : 'ea-con';

    const translations = parseTranslations(req.body);
    for (const t of translations)
      await createOrUpdateTranslation(entityType, created._id, t.language, t.title, t.description, '');

    res.status(201).json({ message: `${type} added.`, item: { id: created._id, type } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.', message: error.message });
  }
};

export const editProCon = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const ea = await ExpertAdvisor.findById(id);
    if (!ea) return res.status(404).json({ error: 'Expert advisor not found.' });

    const pro = ea.pros.find(p => p._id.toString() === itemId);
    const con = ea.cons.find(c => c._id.toString() === itemId);
    if (!pro && !con) return res.status(404).json({ error: 'Item not found.' });

    const entityType = pro ? 'ea-pro' : 'ea-con';
    const translations = parseTranslations(req.body);
    for (const t of translations)
      await createOrUpdateTranslation(entityType, itemId, t.language, t.title, t.description, '');

    res.status(200).json({ message: 'Item updated.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.', message: error.message });
  }
};

export const deleteProCon = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const ea = await ExpertAdvisor.findById(id);
    if (!ea) return res.status(404).json({ error: 'Expert advisor not found.' });

    const isPro = ea.pros.some(p => p._id.toString() === itemId);
    if (isPro) ea.pros = ea.pros.filter(p => p._id.toString() !== itemId);
    else ea.cons = ea.cons.filter(c => c._id.toString() !== itemId);

    await ea.save();
    await Translation.deleteMany({ entityType: isPro ? 'ea-pro' : 'ea-con', entityId: itemId });

    res.status(200).json({ message: 'Item deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.', message: error.message });
  }
};
