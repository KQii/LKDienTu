const invoiceService = require('../services/invoiceService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllInvoices = catchAsync(async (req, res, next) => {
  const invoices = await invoiceService.getAllInvoicesService();

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: invoices.length,
    data: {
      invoices
    }
  });
});

exports.getInvoice = catchAsync(async (req, res, next) => {
  const invoice = await invoiceService.getInvoiceService(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      invoice
    }
  });
});

exports.updateInvoice = catchAsync(async (req, res, next) => {
  const updatedInvoice = await invoiceService.updateInvoiceService(
    req.params.id,
    req.body
  );

  res.status(200).json({
    status: 'success',
    data: {
      invoice: updatedInvoice
    }
  });
});
