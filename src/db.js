const mysql = require('mysql2/promise');

// Crea el pool de conexiones a la base de datos.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  timezone: 'Z',
});

// Exporta el pool para usarlo en otros módulos.
module.exports = { pool };
