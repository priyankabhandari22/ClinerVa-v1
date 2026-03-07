import mongoose from 'mongoose';

/**
 * Trial Match Schema - AI matching engine output
 */
const trialMatchSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    trialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClinicalTrial',
      required: true
    },
    eligibilityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1 // 0 to 1 scale
    },
    matchReasons: [String],
    exclusionReasons: [String],
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    distanceKm: {
      type: Number,
      default: 0
    },
    locationScore: {
      type: Number,
      min: 0,
      max: 1
    },
    priorityScore: {
      type: Number,
      min: 0,
      max: 1
    },
    algorithmVersion: String, // Track which version of matching algorithm was used
    matchedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['PENDING', 'VIEWED', 'APPLIED', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
      default: 'PENDING'
    },
    viewedAt: Date,
    expiresAt: Date
  },
  { timestamps: true }
);

trialMatchSchema.index({ patientId: 1 });
trialMatchSchema.index({ eligibilityScore: -1 });
trialMatchSchema.index({ status: 1 });

const TrialMatch = mongoose.model('TrialMatch', trialMatchSchema);

export default TrialMatch;
