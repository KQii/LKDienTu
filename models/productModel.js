const db = require('../database');

const queryString = (operator, fieldName) => {
  switch (operator) {
    case 'gte':
      return `${fieldName} >= ?`;
    case 'gt':
      return `${fieldName} > ?`;
    case 'lte':
      return `${fieldName} <= ?`;
    case 'lt':
      return `${fieldName} < ?`;
    default:
      break;
  }
};

const getColumns = async (tableName, excludedFields) => {
  const [rows] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
  const columns = rows.map(row => row.Field);
  return columns.filter(col => !excludedFields.includes(col)).join(', ');
};

exports.getAllProducts = async reqQuery => {
  // const [rows] = await db.query('SELECT * FROM product');
  // return rows;

  // console.log(reqQuery);
  const { quantity, price, hide, sale } = reqQuery;
  const conditions = [];
  const values = [];

  if (quantity) {
    if (typeof quantity === 'object') {
      for (let i = 0; i < Object.keys(quantity).length; i++) {
        const operator = Object.keys(quantity)[i];
        const value = Object.values(quantity)[i];

        conditions.push(queryString(operator, 'Quantity'));
        values.push(value);
      }
    } else {
      conditions.push('Quantity = ?');
      values.push(quantity);
    }
  }
  if (price) {
    if (typeof price === 'object') {
      for (let i = 0; i < Object.keys(price).length; i++) {
        const operator = Object.keys(price)[i];
        const value = Object.values(price)[i];

        conditions.push(queryString(operator, 'Price'));
        values.push(value);
      }
    } else {
      conditions.push('Price = ?');
      values.push(price);
    }
  }
  if (hide) {
    conditions.push('Hide = ?');
    values.push(hide);
  }
  if (sale) {
    conditions.push('Sale = ?');
    values.push(sale);
  }

  let query = 'SELECT * FROM product';
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  if (reqQuery.sort) {
    const sortConditionsArr = reqQuery.sort.split(',');

    query += ` ORDER BY `;

    sortConditionsArr.forEach(el => {
      // let sortField = `${el[0].toUpperCase() + el.slice(1)}`;
      let sortField = `${el}`;
      let type = 'ASC';

      if (el[0] === '-') {
        // sortField = `${el[1].toUpperCase() + el.slice(2)}`;
        sortField = `${el.slice(1)}`;
        type = 'DESC';
      }

      query += `${sortField} ${type}, `;
    });

    query = query.slice(0, -2);
  }
  if (reqQuery.fields) {
    const { fields } = reqQuery;

    if (fields.includes('-')) {
      const excludedFields = fields.split(',').map(el => el.slice(1));

      const selectedFields = await getColumns('product', excludedFields);
      query = query.replace('*', selectedFields);
    }

    query = query.replace('*', fields);
  }

  const page = +reqQuery.page || 1;
  const limit = +reqQuery.limit || 10;
  const skip = (page - 1) * limit;

  if (reqQuery.page) {
    const [rows] = await db.query('SELECT COUNT(*) AS total_rows FROM product');
    const numProducts = rows[0].total_rows;
    if (skip >= numProducts) throw new Error('This page does not exist');
  }

  query += ` LIMIT ${skip}, ${limit}`;

  const [rows] = await db.execute(query, values);
  return rows;
};

exports.getProductById = async id => {
  const [rows] = await db.query('SELECT * FROM product WHERE ProductID = ?', [
    id
  ]);
  return rows[0];
};

exports.createProduct = async data => {
  const query = `
    INSERT INTO product (ProductCatalogID,
    ProductName,
    DescribeProduct,
    Image,
    Product_Information,
    Quantity,
    Price,
    Sale,
    Hide)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.execute(query, Object.values(data));

  // return { ProductID: result.insertId, ...data };
  return this.getProductById(result.insertId);
};

exports.updateProductById = async (id, data) => {
  const {
    ProductCatalogID,
    ProductName,
    DescribeProduct,
    Image,
    Product_Information,
    Quantity,
    Price,
    Sale,
    Hide
  } = data;

  // let updateQuery = 'UPDATE product SET ';
  // const values = [];

  // if (ProductCatalogID) {
  //   updateQuery += 'ProductCatalogID = ?, ';
  //   values.push(ProductCatalogID);
  // }
  // if (ProductName) {
  //   updateQuery += 'ProductName = ?, ';
  //   values.push(ProductName);
  // }
  // if (DescribeProduct) {
  //   updateQuery += 'DescribeProduct = ?, ';
  //   values.push(DescribeProduct);
  // }
  // if (Image) {
  //   updateQuery += 'Image = ?, ';
  //   values.push(Image);
  // }
  // if (Product_Information) {
  //   updateQuery += 'Product_Information = ?, ';
  //   values.push(Product_Information);
  // }
  // if (Quantity) {
  //   updateQuery += 'Quantity = ?, ';
  //   values.push(Quantity);
  // }
  // if (Price) {
  //   updateQuery += 'Price = ?, ';
  //   values.push(Price);
  // }
  // if (Sale) {
  //   updateQuery += 'Sale = ?, ';
  //   values.push(Sale);
  // }
  // if (Hide) {
  //   updateQuery += 'Hide = ?, ';
  //   values.push(Hide);
  // }

  // updateQuery = updateQuery.slice(0, -2);
  // updateQuery += ' WHERE ProductID = ?';
  // values.push(id);

  // const [result] = await db.execute(updateQuery, values);

  // return { result, updatedProduct: this.getProductById(id) };

  const fields = [];
  const values = [];

  if (ProductCatalogID) {
    fields.push('ProductCatalogID = ?');
    values.push(ProductCatalogID);
  }
  if (ProductName) {
    fields.push('ProductName = ?');
    values.push(ProductName);
  }
  if (DescribeProduct) {
    fields.push('DescribeProduct = ?');
    values.push(DescribeProduct);
  }
  if (Image) {
    fields.push('Image = ?');
    values.push(Image);
  }
  if (Product_Information) {
    fields.push('Product_Information = ?');
    values.push(Product_Information);
  }
  if (Quantity) {
    fields.push('Quantity = ?');
    values.push(Quantity);
  }
  if (Price) {
    fields.push('Price = ?');
    values.push(Price);
  }
  if (Sale !== undefined) {
    fields.push('Sale = ?');
    values.push(Sale);
  }
  if (Hide !== undefined) {
    fields.push('Hide = ?');
    values.push(Hide);
  }
  values.push(id);

  console.log(fields);
  console.log(values);

  let updateQuery = 'UPDATE product SET ';
  if (fields.length > 0) {
    updateQuery += `${fields.join(', ')} WHERE ProductID = ?`;
  }

  const [result] = await db.execute(updateQuery, values);
  return { result, updatedProduct: this.getProductById(id) };
};

exports.deleteProductById = async id => {
  const [rows] = await db.query('DELETE FROM product WHERE ProductID = ?', [
    id
  ]);

  return rows;
};
