const accountService = require('../services/accountService');
const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

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

exports.getAccount = catchAsync(async (req, res, next) => {
  const account = await accountService.getAccountByIdService(req.params.id);

  if (!account) {
    return next(
      new AppError(`Account with ID ${req.params.id} not found`, 404)
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      account
    }
  });
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
  await accountService.deleteAccountService(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.Password || req.body.PasswordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  const filteredBody = filterObj(req.body, 'Mail');
  const updatedAccount = await authService.updateAccountByIdService(
    req.Account.AccountID,
    filteredBody
  );

  res.status(200).json({
    status: 'success',
    data: {
      account: updatedAccount
    }
  });
});

exports.createAccount = catchAsync(async (req, res, next) => {
  const accountNameExists = await accountService.getAccountByAccountNameService(
    req.body
  );
  if (accountNameExists) {
    return next(
      new AppError(
        'This account name has been used. Please use another name',
        400
      )
    );
  }

  const mailExists = await accountService.getAccountByMailService(req.body);
  if (mailExists) {
    return next(
      new AppError('This email has been used. Please use another email', 400)
    );
  }

  const newAccount = await accountService.createNewAccountSuperAdminService(
    req.body
  );

  res.status(201).json({
    status: 'success',
    data: {
      account: newAccount
    }
  });
});

exports.updateAccount = catchAsync(async (req, res, next) => {
  const accountIdExists = await accountService.getAccountByIdService(
    req.params.id
  );
  if (!accountIdExists) {
    return next(
      new AppError(`Account with ID ${req.params.id} not found`, 400)
    );
  }

  const updatedAccount = await accountService.updateAccountSuperadminService(
    req.params.id,
    req.body
  );

  res.status(200).json({
    status: 'success',
    data: {
      account: updatedAccount
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {});
