import express from 'express';
import { getEconomicCalendar, healthCheck } from './economic-calendar.controller.js';

const router = express.Router();

// Public routes for economic calendar
router.get('/', getEconomicCalendar);
router.get('/health', healthCheck);

// Alternative route patterns that might be useful
router.get('/events', getEconomicCalendar);

export default router;