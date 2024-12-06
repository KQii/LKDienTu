const express = require('express');
const authController = require('../controllers/authController');
const cartDetailController = require('../controllers/cartDetailController');

const router = express.Router();

router
  .route('/myCart')
  .get(
    authController.protect,
    authController.restrictTo('User'),
    cartDetailController.getMyCart
  )
  .patch(
    authController.protect,
    authController.restrictTo('User'),
    cartDetailController.updateMyCart
  );

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('Superadmin', 'Admin'),
    cartDetailController.getAllCartDetails
  )
  .post(
    authController.protect,
    authController.restrictTo('User'),
    cartDetailController.createCartDetail
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('Admin'),
    cartDetailController.getCartDetail
  )
  .patch(
    authController.protect,
    authController.restrictTo('User'),
    cartDetailController.updateCartDetail
  )
  .delete(
    authController.protect,
    authController.restrictTo('Admin', 'User'),
    cartDetailController.deleteCartDetail
  );

module.exports = router;
