const bcrypt = require('bcryptjs');

const accountModel = require('../models/accountModel');
const AppError = require('../utils/appError');

exports.createAccountService = async accountData => {
  accountData.Password = await bcrypt.hash(accountData.Password, 12);
  accountData.PasswordConfirm = null;

  const result = await accountModel.createAccount(accountData);
  return result;
};

exports.getAccountService = async id => {
  const account = await accountModel.getAccountById(id);
  // if (!account) {
  //   throw new AppError(`Account with ID ${id} not found`, 404);
  // }
  return account;
};

exports.getAccountDetailsService = async (accountName, email) => {
  const account = await accountModel.getAccountByAccountNameOrMailAndPassword(
    accountName,
    email
  );

  return account;
};

exports.correctPassword = async (candidatePassword, userPassword) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};

exports.changedPasswordAfter = (account, JWTTimestamp) => {
  if (account.PasswordChangedAt) {
    const changedTimestamp = parseInt(
      account.PasswordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
