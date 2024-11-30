const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

// router.param('id', productController.checkID);

// router
//   .route('/top-5-cheap')
//   .get(productController.aliasTopTours, productController.getAllTours);

// router.route('/tour-stats').get(productController.getTourStats);
// router.route('/monthly-plan/:year').get(productController.getMonthlyPlan);

router
  .route('/top-5-cheap')
  .get(productController.aliasTopProducts, productController.getAllProducts);

router
  .route('/')
  .get(productController.getAllProducts)
  .post(productController.createProduct);

router
  .route('/:id')
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
