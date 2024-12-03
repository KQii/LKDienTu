const db = require('../database');

exports.getAllAccounts = async () => {
  const [rows] = await db.query(
    'SELECT AccountID, AccountName, CIC, Mail, PasswordChangedAt FROM account'
  );
  return rows;
};

exports.getAccountById = async id => {
  const [
    rows
  ] = await db.query(
    'SELECT AccountID, AccountName, CIC, Mail, PasswordChangedAt FROM account WHERE AccountID = ?',
    [id]
  );
  return rows[0];
};

exports.getAccountByAccountNameOrMailAndPassword = async (
  accountName,
  email
) => {
  const values = [accountName, email];
  const [rows] = await db.query(
    'SELECT * FROM account WHERE AccountName = ? OR Mail = ?',
    values
  );
  return rows[0];
};

exports.createAccount = async data => {
  const { AccountName, Password, Mail, PasswordChangedAt } = data;

  const query = `
    INSERT INTO account (AccountName, Password, Mail, PasswordChangedAt)
    VALUES (?, ?, ?, ?)
  `;

  const [result] = await db.execute(query, [
    AccountName,
    Password,
    Mail,
    PasswordChangedAt
  ]);
  return this.getAccountById(result.insertId);
};

exports.updateAccount = async () => {};

exports.deleteAccount = async () => {};

// exports.changedPasswordAfter = JWTTimestamp => {
//   if (this.PasswordChangedAt) console.log(this.PasswordChangedAt, JWTTimestamp);
//   return false;
// };
