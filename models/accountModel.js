const db = require('../database');
// const trans = require('../utils/transaction');

exports.getAllAccounts = async () => {
  const [rows] = await db.query(
    `
    SELECT
      a.AccountID, a.AccountName, a.CIC, a.Mail,
      JSON_OBJECT(
        'RoleID', r.RoleID,
        'RoleName', r.RoleName
      ) AS Role
    FROM account AS a
    JOIN roles AS r ON a.RoleID = r.RoleID
    `
  );
  return rows;
};

exports.getAccountById = async id => {
  const [rows] = await db.query(
    `
    SELECT
      a.AccountID, a.AccountName, a.CIC, a.Mail,
      JSON_OBJECT(
        'RoleID', r.RoleID,
        'RoleName', r.RoleName
      ) AS Role
    FROM account AS a
    JOIN roles AS r ON a.RoleID = r.RoleID
    WHERE a.AccountID = ?
    `,
    [id]
  );
  return rows[0];
};

exports.getAccountByIdWithTrans = async (id, connection) => {
  const [rows] = await connection.execute(
    `
    SELECT
      a.AccountID, a.AccountName, a.CIC, a.Mail,
      JSON_OBJECT(
        'RoleID', r.RoleID,
        'RoleName', r.RoleName
      ) AS Role
    FROM account AS a
    JOIN roles AS r ON a.RoleID = r.RoleID
    WHERE a.AccountID = ?
    `,
    [id]
  );
  return rows[0];
};

exports.getAccountByAccountName = async accountName => {
  const [rows] = await db.query(`SELECT * FROM account WHERE AccountName = ?`, [
    accountName
  ]);
  return rows[0];
};

exports.getAccountByMail = async mail => {
  const [rows] = await db.query(`SELECT * FROM account WHERE Mail = ?`, [mail]);
  return rows[0];
};

exports.getAccountByAccountNameOrMail = async (accountName, email) => {
  const values = [accountName, email];
  // console.log(values);
  // const [rows] = await db.query(
  //   'SELECT * FROM account WHERE AccountName = ? OR Mail = ?',
  //   values
  // );
  const [rows] = await db.query(
    `
    SELECT
      a.AccountID, a.AccountName, a.CIC, a.Password, a.Mail,
      JSON_OBJECT(
        'RoleID', r.RoleID,
        'RoleName', r.RoleName
      ) AS Role
    FROM account AS a
    JOIN roles AS r ON a.RoleID = r.RoleID
    WHERE a.AccountName = ? OR a.Mail = ?
    `,
    values
  );
  return rows[0];
};

exports.updateAccountById = async (id, data) => {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    if (key !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  values.push(id);

  let updateQuery = 'UPDATE account SET ';
  if (fields.length > 0) {
    updateQuery += `${fields.join(', ')} WHERE AccountID = ?`;
  }

  await db.execute(updateQuery, values);
  return this.getAccountById(id);
};

exports.getAccountByPasswordResetToken = async passwordResetToken => {
  const [
    rows
  ] = await db.query(
    'SELECT * FROM account WHERE PasswordResetToken = ? AND PasswordResetExpires > NOW()',
    [passwordResetToken]
  );
  return rows[0];
};

exports.createAccount = async data => {
  const { AccountName, Password, Mail } = data;

  const query = `
    INSERT INTO account (AccountName, Password, Mail)
    VALUES (?, ?, ?)
  `;

  const [result] = await db.execute(query, [AccountName, Password, Mail]);
  return this.getAccountById(result.insertId);
};

exports.createAccountSuperadmin = async data => {
  const { AccountName, Password, Mail, RoleID } = data;

  const query = `
    INSERT INTO account (AccountName, Password, Mail, RoleID)
    VALUES (?, ?, ?, ?)
  `;

  const [result] = await db.execute(query, [
    AccountName,
    Password,
    Mail,
    RoleID
  ]);
  return this.getAccountById(result.insertId);
};

exports.updateAccountPassword = async data => {
  const { AccountID, Password } = data;

  const query = `
    UPDATE account SET Password = ?, PasswordResetToken = null, PasswordResetExpires = null, PasswordChangedAt = NOW() WHERE AccountID = ?
  `;
  // await db.execute(query, [Password, AccountID]);
  const [result] = await db.execute(query, [Password, AccountID]);
  return { result, updatedAccount: this.getAccountById(AccountID) };
};

exports.updatePasswordResetToken = async data => {
  const { AccountID, PasswordResetToken, PasswordResetExpires } = data;
  let passwordResetExpiresValue = 'DATE_ADD(NOW(), INTERVAL 10 MINUTE)';
  if (PasswordResetExpires === 'error') passwordResetExpiresValue = null;

  const query = `UPDATE account SET PasswordResetToken = ?, PasswordResetExpires = ${passwordResetExpiresValue} WHERE AccountID = ?`;
  await db.execute(query, [PasswordResetToken, AccountID]);
};

exports.updateAccountByCICWithTrans = async (id, CIC, connection) => {
  const query = `UPDATE account SET CIC = ? WHERE AccountID = ?`;
  const result = await connection.execute(query, [CIC, id]);
  return {
    result,
    updatedAccount: this.getAccountByIdWithTrans(id, connection)
  };
};

exports.deleteAccountById = async id => {
  const [rows] = await db.query('DELETE FROM account WHERE AccountID = ?', [
    id
  ]);

  return rows;
};
