const express = require('express');
const authController = require('../controllers/authController');
const receiptDetailController = require('../controllers/receiptDetailController');
// const receiptDetailValidator = require('../validators/receiptDetailValidator');
// const handleValidationErrors = require('../validators/handleValidationErrors');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('Superadmin', 'Admin'),
    receiptDetailController.getAllReceiptDetails
  )
  .post(
    authController.protect,
    authController.restrictTo('Superadmin', 'Admin'),
    receiptDetailController.createReceiptDetail
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('Superadmin', 'Admin'),
    receiptDetailController.getReceiptDetail
  )
  .patch(
    authController.protect,
    authController.restrictTo('Superadmin', 'Admin'),
    receiptDetailController.updateReceiptDetail
  )
  .delete(
    authController.protect,
    authController.restrictTo('Superadmin', 'Admin'),
    receiptDetailController.deleteReceiptDetail
  );
