const express = require('express');
const accountController = require('../controllers/accountController');
const authController = require('../controllers/authController');
const informationController = require('../controllers/informationController');
const accountValidator = require('../validators/accountValidator');
const informationValidator = require('../validators/informationValidator');
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

router.post(
  '/createMyInfo',
  authController.protect,
  informationValidator.validateInfoCreation,
  handleValidationErrors,
  informationController.createMyInfo
);

router.patch(
  '/updateMyInfo',
  authController.protect,
  informationController.updateInfo
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
