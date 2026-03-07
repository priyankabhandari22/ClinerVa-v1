import mongoose from 'mongoose';

/**
 * Doctor Schema - Doctors who register and refer patients
 */
const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    hospital: {
      type: String,
      required: true
    },
    specialization: {
      type: String,
      required: true
    },
    licenseNumber: String,
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
          type: [Number],
          default: [0, 0]
        }
      }
    },
    patientsRegistered: {
      type: Number,
      default: 0
    },
    trialsReferred: {
      type: Number,
      default: 0
    },
    totalCommissionEarned: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    bio: String,
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

doctorSchema.index({ 'location.coordinates': '2dsphere' });
doctorSchema.index({ specialization: 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
