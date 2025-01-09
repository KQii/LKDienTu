const invoiceModel = require('../models/invoiceModel');
const filterObj = require('../utils/filterObj');

exports.getAllInvoicesService = async (reqQuery, connection) => {
  // prettier-ignore
  const validReqQuery = filterObj(reqQuery,
      'InvoiceID', 'AccountID', 'InvoiceDate', 'Paid_Method', 'IsPaid', 'IsDelete', 'sort', 'fields', 'page', 'limit');

  const allInvoices = await invoiceModel.getAllInvoicesWithTrans(
    validReqQuery,
    connection
  );
  return allInvoices;
};

exports.getInvoiceService = async invoiceId => {
  const invoice = await invoiceModel.getInvoiceById(invoiceId);
  return invoice;
};

exports.getInvoiceServiceWithTrans = async (invoiceId, connection) => {
  const invoice = await invoiceModel.getInvoiceByIdWithTrans(
    invoiceId,
    connection
  );
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

exports.createInvoiceService = async (accountId, invoiceData, connection) => {
  const newInvoice = await invoiceModel.createInvoiceWithTrans(
    accountId,
    invoiceData,
    connection
  );
  return this.getInvoiceServiceWithTrans(newInvoice.InvoiceID, connection);
};
