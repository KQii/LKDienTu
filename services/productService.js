const productModel = require('../models/productModel');
const AppError = require('../utils/appError');

exports.getProductStatsService = async () => {
  const productStats = await productModel.getProductStats();
  if (!productStats) {
    throw new AppError('No stats found', 404);
  }
  return productStats;
};

exports.getAllProductsService = async reqQuery => {
  const allProducts = await productModel.getAllProducts(reqQuery);
  // if (!allProducts) {
  //   throw new AppError('No product found', 404);
  // }
  return allProducts;
};

exports.getProductDetailsService = async id => {
  const product = await productModel.getProductById(id);
  if (!product) {
    throw new AppError(`Product with ID ${id} not found`, 404);
  }
  return product;
};

exports.createNewProductService = async productData => {
  const result = await productModel.createProduct(productData);
  return result;
};

exports.updateProductService = async (productId, productData) => {
  const { updatedProduct } = await productModel.updateProductById(
    productId,
    productData
  );
  return updatedProduct;
};

exports.deleteProductService = async productId => {
  const result = await productModel.deleteProductById(productId);
  if (result.affectedRows === 0) {
    throw new AppError(`Product with ID ${productId} not found`, 404);
  }
};
