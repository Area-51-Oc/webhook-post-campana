const router = require('express').Router();
const { pool } = require('../db');
const { ensureTableExists, buildInsertQuery } = require('../schema');
const { normalizeCampaign, mapPayload } = require('../mappers');

// Maneja las solicitudes POST al webhook.
router.post('/:campana', async (req, res, next) => {
  try {
    const norm = normalizeCampaign(req.params.campana);
    if (!norm) {
      return res.status(400).json({ ok: false, error: 'Campaña inválida' });
    }
    const table = `leads_${norm}`;

    await ensureTableExists(table);

    const m = mapPayload(req.body);
    const sql = buildInsertQuery(table);
    const params = [
      m.contact_id,
      m.nombres,
      m.phone,
      m.date_create_crm,
      m.contact_type,
      m.opportunity_name,
      m.status,
      m.pipleline_stage,
      m.pipeline_name,
      m.asesor,
      m.workflow,
    ];

    const [result] = await pool.execute(sql, params);
    const id = result.insertId || null;

    console.log(`[webhook] tabla=${table} id=${id} affectedRows=${result.affectedRows}`);
    return res.json({ ok: true, table, id });
  } catch (e) {
    console.error('[webhook][error]', e);
    return next(e);
  }
});

// Exporta el router para usarlo en server.js.
module.exports = router;
