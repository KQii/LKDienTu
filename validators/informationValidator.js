const { body } = require('express-validator');

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
  // .isAlpha()
  // .withMessage('First name only contains letters'),

  body('LastName')
    .notEmpty()
    .withMessage('Last name is required'),
  // .isAlpha()
  // .withMessage('Last name only contains letters'),

  body('MiddleName').optional(),
  // .isAlpha()
  // .withMessage('Middle name only contains letters'),

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

// exports.validatePatchAccount = [
//   body('AccountName')
//     .optional()
//     .isLength({ min: 3, max: 45 })
//     .withMessage('Account name must be between 3 and 50 characters'),

//   body('CIC')
//     .optional()
//     .custom(value => {
//       if (value !== 10 || value !== 12) {
//         throw new Error('CIC must be 10 or 12 characters long');
//       }
//       return true;
//     }),

//   body('Mail')
//     .optional()
//     .isEmail()
//     .withMessage('Invalid email format'),

//   body('Password').optional()
// ];

// exports.validateForgotPassword = [
//   body('Mail')
//     .notEmpty()
//     .withMessage('Email is required')
//     .isEmail()
//     .withMessage('Invalid email format')
// ];

// exports.validateAccountId = [
//   param('id')
//     .notEmpty()
//     .withMessage('Account ID is required')
//     .isInt({ min: 1 })
//     .withMessage('Account ID must be a positive integer')
// ];
