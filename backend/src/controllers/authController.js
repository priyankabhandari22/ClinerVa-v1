import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 * @body    { name, email, password, role }
 *
 * IMPORTANT: The User schema stores passwords in `passwordHash` (not `password`),
 * and roles are stored UPPERCASE ('PATIENT' | 'DOCTOR' | 'RESEARCHER' | 'ADMIN').
 * The schema's pre-save hook handles hashing automatically.
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Normalise role: accept 'patient'/'doctor' from frontend, store as uppercase
    const allowedRoles = ['PATIENT', 'DOCTOR', 'RESEARCHER', 'ADMIN'];
    const normalizedRole = role ? role.toUpperCase() : 'PATIENT';
    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed: ${allowedRoles.join(', ')}`
      });
    }

    // ── Duplicate check ─────────────────────────────────────────────────────
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    // ── Create user ─────────────────────────────────────────────────────────
    // NOTE: schema field is 'passwordHash' — the pre-save hook hashes it automatically
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password,   // pre-save hook will bcrypt this
      role: normalizedRole,
      profileImage: { url: null, publicId: null }
    });

    // Update lastLogin on first register
    user.lastLogin = new Date();
    await user.save();

    console.log(`[AUTH] ✅ Registered: ${user.email} (${user.role})`);

    return res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    next(error);
  }
};

/**
 * @desc    Login user & return JWT
 * @route   POST /api/auth/login
 * @access  Public
 * @body    { email, password }
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user (include passwordHash for comparison)
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      console.log(`[AUTH] ❌ Login failed — not found: ${email}`);
      // Use vague message to avoid user enumeration
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Compare password against passwordHash
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log(`[AUTH] ❌ Login failed — wrong password: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save();

    console.log(`[AUTH] ✅ Login success: ${user.email} (${user.role})`);

    return res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get the currently authenticated user's profile
 * @route   GET /api/auth/profile
 * @access  Private (JWT required)
 */
export const getUserProfile = async (req, res, next) => {
  try {
    // req.user is attached by protect middleware
    // Exclude passwordHash from the response
    const user = await User.findById(req.user._id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update the current user's name / email
 * @route   PUT /api/auth/profile
 * @access  Private (JWT required)
 * @body    { name?, email? }
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, email } = req.body;

    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();

    const updated = await user.save();

    console.log(`[AUTH] ✏️  Profile updated: ${updated.email}`);

    return res.json({
      success: true,
      message: 'Profile updated',
      data: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        profileImage: updated.profileImage
      }
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    next(error);
  }
};

/**
 * @desc    Change password (authenticated)
 * @route   PUT /api/auth/change-password
 * @access  Private (JWT required)
 * @body    { currentPassword, newPassword }
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'currentPassword and newPassword are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // pre-save hook will re-hash newPassword
    user.passwordHash = newPassword;
    await user.save();

    console.log(`[AUTH] 🔑 Password changed: ${user.email}`);

    return res.json({ success: true, message: 'Password changed successfully' });

  } catch (error) {
    next(error);
  }
};
