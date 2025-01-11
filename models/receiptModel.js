const db = require('../database');
const APIFeatures = require('./../utils/apiFeatures');

exports.getAllReceiptsWithTrans = async (reqQuery, connection) => {
  const receiptQuery = `
  SELECT
  ReceiptID, ReceiptType, Partner, CreatedAt
  FROM receipt`;

  const receiptFeatures = new APIFeatures(receiptQuery, reqQuery, 'invoice')
    .filter()
    .sort()
    .paginate();

  const [receipts] = await connection.execute(
    receiptFeatures.query,
    receiptFeatures.values
  );

  if (receipts.length === 0) return [];

  const receiptIds = receipts.map(re => re.ReceiptID);

  const detailsQuery = `
    SELECT 
      rd.ReceiptDetailID, rd.ProductID, rd.Quantity, rd.UnitPrice,
      r.ReceiptID
    FROM receipt_detail AS rd
    JOIN receipt AS r ON rd.ReceiptID = r.ReceiptID
    WHERE r.ReceiptID IN (${receiptIds.map(() => '?').join(', ')})
  `;

  const [details] = await connection.execute(detailsQuery, receiptIds);

  // Gộp dữ liệu hóa đơn và chi tiết hóa đơn
  let result = receipts.map(receipt => {
    const relatedDetails = details.filter(
      detail => detail.ReceiptID === receipt.ReceiptID
    );
    return {
      ...receipt,
      ReceiptDetails: relatedDetails.map(({ ReceiptID, ...rest }) => rest)
    };
  });

  result = APIFeatures.limitFieldsOnProcessedData(result, reqQuery.fields);
  return result;
};

exports.getReceiptByIdWithTrans = async (id, connection) => {
  const receiptQuery = `
  SELECT
  ReceiptID, ReceiptType, Partner, CreatedAt
  FROM receipt
  WHERE ReceiptID = ?`;

  const [receipts] = await connection.execute(receiptQuery, [id]);

  if (receipts.length === 0) return [];

  const detailsQuery = `
    SELECT 
      rd.ReceiptDetailID, rd.ProductID, rd.Quantity, rd.UnitPrice,
      r.ReceiptID
    FROM receipt_detail AS rd
    JOIN receipt AS r ON rd.ReceiptID = r.ReceiptID
    WHERE r.ReceiptID = ?
  `;
  const [details] = await connection.execute(detailsQuery, [id]);

  const result = receipts.map(receipt => {
    const relatedDetails = details.filter(
      detail => detail.ReceiptID === receipt.ReceiptID
    );
    return {
      ...receipt,
      ReceiptDetails: relatedDetails.map(({ ReceiptID, ...rest }) => rest)
    };
  });
  return result[0];
};

exports.getReceiptById = async id => {
  const receiptQuery = `
  SELECT
  ReceiptID, ReceiptType, Partner, CreatedAt
  FROM receipt
  WHERE ReceiptID = ?`;

  const [receipts] = await db.execute(receiptQuery, [id]);

  const detailsQuery = `
    SELECT 
      rd.ReceiptDetailID, rd.ProductID, rd.Quantity, rd.UnitPrice,
      r.ReceiptID
    FROM receipt_detail AS rd
    JOIN receipt AS r ON rd.ReceiptID = r.ReceiptID
    WHERE r.ReceiptID = ?
  `;
  const [details] = await db.execute(detailsQuery, [id]);

  const result = receipts.map(receipt => {
    const relatedDetails = details.filter(
      detail => detail.ReceiptID === receipt.ReceiptID
    );
    return {
      ...receipt,
      ReceiptDetails: relatedDetails.map(({ ReceiptID, ...rest }) => rest)
    };
  });
  return result[0];
};

exports.createReceiptWithTrans = async (data, connection) => {
  const query = `INSERT INTO receipt (ReceiptType, Partner, CreatedAt) VALUES (?, ?, NOW())`;
  const [result] = await connection.execute(query, [
    data.ReceiptType,
    data.Partner
  ]);

  return this.getReceiptByIdWithTrans(result.insertId, connection);
};

exports.updateReceiptById = async (id, data) => {
  const updateQuery = 'UPDATE receipt SET Partner = ? WHERE ReceiptID = ?';

  const [result] = await db.execute(updateQuery, [data.Partner, id]);
  return { result, updatedReceipt: this.getReceiptById(id) };
};
