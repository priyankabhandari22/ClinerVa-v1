import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
} from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

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
