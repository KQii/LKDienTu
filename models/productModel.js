const db = require('../database');
const APIFeatures = require('./../utils/apiFeatures');

exports.getProductStats = async () => {
  const query = `SELECT SUM(quantity) AS TotalQuantity, MIN(price) AS MinPrice, MAX(price) AS MaxPrice FROM product WHERE hide = 0;`;
  const [rows] = await db.query(query);
  return rows;
};

exports.getAllProducts = async reqQuery => {
  const query = `
    SELECT
      p.ProductID,
      JSON_OBJECT(
        'ProductCatalogID', pc.ProductCatalogID,
        'ProductCatalogName', pc.ProductCatalogName
      ) AS ProductCatalog,
      p.ProductName, p.DescribeProduct, p.Image, p.Product_Information, p.Quantity, p.Price, p.Sale, p.Hide
    FROM product AS p
    JOIN product_catalog AS pc ON p.ProductCatalogID = pc.ProductCatalogID
  `;
  const features = new APIFeatures(query, reqQuery)
    .filter()
    .sort()
    .paginate();
  await features.limitFields('product');

  const [rows] = await db.execute(features.query, features.values);

  // Virtual fields
  if (!reqQuery.fields) {
    const updatedRows = rows.map(row => ({
      ...row,
      SalePercent: row.Sale ? `${row.Sale}%` : null,
      PriceDiscount: row.Price * ((100 - row.Sale) / 100)
    }));
    return updatedRows;
  }

  return rows;
};

exports.getProductById = async id => {
  const [rows] = await db.query(
    `
    SELECT
      p.ProductID,
      JSON_OBJECT(
        'ProductCatalogID', pc.ProductCatalogID,
        'ProductCatalogName', pc.ProductCatalogName
      ) AS ProductCatalog,
      p.ProductName, p.DescribeProduct, p.Image, p.Product_Information, p.Quantity, p.Price, p.Sale, p.Hide
    FROM product AS p
    JOIN product_catalog AS pc ON p.ProductCatalogID = pc.ProductCatalogID
    WHERE p.ProductID = ?
    `,
    [id]
  );
  return rows[0];
};

exports.createProduct = async data => {
  const query = `
    INSERT INTO product (ProductCatalogID,
    ProductName,
    DescribeProduct,
    Image,
    Product_Information,
    Quantity,
    Price,
    Sale,
    Hide)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.execute(query, Object.values(data));

  // return { ProductID: result.insertId, ...data };
  return this.getProductById(result.insertId);
};

exports.updateProductById = async (id, data) => {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    if (key !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  values.push(id);

  let updateQuery = 'UPDATE product SET ';
  if (fields.length > 0) {
    updateQuery += `${fields.join(', ')} WHERE ProductID = ?`;
  }

  const [result] = await db.execute(updateQuery, values);
  return { result, updatedProduct: this.getProductById(id) };
};

exports.deleteProductById = async id => {
  const [rows] = await db.query('DELETE FROM product WHERE ProductID = ?', [
    id
  ]);

  return rows;
};

exports.checkCreateProductAvailable = async (
  accountID,
  productID,
  orderedNumber
) => {
  const [res] = await db.query(
    `
    SELECT OrderedNumber FROM cart_detail WHERE AccountID = ? AND ProductID = ?
    `,
    [accountID, productID]
  );
  const cartOrderedNumber = res.length > 0 ? res[0].OrderedNumber : 0;

  const [
    rows
  ] = await db.query(
    'SELECT * FROM product WHERE ProductID = ? AND Quantity >= ?',
    [productID, cartOrderedNumber + orderedNumber]
  );

  return rows[0];
};

exports.checkUpdateProductAvailable = async (productID, orderedNumber) => {
  const [
    rows
  ] = await db.query(
    'SELECT * FROM product WHERE ProductID = ? AND Quantity >= ?',
    [productID, orderedNumber]
  );

  return rows[0];
};

exports.updateStockQuantityAfterPurchased = async (
  productID,
  orderedNumber
) => {
  const query = `UPDATE product SET Quantity = Quantity - ? WHERE ProductID = ?`;

  await db.execute(query, [orderedNumber, productID]);
};
