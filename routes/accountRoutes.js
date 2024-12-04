const express = require('express');
const accountController = require('../controllers/accountController');
const authController = require('../controllers/authController');
const accountValidator = require('../validators/accountValidator');
const handleValidationErrors = require('../validators/handleValidationErrors');

const router = express.Router();

router.post(
  '/signup',
  accountValidator.validateAccountCreation,
  handleValidationErrors,
  authController.signup
);
router.post('/login', authController.login);

router.post(
  '/forgotPassword',
  accountValidator.validateForgotPassword,
  handleValidationErrors,
  authController.forgotPassword
);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch('/updateMe', authController.protect, accountController.updateMe);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router
  .route('/')
  .get(accountController.getAllAccounts)
  .post
  // accountValidator.validateAccountCreation,
  // handleValidationErrors,
  // accountController.createAccount
  ();

router
  .route('/:id')
  .get
  // accountValidator.validateAccountId,
  // handleValidationErrors.validateAccountId,
  // accountController.getAccount
  ()
  .patch
  // accountValidator.validateAccountId,
  // accountValidator.validatePatchAccount,
  // handleValidationErrors,
  // accountController.updateAccount
  ()
  .delete
  // accountValidator.validateAccountId,
  // handleValidationErrors,
  // accountController.deleteAccount
  ();

module.exports = router;
