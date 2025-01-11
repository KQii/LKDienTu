const db = require('../database');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllInvoicesWithTrans = async (reqQuery, connection) => {
  const invoiceQuery = `
  SELECT
  i.InvoiceID, AccountID, InvoiceDate, Paid_Method, IsPaid, IsDelete
  FROM invoice AS i`;

  const invoiceFeatures = new APIFeatures(invoiceQuery, reqQuery, 'invoice')
    .filter()
    .sort()
    .paginate();

  const [invoices] = await connection.execute(
    invoiceFeatures.query,
    invoiceFeatures.values
  );

  if (invoices.length === 0) return [];

  // Lấy danh sách các InvoiceID đã lọc
  const invoiceIds = invoices.map(inv => inv.InvoiceID);

  // Lấy tất cả chi tiết hóa đơn liên quan đến các hóa đơn đã lọc
  const detailsQuery = `
    SELECT 
      id.InvoiceDetailID, id.ProductID, id.PaidNumber, id.UnitPrice, id.SalePercent,
      i.InvoiceID
    FROM invoice_detail AS id
    JOIN invoice AS i ON id.InvoiceID = i.InvoiceID
    WHERE i.InvoiceID IN (${invoiceIds.map(() => '?').join(', ')})
  `;

  const [details] = await connection.execute(detailsQuery, invoiceIds);

  // Gộp dữ liệu hóa đơn và chi tiết hóa đơn
  let result = invoices.map(invoice => {
    const relatedDetails = details.filter(
      detail => detail.InvoiceID === invoice.InvoiceID
    );
    return {
      ...invoice,
      InvoiceDetails: relatedDetails.map(({ InvoiceID, ...rest }) => rest)
    };
  });

  result = APIFeatures.limitFieldsOnProcessedData(result, reqQuery.fields);
  return result;
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

exports.getInvoiceByIdWithTrans = async (id, connection) => {
  const [rows] = await connection.query(
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
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    if (key !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  values.push(id);

  let updateQuery = 'UPDATE invoice SET ';
  if (fields.length > 0) {
    updateQuery += `${fields.join(', ')} WHERE InvoiceID = ?`;
  }

  const [result] = await db.execute(updateQuery, values);
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

exports.getMyInvoicesWithTrans = async (id, reqQuery, connection) => {
  const invoiceQuery = `
  SELECT
  i.InvoiceID, AccountID, InvoiceDate, Paid_Method, IsPaid, IsDelete
  FROM invoice AS i`;

  const invoiceFeatures = new APIFeatures(invoiceQuery, reqQuery, 'invoice')
    .filter()
    .sort()
    .paginate();

  if (invoiceFeatures.query.includes('WHERE')) {
    invoiceFeatures.query = invoiceFeatures.query.replace(
      'WHERE',
      'WHERE AccountID = ? AND '
    );
  } else {
    invoiceFeatures.query = invoiceFeatures.query.replace(
      'FROM invoice AS i',
      'FROM invoice AS i WHERE AccountID = ? '
    );
  }
  invoiceFeatures.values.unshift(id);

  const [invoices] = await connection.execute(
    invoiceFeatures.query,
    invoiceFeatures.values
  );

  if (invoices.length === 0) return [];

  // Lấy danh sách các InvoiceID đã lọc
  const invoiceIds = invoices.map(inv => inv.InvoiceID);

  // Lấy tất cả chi tiết hóa đơn liên quan đến các hóa đơn đã lọc
  const detailsQuery = `
    SELECT 
      id.InvoiceDetailID, id.ProductID, id.PaidNumber, id.UnitPrice, id.SalePercent,
      i.InvoiceID
    FROM invoice_detail AS id
    JOIN invoice AS i ON id.InvoiceID = i.InvoiceID
    WHERE i.InvoiceID IN (${invoiceIds.map(() => '?').join(', ')})
  `;

  const [details] = await connection.execute(detailsQuery, invoiceIds);

  // Gộp dữ liệu hóa đơn và chi tiết hóa đơn
  let result = invoices.map(invoice => {
    const relatedDetails = details.filter(
      detail => detail.InvoiceID === invoice.InvoiceID
    );
    return {
      ...invoice,
      InvoiceDetails: relatedDetails.map(({ InvoiceID, ...rest }) => rest)
    };
  });

  result = APIFeatures.limitFieldsOnProcessedData(result, reqQuery.fields);
  return result;
};

exports.createInvoiceWithTrans = async (accountId, data, connection) => {
  const query = `INSERT INTO invoice (AccountID, InvoiceDate, Paid_Method, IsPaid) VALUES (?, NOW(), ?, ?)`;
  const [result] = await connection.execute(query, [
    accountId,
    data.PaidMethod,
    data.IsPaid
  ]);

  return this.getInvoiceByIdWithTrans(result.insertId, connection);
};
