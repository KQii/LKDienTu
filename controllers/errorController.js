const AppError = require('../utils/appError');

const handleDupicateFieldsDB = err => {
  const message = `Duplicate field value: ${err.sqlMessage
    .split("'")
    .at(1)}. Please use another value!`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const message = `Invalid input data. ${err.message.slice(
    err.message.indexOf(': ') + 2
  )}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR: ', err);
    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (err.code === 'ER_DUP_ENTRY') error = handleDupicateFieldsDB(error);
    if (err.statusCode === 400 && err.message.includes('Validation error'))
      error = handleValidationErrorDB(err);

    sendErrorProd(error, res);
  }
};