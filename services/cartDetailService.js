const cartDetailModel = require('../models/cartDetailModel');
const productModel = require('../models/productModel');
const AppError = require('../utils/appError');
const filterObj = require('../utils/filterObj');
const mapKeysAndValues = require('../utils/mapKeysAndValues');

exports.getAllCartDetailsService = async reqQuery => {
  // prettier-ignore
  const validRequestQuery = filterObj(reqQuery,
      'OrderedNumber', 'AccountID', 'Product', 'ProductID', 'ProductName', 'Price', 'sort', 'fields', 'page', 'limit');

  const validCartDetailReqQuery = mapKeysAndValues(validRequestQuery, {
    AccountID: 'a.AccountID',
    ProductID: 'p.ProductID',
    '-AccountID': '-a.AccountID',
    '-ProductID': '-p.ProductID'
  });

  const myCartDetails = await cartDetailModel.getAllCartDetails(
    validCartDetailReqQuery
  );
  return myCartDetails;
};

exports.getCartDetailByIdService = async cartDetailId => {
  const cartDetail = await cartDetailModel.getCartDetailById(cartDetailId);
  return cartDetail;
};

exports.getCartDetailByAccountIdAndProductIdService = async (
  accountId,
  productId
) => {
  const cartDetail = await cartDetailModel.getCartDetailByAccountIdAndProductId(
    accountId,
    productId
  );
  return cartDetail;
};

exports.deleteCartDetailService = async cartDetailId => {
  const result = await cartDetailModel.deleteCartDetailById(cartDetailId);
  if (result.affectedRows === 0) {
    throw new AppError(`Cart Detail with ID ${cartDetailId} not found`, 404);
  }
};

exports.createCartDetailService = async cartDetailData => {
  console.log(cartDetailData);
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
  const myCart = await cartDetailModel.getMyCart(accountId);
  return myCart;
};

exports.getMyCartDetailService = async accountId => {
  const myCartDetail = await cartDetailModel.getMyCartDetail(accountId);
  return myCartDetail;
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

exports.updateOrderedNumberAfterPurchasedService = async (
  accountId,
  productID,
  orderedNumber,
  connection
) => {
  const result = await cartDetailModel.updateOrderedNumberAfterPurchasedWithTrans(
    accountId,
    productID,
    orderedNumber,
    connection
  );
  return result;
};
