const express = require('express');
const authController = require('../controllers/authController');
const invoiceController = require('../controllers/invoiceController');

const router = express.Router();

router
  .route('/myInvoices')
  .get(
    authController.protect,
    authController.restrictTo('User'),
    invoiceController.getMyInvoices
  );

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('Superadmin', 'Admin'),
    invoiceController.getAllInvoices
  )
  .post(
    authController.protect,
    authController.restrictTo('User'),
    invoiceController.createInvoice
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('Superadmin', 'Admin'),
    invoiceController.getInvoice
  )
  .patch(
    authController.protect,
    authController.restrictTo('Superadmin', 'Admin'),
    invoiceController.updateInvoice
  );

module.exports = router;
