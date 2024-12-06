const express = require('express');
const authController = require('../controllers/authController');
const invoiceDetailController = require('../controllers/invoiceDetailController');

const router = express.Router();

// router
//   .route('/myInvoiceDetail')
//   .get(
//     authController.protect,
//     authController.restrictTo('User'),
//     invoiceDetailController.getMyInvoiceDetails
//   );

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('Superadmin', 'Admin'),
    invoiceDetailController.getAllInvoiceDetails
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('Superadmin', 'Admin'),
    invoiceDetailController.getInvoiceDetail
  );

module.exports = router;
