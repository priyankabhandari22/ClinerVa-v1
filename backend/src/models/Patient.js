import mongoose from 'mongoose';

/**
 * Patient Schema - Anonymized patient health profile
 */
const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    anonymousId: {
      type: String,
      unique: true,
      sparse: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 150
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true
    },
    location: {
      city: String,
      state: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0]
        }
      }
    },
    conditions: [String], // e.g., ["Type 2 Diabetes", "Hypertension"]
    medications: [String],
    allergies: [String],
    labResults: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    lifestyle: {
      smoking: Boolean,
      alcohol: Boolean
    },
    consentGiven: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Create geospatial index for location-based queries
patientSchema.index({ 'location.coordinates': '2dsphere' });
patientSchema.index({ conditions: 1 });
patientSchema.index({ age: 1 });

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
