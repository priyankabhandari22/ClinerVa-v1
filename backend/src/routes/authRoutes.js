import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
} from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes example
router.get('/profile', protect, getUserProfile);

// Specific role protected route example
router.get('/doctor-data', protect, authorizeRoles('doctor'), (req, res) => {
  res.json({ success: true, message: 'Doctor access granted' });
});

export default router;
