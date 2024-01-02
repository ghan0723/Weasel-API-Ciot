const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'filemondb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const getUserByUsername = async (username) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0];
};

module.exports = {
  pool,
  getUserByUsername
};
