const roleModel = require('../models/roleModel');
const AppError = require('../utils/appError');

exports.getAllRolesService = async () => {
  const allRoles = await roleModel.getAllRoles();
  return allRoles;
};

exports.createNewRoleService = async roleData => {
  const result = await roleModel.createRole(roleData);
  return result;
};

exports.getRoleService = async roleId => {
  const role = await roleModel.getRoleById(roleId);
  if (!role) {
    throw new AppError(`Role with ID ${roleId} not found`, 404);
  }
  return role;
};

exports.updateRoleService = async (roleId, roleData) => {
  const { updatedRole } = await roleModel.updateRoleById(roleId, roleData);
  return updatedRole;
};

exports.deleteRoleService = async roleId => {
  const result = await roleModel.deleteRoleById(roleId);
  if (result.affectedRows === 0) {
    throw new AppError(`Role with ID ${roleId} not found`, 404);
  }
};
