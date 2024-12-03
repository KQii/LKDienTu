const { body, param, query } = require('express-validator');

exports.validateAccountCreation = [
  body('AccountName')
    .notEmpty()
    .withMessage('Account name is required')
    .isLength({ min: 3, max: 45 })
    .withMessage('Account name must be between 3 and 50 characters'),

  // body('CIC')
  //   .notEmpty()
  //   .withMessage('CIC is required')
  //   .custom(value => {
  //     if (value && value.length !== 10 && value.length !== 12) {
  //       throw new Error('CIC must be 10 or 12 characters long');
  //     }
  //     return true;
  //   }),

  body('Password')
    .notEmpty()
    .withMessage('Password is required'),

  body('PasswordConfirm')
    .notEmpty()
    .withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.Password) {
        throw new Error('Password confirmation does not match password');
      }
      return true; // Bắt buộc phải trả về true nếu không có lỗi
    }),

  body('Mail')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
];

exports.validatePatchAccount = [
  body('AccountName')
    .optional()
    .isLength({ min: 3, max: 45 })
    .withMessage('Account name must be between 3 and 50 characters'),

  body('CIC')
    .optional()
    .custom(value => {
      if (value !== 10 || value !== 12) {
        throw new Error('CIC must be 10 or 12 characters long');
      }
      return true;
    }),

  body('Mail')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),

  body('Password').optional()
];

exports.validateAccountId = [
  param('id')
    .notEmpty()
    .withMessage('Account ID is required')
    .isInt({ min: 1 })
    .withMessage('Account ID must be a positive integer')
];
