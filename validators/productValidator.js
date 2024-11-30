const { body, param, query } = require('express-validator');

exports.validateProductCreation = [
  body('ProductName')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Product name must be between 3 and 50 characters'),

  body('Quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a positive number'),

  body('Price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('Sale')
    .notEmpty()
    .withMessage('Sale is required')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Sale must be a positive number')
];

exports.validatePatchProduct = [
  body('ProductName')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Product name must be between 3 and 50 characters'),

  body('Quantity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a positive number'),

  body('Price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('Sale')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Sale must be a positive number')
];

exports.validateProductId = [
  param('id')
    .notEmpty()
    .withMessage('Product ID is required')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer')
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
