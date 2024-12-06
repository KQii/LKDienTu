const db = require('../database');

exports.getAllInvoices = async () => {
  const [rows] = await db.query(`
    SELECT *
    FROM invoice AS i
    LEFT JOIN invoice_detail AS id
    ON i.InvoiceID = id.InvoiceID
    `);

  const invoices = rows.reduce((acc, row) => {
    const {
      InvoiceDetailID,
      ProductID,
      PaidNumber,
      UnitPrice,
      SalePercent,
      ...invoice
    } = row;

    // Tìm invoice trong danh sách
    let existingInvoice = acc.find(i => i.InvoiceID === invoice.InvoiceID);

    // Nếu chưa có, thêm mới
    if (!existingInvoice) {
      existingInvoice = { ...invoice, InvoiceDetails: [] };
      acc.push(existingInvoice);
    }

    // Thêm chi tiết hóa đơn vào InvoiceDetails
    if (InvoiceDetailID) {
      existingInvoice.InvoiceDetails.push({
        InvoiceDetailID,
        ProductID,
        PaidNumber,
        UnitPrice,
        SalePercent
      });
    }

    return acc;
  }, []);

  return invoices;
};

exports.getInvoiceById = async id => {
  const [rows] = await db.query(
    `
    SELECT 
      i.InvoiceID, i.AccountID, i.InvoiceDate, i.Paid_Method, i.IsPaid, i.IsDelete,
      id.InvoiceDetailID, id.ProductID, id.UnitPrice, id.SalePercent, id.PaidNumber
    FROM invoice AS i
    LEFT JOIN invoice_detail AS id
    ON i.InvoiceID = id.InvoiceID
    WHERE i.InvoiceID = ?
    `,
    [id]
  );

  const invoices = rows.reduce((acc, row) => {
    const {
      InvoiceDetailID,
      ProductID,
      PaidNumber,
      UnitPrice,
      SalePercent,
      ...invoice
    } = row;

    // Tìm invoice trong danh sách
    let existingInvoice = acc.find(i => i.InvoiceID === invoice.InvoiceID);

    // Nếu chưa có, thêm mới
    if (!existingInvoice) {
      existingInvoice = { ...invoice, InvoiceDetails: [] };
      acc.push(existingInvoice);
    }

    // Thêm chi tiết hóa đơn vào InvoiceDetails
    if (InvoiceDetailID) {
      existingInvoice.InvoiceDetails.push({
        InvoiceDetailID,
        ProductID,
        PaidNumber,
        UnitPrice,
        SalePercent
      });
    }

    return acc;
  }, []);

  return invoices[0];
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

exports.getMyInvoices = async id => {
  // const [rows] = await db.query('SELECT * FROM invoice WHERE AccountID = ?', [
  //   id
  // ]);
  const [rows] = await db.query(
    `
    SELECT *
    FROM invoice AS i
    LEFT JOIN invoice_detail AS id
    ON i.InvoiceID = id.InvoiceID
    WHERE AccountID = ?
    `,
    [id]
  );

  const invoices = rows.reduce((acc, row) => {
    const {
      InvoiceDetailID,
      ProductID,
      PaidNumber,
      UnitPrice,
      SalePercent,
      ...invoice
    } = row;

    // Tìm invoice trong danh sách
    let existingInvoice = acc.find(i => i.InvoiceID === invoice.InvoiceID);

    // Nếu chưa có, thêm mới
    if (!existingInvoice) {
      existingInvoice = { ...invoice, InvoiceDetails: [] };
      acc.push(existingInvoice);
    }

    // Thêm chi tiết hóa đơn vào InvoiceDetails
    if (InvoiceDetailID) {
      existingInvoice.InvoiceDetails.push({
        InvoiceDetailID,
        ProductID,
        PaidNumber,
        UnitPrice,
        SalePercent
      });
    }

    return acc;
  }, []);

  return invoices;
};

exports.createInvoice = async (accountId, data) => {
  const query = `INSERT INTO invoice (AccountID, InvoiceDate, Paid_Method, IsPaid) VALUES (?, NOW(), ?, ?)`;
  const [result] = await db.execute(query, [
    accountId,
    data.PaidMethod,
    data.IsPaid
  ]);

  return this.getInvoiceById(result.insertId);
};
