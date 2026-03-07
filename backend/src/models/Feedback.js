import mongoose from 'mongoose';

/**
 * Feedback Schema - Patient feedback on trial experience
 */
const feedbackSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    feedbackCategory: {
      type: String,
      enum: ['TRIAL_EXPERIENCE', 'RESEARCHER_SUPPORT', 'FACILITIES', 'COMMUNICATION', 'OVERALL'],
      default: 'OVERALL'
    },
    feedback: {
      type: String,
      minlength: 10,
      maxlength: 1000
    },
    pros: [String],
    cons: [String],
    wouldRecommend: {
      type: Boolean,
      default: null
    },
    anonymousReview: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

feedbackSchema.index({ patientId: 1 });
feedbackSchema.index({ rating: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
