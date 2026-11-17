import { Role } from '../models/Role.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { AVAILABLE_PERMISSIONS } from '../utils/permissions.js';

/**
 * Get all roles along with count of users assigned to each
 */
export const getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find().sort({ createdAt: 1 });

    // Count users for each role
    const rolesWithCounts = await Promise.all(
      roles.map(async (role) => {
        const userCount = await User.countDocuments({ role: role._id });
        return {
          ...role.toObject(),
          userCount,
        };
      })
    );

    return apiResponse(res, 200, 'Roles retrieved successfully', {
      roles: rolesWithCounts,
      availablePermissions: AVAILABLE_PERMISSIONS,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new custom role
 */
export const createRole = async (req, res, next) => {
  try {
    const { name, displayName, description, permissions = [] } = req.body;

    const normalizedName = name.toLowerCase().trim();

    const existingRole = await Role.findOne({ name: normalizedName });
    if (existingRole) {
      return next(ApiError.conflict(`A role with identifier '${normalizedName}' already exists.`));
    }

    const role = await Role.create({
      name: normalizedName,
      displayName,
      description: description || '',
      isSystem: false,
      permissions,
    });

    return apiResponse(res, 201, 'Role created successfully', role);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a role's permissions, displayName, and description
 */
export const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { displayName, description, permissions } = req.body;

    const role = await Role.findById(id);
    if (!role) {
      return next(ApiError.notFound('Role not found'));
    }

    if (displayName) role.displayName = displayName;
    if (description !== undefined) role.description = description;

    if (permissions && Array.isArray(permissions)) {
      // If it's the admin role, prevent revoking core admin permissions
      if (role.name === 'admin' && !permissions.includes('roles:write')) {
        return next(
          ApiError.badRequest('Admin role must retain role management permissions.')
        );
      }
      role.permissions = permissions;
    }

    await role.save();

    return apiResponse(res, 200, 'Role updated successfully', role);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a custom role (only if unused and not a system role)
 */
export const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;

    const role = await Role.findById(id);
    if (!role) {
      return next(ApiError.notFound('Role not found'));
    }

    if (role.isSystem || ['admin', 'manager', 'user'].includes(role.name)) {
      return next(ApiError.badRequest('System roles cannot be deleted.'));
    }

    const assignedUsersCount = await User.countDocuments({ role: id });
    if (assignedUsersCount > 0) {
      return next(
        ApiError.badRequest(
          `Cannot delete this role because it is currently assigned to ${assignedUsersCount} user(s). Reassign them first.`
        )
      );
    }

    await Role.findByIdAndDelete(id);

    return apiResponse(res, 200, 'Role deleted successfully');
  } catch (error) {
    next(error);
  }
};

