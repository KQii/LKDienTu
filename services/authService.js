const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const accountModel = require('../models/accountModel');
const AppError = require('../utils/appError');
// const AppError = require('../utils/appError');

exports.createAccountService = async accountData => {
  accountData.Password = await bcrypt.hash(accountData.Password, 12);
  accountData.PasswordConfirm = null;

  const result = await accountModel.createAccount(accountData);
  return result;
};

exports.resetAccountService = async accountData => {
  if (accountData.Password !== accountData.PasswordConfirm) {
    throw new AppError('Password confirmation does not match password', 400);
  }

  accountData.Password = await bcrypt.hash(accountData.Password, 12);
  accountData.PasswordConfirm = null;

  await accountModel.updateAccountPassword(accountData);
};

exports.getAccountService = async id => {
  const account = await accountModel.getAccountById(id);
  // if (!account) {
  //   throw new AppError(`Account with ID ${id} not found`, 404);
  // }
  return account;
};

exports.getAccountDetailsService = async (accountName, email) => {
  const account = await accountModel.getAccountByAccountNameOrMail(
    accountName,
    email
  );

  return account;
};

exports.updateAccountByIdService = async (accountID, filteredBody) => {
  const account = await accountModel.updateAccountById(accountID, filteredBody);

  return account;
};

exports.getAccountByPasswordResetTokenService = async passwordResetToken => {
  const account = await accountModel.getAccountByPasswordResetToken(
    passwordResetToken
  );
  return account;
};

exports.updatePasswordResetTokenService = async account => {
  await accountModel.updatePasswordResetToken(account);
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

exports.createPasswordResetToken = account => {
  const resetToken = crypto.randomBytes(32).toString('hex');

  account.PasswordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, account.PasswordResetToken);

  // account.PasswordResetExpires = new Date(Date.now() + 10 * 60 * 1000)
  //   .toISOString()
  //   .slice(0, 19)
  //   .replace('T', ' ');
  this.updatePasswordResetTokenService(account);

  return resetToken;
};
