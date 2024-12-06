const invoiceModel = require('../models/invoiceModel');
const AppError = require('../utils/appError');

exports.getAllInvoicesService = async () => {
  const allInvoices = await invoiceModel.getAllInvoices();
  return allInvoices;
};

exports.getInvoiceService = async invoiceId => {
  const invoice = await invoiceModel.getInvoiceById(invoiceId);
  if (!invoice) {
    throw new AppError(`Invoice with ID ${invoiceId} not found`, 404);
  }
  return invoice;
};

exports.updateInvoiceService = async (invoiceId, invoiceData) => {
  const { updatedInvoice } = await invoiceModel.updateInvoiceById(
    invoiceId,
    invoiceData
  );
  return updatedInvoice;
};
