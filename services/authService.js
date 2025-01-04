const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const accountModel = require('../models/accountModel');
// const AppError = require('../utils/appError');

exports.resetAccountService = async accountData => {
  accountData.Password = await bcrypt.hash(accountData.Password, 12);
  accountData.PasswordConfirm = null;

  const { updatedAccount } = await accountModel.updateAccountPassword(
    accountData
  );
  return updatedAccount;
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

  this.updatePasswordResetTokenService(account);

  return resetToken;
};
