const db = require('../database');

exports.createReceiptDetailWithTrans = async (data, connection) => {
  const query = `
  INSERT INTO receipt_detail (ReceiptID, ProductID, Quantity, UnitPrice)
  VALUES (?, ?, ?, ?)
  `;

  await connection.execute(query, [
    data.ReceiptID,
    data.ProductID,
    data.Quantity,
    data.UnitPrice
  ]);
};
