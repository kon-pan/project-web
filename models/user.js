// User defined module imports
const db = require('../db/db'); // holds database pool connnection

class User {
  static async findByUsername(username) {
    const client = await db.connect();

    try {
      const result = await client.query(
        'SELECT * FROM users WHERE username=$1',
        [username]
      );
      if (result.rowCount > 0) {
        return true;
      } else {
        return false;
      }
    } finally {
      client.release();
    }
  }

  static async findByEmail(email) {
    const client = await db.connect();

    try {
      const result = await client.query('SELECT * FROM users WHERE email=$1', [
        email,
      ]);
      if (result.rowCount > 0) {
        return result.rows[0];
      } else {
        return false;
      }
    } finally {
      client.release();
    }
  }

  static async findById(id) {
    const client = await db.connect();

    try {
      const result = await client.query('SELECT * FROM users WHERE id=$1', [
        id,
      ]);
      if (result.rowCount > 0) {
        return result.rows[0];
      } else {
        return false;
      }
    } finally {
      client.release();
    }
  }

  static async create(user) {
    const query = `
      INSERT INTO users (first_name, last_name, username, email, password, is_admin) 
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    const values = [
      user.firstName,
      user.lastName,
      user.username,
      user.email,
      user.password,
      0,
    ];
    const client = await db.connect();

    try {
      const result = await client.query(query, values);
      if (result.rowCount > 0) {
        return true;
      } else {
        return false;
      }
    } finally {
      client.release();
    }
  }

  static async edit(id, user) {
    const query = `
      UPDATE users
      SET first_name=$1, last_name=$2, username=$3, password=$4
      WHERE id=$5;
    `;

    const values = [
      user.firstName,
      user.lastName,
      user.username,
      user.password,
      id,
    ];

    const client = await db.connect();

    try {
      const result = await client.query(query, values);
      if (result.rowCount > 0) {
        return true;
      } else {
        return false;
      }
    } finally {
      client.release();
    }
  }

  static async getHeatmapDataAll(id) {
    const query = `
      SELECT server_ip_address, server_lat, server_lon, COUNT(*) AS freq
      FROM entries
      WHERE entries.user_id = $1
      GROUP BY server_ip_address, server_lat, server_lon
    `;

    const values = [id];

    const client = await db.connect();

    try {
      const result = await client.query(query, values);
      if (result.rowCount > 0) {
        return result.rows;
      } else {
        return false;
      }
    } finally {
      client.release();
    }
  }

  static async getHeatmapDataDomains(id) {
    const query = `
    SELECT server_ip_address, requests.host, server_lat, server_lon, COUNT(*) as freq
    FROM entries
    INNER JOIN requests ON entries.id = requests.entry_id
    WHERE entries.user_id = $1 AND requests.host IS NOT NULL
    GROUP BY server_ip_address, requests.host, server_lat, server_lon;
    `;

    const values = [id];

    const client = await db.connect();

    try {
      const result = await client.query(query, values);
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

module.exports = User;
