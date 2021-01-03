// User defined module imports
const db = require('../db/db'); // holds database pool connnection

class Admin {
  // Returns the total number of registered users in the database
  static async getTotalUsers() {
    const query = `
      SELECT COUNT(*) AS total_users
      FROM users;
    `;

    const client = await db.connect();

    try {
      const result = await client.query(query);
      if (result.rowCount > 0) {
        return result.rows[0].total_users;
      } else {
        return false;
      }
    } finally {
      client.release();
    }
  }

  static async getTotalEntries() {
    const query = `
      SELECT COUNT(*) AS total_entries
      FROM entries;
    `;

    const client = await db.connect();

    try {
      const result = await client.query(query);
      if (result.rowCount > 0) {
        return result.rows[0].total_entries;
      } else {
        return false;
      }
    } finally {
      client.release();
    }
  }

  static async getTotalDomains() {
    const query = `
      SELECT COUNT(*) AS unique_domains 
      FROM 
        (SELECT DISTINCT host FROM requests) AS temp;
    `;

    const client = await db.connect();

    try {
      const result = await client.query(query);
      if (result.rowCount > 0) {
        return result.rows[0].unique_domains;
      } else {
        return false;
      }
    } finally {
      client.release();
    }
  }

  static async getTotalIsps() {
    const query = `
      SELECT COUNT(*) AS unique_isps 
      FROM 
        (SELECT DISTINCT isp FROM entries) AS temp;
    `;

    const client = await db.connect();

    try {
      const result = await client.query(query);
      if (result.rowCount > 0) {
        return result.rows[0].unique_isps;
      } else {
        return false;
      }
    } finally {
      client.release();
    }
  }

  static async getUsers() {
    const query = `
      SELECT id, first_name, last_name, username, email
      FROM users
      ORDER BY id;
    `;

    const client = await db.connect();

    try {
      const result = await client.query(query);
      if (result.rowCount > 0) {
        return result.rows;
      } else {
        return false;
      }
    } finally {
      client.release();
    }
  }

  static async getRequestsGroupByMethod() {
    const query = `
      SELECT requests.method, COUNT(*) AS request_count 
      FROM requests
      GROUP BY requests.method;
    `;

    const client = await db.connect();

    try {
      const result = await client.query(query);
      if (result.rowCount > 0) {
        return result.rows;
      } else {
        return false;
      }
    } finally {
      client.release();
    }
  }

  static async getResponsesGroupByStatus() {
    const query = `
      SELECT responses.status, COUNT(*) AS status_count 
      FROM responses
      GROUP BY responses.status;
    `;

    const client = await db.connect();

    try {
      const result = await client.query(query);
      if (result.rowCount > 0) {
        return result.rows;
      } else {
        return false;
      }
    } finally {
      client.release();
    }
  }
}

module.exports = Admin;