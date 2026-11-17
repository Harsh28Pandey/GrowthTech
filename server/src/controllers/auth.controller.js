import { User } from '../models/User.js';
import { Role } from '../models/Role.js';
import { ApiError } from '../utils/ApiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';

/**
 * Register a new standard user
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(ApiError.conflict('An account with this email address already exists.'));
    }

    // Assign default 'user' role
    let defaultRole = await Role.findOne({ name: 'user' });
    if (!defaultRole) {
      // Fallback if roles not yet initialized
      defaultRole = await Role.create({
        name: 'user',
        displayName: 'User',
        description: 'Standard application user',
        isSystem: true,
        permissions: ['records:read', 'records:write'],
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: defaultRole._id,
      status: 'active',
      lastLogin: new Date(),
    });

    const populatedUser = await User.findById(user._id).populate('role');
    const token = generateToken(user._id);
    setAuthCookie(res, token);

    return apiResponse(res, 201, 'Registration successful', {
      user: populatedUser,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Standard user login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password').populate('role');
    if (!user) {
      return next(ApiError.unauthorized('Invalid email or password.'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(ApiError.unauthorized('Invalid email or password.'));
    }

    if (user.status === 'inactive') {
      return next(
        ApiError.forbidden('Your account has been deactivated. Please contact an administrator.')
      );
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    // Remove password before returning
    const safeUser = user.toJSON();

    return apiResponse(res, 200, 'Login successful', {
      user: safeUser,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin portal login (strictly enforces admin role)
 */
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password').populate('role');
    if (!user) {
      return next(ApiError.unauthorized('Invalid email or password.'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(ApiError.unauthorized('Invalid email or password.'));
    }

    if (user.status === 'inactive') {
      return next(
        ApiError.forbidden('Your account has been deactivated. Please contact an administrator.')
      );
    }

    if (user.role?.name !== 'admin') {
      return next(
        ApiError.forbidden('Access denied. Administrator privileges required to access the admin portal.')
      );
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    const safeUser = user.toJSON();

    return apiResponse(res, 200, 'Admin login successful', {
      user: safeUser,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout current user (clears auth cookie)
 */
export const logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);
    return apiResponse(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('role');
    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    return apiResponse(res, 200, 'Current user retrieved', { user });
  } catch (error) {
    next(error);
  }
};

