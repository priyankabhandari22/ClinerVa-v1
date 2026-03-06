import Commission from '../models/Commission.js';
import Doctor from '../models/Doctor.js';

/**
 * Commission Service - Handle doctor commissions
 */

class CommissionService {
  /**
   * Create commission entry
   */
  static async createCommission(commissionData) {
    const commission = new Commission(commissionData);
    return await commission.save();
  }

  /**
   * Get doctor commissions
   */
  static async getDoctorCommissions(doctorId) {
    return await Commission.find({ doctorId })
      .populate('patientId', 'anonymousId')
      .populate('trialId', 'title')
      .sort({ createdAt: -1 });
  }

  /**
   * Get commission by ID
   */
  static async getCommission(commissionId) {
    return await Commission.findById(commissionId)
      .populate('doctorId', 'name hospital')
      .populate('patientId', 'anonymousId')
      .populate('trialId', 'title');
  }

  /**
   * Update commission status
   */
  static async updateCommissionStatus(commissionId, status, paidBy = null) {
    const updateData = { status };

    if (status === 'PAID') {
      updateData.paidAt = new Date();
      if (paidBy) updateData.paidBy = paidBy;
    }

    const commission = await Commission.findByIdAndUpdate(
      commissionId,
      updateData,
      { new: true }
    );

    // Update doctor's total earned if paid
    if (status === 'PAID') {
      await Doctor.findByIdAndUpdate(
        commission.doctorId,
        { $inc: { totalCommissionEarned: commission.amount } }
      );
    }

    return commission;
  }

  /**
   * Get pending commissions
   */
  static async getPendingCommissions() {
    return await Commission.find({ status: 'PENDING' })
      .populate('doctorId', 'name email')
      .populate('trialId', 'title');
  }

  /**
   * Calculate doctor total earnings
   */
  static async calculateDoctorEarnings(doctorId) {
    const commissions = await Commission.find({ doctorId });

    const dashboard = {
      total: 0,
      pending: 0,
      paid: 0,
      approved: 0,
      processing: 0,
      cancelled: 0,
      byTrial: {}
    };

    for (const commission of commissions) {
      dashboard.total += commission.amount;

      if (commission.status === 'PENDING') dashboard.pending += commission.amount;
      else if (commission.status === 'APPROVED') dashboard.approved += commission.amount;
      else if (commission.status === 'PROCESSING') dashboard.processing += commission.amount;
      else if (commission.status === 'PAID') dashboard.paid += commission.amount;
      else if (commission.status === 'CANCELLED') dashboard.cancelled += commission.amount;

      // Group by trial
      const trialId = commission.trialId.toString();
      if (!dashboard.byTrial[trialId]) {
        dashboard.byTrial[trialId] = 0;
      }
      dashboard.byTrial[trialId] += commission.amount;
    }

    return dashboard;
  }

  /**
   * Process commission payments
   */
  static async processPayments(commissionIds, processedBy) {
    const results = [];

    for (const commissionId of commissionIds) {
      try {
        const updated = await this.updateCommissionStatus(
          commissionId,
          'PAID',
          processedBy
        );
        results.push({ commissionId, status: 'success', paidAmount: updated.amount });
      } catch (error) {
        results.push({ commissionId, status: 'failed', error: error.message });
      }
    }

    return results;
  }

  /**
   * Get commission summary for a trial
   */
  static async getTrialCommissionSummary(trialId) {
    const commissions = await Commission.find({ trialId });

    let totalCommissions = 0;
    let paidCommissions = 0;
    let doctorCount = new Set();

    for (const commission of commissions) {
      totalCommissions += commission.amount;
      if (commission.status === 'PAID') {
        paidCommissions += commission.amount;
      }
      doctorCount.add(commission.doctorId.toString());
    }

    return {
      trialId,
      totalCommissions,
      paidCommissions,
      pendingCommissions: totalCommissions - paidCommissions,
      doctorCount: doctorCount.size,
      commissionCount: commissions.length
    };
  }

  /**
   * Batch create commissions
   */
  static async batchCreateCommissions(commissionsData) {
    try {
      return await Commission.insertMany(commissionsData);
    } catch (error) {
      throw new Error(`Batch creation failed: ${error.message}`);
    }
  }

  /**
   * Get commission statistics
   */
  static async getCommissionStats() {
    const stats = await Commission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    return stats;
  }

  /**
   * Approve pending commission
   */
  static async approveCommission(commissionId) {
    return await Commission.findByIdAndUpdate(
      commissionId,
      { status: 'APPROVED' },
      { new: true }
    );
  }

  /**
   * Reject commission
   */
  static async rejectCommission(commissionId, reason = null) {
    return await Commission.findByIdAndUpdate(
      commissionId,
      { status: 'CANCELLED', reason },
      { new: true }
    );
  }
}

export default CommissionService;
