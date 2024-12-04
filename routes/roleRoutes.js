const express = require('express');
const authController = require('../controllers/authController');
const roleController = require('../controllers/roleController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('Superadmin'),
    roleController.getAllRoles
  )
  .post(
    authController.protect,
    authController.restrictTo('Superadmin'),
    roleController.createRole
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('Superadmin'),
    roleController.getRole
  )
  .patch(
    authController.protect,
    authController.restrictTo('Superadmin'),
    roleController.updateRole
  )
  .delete(
    authController.protect,
    authController.restrictTo('Superadmin'),
    roleController.deleteRole
  );

module.exports = router;
