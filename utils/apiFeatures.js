const allowedValuesMap = {
  // prettier-ignore
  product: [
  'productID', 'productCatalog', 'p.productCatalogID', 'productCatalogName', 'productName', 'describeProduct', 'image', 'productInformation', 'quantity', 'price', 'sale', 'hide', '-productID', '-productCatalog', '-p.productCatalogID', '-productCatalogName', '-productName', '-describeProduct', '-image', '-productInformation', '-quantity', '-price', '-sale', '-hide'
  ],

  // prettier-ignore
  productCatalog: [
  'pc1.productCatalogID', 'pc1.productCatalogName', 'parent', '-pc1.productCatalogID', '-pc1.productCatalogName', '-parent'
  ],

  // prettier-ignore
  account: ['AccountID', 'AccountName', 'CIC', 'Mail', 'Role', 'r.RoleID', 'RoleName', '-AccountID', '-AccountName', '-CIC', '-Mail', '-Role', '-r.RoleID', '-RoleName'],

  // prettier-ignore
  roles: ['RoleID', 'RoleName', '-RoleID', '-RoleName'],

  // prettier-ignore
  info: ['InfoID', 'CIC', 'PhoneNumber', 'FirstName', 'MiddleName', 'LastName', 'DateOfBirth', 'Sex', 'HouseNumber', 'Street', 'Ward', 'District', 'City', '-InfoID', '-CIC', '-PhoneNumber', '-FirstName', '-MiddleName', '-LastName', '-DateOfBirth', '-Sex', '-HouseNumber', '-Street', '-Ward', '-District', '-City'],

  // prettier-ignore
  cartDetails: ['CartDetailID', 'OrderedNumber', 'a.AccountID', 'Product', 'p.ProductID', 'ProductName', 'Price', '-CartDetailID', '-OrderedNumber', '-a.AccountID', '-p.ProductID', '-ProductName', '-Price'],

  // prettier-ignore
  invoice: ['InvoiceID', 'AccountID', 'InvoiceDate', 'Paid_Method', 'IsPaid', 'IsDelete', '-InvoiceID', '-AccountID', '-InvoiceDate', '-Paid_Method', '-IsPaid', '-IsDelete']
};

const sortFieldsMap = {
  product: {
    productCatalog: 'p.productCatalogID',
    '-productCatalog': '-p.productCatalogID'
  },
  account: {
    Role: 'r.RoleID',
    '-Role': '-r.RoleID'
  },
  cartDetails: {
    Product: 'p.ProductID',
    '-Product': '-p.ProductID'
  },
  invoice: {
    InvoiceDetails: 'id.InvoiceDetailID',
    '-InvoiceDetails': '-id.InvoiceDetailID'
  }
};

const specialFieldsMap = {
  productCatalog: `JSON_OBJECT(
      'productCatalogID', pc.productCatalogID,
      'productCatalogName', pc.productCatalogName
    ) AS productCatalog`,
  Role: `JSON_OBJECT(
      'RoleID', r.RoleID,
      'RoleName', r.RoleName
    ) AS Role`,
  parent: `IF(pc1.ParentID IS NULL, NULL, JSON_OBJECT(
        'productCatalogID', pc2.productCatalogID,
        'productCatalogName', pc2.productCatalogName
      )) AS parent`,
  Product: `JSON_OBJECT(
        'ProductID', p.ProductID,
        'ProductName', p.ProductName,
        'Price', p.Price
      ) AS Product`
};

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

class APIFeatures {
  constructor(query, reqQuery, tableName) {
    this.query = query;
    this.reqQuery = reqQuery;
    this.values = [];
    this.tableName = tableName;
    this.allowedValues = allowedValuesMap[tableName] || [];
  }

