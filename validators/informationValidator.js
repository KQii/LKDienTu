const { body, param, query } = require('express-validator');

exports.validateInfoCreation = [
  body('CIC')
    .notEmpty()
    .withMessage('CIC is required')
    .custom(value => {
      if (value && value.length !== 10 && value.length !== 12) {
        throw new Error('CIC must be 10 or 12 characters long');
      }
      return true;
    }),

  body('FirstName')
    .notEmpty()
    .withMessage('First name is required'),

  body('LastName')
    .notEmpty()
    .withMessage('Last name is required'),

  body('MiddleName').optional(),

  body('DateOfBirth')
    .optional()
    .isDate()
    .withMessage('Invalid date format'),

  body('Sex')
    .optional()
    .custom(value => {
      if (value && value !== 0 && value !== 1) {
        throw new Error('Sex must be 0 or 1');
      }
      return true;
    }),

  body('PhoneNumber')
    .notEmpty()
    .withMessage('Phonenumber is required')
    .isLength({ min: 10, max: 10 })
    .withMessage('Phonenumber must contain exactly 10 characters')
    .isNumeric()
    .withMessage('Phonenumber must contain only numbers'),

  body('HouseNumber')
    .notEmpty()
    .withMessage('House number is required'),

  body('Street')
    .notEmpty()
    .withMessage('Street is required'),

  body('Ward')
    .notEmpty()
    .withMessage('Ward is required'),

  body('District')
    .notEmpty()
    .withMessage('District is required'),

  body('City')
    .notEmpty()
    .withMessage('City is required')
];

exports.validatePatchInfo = [
  body('CIC')
    .optional()
    .custom(value => {
      if (value && value.length !== 10 && value.length !== 12) {
        throw new Error('CIC must be 10 or 12 characters long');
      }
      return true;
    }),

  body('FirstName').optional(),

  body('LastName').optional(),

  body('MiddleName').optional(),

  body('DateOfBirth')
    .optional()
    .isDate()
    .withMessage('Invalid date format'),

  body('Sex')
    .optional()
    .custom(value => {
      if (value && value !== 0 && value !== 1) {
        throw new Error('Sex must be 0 or 1');
      }
      return true;
    }),

  body('PhoneNumber')
    .optional()
    .isLength({ min: 10, max: 10 })
    .withMessage('Phonenumber must contain exactly 10 characters')
    .isNumeric()
    .withMessage('Phonenumber must contain only numbers'),

  body('HouseNumber').optional(),

  body('Street').optional(),

  body('Ward').optional(),

  body('District').optional(),

  body('City').optional()
];

exports.validateInfoID = [
  param('id')
    .notEmpty()
    .withMessage('InfoID is required')
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
