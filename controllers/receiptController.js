const receiptService = require('../services/receiptService');
const receiptDetailService = require('../services/receiptDetailService');
const productService = require('../services/productService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const db = require('../database');

exports.getAllReceipts = catchAsync(async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const receipts = await receiptService.getAllReceiptsService(
      req.query,
      connection
    );

    await connection.commit();

    res.status(200).json({
      status: 'success',
      results: receipts.length,
      data: {
        receipts
      }
    });
  } catch (err) {
    await connection.rollback();
    return next(err);
  } finally {
    connection.release();
  }
});

exports.getReceipt = catchAsync(async (req, res, next) => {
  const receipt = await receiptService.getReceiptServiceById(req.params.id);
  if (!receipt)
    return next(
      new AppError(`Receipt with ID ${req.params.id} not found`, 404)
    );

  res.status(200).json({
    status: 'success',
    data: {
      receipt
    }
  });
});

exports.createReceipt = catchAsync(async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const newReceipt = await receiptService.createReceiptService(
      req.body,
      connection
    );

    for (const product of req.body.ReceiptProducts) {
      const receiptDetailData = {
        ReceiptID: newReceipt.ReceiptID,
        ProductID: product.ProductID,
        Quantity: product.Quantity,
        UnitPrice: product.UnitPrice
      };
      if (newReceipt.ReceiptType === 'export') {
        const productData = await productService.getProductByIdServiceWithTrans(
          product.ProductID,
          connection
        );
        receiptDetailData.UnitPrice = productData.price;
      }

      await receiptDetailService.createReceiptDetailService(
        receiptDetailData,
        connection
      );

      if (newReceipt.ReceiptType === 'import') {
        await productService.updateStockQuantityAfterImportedService(
          product.ProductID,
          product.Quantity,
          connection
        );
      } else if (newReceipt.ReceiptType === 'export') {
        await productService.updateStockQuantityAfterPurchasedService(
          product.ProductID,
          product.Quantity,
          connection
        );
      }
    }

    const finalReceipt = await receiptService.getReceiptServiceWithTrans(
      newReceipt.ReceiptID,
      connection
    );

    await connection.commit();

    res.status(201).json({
      status: 'success',
      data: {
        receipt: finalReceipt
      }
    });
  } catch (err) {
    await connection.rollback();
    return next(err);
  } finally {
    connection.release();
  }
});

exports.updateReceipt = catchAsync(async (req, res, next) => {
  const receipt = await receiptService.getReceiptServiceById(req.params.id);
  if (!receipt)
    return next(
      new AppError(`Receipt with ID ${req.params.id} not found`, 404)
    );

  const updatedReceipt = await receiptService.updateReceiptByIdService(
    req.params.id,
    req.body
  );

  res.status(200).json({
    status: 'success',
    data: {
      receipt: updatedReceipt
    }
  });
});

exports.deleteReceipt = catchAsync(async (req, res, next) => {});
