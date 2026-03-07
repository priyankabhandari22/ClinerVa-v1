import express from 'express';
import patientController from '../controllers/patientController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get and Update current logged in patient profile
router.get('/profile/me', protect, patientController.getMyProfile);
router.post('/profile', protect, patientController.upsertMyProfile);

// Medical Records Routes
router.get('/medical-records/me', protect, patientController.getMedicalRecordsMe);
router.get('/:patientId/medical-records', protect, patientController.getMedicalRecords);
router.post('/:patientId/medical-records', protect, patientController.addMedicalRecord);
router.post('/:patientId/clinical-notes', protect, patientController.addClinicalNote);

// Patient Profile Routes
router.post('/', protect, patientController.createPatientProfile);
router.get('/stats', protect, authorizeRoles('DOCTOR', 'RESEARCHER', 'ADMIN'), patientController.getPatientStats);
router.get('/search', protect, authorizeRoles('DOCTOR', 'RESEARCHER'), patientController.searchPatientsByCondition);
router.get('/:patientId', protect, patientController.getPatientProfile);
router.put('/:patientId', protect, patientController.updatePatientProfile);

// Patient Health Data Routes
router.post('/:patientId/condition', patientController.addCondition);
router.put('/:patientId/lab-results', patientController.updateLabResults);

// Export Routes
router.post('/:patientId/export', patientController.exportAnonymousData);

export default router;
