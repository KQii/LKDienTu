const db = require('../database');
const APIFeatures = require('./../utils/apiFeatures');

exports.getAllProductCatalogs = async reqQuery => {
  const query = `
    SELECT pc1.ProductCatalogID, pc1.ProductCatalogName,
	    IF(pc1.ParentID IS NULL, NULL, JSON_OBJECT(
        'ProductCatalogID', pc2.ProductCatalogID,
        'ProductCatalogName', pc2.ProductCatalogName
      )) AS Parent
    FROM product_catalog AS pc1
    LEFT JOIN product_catalog AS pc2
    ON pc1.ParentID = pc2.ProductCatalogID
  `;

  const features = new APIFeatures(query, reqQuery, 'productCatalog')
    .filter()
    .sort()
    .paginate()
    .limitFields();

  // console.log(features.query, features.values);

  const [rows] = await db.execute(features.query, features.values);

  return rows;
};

exports.getProductCatalogById = async id => {
  const [rows] = await db.query(
    `
    SELECT pc1.ProductCatalogID, pc1.ProductCatalogName,
	    IF(pc1.ParentID IS NULL, NULL, JSON_OBJECT(
        'ProductCatalogID', pc2.ProductCatalogID,
        'ProductCatalogName', pc2.ProductCatalogName
      )) AS Parent
    FROM product_catalog AS pc1
    LEFT JOIN product_catalog AS pc2
    ON pc1.ParentID = pc2.ProductCatalogID
    WHERE pc1.ProductCatalogID = ?
    `,
    [id]
  );
  return rows[0];
};

exports.createProductCatalog = async data => {
  const query = `INSERT INTO product_catalog (ProductCatalogName, ParentID) VALUES (?, ?)`;
  const [result] = await db.execute(query, [
    data.ProductCatalogName,
    data.ParentID
  ]);

  return this.getProductCatalogById(result.insertId);
};

exports.updateProductCatalogById = async (id, data) => {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    if (key !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  values.push(id);

  let updateQuery = 'UPDATE product_catalog SET ';
  if (fields.length > 0) {
    updateQuery += `${fields.join(', ')} WHERE ProductCatalogID = ?`;
  }

  const [result] = await db.execute(updateQuery, values);
  return { result, updatedProductCatalog: this.getProductCatalogById(id) };
};

exports.deleteProductCatalogById = async id => {
  const [
    rows
  ] = await db.query('DELETE FROM product_catalog WHERE ProductCatalogID = ?', [
    id
  ]);

  return rows;
};
