const { body, param, query } = require('express-validator');

exports.validateProductCreation = [
  body('productName')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Product name must be between 3 and 50 characters'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a positive number'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('sale')
    .notEmpty()
    .withMessage('Sale is required')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Sale must be a positive number')
];

exports.validatePatchProduct = [
  body('productName')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Product name must be between 3 and 50 characters'),

  body('quantity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a positive number'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('sale')
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
