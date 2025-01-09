const invoiceDetailModel = require('../models/invoiceDetailModel');
const AppError = require('../utils/appError');

exports.getAllInvoiceDetailsService = async () => {
  const allInvoiceDetail = await invoiceDetailModel.getAllInvoiceDetails();
  return allInvoiceDetail;
};

exports.getInvoiceDetailService = async invoiceDetailId => {
  const invoiceDetail = await invoiceDetailModel.getInvoiceDetailById(
    invoiceDetailId
  );
  if (!invoiceDetail) {
    throw new AppError(
      `Invoice Detail with ID ${invoiceDetailId} not found`,
      404
    );
  }
  return invoiceDetail;
};

exports.createInvoiceDetailService = async (invoiceDetailData, connection) => {
  await invoiceDetailModel.createInvoiceDetailWithTrans(
    invoiceDetailData,
    connection
  );
};
