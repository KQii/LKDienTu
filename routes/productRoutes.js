const express = require('express');
const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const productValidator = require('../validators/productValidator');
const handleValidationErrors = require('../validators/handleValidationErrors');

const router = express.Router();

// router.route('/monthly-plan/:year').get(productController.getMonthlyPlan);

router
  .route('/top-5-cheap')
  .get(productController.aliasTopProducts, productController.getAllProducts);

router.route('/product-stats').get(productController.getProductStats);

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('Superadmin', 'Admin'),
    productValidator.validateFeatures,
    handleValidationErrors,
    productController.getAllProducts
  )
  .post(
    authController.protect,
    authController.restrictTo('Superadmin'),
    productValidator.validateProductCreation,
    handleValidationErrors,
    productController.createProduct
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('Superadmin', 'Admin', 'User'),
    productValidator.validateProductId,
    handleValidationErrors,
    productController.getProduct
  )
  .patch(
    authController.protect,
    authController.restrictTo('Superadmin', 'Admin'),
    productValidator.validateProductId,
    productValidator.validatePatchProduct,
    handleValidationErrors,
    productController.updateProduct
  )
  .delete(
    authController.protect,
    authController.restrictTo('Superadmin'),
    productValidator.validateProductId,
    handleValidationErrors,
    productController.deleteProduct
  );

module.exports = router;
