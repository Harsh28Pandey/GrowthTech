import express from 'express';
import {
  getRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
} from '../controllers/record.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  recordValidator,
  updateRecordValidator,
  recordIdValidator,
} from '../middleware/validators/record.validator.js';

const router = express.Router();

router.use(authenticate);

// Public to authenticated users (controller enforces role/owner scope)
router.get('/', authorize('records:read'), getRecords);
router.post('/', authorize('records:write'), validate(recordValidator), createRecord);
router.get('/:id', authorize('records:read'), validate(recordIdValidator), getRecordById);
router.put(
  '/:id',
  validate([...recordIdValidator, ...updateRecordValidator]),
  updateRecord
);
router.delete('/:id', validate(recordIdValidator), deleteRecord);

export default router;
