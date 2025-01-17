const db = require('../database');
const APIFeatures = require('./../utils/apiFeatures');

exports.getAllProductCatalogs = async reqQuery => {
  const query = `
    SELECT 
      pc1.productCatalogID, pc1.productCatalogName,
	    IF(pc1.ParentID IS NULL, NULL, JSON_OBJECT(
        'productCatalogID', pc2.productCatalogID,
        'productCatalogName', pc2.productCatalogName
      )) AS parent
    FROM product_catalog AS pc1
    LEFT JOIN product_catalog AS pc2
    ON pc1.parentID = pc2.productCatalogID
  `;

  const features = new APIFeatures(query, reqQuery, 'productCatalog')
    .filter()
    .sort()
    .paginate()
    .limitFields();

  // console.log(features.query, features.values);

  const [rows] = await db.execute(features.query, features.values);

  return rows;
};

exports.getAllProductCatalogsWithTrans = async (reqQuery, connection) => {
  const catalogQuery = `
  SELECT
  p.productCatalogID, productCatalogName
  FROM product_catalog AS p`;

  const catalogFeatures = new APIFeatures(
    catalogQuery,
    reqQuery,
    'productCatalog'
  )
    .filter()
    .sort()
    .paginate();

  if (catalogFeatures.query.includes('WHERE')) {
    if (!catalogFeatures.query.includes('productCatalogName')) {
      catalogFeatures.query = catalogFeatures.query.replace(
        'WHERE',
        'WHERE parentID IS null AND '
      );
    }
  } else {
    catalogFeatures.query = catalogFeatures.query.replace(
      'FROM product_catalog AS p',
      'FROM product_catalog AS p WHERE parentID IS null'
    );
  }

  const [catalogs] = await connection.execute(
    catalogFeatures.query,
    catalogFeatures.values
  );

  if (catalogs.length === 0) return [];

  // Lấy danh sách các InvoiceID đã lọc
  const catalogIds = catalogs.map(cat => cat.productCatalogID);

  // Lấy tất cả chi tiết hóa đơn liên quan đến các hóa đơn đã lọc
  const detailsQuery = `
    SELECT 
      pc1.productCatalogID, pc1.productCatalogName, pc1.parentID
    FROM product_catalog AS pc1
    JOIN product_catalog AS pc2 ON pc1.parentID = pc2.productCatalogID
    WHERE pc1.parentID IN (${catalogIds.map(() => '?').join(', ')})
  `;

  const [details] = await connection.execute(detailsQuery, catalogIds);

  // Gộp dữ liệu hóa đơn và chi tiết hóa đơn
  let result = catalogs.map(catalog => {
    const relatedDetails = details.filter(
      detail => detail.parentID === catalog.productCatalogID
    );
    return {
      ...catalog,
      childs: relatedDetails.map(({ parentID, ...rest }) => rest)
    };
  });

  result = APIFeatures.limitFieldsOnProcessedData(result, reqQuery.fields);
  return result;
};

exports.getProductCatalogById = async id => {
  const [rows] = await db.query(
    `
    SELECT 
      pc1.productCatalogID, pc1.productCatalogName,
	    IF(pc1.ParentID IS NULL, NULL, JSON_OBJECT(
        'productCatalogID', pc2.productCatalogID,
        'productCatalogName', pc2.productCatalogName
      )) AS parent
    FROM product_catalog AS pc1
    LEFT JOIN product_catalog AS pc2
    ON pc1.parentID = pc2.productCatalogID
    WHERE pc1.productCatalogID = ?
    `,
    [id]
  );
  return rows[0];
};

exports.getProductCatalogByIdWithTrans = async (id, connection) => {
  const catalogQuery = `
  SELECT
  p.productCatalogID, productCatalogName
  FROM product_catalog AS p
  WHERE p.productCatalogID = ?`;

  const [catalogs] = await connection.execute(catalogQuery, [id]);

  if (catalogs.length === 0) return [];

  const catalogIds = catalogs.map(cat => cat.productCatalogID);

  const detailsQuery = `
    SELECT 
      pc1.productCatalogID, pc1.productCatalogName, pc1.parentID
    FROM product_catalog AS pc1
    JOIN product_catalog AS pc2 ON pc1.parentID = pc2.productCatalogID
    WHERE pc1.parentID IN (${catalogIds.map(() => '?').join(', ')})
  `;

  const [details] = await connection.execute(detailsQuery, catalogIds);

  // Gộp dữ liệu hóa đơn và chi tiết hóa đơn
  const result = catalogs.map(catalog => {
    const relatedDetails = details.filter(
      detail => detail.parentID === catalog.productCatalogID
    );
    return {
      ...catalog,
      childs: relatedDetails.map(({ parentID, ...rest }) => rest)
    };
  });

  // result = APIFeatures.limitFieldsOnProcessedData(result, reqQuery.fields);
  return result;
};

exports.getProductCatalogByName = async name => {
  const [rows] = await db.query(
    `
    SELECT 
      pc1.productCatalogID, pc1.productCatalogName,
	    IF(pc1.ParentID IS NULL, NULL, JSON_OBJECT(
        'productCatalogID', pc2.productCatalogID,
        'productCatalogName', pc2.productCatalogName
      )) AS parent
    FROM product_catalog AS pc1
    LEFT JOIN product_catalog AS pc2
    ON pc1.parentID = pc2.productCatalogID
    WHERE pc1.productCatalogName = ?
    `,
    [name]
  );
  return rows[0];
};

exports.getOtherProductCatalogNameByName = async (id, name) => {
  const [
    rows
  ] = await db.query(
    `SELECT * FROM product_catalog WHERE productCatalogName = ? AND productCatalogID <> ?`,
    [name, id]
  );
  return rows[0];
};

exports.createProductCatalog = async data => {
  const query = `INSERT INTO product_catalog (productCatalogName, parentID) VALUES (?, ?)`;
  const [result] = await db.execute(query, [
    data.productCatalogName,
    data.parentID
  ]);

  return this.getProductCatalogById(result.insertId);
};

exports.updateProductCatalogById = async (id, data) => {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    if (key !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  values.push(id);

  let updateQuery = 'UPDATE product_catalog SET ';
  if (fields.length > 0) {
    updateQuery += `${fields.join(', ')} WHERE productCatalogID = ?`;
  }

  const [result] = await db.execute(updateQuery, values);
  return { result, updatedProductCatalog: this.getProductCatalogById(id) };
};

exports.deleteProductCatalogById = async id => {
  const [
    rows
  ] = await db.query('DELETE FROM product_catalog WHERE productCatalogID = ?', [
    id
  ]);

  return rows;
};