  filter() {
    const queryObj = { ...this.reqQuery };
    const excludedFields = ['sort', 'fields', 'page', 'limit'];
    excludedFields.forEach(el => delete queryObj[el]);
    console.log('input filter: ', queryObj);

    const conditions = [];
    const values = [];
    for (const [key, val] of Object.entries(queryObj)) {
      let value = val;
      if (typeof value === 'string' && value.includes(',')) {
        value = value.split(',');
      }

      if (Array.isArray(value)) {
        const orConditions = value.map(() => `${key} = ?`).join(' OR ');
        conditions.push(`(${orConditions})`);
        values.push(...value);
      } else if (typeof value === 'object') {
        for (const [operator, val2] of Object.entries(value)) {
          conditions.push(queryString(operator, key));
          values.push(val2);
        }
      } else {
        conditions.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (conditions.length > 0) {
      this.query += ` WHERE ${conditions.join(' AND ')}`;
      this.values = values;
    }
    console.log('FILTER: ', this.query, this.values);
    return this;
  }

  sort() {
    if (this.reqQuery.sort) {
      const sortConditionsArr = this.reqQuery.sort.split(',');
      let count = 0;
      console.log('input sort: ', sortConditionsArr);

      this.query += ` ORDER BY `;

      sortConditionsArr.forEach(el => {
        if (!this.allowedValues.includes(el)) return;

        let sortField = `${el}`;
        let type = 'ASC';

        if (el[0] === '-') {
          sortField = `${el.slice(1)}`;
          type = 'DESC';
        }

        // Ánh xạ trường đặc biệt từ cấu trúc sortFieldsMap
        const mappedField =
          sortFieldsMap[this.tableName] &&
          sortFieldsMap[this.tableName][sortField]
            ? sortFieldsMap[this.tableName][sortField]
            : sortField;

        this.query += `${mappedField} ${type}, `;
        count += 1;
      });

      if (count === 0)
        this.query = this.query.slice(0, this.query.indexOf('ORDER BY'));
      else this.query = this.query.slice(0, -2);
      console.log('SORT: ', this.query);
    }

    return this;
  }

  limitFields() {
    if (this.reqQuery.fields) {
      const match = this.query.match(/SELECT([\s\S]*?)FROM/);
      const query = match[1].trim();

      let { fields } = this.reqQuery;
      console.log('input limit fields: ', fields);

      if (fields[0] === '-') {
        let queryCopy = `${query},`;

        fields
          .split(',')
          .map(el => el.slice(1))
          .filter(el => this.allowedValues.includes(el))
          .forEach(el => {
            if (specialFieldsMap[el]) {
              queryCopy = queryCopy.replace(`${specialFieldsMap[el]},`, '');
            } else {
              queryCopy = queryCopy.replace(
                new RegExp(`\\b${el}\\b(,\\s*|\\s*)?`, 'g'),
                ''
              );
              console.log(queryCopy);
            }
          });

        this.query = this.query.replace(
          query,
          queryCopy.slice(0, queryCopy.lastIndexOf(','))
        );
      } else {
        fields = fields
          .split(',')
          .filter(el => this.allowedValues.includes(el))
          .map(el => (specialFieldsMap[el] ? specialFieldsMap[el] : el))
          .join(',');

        if (fields.length > 0) this.query = this.query.replace(query, fields);
      }

      console.log('LIMIT FIELDS: ', this.query);
    }
    return this;
  }

  paginate() {
    const page = +this.reqQuery.page || 1;
    const limit = +this.reqQuery.limit || 5;
    const skip = (page - 1) * limit;

    this.query += ` LIMIT ${skip}, ${limit}`;
    return this;
  }

  static limitFieldsOnProcessedData(data, fields) {
    if (fields) {
      const fieldList = fields.split(',').map(f => f.trim());
      const includeFields = fieldList.filter(f => !f.startsWith('-')); // Trường cần hiển thị
      const excludeFields = fieldList
        .filter(f => f.startsWith('-'))
        .map(f => f.slice(1)); // Trường cần loại bỏ

      return data.map(item => {
        let filteredItem = { ...item };

        // Loại bỏ các trường có trong excludeFields
        excludeFields.forEach(field => {
          delete filteredItem[field];
        });

        // Nếu có includeFields, chỉ giữ lại các trường đó
        if (includeFields.length > 0) {
          filteredItem = includeFields.reduce((acc, field) => {
            if (item.hasOwnProperty(field)) {
              acc[field] = item[field];
            }
            return acc;
          }, {});
        }

        return filteredItem;
      });
    }
    return data; // Nếu không có `fields`, trả lại dữ liệu gốc
  }
}

module.exports = APIFeatures;
