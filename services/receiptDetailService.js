const receiptDetailModel = require('../models/receiptDetailModel');

exports.createReceiptDetailService = async (receiptDetailData, connection) => {
  await receiptDetailModel.createReceiptDetailWithTrans(
    receiptDetailData,
    connection
  );
};
