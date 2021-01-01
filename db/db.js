const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres', // TODO: move to .env file
  host: 'localhost', // TODO: move to .env file
  database: 'project-db', // TODO: move to .env file
  password: 'password', // TODO: move to .env file
  port: 5432, // TODO: move to .env file
});

module.exports = pool;
