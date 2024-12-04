const db = require('../database');

exports.getAllInfo = async () => {
  const [rows] = await db.query('SELECT * FROM info');

  return rows;
};

exports.getInfoById = async id => {
  const [rows] = await db.query('SELECT * FROM info WHERE InfoID = ?', [id]);
  return rows[0];
};

exports.getInfoByCIC = async CIC => {
  const [rows] = await db.query('SELECT * FROM info WHERE CIC = ?', [CIC]);
  return rows[0];
};

exports.createInfo = async data => {
  const {
    CIC,
    PhoneNumber,
    FirstName,
    MiddleName,
    LastName,
    DateOfBirth,
    Sex,
    HouseNumber,
    Street,
    Ward,
    District,
    City
  } = data;

  const query = `
  INSERT INTO info (CIC, PhoneNumber, FirstName, MiddleName, LastName, DateOfBirth, Sex, HouseNumber, Street, Ward, District, City)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.execute(query, [
    CIC,
    PhoneNumber,
    FirstName,
    MiddleName,
    LastName,
    DateOfBirth,
    Sex,
    HouseNumber,
    Street,
    Ward,
    District,
    City
  ]);

  return this.getInfoById(result.insertId);
};

exports.updateInfoById = async (id, data) => {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    if (key !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  values.push(id);

  let updateQuery = 'UPDATE info SET ';
  if (fields.length > 0) {
    updateQuery += `${fields.join(', ')} WHERE InfoID = ?`;
  }

  const [result] = await db.execute(updateQuery, values);
  return { result, updatedInfo: this.getInfoById(id) };
};

exports.deleteInfoById = async id => {
  const [rows] = await db.query('DELETE FROM info WHERE InfoID = ?', [id]);

  return rows;
};
