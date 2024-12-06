const express = require('express');
const authController = require('../controllers/authController');
const invoiceController = require('../controllers/invoiceController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('Superadmin', 'Admin'),
    invoiceController.getAllInvoices
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
