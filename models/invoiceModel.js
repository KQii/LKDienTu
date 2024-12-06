const db = require('../database');

exports.getAllInvoices = async () => {
  const [rows] = await db.query('SELECT * FROM invoice');

  return rows;
};

exports.getInvoiceById = async id => {
  const [rows] = await db.query('SELECT * FROM invoice WHERE InvoiceID = ?', [
    id
  ]);
  return rows[0];
};

exports.updateInvoiceById = async (id, data) => {
  const [
    result
  ] = await db.execute('UPDATE invoice SET IsDelete = ? WHERE InvoiceID = ?', [
    data.IsDelete,
    id
  ]);
  return { result, updatedInvoice: this.getInvoiceById(id) };
};
