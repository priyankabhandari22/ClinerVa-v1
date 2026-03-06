import mongoose from 'mongoose';

/**
 * Clinical Trial Schema - Main trial information
 */
const clinicalTrialSchema = new mongoose.Schema(
  {
    researchLabId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResearchLab',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['PLANNING', 'OPEN', 'RECRUITING', 'ACTIVE', 'CLOSED', 'COMPLETED', 'TERMINATED'],
      default: 'OPEN'
    },
    trialPhase: {
      type: String,
      enum: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'],
      required: true
    },
    studyType: {
      type: String,
      enum: ['Observational', 'Interventional', 'Expanded Access'],
      default: 'Interventional'
    },
    locations: [
      {
        city: String,
        state: String,
        hospital: String,
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
      }
    ],
    participantLimit: {
      type: Number,
      required: true,
      min: 1
    },
    currentParticipants: {
      type: Number,
      default: 0
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    duration: String, // e.g., "6 months", "1 year"
    objectives: [String],
    rewardAmount: {
      type: Number,
      default: 0
    },
    doctorCommission: {
      type: Number,
      default: 0
    },
    eligibilitySummary: String,
    contactName: String,
    contactEmail: String,
    contactPhone: String
  },
  { timestamps: true }
);

clinicalTrialSchema.index({ status: 1 });
clinicalTrialSchema.index({ trialPhase: 1 });
clinicalTrialSchema.index({ researchLabId: 1 });
clinicalTrialSchema.index({ 'locations.coordinates': '2dsphere' });

const ClinicalTrial = mongoose.model('ClinicalTrial', clinicalTrialSchema);

export default ClinicalTrial;
