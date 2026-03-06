import mongoose from 'mongoose';

/**
 * Trial Application Schema - When patient applies to a trial
 */
const trialApplicationSchema = new mongoose.Schema(
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
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null
    },
    applicationStatus: {
      type: String,
      enum: ['PENDING', 'DOCTOR_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN'],
      default: 'PENDING'
    },
    doctorVerified: {
      type: Boolean,
      default: false
    },
    doctorVerifiedAt: Date,
    eligibilityScore: {
      type: Number,
      min: 0,
      max: 1
    },
    reasonForRejection: String,
    appliedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrollmentDate: Date,
    withdrawalDate: Date,
    withdrawalReason: String,
    notes: String
  },
  { timestamps: true }
);

trialApplicationSchema.index({ patientId: 1 });
trialApplicationSchema.index({ trialId: 1 });
trialApplicationSchema.index({ applicationStatus: 1 });
trialApplicationSchema.index({ doctorId: 1 });

const TrialApplication = mongoose.model('TrialApplication', trialApplicationSchema);

export default TrialApplication;
