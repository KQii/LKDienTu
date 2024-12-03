const accountModel = require('../models/accountModel');
// const AppError = require('../utils/appError');

exports.getAllAccountsService = async () => {
  const allAccounts = await accountModel.getAllAccounts();
  return allAccounts;
};
exports.getAccountDetailsService = async () => {};
exports.createAccountService = async () => {};
exports.updateAccountService = async () => {};
exports.deleteAccountService = async () => {};
