const db = require('../database');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllRoles = async reqQuery => {
  const query = 'SELECT RoleID, RoleName FROM roles';

  const features = new APIFeatures(query, reqQuery, 'roles')
    .filter()
    .sort()
    .paginate()
    .limitFields();

  const [rows] = await db.execute(features.query, features.values);

  return rows;
};

exports.getRoleById = async id => {
  const [rows] = await db.query('SELECT * FROM roles WHERE RoleID = ?', [id]);
  return rows[0];
};

exports.getRoleByRoleName = async roleName => {
  const [rows] = await db.query('SELECT * FROM roles WHERE RoleName = ?', [
    roleName
  ]);
  return rows[0];
};

exports.getOtherRoleByRoleName = async (roleId, roleName) => {
  const [
    rows
  ] = await db.query(`SELECT * FROM roles WHERE RoleName = ? AND RoleID <> ?`, [
    roleName,
    roleId
  ]);
  return rows[0];
};

exports.createRole = async data => {
  const query = `INSERT INTO roles (RoleName) VALUES (?)`;
  const [result] = await db.execute(query, [data.RoleName]);

  return this.getRoleById(result.insertId);
};

exports.updateRoleById = async (id, data) => {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    if (key !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  values.push(id);

  let updateQuery = 'UPDATE roles SET ';
  if (fields.length > 0) {
    updateQuery += `${fields.join(', ')} WHERE RoleID = ?`;
  }

  const [result] = await db.execute(updateQuery, values);
  return { result, updatedRole: this.getRoleById(id) };
};

exports.deleteRoleById = async id => {
  const [rows] = await db.query('DELETE FROM roles WHERE RoleID = ?', [id]);

  return rows;
};
