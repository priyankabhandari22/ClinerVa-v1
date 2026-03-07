import mongoose from 'mongoose';

/**
 * Trial Criteria Schema - Eligibility rules extracted by AI (NLP parsing)
 */
const trialCriteriaSchema = new mongoose.Schema(
  {
    trialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClinicalTrial',
      required: true,
      unique: true
    },
    inclusionCriteria: [
      {
        field: String, // e.g., "age", "HbA1c", "condition"
        operator: {
          type: String,
          enum: ['between', 'equals', '>', '<', '>=', '<=', 'contains', 'in', 'not_in'],
          required: true
        },
        value: mongoose.Schema.Types.Mixed, // Can be number, string, or array
        unit: String, // e.g., "years", "mg/dL"
        description: String
      }
    ],
    exclusionCriteria: [
      {
        field: String,
        operator: {
          type: String,
          enum: ['between', 'equals', '>', '<', '>=', '<=', 'contains', 'in', 'not_in'],
          required: true
        },
        value: mongoose.Schema.Types.Mixed,
        unit: String,
        description: String
      }
    ],
    primaryOutcomes: [String],
    secondaryOutcomes: [String],
    aiExtractedAt: {
      type: Date,
      default: Date.now
    },
    manuallyVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    verifiedAt: Date,
    notes: String
  },
  { timestamps: true }
);


const TrialCriteria = mongoose.model('TrialCriteria', trialCriteriaSchema);

export default TrialCriteria;
