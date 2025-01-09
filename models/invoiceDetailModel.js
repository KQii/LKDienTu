const db = require('../database');

exports.getAllInvoiceDetails = async () => {
  const [rows] = await db.query('SELECT * FROM invoice_detail');

  return rows;
};

exports.getInvoiceDetailById = async id => {
  const [
    rows
  ] = await db.query('SELECT * FROM invoice_detail WHERE InvoiceDetailID = ?', [
    id
  ]);
  return rows[0];
};

exports.createInvoiceDetailWithTrans = async (data, connection) => {
  const [
    productRows
  ] = await connection.execute(
    `SELECT Price, Sale FROM product WHERE ProductID = ?`,
    [data.ProductID]
  );

  // if (productRows.length === 0) {
  //   throw new Error('Product not found');
  // }

  const { Price, Sale } = productRows[0];

  const query = `
  INSERT INTO invoice_detail (InvoiceID, ProductID, UnitPrice, SalePercent, PaidNumber)
  VALUES (?, ?, ?, ?, ?)
  `;

  console.log([data.InvoiceID, data.ProductID, Price, Sale, data.PaidNumber]);

  await connection.execute(query, [
    data.InvoiceID,
    data.ProductID,
    Price,
    Sale,
    data.PaidNumber
  ]);
};
