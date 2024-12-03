const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// const changedPasswordAfter = JWTTimestamp => {
//   if (this.PasswordChangedAt) console.log(this.PasswordChangedAt, JWTTimestamp);
//   return false;
// };

exports.signup = catchAsync(async (req, res, next) => {
  const newAccount = await authService.createAccountService(req.body);

  const token = signToken(newAccount.AccountID);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      account: newAccount
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const {
    AccountName: accountName,
    Mail: email,
    Password: password
  } = req.body;

  // 1) Check if email and password
  if ((!accountName && !email) || !password) {
    return next(new AppError('Please provide missing information!', 400));
  }
  // 2) Check if user exists && password is correct
  const account = await authService.getAccountDetailsService(
    accountName,
    email
  );
  if (
    !account ||
    !(await authService.correctPassword(password, account.Password))
  )
    return next(
      new AppError('Incorrect account name or email or password', 401)
    );
  // 3) If everything ok, send token to client
  const token = signToken(account.AccountID);
  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ').at(1);
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentAccount = await authService.getAccountService(decoded.id);
  if (!currentAccount) {
    return next(
      new AppError(
        'The account belonging to this token does no longer exist.',
        401
      )
    );
  }
  // 4) Check if user changed password after the token was issued
  if (authService.changedPasswordAfter(currentAccount, decoded.iat)) {
    return next(
      new AppError(
        'Account password has been changed recently! Please log in again.',
        401
      )
    );
  }

  // GRANTED ACCESS TO PROTECTED ROUTE
  req.account = currentAccount;
  next();
});
