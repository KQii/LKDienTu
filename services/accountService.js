const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const accountModel = require('../models/accountModel');
const AppError = require('../utils/appError');

exports.getAllAccountsService = async () => {
  const allAccounts = await accountModel.getAllAccounts();
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

exports.getAccountService = async id => {
  const account = await accountModel.getAccountById(id);
  // if (!account) {
  //   throw new AppError(`Account with ID ${id} not found`, 404);
  // }
  return account;
};
