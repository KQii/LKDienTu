const db = require('../database');

exports.getAllRoles = async () => {
  const [rows] = await db.query('SELECT * FROM roles');

  return rows;
};

exports.getRoleById = async id => {
  const [rows] = await db.query('SELECT * FROM roles WHERE RoleID = ?', [id]);
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
