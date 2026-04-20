import Indicator from './indicator.model.js';
import Translation from '../translations/translation.model.js';
import { createOrUpdateTranslation, getTranslationsByEntity } from '../translations/translation.service.js';
import { validateTranslationsForCreate } from '../../utils/translationValidator.js';
import { formatAdminResponse } from '../../utils/accessControl.js';
import bunnycdn from '../../utils/bunnycdn.js';
import mongoose from 'mongoose';

// Helper to parse translations from FormData or JSON
const parseTranslations = (body) => {
  // Format 1: translations as JSON string or array
  if (body.translations) {
    if (typeof body.translations === 'string') {
      try { return JSON.parse(body.translations); } catch { /* fall through */ }
    } else if (Array.isArray(body.translations)) {
      return body.translations;
    }
  }

  const translations = [];

  // Format 2: title[en], title[ar] (parsed by express as objects)
  const titles = body.title || {};
  const descriptions = body.description || {};
  const contents = body.content || {};

  if (titles.en || descriptions.en || contents.en)
    translations.push({ language: 'en', title: titles.en || '', description: descriptions.en || '', content: contents.en || '' });
  if (titles.ar || descriptions.ar || contents.ar)
    translations.push({ language: 'ar', title: titles.ar || '', description: descriptions.ar || '', content: contents.ar || '' });

  if (translations.length) return translations;

  // Format 3: title_en, title_ar flat keys
  const enTitle = body.title_en || body['title[en]'];
  const arTitle = body.title_ar || body['title[ar]'];
  const enDesc  = body.description_en || body['description[en]'];
  const arDesc  = body.description_ar || body['description[ar]'];
  const enCont  = body.content_en || body['content[en]'];
  const arCont  = body.content_ar || body['content[ar]'];

  if (enTitle || enDesc || enCont)
    translations.push({ language: 'en', title: enTitle || '', description: enDesc || '', content: enCont || '' });
  if (arTitle || arDesc || arCont)
    translations.push({ language: 'ar', title: arTitle || '', description: arDesc || '', content: arCont || '' });

  return translations;
};

// Helper to parse plans from FormData
const parsePlans = (body) => {
  const raw = body.plans ?? body['plans[]'];
  if (!raw) return undefined;
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.filter(p => p !== '');
};

