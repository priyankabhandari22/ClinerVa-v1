import CommissionService from '../services/commissionService.js';

/**
 * Commission Controller - Handle doctor commission requests
 */

const getDoctorCommissions = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const commissions = await CommissionService.getDoctorCommissions(doctorId);

    res.json({
      success: true,
      count: commissions.length,
      commissions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCommissionById = async (req, res) => {
  try {
    const { commissionId } = req.params;

    const commission = await CommissionService.getCommission(commissionId);

    if (!commission) {
      return res.status(404).json({ error: 'Commission not found' });
    }

    res.json({
      success: true,
      commission
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCommissionStatus = async (req, res) => {
  try {
    const { commissionId } = req.params;
    const { status, paidBy } = req.body;

    if (!['PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updated = await CommissionService.updateCommissionStatus(commissionId, status, paidBy);

    res.json({
      success: true,
      message: 'Commission status updated',
      commission: updated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDoctorEarnings = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const earnings = await CommissionService.calculateDoctorEarnings(doctorId);

    res.json({
      success: true,
      earnings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPendingCommissions = async (req, res) => {
  try {
    const commissions = await CommissionService.getPendingCommissions();

    res.json({
      success: true,
      count: commissions.length,
      commissions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const processPayments = async (req, res) => {
  try {
    const { commissionIds, processedBy } = req.body;

    if (!Array.isArray(commissionIds) || commissionIds.length === 0) {
      return res.status(400).json({ error: 'Commission IDs array is required' });
    }

    const results = await CommissionService.processPayments(commissionIds, processedBy);

    res.json({
      success: true,
      message: `Processed ${results.length} commissions`,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTrialCommissionSummary = async (req, res) => {
  try {
    const { trialId } = req.params;

    const summary = await CommissionService.getTrialCommissionSummary(trialId);

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCommissionStats = async (req, res) => {
  try {
    const stats = await CommissionService.getCommissionStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveCommission = async (req, res) => {
  try {
    const { commissionId } = req.params;

    const commission = await CommissionService.approveCommission(commissionId);

    res.json({
      success: true,
      message: 'Commission approved',
      commission
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectCommission = async (req, res) => {
  try {
    const { commissionId } = req.params;
    const { reason } = req.body;

    const commission = await CommissionService.rejectCommission(commissionId, reason);

    res.json({
      success: true,
      message: 'Commission rejected',
      commission
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getDoctorCommissions,
  getCommissionById,
  updateCommissionStatus,
  getDoctorEarnings,
  getPendingCommissions,
  processPayments,
  getTrialCommissionSummary,
  getCommissionStats,
  approveCommission,
  rejectCommission
};
