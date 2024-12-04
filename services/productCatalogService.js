const productCatalogModel = require('../models/productCatalogModel');
const AppError = require('../utils/appError');

exports.getAllProductCatalogsService = async () => {
  const allProductCatalogs = await productCatalogModel.getAllProductCatalogs();
  return allProductCatalogs;
};

exports.createNewProductCatalogService = async productCatalogData => {
  const result = await productCatalogModel.createProductCatalog(
    productCatalogData
  );
  return result;
};

exports.getProductCatalogDetailsService = async productCatalogId => {
  const productCatalog = await productCatalogModel.getProductCatalogById(
    productCatalogId
  );
  if (!productCatalog) {
    throw new AppError(
      `ProductCatalog with ID ${productCatalogId} not found`,
      404
    );
  }
  return productCatalog;
};

exports.updateProductCatalogService = async (
  productCatalogId,
  productCatalogData
) => {
  const {
    updatedProductCatalog
  } = await productCatalogModel.updateProductCatalogById(
    productCatalogId,
    productCatalogData
  );
  return updatedProductCatalog;
};

exports.deleteProductCatalogService = async productCatalogId => {
  const result = await productCatalogModel.deleteProductCatalogById(
    productCatalogId
  );
  if (result.affectedRows === 0) {
    throw new AppError(
      `ProductCatalog with ID ${productCatalogId} not found`,
      404
    );
  }
};
