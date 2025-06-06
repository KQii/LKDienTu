const cartDetailService = require('../services/cartDetailService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllCartDetails = catchAsync(async (req, res, next) => {
  const cartDetails = await cartDetailService.getAllCartDetailsService(
    req.query
  );

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: cartDetails.length,
    data: {
      cartDetails
    }
  });
});

exports.getCartDetail = catchAsync(async (req, res, next) => {
  const cartDetail = await cartDetailService.getCartDetailByIdService(
    req.params.id
  );

  if (!cartDetail)
    next(new AppError(`Cart Detail with ID ${req.params.id} not found`, 404));

  res.status(200).json({
    status: 'success',
    data: {
      cartDetail
    }
  });
});

exports.deleteCartDetail = catchAsync(async (req, res, next) => {
  await cartDetailService.deleteCartDetailService(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createCartDetail = catchAsync(async (req, res, next) => {
  req.body.AccountID = req.Account.AccountID;
  const newCartDetail = await cartDetailService.createCartDetailService(
    req.body
  );

  res.status(201).json({
    status: 'success',
    data: {
      cartDetail: newCartDetail
    }
  });
});

exports.updateCartDetail = catchAsync(async (req, res, next) => {
  const cartDetail = await cartDetailService.getCartDetailByIdService(
    req.params.id
  );

  if (!cartDetail)
    next(new AppError(`Cart Detail with ID ${req.params.id} not found`, 404));

  const updatedCartDetail = await cartDetailService.updateCartDetailService(
    req.params.id,
    req.body
  );

  res.status(200).json({
    status: 'success',
    data: {
      cartDetail: updatedCartDetail
    }
  });
});

exports.getMyCart = catchAsync(async (req, res, next) => {
  const cartDetails = await cartDetailService.getMyCartService(
    req.Account.AccountID
  );

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: cartDetails.length,
    data: {
      cartDetails
    }
  });
});

exports.updateMyCart = catchAsync(async (req, res, next) => {
  const cartDetails = await cartDetailService.getMyCartService(
    req.Account.AccountID
  );
  if (cartDetails.length === 0) return next(new AppError('Cart empty', 404));

  const productExists = await cartDetailService.getCartDetailByAccountIdAndProductIdService(
    req.Account.AccountID,
    req.body.ProductID
  );
  if (!productExists)
    return next(new AppError('Product not found in cart', 404));

  const updatedCartDetail = await cartDetailService.updateMyCartDetailService(
    req.Account.AccountID,
    req.body
  );

  res.status(200).json({
    status: 'success',
    data: {
      cartDetail: updatedCartDetail
    }
  });
});
