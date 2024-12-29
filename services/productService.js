const productModel = require('../models/productModel');
const AppError = require('../utils/appError');
const filterObj = require('../utils/filterObj');

exports.getProductStatsService = async () => {
  const productStats = await productModel.getProductStats();
  if (!productStats) {
    throw new AppError('No stats found', 404);
  }
  return productStats;
};

exports.getAllProductsService = async reqQuery => {
  // prettier-ignore
  const validRequestQuery = filterObj(reqQuery,
    'productID', 'productCatalogID', 'productName', 'describeProduct', 'image', 'productInformation', 'quantity','price', 'sale', 'hide', 'sort', 'fields', 'page', 'limit');

  const allProducts = await productModel.getAllProducts(validRequestQuery);
  return allProducts;
};

exports.getProductDetailsService = async id => {
  const product = await productModel.getProductById(id);
  if (!product) {
    throw new AppError(`Product with ID ${id} not found`, 404);
  }
  return product;
};

exports.getProductByIdService = async productId => {
  const product = await productModel.getProductById(productId);
  return product;
};

exports.getProductByProductNameService = async productData => {
  const product = await productModel.getProductByProductName(
    productData.ProductName
  );
  return product;
};

exports.getOtherProductByProductNameService = async (
  productId,
  productData
) => {
  const product = await productModel.getOtherProductByProductName(
    productId,
    productData.ProductName
  );
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
