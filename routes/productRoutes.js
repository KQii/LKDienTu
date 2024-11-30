const express = require('express');
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
    productValidator.validateFeatures,
    handleValidationErrors,
    productController.getAllProducts
  )
  .post(
    productValidator.validateProductCreation,
    handleValidationErrors,
    productController.createProduct
  );

router
  .route('/:id')
  .get(
    productValidator.validateProductId,
    handleValidationErrors,
    productController.getProduct
  )
  .patch(
    productValidator.validateProductId,
    productValidator.validatePatchProduct,
    handleValidationErrors,
    productController.updateProduct
  )
  .delete(
    productValidator.validateProductId,
    handleValidationErrors,
    productController.deleteProduct
  );

module.exports = router;
