const roleModel = require('../models/roleModel');
const AppError = require('../utils/appError');
const filterObj = require('../utils/filterObj');

exports.getAllRolesService = async reqQuery => {
  // prettier-ignore
  const validRequestQuery = filterObj(reqQuery, 'RoleID', 'RoleName', 'sort', 'fields', 'page', 'limit');

  const allRoles = await roleModel.getAllRoles(validRequestQuery);
  return allRoles;
};

exports.createNewRoleService = async roleData => {
  const result = await roleModel.createRole(roleData);
  return result;
};

exports.getRoleService = async roleId => {
  const role = await roleModel.getRoleById(roleId);
  return role;
};

exports.getRoleByRoleNameService = async roleName => {
  const role = await roleModel.getRoleByRoleName(roleName);
  return role;
};

exports.getOtherRoleByRoleNameService = async (roleId, roleName) => {
  const role = await roleModel.getOtherRoleByRoleName(roleId, roleName);
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
