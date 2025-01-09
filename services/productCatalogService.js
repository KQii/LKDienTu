const productCatalogModel = require('../models/productCatalogModel');
const AppError = require('../utils/appError');
const filterObj = require('../utils/filterObj');
const mapKeysAndValues = require('../utils/mapKeysAndValues');

exports.getAllProductCatalogsService = async reqQuery => {
  // prettier-ignore
  const validRequestQuery = filterObj(reqQuery,
    'productCatalogID', 'productCatalogName', 'parent', 'sort', 'fields', 'page', 'limit');
  console.log('Before rename:', validRequestQuery);

  const validCatalogRequestQuery = mapKeysAndValues(validRequestQuery, {
    productCatalogID: 'pc1.productCatalogID',
    productCatalogName: 'pc1.productCatalogName',
    '-productCatalogID': '-pc1.productCatalogID',
    '-productCatalogName': '-pc1.productCatalogName'
  });
  console.log('After rename:', validCatalogRequestQuery);

  const allProductCatalogs = await productCatalogModel.getAllProductCatalogs(
    validCatalogRequestQuery
  );
  return allProductCatalogs;
};

exports.createNewProductCatalogService = async productCatalogData => {
  const result = await productCatalogModel.createProductCatalog(
    productCatalogData
  );
  return result;
};

exports.getProductCatalogByIdService = async productCatalogId => {
  const productCatalog = await productCatalogModel.getProductCatalogById(
    productCatalogId
  );
  return productCatalog;
};

exports.getProductCatalogByNameService = async productCatalogName => {
  const productCatalog = await productCatalogModel.getProductCatalogByName(
    productCatalogName
  );
  return productCatalog;
};

exports.getOtherProductCatalogNameByNameService = async (
  id,
  productCatalogName
) => {
  const productCatalog = await productCatalogModel.getOtherProductCatalogNameByName(
    id,
    productCatalogName
  );
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
