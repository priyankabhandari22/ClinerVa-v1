import MatchingService from '../services/matchingService.js';
import NotificationService from '../services/notificationService.js';
import { anonymizePatientData } from '../utils/anonymizer.js';
import AIMatchingService from '../services/aiMatchingService.js';

/**
 * Matching Controller - Handle AI trial matching requests
 */

const generateMatchesForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Generate matches
    const matches = await MatchingService.generateMatchesForPatient(patientId);

    // Save to database
    if (matches.length > 0) {
      const saved = await MatchingService.saveMatches(matches);

      // Send notifications for high-score matches
      for (const match of saved.slice(0, 3)) {
        if (match.eligibilityScore > 0.7) {
          // User ID would come from patient-user relationship
          // This is simplified - in real app, fetch from Patient -> User
          // await NotificationService.notifyTrialMatch(userId, trial, match.eligibilityScore);
        }
      }
    }

    res.json({
      success: true,
      message: `Generated ${matches.length} matches for patient`,
      matches: matches.slice(0, 10) // Show top 10
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTopMatches = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 5 } = req.query;

    const matches = await MatchingService.getTopMatches(patientId, parseInt(limit));

    // Mark as viewed
    for (const match of matches) {
      await MatchingService.updateMatchStatus(match._id, 'VIEWED');
    }

    res.json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMatchDetails = async (req, res) => {
  try {
    const { matchId } = req.params;
    const match = await MatchingService.updateMatchStatus(matchId, 'VIEWED');

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json({
      success: true,
      match
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const calculateEligibility = async (req, res) => {
  try {
    const { patientId, trialId } = req.body;

    if (!patientId || !trialId) {
      return res.status(400).json({ error: 'Patient ID and Trial ID are required' });
    }

    const eligibility = await MatchingService.calculateEligibilityScore(patientId, trialId);

    res.json({
      success: true,
      eligibility
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const generateMatchesForAllPatients = async (req, res) => {
  try {
    // This is a long-running operation - could be triggered by cron or background job
    const results = await MatchingService.generateMatchesForAllPatients();

    res.json({
      success: true,
      message: 'Batch matching completed',
      summary: {
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'failed').length,
        details: results
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMatchingAnalytics = async (req, res) => {
  try {
    const { trialId } = req.params;

    const analytics = await MatchingService.getMatchingAnalytics(trialId);

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { reason } = req.body;

    // Update match status to rejected
    const updated = await MatchingService.updateMatchStatus(matchId, 'REJECTED');

    res.json({
      success: true,
      message: 'Match rejected',
      match: updated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const applyToTrial = async (req, res) => {
  try {
    const { matchId } = req.params;

    // Update match status to applied
    const updated = await MatchingService.updateMatchStatus(matchId, 'APPLIED');

    res.json({
      success: true,
      message: 'Application submitted for trial',
      match: updated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Legacy endpoint - process patient match with anonymization
export const processPatientMatch = async (req, res) => {
  try {
    const rawPatientData = req.body;

    // Step 1: Anonymize the data (strip PII)
    const anonymizedData = anonymizePatientData(rawPatientData);

    // Step 2: Run the Matching Engine
    // const matches = matchPatientToTrials(anonymizedData);

    // Provide full transparency of what was analyzed vs original
    res.status(200).json({
      success: true,
      message: "Patient data successfully anonymized and matched.",
      data: {
        anonymousSessionId: anonymizedData.anonymousId,
        inputScrubbed: true,
        // matchingResults: matches
      }
    });

  } catch (error) {
    console.error("Error processing match:", error);
    res.status(500).json({ success: false, error: "Internal Server Error during matching." });
  }
};

/**
 * AI-powered: Match patient to all open trials using GPT-4o
 * @route  GET /api/matches/ai/:patientId
 */
export const aiMatchPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { top = 5 } = req.query;
    const result = await AIMatchingService.generatePersonalizedRecommendations(
      patientId,
      [] // top matches will be generated inside service
    );
    // Use the more complete validateEligibilityWithAI flow per trial instead
    const matchReport = await AIMatchingService.validateEligibilityWithAI(
      patientId,
      req.query.trialId || null
    );
    res.json({ success: true, data: matchReport || result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * AI-powered: Validate patient eligibility for a specific trial with GPT-4o reasoning
 * @route  POST /api/matches/ai/eligibility
 * @body   { patientId, trialId }
 */
export const aiValidateEligibility = async (req, res) => {
  try {
    const { patientId, trialId } = req.body;
    if (!patientId || !trialId) {
      return res.status(400).json({ error: 'patientId and trialId are required' });
    }
    const result = await AIMatchingService.validateEligibilityWithAI(patientId, trialId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * AI-powered: Get personalized recommendations for a patient's top matches
 * @route  POST /api/matches/ai/recommendations
 * @body   { patientId, matchIds[] }
 */
export const aiGetRecommendations = async (req, res) => {
  try {
    const { patientId } = req.body;
    const topMatches = await MatchingService.getTopMatches(patientId, 5);
    const result = await AIMatchingService.generatePersonalizedRecommendations(patientId, topMatches);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * AI-powered: Compare multiple trials for a patient
 * @route  POST /api/matches/ai/compare
 * @body   { patientId, trialIds[] }
 */
export const aiCompareTrials = async (req, res) => {
  try {
    const { patientId, trialIds } = req.body;
    if (!patientId || !trialIds?.length) {
      return res.status(400).json({ error: 'patientId and trialIds[] are required' });
    }
    const result = await AIMatchingService.compareTrials(patientId, trialIds);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * AI Health Check - verify Bytez GPT-4o is reachable
 * @route  GET /api/matches/ai/health
 */
export const aiHealthCheck = async (req, res) => {
  try {
    const result = await AIMatchingService.healthCheck();
    // Keep this endpoint non-failing so UI status checks don't produce noisy 503 errors.
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  generateMatchesForPatient,
  getTopMatches,
  getMatchDetails,
  calculateEligibility,
  generateMatchesForAllPatients,
  getMatchingAnalytics,
  rejectMatch,
  applyToTrial,
  processPatientMatch,
  aiMatchPatient,
  aiValidateEligibility,
  aiGetRecommendations,
  aiCompareTrials,
  aiHealthCheck
};
