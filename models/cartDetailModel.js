const db = require('../database');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllCartDetails = async reqQuery => {
  const query = `
    SELECT
      c.CartDetailID, c.OrderedNumber, a.AccountID,
      JSON_OBJECT(
        'ProductID', p.ProductID,
        'ProductName', p.ProductName,
        'Price', p.Price
      ) AS Product
    FROM cart_detail AS c
    JOIN account AS a ON c.AccountID = a.AccountID
    JOIN product AS p ON c.ProductID = p.ProductID
    `;

  const features = new APIFeatures(query, reqQuery, 'cartDetails')
    .filter()
    .sort()
    .paginate()
    .limitFields();

  // console.log(features.query, features.values);

  const [rows] = await db.execute(features.query, features.values);

  return rows;
};

exports.getCartDetailById = async id => {
  const [rows] = await db.query(
    `
    SELECT
      c.CartDetailID, c.OrderedNumber, a.AccountID,
      JSON_OBJECT(
        'ProductID', p.ProductID,
        'ProductName', p.ProductName,
        'Price', p.Price
      ) AS Product
    FROM cart_detail AS c
    JOIN account AS a ON c.AccountID = a.AccountID
    JOIN product AS p ON c.ProductID = p.ProductID
    WHERE c.CartDetailID = ?
    `,
    [id]
  );
  return rows[0];
};

exports.getCartDetailByAccountIdAndProductId = async (id, productId) => {
  const [rows] = await db.query(
    `
    SELECT
      c.CartDetailID, c.OrderedNumber,
        a.AccountID,
        JSON_OBJECT(
        'ProductID', p.ProductID,
            'ProductName', p.ProductName,
            'Price', p.Price
        ) AS Product
    FROM cart_detail AS c
    JOIN account AS a ON c.AccountID = a.AccountID
    JOIN product AS p ON c.ProductID = p.ProductID
    WHERE c.AccountID = ? AND c.ProductID = ?
    `,
    [id, productId]
  );
  return rows[0];
};

exports.deleteCartDetailById = async id => {
  const [
    rows
  ] = await db.query('DELETE FROM cart_detail WHERE CartDetailID = ?', [id]);

  return rows;
};

exports.createCartDetail = async data => {
  const query = `
    INSERT INTO cart_detail (AccountID, ProductID, OrderedNumber)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
    OrderedNumber = OrderedNumber + VALUES(OrderedNumber);
  `;
  const [result] = await db.execute(query, [
    data.AccountID,
    data.ProductID,
    data.OrderedNumber
  ]);

  return this.getCartDetailById(result.insertId);
};

exports.updateCartDetailById = async (id, data) => {
  const [
    result
  ] = await db.execute(
    'UPDATE cart_detail SET OrderedNumber = ? WHERE CartDetailID = ?',
    [data.OrderedNumber, id]
  );
  return { result, updatedCartDetail: this.getCartDetailById(id) };
};

exports.getMyCartDetails = async accountId => {
  const [rows] = await db.query(
    `
    SELECT
      c.CartDetailID, c.OrderedNumber,
      JSON_OBJECT(
      'ProductID', p.ProductID,
          'ProductName', p.ProductName,
          'Price', p.Price
      ) AS Product
    FROM cart_detail AS c
    JOIN account AS a ON c.AccountID = a.AccountID
    JOIN product AS p ON c.ProductID = p.ProductID
    WHERE c.AccountID = ?
  `,
    [accountId]
  );

  return rows;
};

exports.updateCartDetailByAccountId = async (accountId, data) => {
  const [
    result
  ] = await db.execute(
    'UPDATE cart_detail SET OrderedNumber = ? WHERE AccountID = ? AND ProductID = ?',
    [data.OrderedNumber, accountId, data.ProductID]
  );
  return {
    result,
    updatedCartDetail: this.getCartDetailByAccountIdAndProductId(
      accountId,
      data.ProductID
    )
  };
};

exports.updateOrderedNumberAfterPurchasedWithTrans = async (
  accountId,
  productId,
  orderedNumber,
  connection
) => {
  const query = `
    UPDATE cart_detail SET OrderedNumber = OrderedNumber - ?
    WHERE AccountID = ? AND ProductID = ?
  `;
  await connection.execute(query, [orderedNumber, accountId, productId]);
};
