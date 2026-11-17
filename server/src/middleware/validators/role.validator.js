import { body, param } from 'express-validator';

export const createRoleValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Role system identifier name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters')
    .matches(/^[a-z0-9_-]+$/)
    .withMessage('Role name must only contain lowercase letters, numbers, hyphens, and underscores'),

  body('displayName')
    .trim()
    .notEmpty()
    .withMessage('Display name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be between 2 and 50 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Description cannot exceed 255 characters'),

  body('permissions')
    .isArray()
    .withMessage('Permissions must be an array of strings'),
];

export const updateRoleValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid role ID'),

  body('displayName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Display name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be between 2 and 50 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Description cannot exceed 255 characters'),

  body('permissions')
    .isArray()
    .withMessage('Permissions must be an array of strings'),
];

