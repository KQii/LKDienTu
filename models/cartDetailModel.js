const db = require('../database');
const AppError = require('../utils/appError');

exports.getAllCartDetails = async () => {
  const [rows] = await db.query(`
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
    `);

  return rows;
};

exports.getCartDetailById = async id => {
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
    WHERE c.CartDetailID = ?
    `,
    [id]
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
