import mongoose from 'mongoose';

/**
 * Notification Schema - System alerts and notifications for users
 */
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: [
        'TRIAL_MATCH',
        'APPLICATION_STATUS',
        'REWARD_ISSUED',
        'COMMISSION_PAID',
        'TRIAL_UPDATE',
        'REMINDER',
        'SYSTEM',
        'OTHER'
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    relatedData: {
      trialId: mongoose.Schema.Types.ObjectId,
      patientId: mongoose.Schema.Types.ObjectId,
      applicationId: mongoose.Schema.Types.ObjectId,
      doctorId: mongoose.Schema.Types.ObjectId
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: Date,
    actionUrl: String,
    actionLabel: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  },
  { timestamps: true }
);

// Auto-delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

notificationSchema.index({ isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
