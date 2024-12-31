const productCatalogModel = require('../models/productCatalogModel');
const AppError = require('../utils/appError');
const filterObj = require('../utils/filterObj');

const renameKeys = (obj, keyMap) => {
  const newObj = { ...obj };
  for (const [oldKey, newKey] of Object.entries(keyMap)) {
    for (const [key, value] of Object.entries(newObj)) {
      if (key === oldKey) {
        newObj[newKey] = newObj[oldKey];
        delete newObj[oldKey];
      }
      if (value === oldKey) {
        newObj[key] = newKey;
      }
      if (value.includes(',')) {
        const valueStr = value
          .split(',')
          .map(val => {
            return val === oldKey ? newKey : val;
          })
          .join(',');
        newObj[key] = valueStr;
      }
    }
  }
  return newObj;
};

exports.getAllProductCatalogsService = async reqQuery => {
  // prettier-ignore
  const validRequestQuery = filterObj(reqQuery,
    'productCatalogID', 'productCatalogName', 'parentID', 'sort', 'fields', 'page', 'limit');

  const validCatalogRequestQuery = renameKeys(validRequestQuery, {
    productCatalogID: 'pc1.productCatalogID',
    productCatalogName: 'pc1.productCatalogName',
    parentID: 'pc1.parentID',
    '-productCatalogID': '-pc1.productCatalogID',
    '-productCatalogName': '-pc1.productCatalogName',
    '-parentID': '-pc1.parentID'
  });

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
