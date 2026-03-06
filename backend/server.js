import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import patientRoutes from './src/routes/patientRoutes.js';
import trialRoutes from './src/routes/trialRoutes.js';
import matchingRoutes from './src/routes/matchingRoutes.js';
import applicationRoutes from './src/routes/applicationRoutes.js';
import commissionRoutes from './src/routes/commissionRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Parses incoming JSON requests
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Clinerva AI Clinical Trial Matching Engine is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/trials', trialRoutes);
app.use('/api/matches', matchingRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/commissions', commissionRoutes);
app.use('/api/upload', uploadRoutes);   // Cloudinary profile image uploads

// API Documentation Route
app.get('/api', (req, res) => {
  res.json({
    name: 'Clinerva - AI Clinical Trial Matching Engine',
    version: '1.1.0',
    endpoints: {
      auth: '/api/auth',
      patients: '/api/patients',
      trials: '/api/trials',
      matches: '/api/matches',
      applications: '/api/applications',
      commissions: '/api/commissions',
      upload: '/api/upload'
    },
    features: [
      'Patient profile management',
      'AI trial matching (Bytez GPT-4o)',
      'AI eligibility validation with reasoning',
      'Personalized trial recommendations',
      'Profile image upload (Cloudinary)',
      'Doctor referrals',
      'Trial applications',
      'Commission tracking',
      'Reward management',
      'Feedback system'
    ],
    aiEndpoints: {
      healthCheck: 'GET  /api/matches/ai/health',
      eligibility: 'POST /api/matches/ai/eligibility',
      recommendations: 'POST /api/matches/ai/recommendations',
      compareTrials: 'POST /api/matches/ai/compare'
    },
    uploadEndpoints: {
      upload: 'POST   /api/upload/profile-image   (multipart, field: profileImage)',
      delete: 'DELETE /api/upload/profile-image',
      variants: 'GET    /api/upload/profile-image/variants',
      status: 'GET    /api/upload/cloudinary/status  (ADMIN)'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🏥 Environment: ${process.env.NODE_ENV || 'development'}`);
});
