import TrialApplication from '../models/TrialApplication.js';
import Commission from '../models/Commission.js';
import PatientReward from '../models/PatientReward.js';
import NotificationService from '../services/notificationService.js';
import TrialService from '../services/trialService.js';

/**
 * Application Controller - Handle trial application requests
 */

const createApplication = async (req, res) => {
  try {
    const { patientId, trialId, doctorId } = req.body;

    if (!patientId || !trialId) {
      return res.status(400).json({ error: 'Patient ID and Trial ID are required' });
    }

    // Check if already applied
    const existing = await TrialApplication.findOne({ patientId, trialId });
    if (existing) {
      return res.status(400).json({ error: 'Patient has already applied to this trial' });
    }

    const application = new TrialApplication({
      patientId,
      trialId,
      doctorId,
      applicationStatus: 'PENDING'
    });

    const saved = await application.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: saved
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getApplications = async (req, res) => {
  try {
    const { patientId, trialId, status } = req.query;

    const query = {};
    if (patientId) query.patientId = patientId;
    if (trialId) query.trialId = trialId;
    if (status) query.applicationStatus = status;

    const applications = await TrialApplication.find(query)
      .populate('patientId', 'anonymousId age gender')
      .populate('trialId', 'title status')
      .populate('doctorId', 'name hospital')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await TrialApplication.findById(applicationId)
      .populate('patientId', 'anonymousId age gender conditions')
      .populate('trialId', 'title description rewardAmount')
      .populate('doctorId', 'name hospital specialization');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { verifiedBy } = req.body;

    const application = await TrialApplication.findByIdAndUpdate(
      applicationId,
      {
        applicationStatus: 'APPROVED',
        doctorVerified: true,
        doctorVerifiedAt: new Date(),
        reviewedBy: verifiedBy,
        reviewedAt: new Date(),
        enrollmentDate: new Date()
      },
      { new: true }
    ).populate('patientId').populate('trialId').populate('doctorId');

    // Increment trial participants
    await TrialService.addParticipant(application.trialId);

    // Create commission for doctor
    const commission = new Commission({
      doctorId: application.doctorId,
      patientId: application.patientId,
      trialId: application.trialId,
      trialApplicationId: applicationId,
      amount: application.trialId.doctorCommission || 0,
      status: 'PENDING',
      reason: 'Patient enrollment'
    });
    await commission.save();

    // Create reward for patient
    const reward = new PatientReward({
      patientId: application.patientId,
      trialId: application.trialId,
      trialApplicationId: applicationId,
      rewardAmount: application.trialId.rewardAmount || 0,
      rewardType: 'PARTICIPATION'
    });
    await reward.save();

    res.json({
      success: true,
      message: 'Application approved successfully',
      application
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason, rejectedBy } = req.body;

    const application = await TrialApplication.findByIdAndUpdate(
      applicationId,
      {
        applicationStatus: 'REJECTED',
        reasonForRejection: reason,
        reviewedBy: rejectedBy,
        reviewedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Application rejected',
      application
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body;

    const application = await TrialApplication.findByIdAndUpdate(
      applicationId,
      {
        applicationStatus: 'WITHDRAWN',
        withdrawalDate: new Date(),
        withdrawalReason: reason
      },
      { new: true }
    );

    // Decrement trial participants if was approved
    if (application.enrollmentDate) {
      await TrialService.removeParticipant(application.trialId);
    }

    res.json({
      success: true,
      message: 'Application withdrawn',
      application
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getApplicationStats = async (req, res) => {
  try {
    const { trialId } = req.params;

    const totalApplications = await TrialApplication.countDocuments({ trialId });
    const approved = await TrialApplication.countDocuments({
      trialId,
      applicationStatus: 'APPROVED'
    });
    const rejected = await TrialApplication.countDocuments({
      trialId,
      applicationStatus: 'REJECTED'
    });
    const pending = await TrialApplication.countDocuments({
      trialId,
      applicationStatus: 'PENDING'
    });

    res.json({
      success: true,
      stats: {
        trialId,
        totalApplications,
        approved,
        rejected,
        pending,
        approvalRate: totalApplications > 0 ? (approved / totalApplications) * 100 : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const bulkApproveApplications = async (req, res) => {
  try {
    const { applicationIds, verifiedBy } = req.body;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({ error: 'Application IDs array is required' });
    }

    const updated = await TrialApplication.updateMany(
      { _id: { $in: applicationIds } },
      {
        applicationStatus: 'APPROVED',
        doctorVerified: true,
        doctorVerifiedAt: new Date(),
        reviewedBy: verifiedBy,
        reviewedAt: new Date(),
        enrollmentDate: new Date()
      }
    );

    res.json({
      success: true,
      message: `${updated.modifiedCount} applications approved`,
      updatedCount: updated.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  createApplication,
  getApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
  withdrawApplication,
  getApplicationStats,
  bulkApproveApplications
};
