const express = require('express');
const authController = require('../controllers/authController');
const roleController = require('../controllers/roleController');
const roleValidator = require('../validators/roleValidator');
const handleValidationErrors = require('../validators/handleValidationErrors');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('Superadmin'),
    roleValidator.validateFeatures,
    handleValidationErrors,
    roleController.getAllRoles
  )
  .post(
    authController.protect,
    authController.restrictTo('Superadmin'),
    roleValidator.validateRoleCreation,
    handleValidationErrors,
    roleController.createRole
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('Superadmin'),
    roleValidator.validateRoleId,
    handleValidationErrors,
    roleController.getRole
  )
  .patch(
    authController.protect,
    authController.restrictTo('Superadmin'),
    roleValidator.validateRoleId,
    handleValidationErrors,
    roleController.updateRole
  )
  .delete(
    authController.protect,
    authController.restrictTo('Superadmin'),
    roleValidator.validateRoleId,
    handleValidationErrors,
    roleController.deleteRole
  );

module.exports = router;
