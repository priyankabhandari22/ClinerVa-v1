import express from 'express';
import applicationController from '../controllers/applicationController.js';

const router = express.Router();

// Application Submission and Retrieval
router.post('/', applicationController.createApplication);
router.get('/', applicationController.getApplications);
router.get('/:applicationId', applicationController.getApplicationById);

// Application Status Management
router.put('/:applicationId/approve', applicationController.approveApplication);
router.put('/:applicationId/reject', applicationController.rejectApplication);
router.put('/:applicationId/withdraw', applicationController.withdrawApplication);

// Statistics
router.get('/trial/:trialId/stats', applicationController.getApplicationStats);

// Bulk Operations
router.post('/bulk/approve', applicationController.bulkApproveApplications);

export default router;
