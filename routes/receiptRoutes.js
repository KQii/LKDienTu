const express = require('express');
const authController = require('../controllers/authController');
const receiptController = require('../controllers/receiptController');
// const receiptValidator = require('../validators/receiptValidator');
// const handleValidationErrors = require('../validators/handleValidationErrors');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('Superadmin', 'Admin'),
    receiptController.getAllReceipts
  )
  .post(
    authController.protect,
    authController.restrictTo('Superadmin', 'Admin'),
    receiptController.createReceipt
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('Superadmin', 'Admin'),
    receiptController.getReceipt
  )
  .patch(
    authController.protect,
    authController.restrictTo('Superadmin', 'Admin'),
    receiptController.updateReceipt
  );
// .delete(
//   authController.protect,
//   authController.restrictTo('Superadmin', 'Admin'),
//   receiptController.deleteReceipt
// );

module.exports = router;
