const invoiceModel = require('../models/invoiceModel');
const invoiceDetailModel = require('../models/invoiceDetailModel');
const cartDetailModel = require('../models/cartDetailModel');
const productModel = require('../models/productModel');
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

exports.getMyInvoicesService = async accountId => {
  const myInvoices = await invoiceModel.getMyInvoices(accountId);
  return myInvoices;
};

exports.createInvoiceService = async (accountId, invoiceData) => {
  const newInvoice = await invoiceModel.createInvoice(accountId, invoiceData);

  for (const product of invoiceData.SelectedProducts) {
    await invoiceDetailModel.createInvoiceDetail({
      InvoiceID: newInvoice.InvoiceID,
      ProductID: product.ProductID,
      PaidNumber: product.OrderedNumber
    });

    await cartDetailModel.updateOrderedNumberAfterPurchased(
      accountId,
      product.ProductID,
      product.OrderedNumber
    );

    await productModel.updateStockQuantityAfterPurchased(
      product.ProductID,
      product.OrderedNumber
    );
  }

  return this.getInvoiceService(newInvoice.InvoiceID);
};
