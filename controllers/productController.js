const productService = require('../services/productService');
const catchAsync = require('../utils/catchAsync');

exports.aliasTopProducts = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'Price';
  req.query.fields = 'ProductName,Quantity,Price';
  next();
};

exports.getProductStats = catchAsync(async (req, res, next) => {
  const stats = await productService.getProductStatsService();

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const products = await productService.getAllProductsService(req.query);

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products
    }
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await productService.getProductDetailsService(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const newProduct = await productService.createNewProductService(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      product: newProduct
    }
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  // const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
  //   new: true,
  //   runValidators: true
  // });
  const updatedProduct = await productService.updateProductService(
    req.params.id,
    req.body
  );

  res.status(200).json({
    status: 'success',
    data: {
      product: updatedProduct
    }
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  // await Tour.findByIdAndDelete(req.params.id);
  await productService.deleteProductService(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
