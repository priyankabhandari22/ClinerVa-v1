import TrialService from '../services/trialService.js';
import MatchingService from '../services/matchingService.js';

/**
 * Trial Controller - Handle clinical trial API requests
 */

const createTrial = async (req, res) => {
  try {
    const { researchLabId } = req.params;
    const trial = await TrialService.createTrial(researchLabId, req.body);

    res.status(201).json({
      success: true,
      message: 'Clinical trial created successfully',
      trial
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTrialDetails = async (req, res) => {
  try {
    const { trialId } = req.params;
    const trial = await TrialService.getTrialDetails(trialId);

    if (!trial) {
      return res.status(404).json({ error: 'Trial not found' });
    }

    res.json({
      success: true,
      trial
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOpenTrials = async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;
    const trials = await TrialService.getOpenTrials(parseInt(limit), parseInt(skip));

    res.json({
      success: true,
      count: trials.length,
      trials
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchTrials = async (req, res) => {
  try {
    const filters = req.query;
    const trials = await TrialService.searchTrials(filters);

    res.json({
      success: true,
      count: trials.length,
      trials
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const findTrialsNearby = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 100 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({ error: 'Longitude and latitude required' });
    }

    const trials = await TrialService.findTrialsNearby(
      [parseFloat(longitude), parseFloat(latitude)],
      parseInt(maxDistance)
    );

    res.json({
      success: true,
      count: trials.length,
      trials
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTrialStatus = async (req, res) => {
  try {
    const { trialId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const trial = await TrialService.updateTrialStatus(trialId, status);

    res.json({
      success: true,
      message: 'Trial status updated successfully',
      trial
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTrialStats = async (req, res) => {
  try {
    const { trialId } = req.params;
    const stats = await TrialService.getTrialStats(trialId);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const setupTrialCriteria = async (req, res) => {
  try {
    const { trialId } = req.params;
    const criteria = await TrialService.setupTrialCriteria(trialId, req.body);

    res.json({
      success: true,
      message: 'Trial criteria setup successfully',
      criteria
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTrendingTrials = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const trials = await TrialService.getTrendingTrials(parseInt(limit));

    res.json({
      success: true,
      count: trials.length,
      trials
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTrialCriteria = async (req, res) => {
  try {
    const { trialId } = req.params;
    const criteria = await TrialService.getTrialCriteria(trialId);

    if (!criteria) {
      return res.status(404).json({ error: 'Trial criteria not found' });
    }

    res.json({
      success: true,
      criteria
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  createTrial,
  getTrialDetails,
  getOpenTrials,
  searchTrials,
  findTrialsNearby,
  updateTrialStatus,
  getTrialStats,
  setupTrialCriteria,
  getTrendingTrials,
  getTrialCriteria
};
