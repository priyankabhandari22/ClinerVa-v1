import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import all models to ensure they're registered
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import ResearchLab from '../models/ResearchLab.js';
import ClinicalTrial from '../models/ClinicalTrial.js';
import TrialCriteria from '../models/TrialCriteria.js';
import TrialMatch from '../models/TrialMatch.js';
import TrialApplication from '../models/TrialApplication.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Commission from '../models/Commission.js';
import PatientReward from '../models/PatientReward.js';
import Feedback from '../models/Feedback.js';
import Notification from '../models/Notification.js';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('Error: MONGODB_URI environment variable is not defined.');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Create essential indexes
    await createIndexes();

  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Create necessary database indexes for performance optimization
 */
const createIndexes = async () => {
  try {
    // User indexes
    await User.collection.createIndex({ email: 1 });
    await User.collection.createIndex({ role: 1 });
    
    // Patient indexes
    await Patient.collection.createIndex({ userId: 1 });
    await Patient.collection.createIndex({ conditions: 1 });
    await Patient.collection.createIndex({ 'location.coordinates': '2dsphere' });
    
    // Doctor indexes
    await Doctor.collection.createIndex({ userId: 1 });
    await Doctor.collection.createIndex({ 'location.coordinates': '2dsphere' });
    await Doctor.collection.createIndex({ specialization: 1 });
    
    // Trial indexes
    await ClinicalTrial.collection.createIndex({ status: 1 });
    await ClinicalTrial.collection.createIndex({ researchLabId: 1 });
    await ClinicalTrial.collection.createIndex({ 'locations.coordinates': '2dsphere' });
    
    // Matching indexes
    await TrialMatch.collection.createIndex({ patientId: 1, eligibilityScore: -1 });
    await TrialMatch.collection.createIndex({ status: 1 });
    
    // Application indexes
    await TrialApplication.collection.createIndex({ patientId: 1, applicationStatus: 1 });
    await TrialApplication.collection.createIndex({ doctorId: 1 });
    
    // Commission indexes
    await Commission.collection.createIndex({ doctorId: 1, status: 1 });
    
    // Notification TTL index (auto-delete after 30 days)
    await Notification.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.warn('⚠️ Error creating indexes (might already exist):', error.message);
  }
};

export default connectDB;
