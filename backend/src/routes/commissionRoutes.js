import express from 'express';
import commissionController from '../controllers/commissionController.js';

const router = express.Router();

// Doctor Commission Routes
router.get('/doctor/:doctorId', commissionController.getDoctorCommissions);
router.get('/doctor/:doctorId/earnings', commissionController.getDoctorEarnings);

// Commission Details
router.get('/:commissionId', commissionController.getCommissionById);

// Commission Status Management
router.put('/:commissionId/status', commissionController.updateCommissionStatus);
router.put('/:commissionId/approve', commissionController.approveCommission);
router.put('/:commissionId/reject', commissionController.rejectCommission);

// Pending Commissions
router.get('/', commissionController.getPendingCommissions);

// Analytics
router.get('/trial/:trialId/summary', commissionController.getTrialCommissionSummary);
router.get('/stats/all', commissionController.getCommissionStats);

// Bulk Operations
router.post('/bulk/process-payments', commissionController.processPayments);

export default router;
