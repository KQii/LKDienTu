const db = require('../database');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllInfo = async reqQuery => {
  const query = `
  SELECT
    InfoID, CIC, PhoneNumber, FirstName, MiddleName, LastName, DateOfBirth, Sex, HouseNumber, Street, Ward, District, City
  FROM info`;

  const features = new APIFeatures(query, reqQuery, 'info')
    .filter()
    .sort()
    .paginate()
    .limitFields();

  const [rows] = await db.execute(features.query, features.values);

  return rows;
};

exports.getInfoById = async id => {
  const [rows] = await db.query('SELECT * FROM info WHERE InfoID = ?', [id]);
  return rows[0];
};

exports.getInfoByIdWithTrans = async (id, connection) => {
  const [rows] = await connection.execute(
    'SELECT * FROM info WHERE InfoID = ?',
    [id]
  );
  return rows[0];
};

exports.getInfoByCIC = async CIC => {
  const [rows] = await db.query('SELECT * FROM info WHERE CIC = ?', [CIC]);
  return rows[0];
};

exports.getOtherInfoByCIC = async (id, CIC) => {
  const [
    rows
  ] = await db.query('SELECT * FROM info WHERE CIC = ? AND InfoID <> ?', [
    CIC,
    id
  ]);
  return rows[0];
};

exports.getInfoByPhoneNumber = async phoneNumber => {
  const [rows] = await db.query('SELECT * FROM info WHERE PhoneNumber = ?', [
    phoneNumber
  ]);
  return rows[0];
};

exports.getOtherInfoByPhoneNumber = async (id, phoneNumber) => {
  const [
    rows
  ] = await db.query(
    'SELECT * FROM info WHERE PhoneNumber = ? AND InfoID <> ?',
    [phoneNumber, id]
  );
  return rows[0];
};

exports.getInfoByAccountCIC = async CIC => {
  const query = `
  SELECT *
  FROM info AS i
  JOIN account AS a ON i.CIC = a.CIC
  WHERE a.CIC = ?
  `;
  const [rows] = await db.query(query, [CIC]);
  return rows[0];
};

exports.createInfoWithTrans = async (data, connection) => {
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

  const [result] = await connection.execute(query, [
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

  return this.getInfoByIdWithTrans(result.insertId, connection);
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
