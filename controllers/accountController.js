const accountService = require('../services/accountService');
const catchAsync = require('../utils/catchAsync');

exports.getAllAccounts = catchAsync(async (req, res, next) => {
  const accounts = await accountService.getAllAccountsService();

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: accounts.length,
    data: {
      accounts
    }
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {});

exports.createAccount = catchAsync(async (req, res, next) => {});

exports.updateAccount = catchAsync(async (req, res, next) => {});

exports.deleteAccount = catchAsync(async (req, res, next) => {});
