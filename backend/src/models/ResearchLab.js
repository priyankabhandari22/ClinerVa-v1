import mongoose from 'mongoose';

/**
 * Research Lab / Sponsor Schema - Organizations that create and sponsor trials
 */
const researchLabSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    labName: {
      type: String,
      required: true,
      trim: true
    },
    organizationType: {
      type: String,
      enum: ['Pharmaceutical', 'Healthcare', 'Academic', 'Government', 'Other'],
      default: 'Pharmaceutical'
    },
    contactEmail: {
      type: String,
      required: true,
      lowercase: true
    },
    contactPhone: String,
    location: {
      city: String,
      state: String,
      country: String,
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
    website: String,
    trialsCreated: {
      type: Number,
      default: 0
    },
    totalParticipants: {
      type: Number,
      default: 0
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    taxId: String,
    registrationNumber: String
  },
  { timestamps: true }
);

researchLabSchema.index({ organizationType: 1 });

const ResearchLab = mongoose.model('ResearchLab', researchLabSchema);

export default ResearchLab;
