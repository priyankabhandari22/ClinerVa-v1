import express from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import { uploadProfile } from '../services/cloudinaryService.js';
import {
    uploadUserProfileImage,
    deleteUserProfileImage,
    getProfileImageVariants,
    cloudinaryStatus
} from '../controllers/uploadController.js';

const router = express.Router();

/**
 * POST /api/upload/profile-image
 * Upload or replace profile picture (multipart, field: "profileImage")
 */
router.post(
    '/profile-image',
    protect,
    uploadProfile.single('profileImage'),
    uploadUserProfileImage
);

/**
 * DELETE /api/upload/profile-image
 * Remove the current user's profile picture
 */
router.delete('/profile-image', protect, deleteUserProfileImage);

/**
 * GET /api/upload/profile-image/variants
 * Get responsive image URLs (thumbnail / small / medium / large / original)
 */
router.get('/profile-image/variants', protect, getProfileImageVariants);

/**
 * GET /api/upload/cloudinary/status
 * Check Cloudinary connectivity (Admin only)
 */
router.get('/cloudinary/status', protect, authorizeRoles('ADMIN'), cloudinaryStatus);

export default router;
