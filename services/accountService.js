const bcrypt = require('bcryptjs');

const accountModel = require('../models/accountModel');
const AppError = require('../utils/appError');
const filterObj = require('../utils/filterObj');
const mapKeysAndValues = require('../utils/mapKeysAndValues');

exports.getAccountByAccountNameService = async accountData => {
  const account = await accountModel.getAccountByAccountName(
    accountData.AccountName
  );
  return account;
};

exports.getOtherAccountByAccountNameService = async (
  accountId,
  accountName
) => {
  const account = await accountModel.getOtherAccountByAccountName(
    accountId,
    accountName
  );
  return account;
};

exports.getOtherAccountByCICService = async (accountId, CIC) => {
  const account = await accountModel.getOtherAccountByCIC(accountId, CIC);
  return account;
};

exports.getAccountByMailService = async accountData => {
  const account = await accountModel.getAccountByMail(accountData.Mail);
  return account;
};

exports.getAllAccountsService = async reqQuery => {
  // prettier-ignore
  const validRequestQuery = filterObj(reqQuery,
      'AccountID', 'AccountName', 'CIC', 'Mail', 'RoleID', 'RoleName', 'sort', 'fields', 'page', 'limit');
  console.log('REQQUERY BEFORE: ', validRequestQuery);

  const validAccountRequestQuery = mapKeysAndValues(validRequestQuery, {
    RoleID: 'r.RoleID',
    '-RoleID': '-r.RoleID'
  });
  console.log('REQQUERY AFTER: ', validAccountRequestQuery);

  const allAccounts = await accountModel.getAllAccounts(
    validAccountRequestQuery
  );
  return allAccounts;
};

exports.createAccountService = async accountData => {
  accountData.Password = await bcrypt.hash(accountData.Password, 12);
  accountData.PasswordConfirm = null;

  const result = await accountModel.createAccount(accountData);
  return result;
};

exports.getAccountDetailsService = async (accountName, email) => {
  const account = await accountModel.getAccountByAccountNameOrMail(
    accountName,
    email
  );

  return account;
};

exports.getAccountByIdService = async id => {
  const account = await accountModel.getAccountById(id);
  return account;
};

exports.updateAccountCICService = async (id, CIC, connection) => {
  const { updatedAccount } = await accountModel.updateAccountByCICWithTrans(
    id,
    CIC,
    connection
  );
  return updatedAccount;
};

exports.createNewAccountSuperAdminService = async accountData => {
  accountData.Password = await bcrypt.hash(accountData.Password, 12);
  accountData.PasswordConfirm = null;

  const result = await accountModel.createAccountSuperadmin(accountData);
  return result;
};

exports.updateAccountSuperadminService = async (accountId, accountData) => {
  if (accountData.Password)
    accountData.Password = await bcrypt.hash(accountData.Password, 12);
  const updatedAccount = await accountModel.updateAccountById(
    accountId,
    accountData
  );

  return updatedAccount;
};

exports.deleteAccountService = async accountId => {
  const result = await accountModel.deleteAccountById(accountId);
  if (result.affectedRows === 0) {
    throw new AppError(`Account with ID ${accountId} not found`, 404);
  }
};
