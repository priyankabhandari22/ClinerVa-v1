import express from 'express';
import patientController from '../controllers/patientController.js';

const router = express.Router();

// Patient Profile Routes
router.post('/', patientController.createPatientProfile);
router.get('/stats', patientController.getPatientStats);
router.get('/search', patientController.searchPatientsByCondition);
router.get('/:patientId', patientController.getPatientProfile);
router.put('/:patientId', patientController.updatePatientProfile);

// Patient Health Data Routes
router.post('/:patientId/condition', patientController.addCondition);
router.put('/:patientId/lab-results', patientController.updateLabResults);

// Export Routes
router.post('/:patientId/export', patientController.exportAnonymousData);

export default router;
