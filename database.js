const mysql = require('mysql2/promise');

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: 'Z'
});

module.exports = pool;
