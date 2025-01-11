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
    productID, productName, describeProduct, image, productInformation, quantity, price, sale, hide,
    JSON_OBJECT(
      'productCatalogID', pc.productCatalogID,
      'productCatalogName', pc.productCatalogName
    ) AS productCatalog
  FROM product AS p
  JOIN product_catalog AS pc ON p.productCatalogID = pc.productCatalogID
  `;

  const features = new APIFeatures(query, reqQuery, 'product')
    .filter()
    .sort()
    .paginate()
    .limitFields();

  const [rows] = await db.execute(features.query, features.values);

  // Virtual fields
  if (!reqQuery.fields) {
    const virtualRows = rows.map(row => ({
      ...row,
      SalePercent: row.Sale ? `${row.Sale}%` : null,
      PriceDiscount: row.Price * ((100 - row.Sale) / 100)
    }));
    return virtualRows;
  }

  return rows;
};

exports.getProductById = async id => {
  const [rows] = await db.query(
    `
    SELECT
      p.productID,
      JSON_OBJECT(
        'ProductCatalogID', pc.ProductCatalogID,
        'ProductCatalogName', pc.ProductCatalogName
      ) AS productCatalog,
      p.productName, p.describeProduct, p.image, p.productInformation, p.quantity, p.price, p.sale, p.hide
    FROM product AS p
    JOIN product_catalog AS pc ON p.productCatalogID = pc.productCatalogID
    WHERE p.productID = ?
    `,
    [id]
  );
  return rows[0];
};

exports.getProductByIdWithTrans = async (id, connection) => {
  const [rows] = await connection.query(
    `
    SELECT
      p.productID,
      JSON_OBJECT(
        'ProductCatalogID', pc.ProductCatalogID,
        'ProductCatalogName', pc.ProductCatalogName
      ) AS productCatalog,
      p.productName, p.describeProduct, p.image, p.productInformation, p.quantity, p.price, p.sale, p.hide
    FROM product AS p
    JOIN product_catalog AS pc ON p.productCatalogID = pc.productCatalogID
    WHERE p.productID = ?
    `,
    [id]
  );
  return rows[0];
};

exports.getProductByProductName = async productName => {
  const [rows] = await db.query(`SELECT * FROM product WHERE productName = ?`, [
    productName
  ]);
  return rows[0];
};

exports.getOtherProductByProductName = async (productId, productName) => {
  const [
    rows
  ] = await db.query(
    `SELECT * FROM product WHERE productName = ? AND productID <> ?`,
    [productName, productId]
  );
  return rows[0];
};

exports.createProduct = async data => {
  const query = `
    INSERT INTO product (productCatalogID,
    productName,
    describeProduct,
    image,
    productInformation,
    quantity,
    price,
    sale,
    hide)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.execute(query, [
    data.ProductCatalogID,
    data.ProductName,
    data.DescribeProduct,
    data.Image,
    data.productInformation,
    data.Quantity,
    data.Price,
    data.Sale,
    data.Hide
  ]);

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
    updateQuery += `${fields.join(', ')} WHERE productID = ?`;
  }

  const [result] = await db.execute(updateQuery, values);
  return { result, updatedProduct: this.getProductById(id) };
};

exports.deleteProductById = async id => {
  const [rows] = await db.query('DELETE FROM product WHERE productID = ?', [
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
    'SELECT * FROM product WHERE productID = ? AND quantity >= ?',
    [productID, cartOrderedNumber + orderedNumber]
  );

  return rows[0];
};

exports.checkUpdateProductAvailable = async (productID, orderedNumber) => {
  const [
    rows
  ] = await db.query(
    'SELECT * FROM product WHERE productID = ? AND quantity >= ?',
    [productID, orderedNumber]
  );

  return rows[0];
};

exports.updateStockQuantityAfterPurchasedWithTrans = async (
  productID,
  orderedNumber,
  connection
) => {
  const query = `UPDATE product SET quantity = quantity - ? WHERE productID = ?`;

  await connection.execute(query, [orderedNumber, productID]);
};

exports.updateStockQuantityAfterImportedWithTrans = async (
  productId,
  quantity,
  connection
) => {
  const query = `UPDATE product SET quantity = quantity + ? WHERE productID = ?`;

  await connection.execute(query, [quantity, productId]);
};
