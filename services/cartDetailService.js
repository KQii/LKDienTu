const cartDetailModel = require('../models/cartDetailModel');
const productModel = require('../models/productModel');
const AppError = require('../utils/appError');

exports.getAllCartDetailsService = async () => {
  const myCartDetails = await cartDetailModel.getAllCartDetails();
  return myCartDetails;
};

exports.getCartDetailService = async cartDetailId => {
  const cartDetail = await cartDetailModel.getCartDetailById(cartDetailId);
  if (!cartDetail) {
    throw new AppError(`Cart Detail with ID ${cartDetailId} not found`, 404);
  }
  return cartDetail;
};

exports.deleteCartDetailService = async cartDetailId => {
  const result = await cartDetailModel.deleteCartDetailById(cartDetailId);
  if (result.affectedRows === 0) {
    throw new AppError(`Cart Detail with ID ${cartDetailId} not found`, 404);
  }
};

exports.createCartDetailService = async cartDetailData => {
  const available = await productModel.checkCreateProductAvailable(
    cartDetailData.AccountID,
    cartDetailData.ProductID,
    cartDetailData.OrderedNumber
  );
  if (!available)
    throw new AppError(
      `Ordered quantity of Product with ID ${cartDetailData.ProductID} exceeds available stock.`,
      422
    );

  const result = await cartDetailModel.createCartDetail(cartDetailData);
  return result;
};

exports.updateCartDetailService = async (cartDetailId, cartDetailData) => {
  const available = await productModel.checkUpdateProductAvailable(
    cartDetailData.ProductID,
    cartDetailData.OrderedNumber
  );
  if (!available)
    throw new AppError(
      `Ordered quantity of Product with ID ${cartDetailData.ProductID} exceeds available stock.`,
      422
    );

  const { updatedCartDetail } = await cartDetailModel.updateCartDetailById(
    cartDetailId,
    cartDetailData
  );
  return updatedCartDetail;
};

exports.getMyCartService = async accountId => {
  const myCartDetails = await cartDetailModel.getMyCartDetails(accountId);
  if (!myCartDetails) {
    throw new AppError(`Cart empty`, 404);
  }
  return myCartDetails;
};

exports.updateMyCartDetailService = async (accountId, cartDetailData) => {
  const available = await productModel.checkUpdateProductAvailable(
    cartDetailData.ProductID,
    cartDetailData.OrderedNumber
  );
  if (!available)
    throw new AppError(
      `Ordered quantity of Product with ID ${cartDetailData.ProductID} exceeds available stock.`,
      422
    );

  const {
    updatedCartDetail
  } = await cartDetailModel.updateCartDetailByAccountId(
    accountId,
    cartDetailData
  );
  return updatedCartDetail;
};
