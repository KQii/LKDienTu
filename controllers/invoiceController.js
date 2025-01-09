const invoiceService = require('../services/invoiceService');
const invoiceDetailService = require('../services/invoiceDetailService');
const cartDetailService = require('../services/cartDetailService');
const productService = require('../services/productService');
const productModel = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const db = require('../database');
const AppError = require('../utils/appError');

exports.getAllInvoices = catchAsync(async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const invoices = await invoiceService.getAllInvoicesService(
      req.query,
      connection
    );

    await connection.commit();

    res.status(200).json({
      status: 'success',
      results: invoices.length,
      data: {
        invoices
      }
    });
  } catch (err) {
    await connection.rollback();
    return next(err);
  } finally {
    connection.release();
  }
});

exports.getInvoice = catchAsync(async (req, res, next) => {
  const invoice = await invoiceService.getInvoiceService(req.params.id);
  if (!invoice) {
    throw new AppError(`Invoice with ID ${req.params.id} not found`, 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      invoice
    }
  });
});

exports.updateInvoice = catchAsync(async (req, res, next) => {
  const invoice = await invoiceService.getInvoiceService(req.params.id);
  if (!invoice) {
    throw new AppError(`Invoice with ID ${req.params.id} not found`, 404);
  }

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

exports.getMyInvoices = catchAsync(async (req, res, next) => {
  const invoices = await invoiceService.getMyInvoicesService(
    req.Account.AccountID
  );

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: invoices.length,
    data: {
      invoices
    }
  });
});

exports.createInvoice = catchAsync(async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const newInvoice = await invoiceService.createInvoiceService(
      req.Account.AccountID,
      req.body,
      connection
    );

    for (const product of req.body.SelectedProducts) {
      const available = await productModel.checkUpdateProductAvailable(
        product.ProductID,
        product.OrderedNumber
      );
      if (!available)
        return next(
          new AppError(
            `Ordered quantity of Product with ID ${product.ProductID} exceeds available stock.`,
            422
          )
        );

      await invoiceDetailService.createInvoiceDetailService(
        {
          InvoiceID: newInvoice.InvoiceID,
          ProductID: product.ProductID,
          PaidNumber: product.OrderedNumber
        },
        connection
      );

      await cartDetailService.updateOrderedNumberAfterPurchasedService(
        req.Account.AccountID,
        product.ProductID,
        product.OrderedNumber,
        connection
      );

      await productService.updateStockQuantityAfterPurchasedService(
        product.ProductID,
        product.OrderedNumber,
        connection
      );
    }

    await connection.commit();

    res.status(201).json({
      status: 'success',
      data: {
        invoice: newInvoice
      }
    });
  } catch (err) {
    await connection.rollback();
    return next(err);
  } finally {
    connection.release();
  }
});
