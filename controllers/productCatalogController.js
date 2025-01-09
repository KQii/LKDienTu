const productCatalogService = require('../services/productCatalogService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllProductCatalogs = catchAsync(async (req, res, next) => {
  const productCatalogs = await productCatalogService.getAllProductCatalogsService(
    req.query
  );

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: productCatalogs.length,
    data: {
      productCatalogs
    }
  });
});

exports.getProductCatalog = catchAsync(async (req, res, next) => {
  const productCatalog = await productCatalogService.getProductCatalogByIdService(
    req.params.id
  );
  if (!productCatalog)
    return next(
      new AppError(`ProductCatalog with ID ${req.params.id} not found`, 404)
    );

  res.status(200).json({
    status: 'success',
    data: {
      productCatalog
    }
  });
});

exports.createProductCatalog = catchAsync(async (req, res, next) => {
  // if (!req.body.ProductCatalogName || req.body.ParentID === undefined) {
  //   return next(new AppError('Please provide missing information!', 400));
  // }
  const productCatalogNameExists = await productCatalogService.getProductCatalogByNameService(
    req.body.productCatalogName
  );
  if (productCatalogNameExists)
    return next(
      new AppError('This name has been used! Please use another name', 400)
    );

  const newProductCatalog = await productCatalogService.createNewProductCatalogService(
    req.body
  );

  res.status(201).json({
    status: 'success',
    data: {
      productCatalog: newProductCatalog
    }
  });
});

exports.updateProductCatalog = catchAsync(async (req, res, next) => {
  const productCatalog = await productCatalogService.getProductCatalogByIdService(
    req.params.id
  );
  if (!productCatalog)
    return next(
      new AppError(`ProductCatalog with ID ${req.params.id} not found`, 404)
    );

  const productCatalogNameExists = await productCatalogService.getOtherProductCatalogNameByNameService(
    req.params.id,
    req.body.productCatalogName
  );
  if (productCatalogNameExists)
    return next(
      new AppError('This name has been used! Please use another name', 400)
    );

  const updatedProductCatalog = await productCatalogService.updateProductCatalogService(
    req.params.id,
    req.body
  );

  res.status(200).json({
    status: 'success',
    data: {
      productCatalog: updatedProductCatalog
    }
  });
});

exports.deleteProductCatalog = catchAsync(async (req, res, next) => {
  await productCatalogService.deleteProductCatalogService(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
