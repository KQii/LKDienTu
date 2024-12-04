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

class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
    this.values = [];
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

      this.query += ` ORDER BY `;

      sortConditionsArr.forEach(el => {
        let sortField = `${el}`;
        let type = 'ASC';

        if (el[0] === '-') {
          sortField = `${el.slice(1)}`;
          type = 'DESC';
        }

        this.query += `${sortField} ${type}, `;
      });

      this.query = this.query.slice(0, -2);
    }
    return this;
  }

  async limitFields(tableName) {
    if (this.queryStr.fields) {
      const { fields } = this.queryStr;

      if (fields.includes('-')) {
        const excludedFields = fields.split(',').map(el => el.slice(1));

        const selectedFields = await getColumns(tableName, excludedFields);
        this.query = this.query.replace('*', selectedFields);
      }

      this.query = this.query.replace('*', fields);
    }
    return this;
  }

  paginate() {
    const page = +this.queryStr.page || 1;
    const limit = +this.queryStr.limit || 5;
    const skip = (page - 1) * limit;

    // if (this.queryStr.page) {
    //   const [rows] = await db.query(
    //     `SELECT COUNT(*) AS total_rows FROM ${tableName}`
    //   );
    //   const numProducts = rows[0].total_rows;
    //   if (skip >= numProducts) throw new Error('This page does not exist');
    // }

    this.query += ` LIMIT ${skip}, ${limit}`;
    return this;
  }
}

module.exports = APIFeatures;
