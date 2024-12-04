const express = require('express');
const authController = require('../controllers/authController');
const informationController = require('../controllers/informationController');
const informationValidator = require('../validators/informationValidator');
const handleValidationErrors = require('../validators/handleValidationErrors');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('Superadmin'),
    informationController.getAllInfo
  )
  .post(
    authController.protect,
    authController.restrictTo('Superadmin'),
    informationValidator.validateInfoCreation,
    handleValidationErrors,
    informationController.createInfo
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('Superadmin'),
    informationController.getInfoById
  )
  .patch(
    authController.protect,
    authController.restrictTo('Superadmin'),
    informationController.updateInfo
  )
  .delete(
    authController.protect,
    authController.restrictTo('Superadmin'),
    informationController.deleteInfo
  );

module.exports = router;
