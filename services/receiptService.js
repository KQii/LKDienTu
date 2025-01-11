const receiptModel = require('../models/receiptModel');
const AppError = require('../utils/appError');
const filterObj = require('../utils/filterObj');
const mapKeysAndValues = require('../utils/mapKeysAndValues');

exports.getAllReceiptsService = async (reqQuery, connection) => {
  // prettier-ignore
  const validReqQuery = filterObj(reqQuery,
    'ReceiptID', 'ReceiptType', 'Partner', 'TotalPrice', 'CreatedAt', 'sort', 'fields', 'page', 'limit');

  const allReceipts = await receiptModel.getAllReceiptsWithTrans(
    validReqQuery,
    connection
  );
  return allReceipts;
};

exports.getReceiptServiceWithTrans = async (receiptId, connection) => {
  const receipt = await receiptModel.getReceiptByIdWithTrans(
    receiptId,
    connection
  );
  return receipt;
};

exports.getReceiptServiceById = async receiptId => {
  const receipt = await receiptModel.getReceiptById(receiptId);
  return receipt;
};

exports.createReceiptService = async (receiptData, connection) => {
  if (!receiptData.ReceiptType) receiptData.ReceiptType = 'export';
  if (!receiptData.Partner) receiptData.Partner = 'Customer';
  const newReceipt = await receiptModel.createReceiptWithTrans(
    receiptData,
    connection
  );
  return newReceipt;
};

exports.updateReceiptByIdService = async (receiptId, receiptData) => {
  const { updatedReceipt } = await receiptModel.updateReceiptById(
    receiptId,
    receiptData
  );
  return updatedReceipt;
};
