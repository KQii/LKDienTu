const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const authService = require('../services/authService');
const accountService = require('../services/accountService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (account, statusCode, res) => {
  const token = signToken(account.AccountID);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      account
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newAccount = await accountService.createAccountService(req.body);
  createSendToken(newAccount, 201, res);
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
  const account = await accountService.getAccountDetailsService(
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

  delete account.Password;
  // 3) If everything ok, send token to client
  createSendToken(account, 200, res);
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
  console.log(decoded);

  // 3) Check if user still exists
  const currentAccount = await accountService.getAccountByIdService(decoded.id);
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
  req.Account = currentAccount;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.Account.Role.RoleName))
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const account = await accountService.getAccountDetailsService(
    req.body.AccountName,
    req.body.Mail
  );
  if (!account) {
    return next(
      new AppError('There is no account with this email address.', 404)
    );
  }
  // 2) Generate the random reset token
  const resetToken = authService.createPasswordResetToken(account);
  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/accounts/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: account.Mail,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    account.PasswordResetToken = null;
    account.PasswordResetExpires = null;
    authService.updatePasswordResetTokenService(account);

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const account = await authService.getAccountByPasswordResetTokenService(
    hashedToken
  );
  // 2) If token has not expired, and there is user, set the new password
  if (!account) return new AppError('Token is invalid or has expired', 400);

  account.Password = req.body.Password;
  account.PasswordConfirm = req.body.PasswordConfirm;
  account.PasswordResetToken = null;
  account.PasswordResetExpires = null;
  await authService.resetAccountService(account);
  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(account, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  console.log(req.Account);
  const account = await accountService.getAccountDetailsService(
    req.Account.AccountName
  );
  console.log('updatePassword', account);
  if (
    !(await authService.correctPassword(
      req.body.PasswordCurrent,
      account.Password
    ))
  ) {
    return next(new AppError('Your current password is wrong', 401));
  }

  if (account.Password !== account.PasswordConfirm) {
    return next(
      new AppError('Password confirmation does not match password', 400)
    );
  }
  account.Password = req.body.Password;
  account.PasswordConfirm = req.body.PasswordConfirm;
  await authService.resetAccountService(account);

  createSendToken(account, 200, res);
});
