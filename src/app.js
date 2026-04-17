import express from 'express';
import connectDB from './config/db.js';
import 'dotenv/config';
import cors from 'cors';

const app = express();

// Connect to MongoDB
connectDB();
       
// Enable CORS with specific origins
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://api.otrade.ae',
    'http://api.otrade.ae',
    'https://otrade-admin.vercel.app',
    'https://otrade.ae', 
    'https://www.otrade.ae',
    'http://otrade.ae',
    'http://www.otrade.ae',
    'https://portal.otrade.ae',
    'http://portal.otrade.ae',
    'https://www.portal.otrade.ae',
    'http://www.portal.otrade.ae',
    'https://o-trade-front.vercel.app',
    'http://72.61.176.86',
    'http://72.61.176.86:3000', 
    'http://72.61.176.86:5173'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}; 
 
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Support FormData

// Routes
import authRoutes from './modules/auth/auth.routes.js';
import subscriptionRoutes from './modules/subscriptions/subscription.routes.js';
import subscriptionRequestRoutes from './modules/subscription-requests/subscription-request.routes.js';
import courseRoutes from './modules/courses/courses.routes.js';
import strategyRoutes from './modules/strategies/strategies.routes.js';
import analysisRoutes from './modules/analysis/analysis.routes.js';
import webinarRoutes from './modules/webinars/webinars.routes.js';
import psychologyRoutes from './modules/psychology/psychology.routes.js';
import bookRoutes from './modules/books/books.routes.js';
import articleRoutes from './modules/articles/articles.routes.js';
import analystRoutes from './modules/analysts/analysts.routes.js';
import supportRoutes from './modules/support/support.routes.js';
import userRoutes from './modules/users/user.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import calendarRoutes from './modules/calendar/calendar.routes.js';
import planRoutes from './modules/plans/plan.routes.js';
import testimonialRoutes from '../src/modules/testimonials/testimonials.routes.js';
import partnerRoutes from './modules/partners/partner.routes.js';
import brokerRoutes from './modules/brokers/broker.routes.js';
import newsRoutes from './modules/news/news.routes.js';
import contactRoutes from './modules/contacts/contact.routes.js';
import contactUsRoutes from './modules/contact/contact.routes.js';
import consultationRoutes from './modules/consultations/consultation.routes.js';
import paymentRoutes from './modules/payments/payment.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import bitcoinRoutes from './modules/bitcoin/bitcoin.routes.js';
import marketAnalysisRoutes from './modules/market-analysis/market-analysis.routes.js';
import emailRoutes from './modules/emails/email.routes.js';
import newsletterRoutes from './modules/newsletter/newsletter.routes.js';
import aboutRoutes from './modules/about/about.routes.js';
import indicatorRoutes from './modules/indicators/indicators.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/admin/subscriptions', subscriptionRoutes);
app.use('/api/subscription-requests', subscriptionRequestRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/strategies', strategyRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/webinars', webinarRoutes);
app.use('/api/psychology', psychologyRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/analysts', analystRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/v1/partners', partnerRoutes); // Our Partners (new system with translations)
app.use('/api/partners', brokerRoutes); // Brokers (old partners system)
app.use('/api/news', newsRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/quick_call', contactUsRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/bitcoin', bitcoinRoutes);
app.use('/api/market-analysis', marketAnalysisRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/indicators', indicatorRoutes);
//app.use('/api/payments', paymentRoutes);
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});
  
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;  