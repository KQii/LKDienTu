const express = require('express');
const authController = require('../controllers/authController');
const productCatalogController = require('../controllers/productCatalogController');
const productCatalogValidator = require('../validators/productCatalogValidator');
const handleValidationErrors = require('../validators/handleValidationErrors');

const router = express.Router();

router
  .route('/')
  .get(
    // authController.protect,
    // authController.restrictTo('Superadmin'),
    productCatalogController.getAllProductCatalogs
  )
  .post(
    // authController.protect,
    // authController.restrictTo('Superadmin'),
    productCatalogValidator.validateProductCatalogCreation,
    handleValidationErrors,
    productCatalogController.createProductCatalog
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('Superadmin'),
    productCatalogValidator.validateProductCatalogId,
    handleValidationErrors,
    productCatalogController.getProductCatalog
  )
  .patch(
    // authController.protect,
    // authController.restrictTo('Superadmin'),
    productCatalogValidator.validateProductCatalogId,
    productCatalogValidator.validatePatchProductCatalog,
    handleValidationErrors,
    productCatalogController.updateProductCatalog
  )
  .delete(
    // authController.protect,
    // authController.restrictTo('Superadmin'),
    productCatalogValidator.validateProductCatalogId,
    handleValidationErrors,
    productCatalogController.deleteProductCatalog
  );

module.exports = router;
