import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema - Authentication + Roles
 * All users (patients, doctors, researchers, admins) login from here
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
    },
    passwordHash: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['PATIENT', 'DOCTOR', 'RESEARCHER', 'ADMIN'],
      required: true,
      default: 'PATIENT'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date,
      default: null
    },
    profileImage: {
      url: {
        type: String,
        default: null
      },
      publicId: {
        type: String,
        default: null
      }
    }
  },
  {
    timestamps: true
  }
);

// Pre-save middleware to hash the password before saving to the database
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('passwordHash')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare entered password with the hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Update lastLogin timestamp
userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  return await this.save();
};

const User = mongoose.model('User', userSchema);

export default User;
