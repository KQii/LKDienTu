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

exports.getAllProducts = async filter => {
  // const [rows] = await db.query('SELECT * FROM product');
  // return rows;

  // console.log(filter);
  const { quantity, price, hide, sale } = filter;
  const conditions = [];
  const values = [];

  console.log(quantity);
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
    conditions.push('Price = ?');
    values.push(price);
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
