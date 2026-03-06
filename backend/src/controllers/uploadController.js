import User from '../models/User.js';
import {
    getUploadResult,
    deleteProfileImage,
    getImageVariants,
    verifyCloudinaryConnection
} from '../services/cloudinaryService.js';

/**
 * Upload / replace the current user's profile picture
 * @route   POST /api/upload/profile-image
 * @access  Private (JWT required)
 * @body    multipart/form-data  field: "profileImage"
 */
export const uploadUserProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided. Send the image as form-data field "profileImage".'
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // If user already has a profile picture, delete the old one from Cloudinary
        if (user.profileImage?.publicId) {
            try {
                await deleteProfileImage(user.profileImage.publicId);
                console.log(`[UPLOAD] Deleted old profile image: ${user.profileImage.publicId}`);
            } catch (err) {
                console.warn(`[UPLOAD] Could not delete old image: ${err.message}`);
            }
        }

        // Extract the new Cloudinary result from multer's req.file
        const uploadResult = getUploadResult(req.file);

        // Persist URL + publicId on the User document
        user.profileImage = {
            url: uploadResult.url,
            publicId: uploadResult.publicId
        };
        await user.save();

        // Generate responsive variants for the frontend
        const variants = getImageVariants(uploadResult.publicId);

        console.log(`[UPLOAD] Profile image updated for user ${user.email}`);
        return res.status(200).json({
            success: true,
            message: 'Profile image uploaded successfully',
            data: {
                url: uploadResult.url,
                publicId: uploadResult.publicId,
                variants
            }
        });
    } catch (error) {
        console.error('[UPLOAD] Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete the current user's profile picture
 * @route   DELETE /api/upload/profile-image
 * @access  Private (JWT required)
 */
export const deleteUserProfileImage = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.profileImage?.publicId) {
            return res.status(400).json({
                success: false,
                message: 'No profile image to delete'
            });
        }

        // Delete from Cloudinary
        const result = await deleteProfileImage(user.profileImage.publicId);

        if (result.success) {
            // Clear from DB
            user.profileImage = { url: null, publicId: null };
            await user.save();

            console.log(`[UPLOAD] Profile image deleted for user ${user.email}`);
            return res.status(200).json({
                success: true,
                message: 'Profile image deleted successfully'
            });
        } else {
            return res.status(500).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('[UPLOAD] Delete error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get URL variants for the current user's profile image
 * @route   GET /api/upload/profile-image/variants
 * @access  Private (JWT required)
 */
export const getProfileImageVariants = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('profileImage email');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.profileImage?.publicId) {
            return res.status(404).json({
                success: false,
                message: 'No profile image found. Please upload one first.'
            });
        }

        const variants = getImageVariants(user.profileImage.publicId);

        return res.status(200).json({
            success: true,
            data: {
                publicId: user.profileImage.publicId,
                original: user.profileImage.url,
                variants
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Verify Cloudinary is connected and reachable
 * @route   GET /api/upload/cloudinary/status
 * @access  Private (JWT + ADMIN)
 */
export const cloudinaryStatus = async (req, res) => {
    try {
        const status = await verifyCloudinaryConnection();
        return res.status(status.connected ? 200 : 503).json({
            success: status.connected,
            data: status
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
