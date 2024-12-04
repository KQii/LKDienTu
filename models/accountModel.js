const db = require('../database');

exports.getAllAccounts = async () => {
  const [rows] = await db.query(
    `
    SELECT
      account.AccountID, account.AccountName, account.CIC, account.Mail, account.PasswordChangedAt,
      roles.*
    FROM account
    JOIN roles ON account.RoleID = roles.RoleID
    `
  );
  const result = rows.map(account => {
    account.Role = { RoleID: account.RoleID, RoleName: account.RoleName };
    delete account.RoleID;
    delete account.RoleName;
    return account;
  });
  return result;
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

exports.getAccountByAccountNameOrMail = async (accountName, email) => {
  const values = [accountName, email];
  const [rows] = await db.query(
    'SELECT * FROM account WHERE AccountName = ? OR Mail = ?',
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

exports.updateAccountPassword = async data => {
  const {
    AccountID,
    Password,
    PasswordResetToken,
    PasswordResetExpires
  } = data;

  const query = `
    UPDATE account SET Password = ?, PasswordResetToken = ?, PasswordResetExpires = ?, PasswordChangedAt = NOW() WHERE AccountID = ?
  `;
  await db.execute(query, [
    Password,
    PasswordResetToken,
    PasswordResetExpires,
    AccountID
  ]);
};

exports.updatePasswordResetToken = async data => {
  const { AccountID, PasswordResetToken } = data;

  const query = `UPDATE account SET PasswordResetToken = ?, PasswordResetExpires = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE AccountID = ?`;
  await db.execute(query, [PasswordResetToken, AccountID]);
};

exports.updateAccountByCIC = async (id, CIC) => {
  const query = `UPDATE account SET CIC = ? WHERE AccountID = ?`;
  const [result] = await db.execute(query, [CIC, id]);
  return { result, updatedAccount: this.getAccountById(id) };
};

exports.deleteAccount = async () => {};
