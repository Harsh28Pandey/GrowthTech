import { verifyToken } from '../utils/token.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(ApiError.unauthorized('Authentication required. Please log in.'));
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return next(ApiError.unauthorized('Invalid or expired authentication token. Please log in again.'));
    }

    const user = await User.findById(decoded.id).populate('role');
    if (!user) {
      return next(ApiError.unauthorized('User associated with this token no longer exists.'));
    }

    if (user.status === 'inactive') {
      return next(ApiError.forbidden('Your account has been deactivated. Please contact an administrator.'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

