import ClinicalTrial from '../models/ClinicalTrial.js';
import TrialApplication from '../models/TrialApplication.js';
import TrialCriteria from '../models/TrialCriteria.js';

/**
 * Trial Service - Handle clinical trial operations
 */

class TrialService {
  /**
   * Create new clinical trial
   */
  static async createTrial(researchLabId, trialData) {
    const trial = new ClinicalTrial({
      researchLabId,
      ...trialData
    });

    return await trial.save();
  }

  /**
   * Get trial details
   */
  static async getTrialDetails(trialId) {
    return await ClinicalTrial.findById(trialId)
      .populate('researchLabId', 'labName organizationType contactEmail')
      .exec();
  }

  /**
   * Get all open trials
   */
  static async getOpenTrials(limit = 20, skip = 0) {
    return await ClinicalTrial.find({ status: 'OPEN' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('title description trialPhase status locations participantLimit currentParticipants rewardAmount');
  }

  /**
   * Find trials near location
   */
  static async findTrialsNearby(coordinates, maxDistance = 100) {
    return await ClinicalTrial.find({
      'locations.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates
          },
          $maxDistance: maxDistance * 1000 // Convert km to meters
        }
      },
      status: 'OPEN'
    });
  }

  /**
   * Search trials by criteria
   */
  static async searchTrials(filters) {
    const query = { status: 'OPEN' };

    if (filters.phase) query.trialPhase = filters.phase;
    if (filters.studyType) query.studyType = filters.studyType;
    if (filters.minReward) query.rewardAmount = { $gte: filters.minReward };
    if (filters.searchText) {
      query.$or = [
        { title: { $regex: filters.searchText, $options: 'i' } },
        { description: { $regex: filters.searchText, $options: 'i' } }
      ];
    }

    return await ClinicalTrial.find(query)
      .limit(filters.limit || 20)
      .skip(filters.skip || 0);
  }

  /**
   * Update trial status
   */
  static async updateTrialStatus(trialId, status) {
    return await ClinicalTrial.findByIdAndUpdate(
      trialId,
      { status },
      { new: true }
    );
  }

  /**
   * Increment participant count
   */
  static async addParticipant(trialId) {
    return await ClinicalTrial.findByIdAndUpdate(
      trialId,
      { $inc: { currentParticipants: 1 } },
      { new: true }
    );
  }

  /**
   * Decrement participant count
   */
  static async removeParticipant(trialId) {
    return await ClinicalTrial.findByIdAndUpdate(
      trialId,
      { $inc: { currentParticipants: -1 } },
      { new: true }
    );
  }

  /**
   * Get trial acceptance count
   */
  static async getTrialAcceptanceCount(trialId) {
    return await TrialApplication.countDocuments({
      trialId,
      applicationStatus: 'APPROVED'
    });
  }

  /**
   * Get trial statistics
   */
  static async getTrialStats(trialId) {
    const trial = await this.getTrialDetails(trialId);
    const applications = await TrialApplication.countDocuments({ trialId });
    const approvedApplications = await TrialApplication.countDocuments({
      trialId,
      applicationStatus: 'APPROVED'
    });
    const rejectedApplications = await TrialApplication.countDocuments({
      trialId,
      applicationStatus: 'REJECTED'
    });

    return {
      trialId,
      title: trial.title,
      status: trial.status,
      currentParticipants: trial.currentParticipants,
      participantLimit: trial.participantLimit,
      participationRate: (trial.currentParticipants / trial.participantLimit) * 100,
      totalApplications: applications,
      approvedApplications,
      rejectedApplications,
      pendingReview: applications - approvedApplications - rejectedApplications
    };
  }

  /**
   * Get trial criteria
   */
  static async getTrialCriteria(trialId) {
    return await TrialCriteria.findOne({ trialId });
  }

  /**
   * Create or update trial criteria
   */
  static async setupTrialCriteria(trialId, criteriaData) {
    return await TrialCriteria.findOneAndUpdate(
      { trialId },
      {
        trialId,
        ...criteriaData
      },
      { upsert: true, new: true }
    );
  }

  /**
   * Get trials by research lab
   */
  static async getTrialsByLab(researchLabId) {
    return await ClinicalTrial.find({ researchLabId })
      .sort({ createdAt: -1 });
  }

  /**
   * Get trial recommendations summary
   */
  static async getTrialRecommendations(trialId) {
    const trial = await this.getTrialDetails(trialId);
    const criteria = await this.getTrialCriteria(trialId);

    return {
      title: trial.title,
      phase: trial.trialPhase,
      status: trial.status,
      reward: trial.rewardAmount,
      inclusionCount: criteria?.inclusionCriteria?.length || 0,
      exclusionCount: criteria?.exclusionCriteria?.length || 0,
      locations: trial.locations?.length || 0
    };
  }

  /**
   * Check if trial is full
   */
  static async isTrialFull(trialId) {
    const trial = await ClinicalTrial.findById(trialId);
    return trial && trial.currentParticipants >= trial.participantLimit;
  }

  /**
   * Get trending trials
   */
  static async getTrendingTrials(limit = 10) {
    return await ClinicalTrial.aggregate([
      { $match: { status: 'OPEN' } },
      { $addFields: { participationRate: { $divide: ['$currentParticipants', '$participantLimit'] } } },
      { $sort: { participationRate: -1 } },
      { $limit: limit },
      {
        $project: {
          title: 1,
          description: 1,
          trialPhase: 1,
          rewardAmount: 1,
          currentParticipants: 1,
          participantLimit: 1,
          participationRate: 1
        }
      }
    ]);
  }

  /**
   * Close trial and calculate final stats
   */
  static async closeTrial(trialId) {
    const trial = await ClinicalTrial.findByIdAndUpdate(
      trialId,
      { status: 'COMPLETED' },
      { new: true }
    );

    const stats = await this.getTrialStats(trialId);

    return {
      trialId,
      message: 'Trial closed successfully',
      finalStats: stats
    };
  }
}

export default TrialService;
