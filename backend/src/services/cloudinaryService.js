import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

/**
 * Cloudinary Service - Handle profile image uploads and management
 * Cloud: dua90mpb2
 */

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Setup Cloudinary Storage for multer (auto-upload on file receive)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'clinerva/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: 'face', quality: 'auto:good' }
    ],
    public_id: (req, file) => {
      // Name file: profile_<userId>_<timestamp>
      const userId = req.user?._id || 'unknown';
      return `profile_${userId}_${Date.now()}`;
    }
  }
});

// Multer upload middleware
export const uploadProfile = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed (jpg, jpeg, png, gif, webp)'));
    }
    cb(null, true);
  }
});

/**
 * Get the Cloudinary URL & publicId after multer uploads the file
 */
export const getUploadResult = (file) => {
  if (!file) throw new Error('No file provided');
  if (!file.path || !file.filename) throw new Error('Invalid upload result: missing path or filename');
  return {
    success: true,
    url: file.path,         // Cloudinary secure URL
    publicId: file.filename, // Cloudinary public_id
    size: file.size || 0,
    format: file.mimetype || 'unknown'
  };
};

/**
 * Delete a profile image from Cloudinary by its publicId
 */
export const deleteProfileImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      message: result.result === 'ok' ? 'Image deleted successfully' : 'Failed to delete image'
    };
  } catch (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
};

/**
 * Get image metadata from Cloudinary
 */
export const getImageMetadata = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    if (!result) throw new Error('Resource not found');
    return {
      publicId: result?.public_id || publicId,
      url: result?.secure_url || '',
      size: result?.bytes || 0,
      width: result?.width || 0,
      height: result?.height || 0,
      format: result?.format || 'unknown',
      createdAt: result?.uploaded_at || new Date().toISOString(),
      tags: result?.tags || []
    };
  } catch (error) {
    throw new Error(`Failed to get metadata: ${error.message}`);
  }
};

/**
 * Generate optimized URL variants for responsive images
 */
export const getImageVariants = (publicId) => {
  return {
    thumbnail: cloudinary.url(publicId, { secure: true, width: 100, height: 100, crop: 'fill', quality: 'auto:low', fetch_format: 'auto' }),
    small:     cloudinary.url(publicId, { secure: true, width: 200, height: 200, crop: 'fill', quality: 'auto:good', fetch_format: 'auto' }),
    medium:    cloudinary.url(publicId, { secure: true, width: 400, height: 400, crop: 'fill', quality: 'auto:good', fetch_format: 'auto' }),
    large:     cloudinary.url(publicId, { secure: true, width: 800, height: 800, crop: 'fill', quality: 'auto:best', fetch_format: 'auto' }),
    original:  cloudinary.url(publicId, { secure: true, fetch_format: 'auto', quality: 'auto' })
  };
};

/**
 * Verify Cloudinary connection (ping)
 */
export const verifyCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    return {
      connected: true,
      status: result.status,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME
    };
  }
};

export default {
  uploadProfile,
  getUploadResult,
  deleteProfileImage,
  getImageMetadata,
  getImageVariants,
  verifyCloudinaryConnection
};
