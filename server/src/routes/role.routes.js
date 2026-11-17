import express from 'express';
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from '../controllers/role.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, requireAdmin } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createRoleValidator,
  updateRoleValidator,
} from '../middleware/validators/role.validator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('roles:read'), getRoles);
router.post('/', authorize('roles:write'), validate(createRoleValidator), createRole);
router.put('/:id', authorize('roles:write'), validate(updateRoleValidator), updateRole);
router.delete('/:id', authorize('roles:delete'), deleteRole);

export default router;

