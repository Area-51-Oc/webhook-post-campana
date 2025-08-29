const { pool } = require('./db');

// Asegura que la tabla exista, creando si es necesario.
async function ensureTableExists(table) {
  const ddl = `
  CREATE TABLE IF NOT EXISTS \`${table}\` (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    contact_id VARCHAR(128),
    nombres VARCHAR(255),
    phone VARCHAR(32),
    date_create_crm DATETIME(6),
    contact_type VARCHAR(64),
    opportunity_name VARCHAR(255),
    status VARCHAR(128),
    pipleline_stage VARCHAR(128),
    pipeline_name VARCHAR(255),
    asesor VARCHAR(255),
    workflow VARCHAR(255),
    date_update TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_contact (contact_id),
    KEY idx_phone (phone),
    KEY idx_datecrm (date_create_crm)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

  // Saca una conexión del pool para ejecutar la consulta.
  const conn = await pool.getConnection();
  try {
    await conn.query(ddl);
    if (process.env.USE_IDEMPOTENCY === '1') {
      try {
        await conn.query(
          `ALTER TABLE \`${table}\` ADD UNIQUE KEY uniq_idem (contact_id, date_create_crm)`
        );
      } catch (e) {
        if (![1061, 1022].includes(e.errno)) throw e;
      }
    }
  } finally {
    conn.release();
  }
}

// Construye la consulta SQL para insertar un nuevo lead en la tabla dada.
function buildInsertQuery(table) {
  const cols = [
    'contact_id',
    'nombres',
    'phone',
    'date_create_crm',
    'contact_type',
    'opportunity_name',
    'status',
    'pipleline_stage',
    'pipeline_name',
    'asesor',
    'workflow',
  ].join(', ');

  if (process.env.USE_IDEMPOTENCY === '1') {
    return `INSERT INTO \`${table}\` (${cols}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id),
date_update = CURRENT_TIMESTAMP(6)`;
  }
  return `INSERT INTO \`${table}\` (${cols}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
}

// Exporta funciones para usarlas desde otros módulos
module.exports = { ensureTableExists, buildInsertQuery };
