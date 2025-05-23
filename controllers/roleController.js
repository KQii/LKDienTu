const roleService = require('../services/roleService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllRoles = catchAsync(async (req, res, next) => {
  const roles = await roleService.getAllRolesService(req.query);

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: roles.length,
    data: {
      roles
    }
  });
});

exports.createRole = catchAsync(async (req, res, next) => {
  if (!req.body.RoleName) {
    return next(new AppError('Please provide missing information!', 400));
  }

  const roleNameExists = await roleService.getRoleByRoleNameService(req.body);
  if (roleNameExists) {
    return next(
      new AppError('This role name has been used. Please use another name')
    );
  }

  const newRole = await roleService.createNewRoleService(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      role: newRole
    }
  });
});

exports.getRole = catchAsync(async (req, res, next) => {
  const role = await roleService.getRoleService(req.params.id);

  if (!role) {
    return next(new AppError(`Role with ID ${req.params.id} not found`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      role
    }
  });
});

exports.updateRole = catchAsync(async (req, res, next) => {
  const role = await roleService.getRoleService(req.params.id);
  if (!role) {
    return next(new AppError(`Role with ID ${req.params.id} not found`, 404));
  }

  const roleNameExists = await roleService.getOtherRoleByRoleNameService(
    req.params.id,
    req.body.RoleName
  );
  if (roleNameExists) {
    return next(
      new AppError('This role name has been used! Please use another name', 400)
    );
  }

  const updatedRole = await roleService.updateRoleService(
    req.params.id,
    req.body
  );

  res.status(200).json({
    status: 'success',
    data: {
      role: updatedRole
    }
  });
});

exports.deleteRole = catchAsync(async (req, res, next) => {
  await roleService.deleteRoleService(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
