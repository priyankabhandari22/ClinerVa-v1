import express from 'express';
import matchingController, {
    aiValidateEligibility,
    aiGetRecommendations,
    aiCompareTrials,
    aiHealthCheck
} from '../controllers/matchingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ─── Rule-based Matching ────────────────────────────────────────────────────
// Patient Matching Routes
router.get('/patient/:patientId/generate', matchingController.generateMatchesForPatient);
router.get('/patient/:patientId/top-matches', matchingController.getTopMatches);

// Match Details and Actions
router.get('/:matchId', matchingController.getMatchDetails);
router.post('/calculate-eligibility', matchingController.calculateEligibility);
router.post('/:matchId/apply', matchingController.applyToTrial);
router.post('/:matchId/reject', matchingController.rejectMatch);

// Batch Operations
router.post('/batch/generate-all', matchingController.generateMatchesForAllPatients);

// Analytics
router.get('/trial/:trialId/analytics', matchingController.getMatchingAnalytics);

// Legacy endpoint
router.post('/process', matchingController.processPatientMatch);

// ─── AI-powered Matching (Bytez GPT-4o) ────────────────────────────────────
/**
 * GET  /api/matches/ai/health
 * Check if Bytez GPT-4o is reachable
 */
router.get('/ai/health', aiHealthCheck);

/**
 * POST /api/matches/ai/eligibility
 * Body: { patientId, trialId }
 * AI-powered eligibility validation with GPT-4o reasoning
 */
router.post('/ai/eligibility', protect, aiValidateEligibility);

/**
 * POST /api/matches/ai/recommendations
 * Body: { patientId }
 * Personalized trial recommendations for a patient's top matches
 */
router.post('/ai/recommendations', protect, aiGetRecommendations);

/**
 * POST /api/matches/ai/compare
 * Body: { patientId, trialIds: [...] }
 * Compare multiple trials for a patient using GPT-4o
 */
router.post('/ai/compare', protect, aiCompareTrials);

export default router;
