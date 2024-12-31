const allowedFieldsMap = {
  // prettier-ignore
  product: [
  'productID', 'productCatalog', 'productName', 'describeProduct', 'image', 'productInformation', 'quantity', 'price', 'sale', 'hide', '-productID', '-productCatalog', '-productName', '-describeProduct', '-image', '-productInformation', '-quantity', '-price', '-sale', '-hide'
  ],

  // prettier-ignore
  productCatalog: [
  'pc1.productCatalogID', 'pc1.productCatalogName', 'pc1.parentID', '-pc1.productCatalogID', '-pc1.productCatalogName', '-pc1.parentID'
  ]
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
  constructor(query, queryStr, tableName) {
    this.query = query;
    this.queryStr = queryStr;
    this.values = [];
    this.allowedFields = allowedFieldsMap[tableName] || [];
  }

  filter() {
    const queryObj = { ...this.queryStr };
    const excludedFields = ['sort', 'fields', 'page', 'limit'];
    excludedFields.forEach(el => delete queryObj[el]);

    const conditions = [];
    const values = [];
    for (const [key, value] of Object.entries(queryObj)) {
      if (Array.isArray(value)) {
        const orConditions = value.map(() => `${key} = ?`).join(' OR ');
        conditions.push(`(${orConditions})`);
        values.push(...value);
      } else if (typeof value === 'object') {
        for (const [operator, val] of Object.entries(value)) {
          conditions.push(queryString(operator, key));
          values.push(val);
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
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortConditionsArr = this.queryStr.sort.split(',');
      let count = 0;

      this.query += ` ORDER BY `;

      sortConditionsArr.forEach(el => {
        if (!this.allowedFields.includes(el)) return;
        if (el === 'productCatalog') el = 'pc.productCatalogName';
        if (el === '-productCatalog') el = '-pc.productCatalogName';

        let sortField = `${el}`;
        let type = 'ASC';

        if (el[0] === '-') {
          sortField = `${el.slice(1)}`;
          type = 'DESC';
        }

        this.query += `${sortField} ${type}, `;
        count += 1;
      });

      if (count === 0)
        this.query = this.query.slice(0, this.query.indexOf('ORDER BY'));
      this.query = this.query.slice(0, -2);
    }

    return this;
  }

  limitFields() {
    if (this.queryStr.fields) {
      const query = `
      p.productID,
      JSON_OBJECT(
        'productCatalogID', pc.productCatalogID,
        'productCatalogName', pc.productCatalogName
      ) AS productCatalog,
      p.productName, p.describeProduct, p.image, p.productInformation, p.quantity, p.price, p.sale, p.hide
      `.trim();
      let { fields } = this.queryStr;

      if (fields[0] === '-') {
        let queryCopy = `${query},`;
        if (fields.includes('productCatalog')) {
          queryCopy = queryCopy.replace(
            `JSON_OBJECT(
        'productCatalogID', pc.productCatalogID,
        'productCatalogName', pc.productCatalogName
      ) AS productCatalog,`,
            ''
          );
        }

        fields
          .split(',')
          .map(el => el.slice(1))
          .forEach(el => {
            queryCopy = queryCopy.replace(new RegExp(`p\\.${el}\\b,`, 'g'), '');
          });

        this.query = this.query.replace(
          query,
          queryCopy.slice(0, queryCopy.lastIndexOf(','))
        );
      } else {
        fields = fields
          .split(',')
          .filter(el => this.allowedFields.includes(el))
          .join(',');

        if (fields.includes('productCatalog')) {
          fields = fields.replace(
            'productCatalog',
            `JSON_OBJECT(
                  'productCatalogID', pc.productCatalogID,
                  'productCatalogName', pc.productCatalogName
                ) AS productCatalog`
          );
        }
        if (fields.length > 0) this.query = this.query.replace(query, fields);
      }
    }
    return this;
  }

  paginate() {
    const page = +this.queryStr.page || 1;
    const limit = +this.queryStr.limit || 5;
    const skip = (page - 1) * limit;

    this.query += ` LIMIT ${skip}, ${limit}`;
    return this;
  }
}

module.exports = APIFeatures;
