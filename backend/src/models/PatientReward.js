import mongoose from 'mongoose';

/**
 * Patient Reward Schema - Rewards for trial participation
 */
const patientRewardSchema = new mongoose.Schema(
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
    trialApplicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TrialApplication'
    },
    rewardAmount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    rewardType: {
      type: String,
      enum: ['PARTICIPATION', 'COMPLETION', 'MILESTONE', 'REFERRAL', 'OTHER'],
      default: 'PARTICIPATION'
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'FORFEITED'],
      default: 'PENDING'
    },
    reason: String,
    issuedAt: {
      type: Date,
      default: Date.now
    },
    paidAt: Date,
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    paymentMethod: {
      type: String,
      enum: ['BANK_TRANSFER', 'WALLET', 'VOUCHER', 'GIFT_CARD', 'OTHER'],
      default: 'BANK_TRANSFER'
    },
    paymentDetails: mongoose.Schema.Types.Mixed,
    notes: String
  },
  { timestamps: true }
);

patientRewardSchema.index({ patientId: 1 });
patientRewardSchema.index({ status: 1 });
patientRewardSchema.index({ trialId: 1 });

const PatientReward = mongoose.model('PatientReward', patientRewardSchema);

export default PatientReward;
