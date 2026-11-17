import { ApiError } from '../utils/ApiError.js';

/**
 * Middleware to enforce permissions
 * If user has 'admin' role, always granted.
 * Otherwise, checks if user's role permissions contain all the requested permissions.
 */
export const authorize = (...permissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const roleName = req.user.role.name?.toLowerCase();

    // Admins bypass all permission checks
    if (roleName === 'admin') {
      return next();
    }

    if (!permissions || permissions.length === 0) {
      return next();
    }

    const userPermissions = req.user.role.permissions || [];
    const hasAll = permissions.every((p) => userPermissions.includes(p));

    if (!hasAll) {
      return next(
        ApiError.forbidden(
          `Access denied. You do not have the required permissions (${permissions.join(', ')}).`
        )
      );
    }

    next();
  };
};

/**
 * Enforce specifically admin role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  if (req.user.role.name?.toLowerCase() !== 'admin') {
    return next(ApiError.forbidden('Access denied. Administrator privileges required.'));
  }

  next();
};