// ─── CREATE ───────────────────────────────────────────────────────────────────
export const createIndicator = async (req, res) => {
  try {
    let coverImageUrl = req.body.coverImageUrl;
    const plans = parsePlans(req.body);
    const date = req.body.date;
    const translations = parseTranslations(req.body);

    if (req.files?.coverImage) {
      try { coverImageUrl = await bunnycdn.uploadImage(req.files.coverImage[0].buffer, req.files.coverImage[0].originalname, 'indicators'); }
      catch { return res.status(400).json({ error: 'Failed to upload cover image' }); }
    } else if (coverImageUrl?.startsWith('data:image')) {
      try { coverImageUrl = await bunnycdn.uploadImage(Buffer.from(coverImageUrl.split(',')[1], 'base64'), 'cover.jpg', 'indicators'); }
      catch { return res.status(400).json({ error: 'Failed to upload cover image' }); }
    }

    if (!plans || plans.length === 0)
      return res.status(400).json({ error: 'Plans array is required.' });

    const validation = validateTranslationsForCreate(translations);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    const { ar, en } = validation.data;

    const indicator = await new Indicator({ plans, coverImageUrl, date }).save();

    await createOrUpdateTranslation('indicator', indicator._id, 'ar', ar.title, ar.description, ar.content);
    await createOrUpdateTranslation('indicator', indicator._id, 'en', en.title, en.description, en.content);

    const createdTranslations = await getTranslationsByEntity('indicator', indicator._id);
    res.status(201).json({ message: 'Indicator created successfully.', indicator: formatAdminResponse(indicator, createdTranslations) });
  } catch (error) {
    console.error('Error creating indicator:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
export const updateIndicator = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: 'Invalid indicator ID.' });

    const indicator = await Indicator.findById(id);
    if (!indicator) return res.status(404).json({ error: 'Indicator not found.' });

    let coverImageUrl = req.body.coverImageUrl;
    const plans = parsePlans(req.body);
    const date = req.body.date;
    const translations = parseTranslations(req.body);

    if (req.files?.coverImage) {
      try { coverImageUrl = await bunnycdn.uploadImage(req.files.coverImage[0].buffer, req.files.coverImage[0].originalname, 'indicators'); }
      catch { return res.status(400).json({ error: 'Failed to upload cover image' }); }
    } else if (coverImageUrl?.startsWith('data:image')) {
      try { coverImageUrl = await bunnycdn.uploadImage(Buffer.from(coverImageUrl.split(',')[1], 'base64'), 'cover.jpg', 'indicators'); }
      catch { return res.status(400).json({ error: 'Failed to upload cover image' }); }
    }

    if (plans) {
      if (plans.length === 0) return res.status(400).json({ error: 'Plans array cannot be empty.' });
      indicator.plans = plans;
    }
    if (coverImageUrl !== undefined) indicator.coverImageUrl = coverImageUrl;
    if (date !== undefined) indicator.date = date;

    await indicator.save();

    if (translations?.length) {
      for (const t of translations)
        await createOrUpdateTranslation('indicator', indicator._id, t.language, t.title, t.description, t.content);
    }

    const updatedTranslations = await getTranslationsByEntity('indicator', indicator._id);
    res.status(200).json({ message: 'Indicator updated successfully.', indicator: formatAdminResponse(indicator, updatedTranslations) });
  } catch (error) {
    console.error('Error updating indicator:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
export const deleteIndicator = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: 'Invalid indicator ID.' });

    const indicator = await Indicator.findById(id);
    if (!indicator) return res.status(404).json({ error: 'Indicator not found.' });

    await Translation.deleteMany({ entityType: 'indicator', entityId: id });
    await Indicator.findByIdAndDelete(id);

    res.status(200).json({ message: 'Indicator deleted successfully.' });
  } catch (error) {
    console.error('Error deleting indicator:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── GET ALL ──────────────────────────────────────────────────────────────────
export const getAllIndicators = async (req, res) => {
  try {
    const indicators = await Indicator.find().sort({ createdAt: -1 });

    const result = await Promise.all(indicators.map(async (indicator) => {
      const translations = await getTranslationsByEntity('indicator', indicator._id);
      const t = translations.find(t => t.language === req.lang) || translations.find(t => t.language === 'en');
      return {
        id: indicator._id,
        coverImageUrl: indicator.coverImageUrl,
        date: indicator.date,
        plans: indicator.plans,
        title: t?.title || '',
        description: t?.description || '',
        createdAt: indicator.createdAt,
        updatedAt: indicator.updatedAt
      };
    }));

    res.status(200).json({ indicators: result });
  } catch (error) {
    console.error('Error fetching indicators:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── GET BY ID ────────────────────────────────────────────────────────────────
export const getIndicatorById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: 'Invalid indicator ID.' });

    const indicator = await Indicator.findById(id);
    if (!indicator) return res.status(404).json({ error: 'Indicator not found.' });

    const translations = await getTranslationsByEntity('indicator', indicator._id);
    const t = translations.find(t => t.language === req.lang) || translations.find(t => t.language === 'en') || translations[0];

    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);

    const base = {
      id: indicator._id,
      coverImageUrl: indicator.coverImageUrl,
      date: indicator.date,
      title: t?.title || '',
      description: t?.description || '',
      content: t?.content || '',
      updates: indicator.updates
    };

    if (!indicator.plans || indicator.plans.length === 0)
      return res.status(200).json({ indicator: { ...base, locked: false } });

    // Check if any of the indicator's plans is a free plan
    const Plan = (await import('../plans/plan.model.js')).default;
    const indicatorPlans = await Plan.find({ _id: { $in: indicator.plans } });
    const hasFreePlan = indicatorPlans.some(p => p.isFree === true);

    if (hasFreePlan)
      return res.status(200).json({ indicator: { ...base, locked: false } });

    if (!req.user)
      return res.status(403).json({
        error: 'Access denied',
        message: 'This indicator requires an active subscription.',
        indicator: { id: indicator._id, coverImageUrl: indicator.coverImageUrl, date: indicator.date, title: base.title, description: base.description, locked: true }
      });

    if (isAdmin)
      return res.status(200).json({ indicator: { ...base, plans: indicator.plans, locked: false } });

    const Subscription = (await import('../subscriptions/subscription.model.js')).default;
    const userSubscription = await Subscription.findOne({ userId: req.user._id, status: 'active' });
    const hasAccess = userSubscription?.planId && indicator.plans.some(p => p.toString() === userSubscription.planId.toString());

    if (hasAccess)
      return res.status(200).json({ indicator: { ...base, locked: false } });

    return res.status(403).json({
      error: 'Access denied',
      message: 'You need to subscribe to a plan that includes this indicator.',
      indicator: { id: indicator._id, coverImageUrl: indicator.coverImageUrl, date: indicator.date, title: base.title, description: base.description, locked: true },
      requiredPlans: indicator.plans
    });
  } catch (error) {
    console.error('Error fetching indicator:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── ADD UPDATE ───────────────────────────────────────────────────────────────
export const addIndicatorUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: 'Invalid indicator ID.' });

    const indicator = await Indicator.findById(id);
    if (!indicator) return res.status(404).json({ error: 'Indicator not found.' });

    let coverImageUrl = req.body.coverImageUrl;
    const { title, description } = req.body;

    if (req.files?.coverImage) {
      try { coverImageUrl = await bunnycdn.uploadImage(req.files.coverImage[0].buffer, req.files.coverImage[0].originalname, 'indicators/updates'); }
      catch { return res.status(400).json({ error: 'Failed to upload image' }); }
    } else if (coverImageUrl?.startsWith('data:image')) {
      try { coverImageUrl = await bunnycdn.uploadImage(Buffer.from(coverImageUrl.split(',')[1], 'base64'), 'cover.jpg', 'indicators/updates'); }
      catch { return res.status(400).json({ error: 'Failed to upload image' }); }
    }

    indicator.updates.push({ coverImageUrl, title, description, date: new Date() });
    await indicator.save();

    res.status(201).json({ message: 'Update added successfully.', indicator });
  } catch (error) {
    console.error('Error adding indicator update:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─── DELETE UPDATE ────────────────────────────────────────────────────────────
export const deleteIndicatorUpdate = async (req, res) => {
  try {
    const { id, updateId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(updateId))
      return res.status(400).json({ error: 'Invalid ID.' });

    const indicator = await Indicator.findById(id);
    if (!indicator) return res.status(404).json({ error: 'Indicator not found.' });

    indicator.updates = indicator.updates.filter(u => u._id.toString() !== updateId);
    await indicator.save();

    res.status(200).json({ message: 'Update deleted successfully.' });
  } catch (error) {
    console.error('Error deleting indicator update:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
