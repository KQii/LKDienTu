const invoiceDetailService = require('../services/invoiceDetailService');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');

exports.getAllInvoiceDetails = catchAsync(async (req, res, next) => {
  const invoiceDetails = await invoiceDetailService.getAllInvoiceDetailsService();

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: invoiceDetails.length,
    data: {
      invoiceDetails
    }
  });
});

exports.getInvoiceDetail = catchAsync(async (req, res, next) => {
  const invoiceDetail = await invoiceDetailService.getInvoiceDetailService(
    req.params.id
  );

  res.status(200).json({
    status: 'success',
    data: {
      invoiceDetail
    }
  });
});
