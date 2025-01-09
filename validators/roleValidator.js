const { body, param, query } = require('express-validator');

exports.validateRoleCreation = [
  body('RoleName')
    .notEmpty()
    .withMessage('Role name is required')
];

exports.validateRoleId = [
  param('id')
    .notEmpty()
    .withMessage('Role ID is required')
    .isInt({ min: 1 })
    .withMessage('Role ID must be a positive integer')
];

exports.validateFeatures = [
  query('sort')
    .optional()
    .trim()
    .escape(),

  query('fields')
    .optional()
    .trim()
    .escape(),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limit must be a positive integer')
];
