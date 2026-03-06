import express from 'express';
import trialController from '../controllers/trialController.js';

const router = express.Router();

// Trial Discovery Routes
router.get('/', trialController.getOpenTrials);
router.get('/search', trialController.searchTrials);
router.get('/nearby', trialController.findTrialsNearby);
router.get('/trending', trialController.getTrendingTrials);

// Trial Details Routes
router.get('/:trialId', trialController.getTrialDetails);
router.get('/:trialId/stats', trialController.getTrialStats);
router.get('/:trialId/criteria', trialController.getTrialCriteria);

// Trial Management Routes
router.post('/:researchLabId/create', trialController.createTrial);
router.put('/:trialId/status', trialController.updateTrialStatus);
router.post('/:trialId/criteria', trialController.setupTrialCriteria);

export default router;
