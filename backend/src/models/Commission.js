import mongoose from 'mongoose';

/**
 * Commission Schema - Doctor earnings from trial referrals
 */
const commissionSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
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
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    percentage: {
      type: Number,
      default: 0 // Percentage of trial reward, if applicable
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'CANCELLED'],
      default: 'PENDING'
    },
    reason: String, // e.g., "Patient enrollment", "Successful completion"
    paidAt: Date,
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    bankDetails: {
      accountNumber: String,
      bankName: String,
      ifscCode: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

commissionSchema.index({ doctorId: 1 });
commissionSchema.index({ status: 1 });

const Commission = mongoose.model('Commission', commissionSchema);

export default Commission;
