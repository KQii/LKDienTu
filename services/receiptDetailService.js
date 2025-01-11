const receiptDetailModel = require('../models/receiptDetailModel');
const AppError = require('../utils/appError');
const filterObj = require('../utils/filterObj');
const mapKeysAndValues = require('../utils/mapKeysAndValues');

exports.createReceiptDetailService = async (receiptDetailData, connection) => {
  await receiptDetailModel.createReceiptDetailWithTrans(
    receiptDetailData,
    connection
  );
};
