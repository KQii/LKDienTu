const productModel = require('../models/productModel');
const AppError = require('../utils/appError');
const filterObj = require('../utils/filterObj');
const mapKeysAndValues = require('../utils/mapKeysAndValues');

exports.getProductStatsService = async () => {
  const productStats = await productModel.getProductStats();
  if (!productStats) {
    throw new AppError('No stats found', 404);
  }
  return productStats;
};

exports.getAllProductsService = async reqQuery => {
  // prettier-ignore
  const validReqQuery = filterObj(reqQuery,
    'productID', 'productCatalogID', 'productCatalogName', 'productName', 'describeProduct', 'image', 'productInformation', 'quantity','price', 'sale', 'hide', 'sort', 'fields', 'page', 'limit');
  console.log('BEFORE RENAME: ', validReqQuery);

  if (validReqQuery.productName) {
    validReqQuery.productName = `%${validReqQuery.productName}%`; // Sử dụng ký tự đại diện % cho LIKE
  }

  const renamedReqQuery = mapKeysAndValues(validReqQuery, {
    productCatalogID: 'p.productCatalogID',
    '-productCatalogID': '-p.productCatalogID',
    productName: 'productName LIKE'
  });
  console.log('AFTER RENAME: ', renamedReqQuery);

  const allProducts = await productModel.getAllProducts(renamedReqQuery);
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

exports.getProductByIdServiceWithTrans = async (productId, connection) => {
  const product = await productModel.getProductByIdWithTrans(
    productId,
    connection
  );
  return product;
};

exports.getProductByProductNameService = async productData => {
  const product = await productModel.getProductByProductName(
    productData.productName
  );
  return product;
};

exports.getOtherProductByProductNameService = async (
  productId,
  productData
) => {
  const product = await productModel.getOtherProductByProductName(
    productId,
    productData.productName
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

exports.updateStockQuantityAfterPurchasedService = async (
  productId,
  orderedNumber,
  connection
) => {
  const available = await productModel.checkUpdateProductAvailable(
    productId,
    orderedNumber
  );
  if (!available)
    throw new AppError(
      `Ordered quantity of Product with ID ${productId} exceeds available stock. Please update your cart and try again.`,
      422
    );

  await productModel.updateStockQuantityAfterPurchasedWithTrans(
    productId,
    orderedNumber,
    connection
  );
};

exports.updateStockQuantityAfterImportedService = async (
  productId,
  quantity,
  connection
) => {
  await productModel.updateStockQuantityAfterImportedWithTrans(
    productId,
    quantity,
    connection
  );
};
