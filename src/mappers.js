// Normaliza el nombre de la campaña a minúsculas y sin espacios ni caracteres especiales.
function normalizeCampaign(c) {
  if (typeof c !== 'string') return null;
  const n = c.toLowerCase();
  return /^[a-z0-9_]{1,64}$/.test(n) ? n : null;
}

// Convierte una fecha a formato DATETIME(6) de MySQL.
function toMysqlDatetime6(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const micro = String(d.getUTCMilliseconds()).padStart(3, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
        `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${micro}`;
}

// Construye el nombre completo a partir de first_name y last_name, si full_name no está presente.
function buildNombre(body) {
  const full = (body.full_name || '').trim();
  if (full) return full;
  const parts = [body.first_name, body.last_name]
    .filter(Boolean)
    .map(s => String(s).trim())
    .filter(Boolean);
  return parts.length ? parts.join(' ') : null;
}

// Selecciona el valor correcto del campo de etapa del pipeline, considerando posibles variaciones en el nombre.
function pickPipelineStage(body) {
  if (body.pipleline_stage != null) return body.pipleline_stage;
  if (body.pipeline_stage != null) return body.pipeline_stage;
  return null;
}

// Mapea el payload recibido a la estructura esperada por la base de datos.
function mapPayload(body) {
  return {
    contact_id: body.contact_id ?? null,
    nombres: buildNombre(body),
    phone: body.phone ?? null,
    date_create_crm: toMysqlDatetime6(body.date_created ?? body.date_create_crm),
    contact_type: body.contact_type ?? null,
    opportunity_name: body.opportunity_name ?? null,
    status: body.status ?? null,
    pipleline_stage: pickPipelineStage(body),
    pipeline_name: body.pipeline_name ?? null,
    asesor: [body.user?.firstName, body.user?.lastName].map(s => s?.trim()).filter(Boolean).join(' ') || null,
    workflow: body.workflow?.name ?? null,
    // workflow: [body.workflow?.id, body.workflow?.name].map(s => s?.trim()).filter(Boolean).join(' ') || null,
  };
}

// Exporta tres funciones para usarlas desde otros módulos
module.exports = { normalizeCampaign, toMysqlDatetime6, mapPayload };
