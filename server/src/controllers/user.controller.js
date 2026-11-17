import { User } from '../models/User.js';
import { Role } from '../models/Role.js';
import { Record } from '../models/Record.js';
import { ApiError } from '../utils/ApiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import bcrypt from 'bcryptjs';

/**
 * Get all users with search, filtering, sorting, and pagination
 */
export const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const { search, role, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const sortOption = {};
    const validSortFields = ['name', 'email', 'createdAt', 'status'];
    const actualSortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOption[actualSortField] = sortOrder === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('role', 'name displayName isSystem')
        .select('-password'),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return apiResponse(res, 200, 'Users retrieved successfully', users, {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('role', 'name displayName permissions isSystem')
      .select('-password');

    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    return apiResponse(res, 200, 'User details retrieved', user);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin creates user
 */
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, status = 'active' } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(ApiError.conflict('A user with this email address already exists.'));
    }

    const roleDoc = await Role.findById(role);
    if (!roleDoc) {
      return next(ApiError.badRequest('Selected role does not exist.'));
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      status,
    });

    const populatedUser = await User.findById(user._id)
      .populate('role', 'name displayName isSystem')
      .select('-password');

    return apiResponse(res, 201, 'User created successfully', populatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin updates user
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, status, password } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    // Protection: admin cannot deactivate self
    const isSelf = req.user._id.toString() === id.toString();
    if (isSelf && status === 'inactive') {
      return next(
        ApiError.badRequest('You cannot deactivate your own administrator account.')
      );
    }

    // Check duplicate email
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return next(ApiError.conflict('Another user already has this email address.'));
      }
      user.email = email;
    }

    if (name) user.name = name;

    if (role) {
      const roleDoc = await Role.findById(role);
      if (!roleDoc) {
        return next(ApiError.badRequest('Selected role does not exist.'));
      }
      // If updating self, protect from demoting self away from admin role
      if (isSelf && req.user.role.name === 'admin' && roleDoc.name !== 'admin') {
        return next(
          ApiError.badRequest('You cannot remove the administrator role from your own account.')
        );
      }
      user.role = role;
    }

    if (status) {
      user.status = status;
    }

    if (password && password.trim().length > 0) {
      user.password = password; // pre-save hook will hash it
    }

    await user.save();

    const updatedUser = await User.findById(id)
      .populate('role', 'name displayName isSystem')
      .select('-password');

    return apiResponse(res, 200, 'User updated successfully', updatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle user status (Active / Inactive)
 */
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user._id.toString() === id.toString()) {
      return next(
        ApiError.badRequest('You cannot change the status of your own administrator account.')
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    user.status = status;
    await user.save();

    const populatedUser = await User.findById(id)
      .populate('role', 'name displayName isSystem')
      .select('-password');

    return apiResponse(res, 200, `User status updated to ${status}`, populatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id.toString()) {
      return next(
        ApiError.badRequest('You cannot delete your own administrator account.')
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    // Clean up or reassign records associated with this user
    await Record.deleteMany({ createdBy: id });
    await User.findByIdAndDelete(id);

    return apiResponse(res, 200, 'User and associated records deleted successfully');
  } catch (error) {
    next(error);
  }
};

