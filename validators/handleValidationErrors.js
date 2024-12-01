const { validationResult } = require('express-validator');
const AppError = require('../utils/appError');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return res.status(400).json({
    //   status: 'fail',
    //   errors: errors.array().map(err => ({
    //     field: err.path,
    //     message: err.msg
    //   }))
    // });
    const errorDetails = errors.array().map(err => ({
      // field: err.path,
      message: err.msg
    }));
    const errorMessage = errorDetails
      // .map(error => `${error.field}: ${error.message}`)
      .map(error => `${error.message}`)
      .join('. ');
    throw new AppError(`Validation error: ${errorMessage}`, 400);
  }
  next();
};

module.exports = handleValidationErrors;
