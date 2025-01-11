const invoiceService = require('../services/invoiceService');
const invoiceDetailService = require('../services/invoiceDetailService');
const cartDetailService = require('../services/cartDetailService');
const productService = require('../services/productService');
const receiptService = require('../services/receiptService');
const receiptDetailService = require('../services/receiptDetailService');
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
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const invoices = await invoiceService.getMyInvoicesService(
      req.Account.AccountID,
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

exports.createInvoice = catchAsync(async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Create new invoice
    const newInvoice = await invoiceService.createInvoiceService(
      req.Account.AccountID,
      req.body,
      connection
    );

    // Create export receipt
    const newReceipt = await receiptService.createReceiptService(
      req.body,
      connection
    );

    for (const product of req.body.SelectedProducts) {
      // Create invoice detail
      const available = await productModel.checkUpdateProductAvailable(
        product.ProductID,
        product.OrderedNumber
      );
      if (!available)
        return next(
          new AppError(
            `Ordered quantity of Product with ID ${product.ProductID} exceeds available stock. Please update your cart and try again.`,
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

      // Create receipt detail
      const receiptDetailData = {
        ReceiptID: newReceipt.ReceiptID,
        ProductID: product.ProductID,
        Quantity: product.OrderedNumber,
        UnitPrice: product.UnitPrice
      };
      const productData = await productService.getProductByIdServiceWithTrans(
        product.ProductID,
        connection
      );
      receiptDetailData.UnitPrice = productData.price;

      await receiptDetailService.createReceiptDetailService(
        receiptDetailData,
        connection
      );

      // Update stock quantity
      await productService.updateStockQuantityAfterPurchasedService(
        product.ProductID,
        product.OrderedNumber,
        connection
      );
    }

    const finalInvoices = await invoiceService.getInvoiceServiceWithTrans(
      newInvoice.InvoiceID,
      connection
    );

    await connection.commit();

    res.status(201).json({
      status: 'success',
      data: {
        invoice: finalInvoices
      }
    });
  } catch (err) {
    await connection.rollback();
    return next(err);
  } finally {
    connection.release();
  }
});
