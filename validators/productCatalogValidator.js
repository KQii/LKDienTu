const { body, param, query } = require('express-validator');

exports.validateProductCatalogCreation = [
  body('productCatalogName')
    .notEmpty()
    .withMessage('ProductCatalogName is required'),

  body('parentID')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('ParentID must be a positive integer')
];

exports.validateProductCatalogId = [
  param('id')
    .notEmpty()
    .withMessage('ProductCatalogID is required')
    .isInt({ min: 1 })
    .withMessage('ProductCatalogID must be a positive integer')
];

exports.validatePatchProductCatalog = [
  body('parentID')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('ParentID must be a positive integer')
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
