import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
} from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import ResearchLab from '../models/ResearchLab.js';

const router = express.Router();

// ── Public ───────────────────────────────────────────────────────────────────
/**
 * POST /api/auth/register
 * Body: { name, email, password, role }
 * Role accepts: 'patient' | 'doctor' | 'PATIENT' | 'DOCTOR' (normalised to uppercase)
 */
router.post('/register', registerUser);

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', loginUser);

/**
 * GET /api/auth/labs
 * Returns all ResearchLab documents (for researcher UI dropdowns)
 */
router.get('/labs', async (req, res) => {
  try {
    const labs = await ResearchLab.find({}).select('_id labName organizationType contactEmail').lean();
    res.json({ success: true, count: labs.length, labs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Protected (JWT required) ─────────────────────────────────────────────────
/**
 * GET /api/auth/profile
 * Returns full profile of the logged-in user (no passwordHash)
 */
router.get('/profile', protect, getUserProfile);

/**
 * PUT /api/auth/profile
 * Body: { name?, email? }
 * Update name / email of the logged-in user
 */
router.put('/profile', protect, updateUserProfile);

/**
 * PUT /api/auth/change-password
 * Body: { currentPassword, newPassword }
 */
router.put('/change-password', protect, changePassword);

// ── Role-restricted examples ─────────────────────────────────────────────────
/**
 * GET /api/auth/doctor-data
 * NOTE: roles in the DB are uppercase ('DOCTOR'), so pass uppercase here too
 */
router.get('/doctor-data', protect, authorizeRoles('DOCTOR'), (req, res) => {
  res.json({ success: true, message: 'Doctor access granted', user: req.user });
});

router.get('/admin-data', protect, authorizeRoles('ADMIN'), (req, res) => {
  res.json({ success: true, message: 'Admin access granted', user: req.user });
});

export default router;
