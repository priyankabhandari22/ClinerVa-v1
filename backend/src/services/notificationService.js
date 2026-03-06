import Notification from '../models/Notification.js';

/**
 * Notification Service - Handle user notifications
 */

class NotificationService {
  /**
   * Create notification
   */
  static async createNotification(notificationData) {
    const notification = new Notification(notificationData);
    return await notification.save();
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(userId, limit = 20, skip = 0) {
    return await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
  }

  /**
   * Get unread notifications count
   */
  static async getUnreadCount(userId) {
    return await Notification.countDocuments({ userId, isRead: false });
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId) {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  /**
   * Mark all notifications as read for user
   */
  static async markAllAsRead(userId) {
    return await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId) {
    return await Notification.findByIdAndDelete(notificationId);
  }

  /**
   * Delete old notifications
   */
  static async deleteOldNotifications(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return await Notification.deleteMany({
      createdAt: { $lt: cutoffDate }
    });
  }

  /**
   * Notify patient of trial match
   */
  static async notifyTrialMatch(userId, trialData, matchScore) {
    return this.createNotification({
      userId,
      type: 'TRIAL_MATCH',
      title: 'New Trial Match!',
      message: `You matched with "${trialData.title}" with a ${Math.round(matchScore * 100)}% compatibility score!`,
      relatedData: {
        trialId: trialData._id
      },
      priority: matchScore > 0.8 ? 'HIGH' : 'MEDIUM',
      actionUrl: `/trials/${trialData._id}`,
      actionLabel: 'View Trial'
    });
  }

  /**
   * Notify application status change
   */
  static async notifyApplicationStatus(userId, applicationId, status) {
    const statusMessages = {
      'APPROVED': 'Your application has been approved! You can now enroll in the trial.',
      'REJECTED': 'Your application was not approved. Check the feedback for more details.',
      'DOCTOR_REVIEW': 'Your application is under doctor review.',
      'WITHDRAWN': 'Your application has been withdrawn.'
    };

    return this.createNotification({
      userId,
      type: 'APPLICATION_STATUS',
      title: `Application ${status}`,
      message: statusMessages[status] || `Application status: ${status}`,
      relatedData: { applicationId },
      priority: status === 'REJECTED' ? 'MEDIUM' : 'HIGH',
      actionUrl: `/applications/${applicationId}`,
      actionLabel: 'View Application'
    });
  }

  /**
   * Notify reward issued
   */
  static async notifyRewardIssued(userId, rewardAmount, trialId) {
    return this.createNotification({
      userId,
      type: 'REWARD_ISSUED',
      title: 'Reward Issued!',
      message: `You have been rewarded ₹${rewardAmount} for your participation.`,
      relatedData: { trialId },
      priority: 'HIGH',
      actionUrl: `/rewards`,
      actionLabel: 'View Rewards'
    });
  }

  /**
   * Notify commission paid
   */
  static async notifyCommissionPaid(userId, commissionAmount, patientName) {
    return this.createNotification({
      userId,
      type: 'COMMISSION_PAID',
      title: 'Commission Received!',
      message: `You received ₹${commissionAmount} commission for referring a patient.`,
      priority: 'HIGH',
      actionUrl: `/commissions`,
      actionLabel: 'View Commissions'
    });
  }

  /**
   * Notify trial update
   */
  static async notifyTrialUpdate(userId, trialId, updateType, message) {
    return this.createNotification({
      userId,
      type: 'TRIAL_UPDATE',
      title: `Trial Updated`,
      message: message,
      relatedData: { trialId },
      priority: 'MEDIUM',
      actionUrl: `/trials/${trialId}`,
      actionLabel: 'View Trial'
    });
  }

  /**
   * Send bulk notifications
   */
  static async sendBulkNotifications(userIds, notificationData) {
    const notifications = userIds.map(userId => ({
      ...notificationData,
      userId
    }));

    return await Notification.insertMany(notifications);
  }

  /**
   * Get notifications by type
   */
  static async getNotificationsByType(userId, type) {
    return await Notification.find({ userId, type })
      .sort({ createdAt: -1 });
  }

  /**
   * Get unread notifications by priority
   */
  static async getUnreadByPriority(userId, priority) {
    return await Notification.find({
      userId,
      isRead: false,
      priority
    }).sort({ createdAt: -1 });
  }

  /**
   * Clear all notifications for user
   */
  static async clearAllNotifications(userId) {
    return await Notification.deleteMany({ userId });
  }

  /**
   * Get notification summary
   */
  static async getNotificationSummary(userId) {
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });
    const byType = await Notification.aggregate([
      { $match: { userId } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const byPriority = await Notification.aggregate([
      { $match: { userId, isRead: false } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    return {
      unreadTotal: unreadCount,
      byType,
      urgentUnread: byPriority.filter(p => p._id === 'URGENT')[0]?.count || 0
    };
  }
}

export default NotificationService;
