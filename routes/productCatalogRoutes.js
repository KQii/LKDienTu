const express = require('express');
const authController = require('../controllers/authController');
const productCatalogController = require('../controllers/productCatalogController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('Superadmin'),
    productCatalogController.getAllProductCatalogs
  )
  .post(
    authController.protect,
    authController.restrictTo('Superadmin'),
    productCatalogController.createProductCatalog
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('Superadmin'),
    productCatalogController.getProductCatalog
  )
  .patch(
    authController.protect,
    authController.restrictTo('Superadmin'),
    productCatalogController.updateProductCatalog
  )
  .delete(
    authController.protect,
    authController.restrictTo('Superadmin'),
    productCatalogController.deleteProductCatalog
  );

module.exports = router;
