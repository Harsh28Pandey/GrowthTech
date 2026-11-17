import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, requireAdmin } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createUserValidator,
  updateUserValidator,
  updateStatusValidator,
} from '../middleware/validators/user.validator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('users:read'), getUsers);
router.post('/', authorize('users:write'), validate(createUserValidator), createUser);
router.get('/:id', authorize('users:read'), getUserById);
router.put('/:id', authorize('users:write'), validate(updateUserValidator), updateUser);
router.patch(
  '/:id/status',
  authorize('users:write'),
  validate(updateStatusValidator),
  toggleUserStatus
);
router.delete('/:id', authorize('users:delete'), deleteUser);

export default router;

