// Middleware para verificar API Key y Content-Type JSON.
function requireApiKey(req, res, next) {
  const expected = process.env.API_KEY;
  if (!expected) return res.status(500).json({ ok: false, error: 'No se ha configurado la API_KEY' });
  if (req.get('X-API-Key') !== expected) {
    return res.status(401).json({ ok: false, error: 'No autorizado' });
  }
  next();
}

// Middleware para verificar que el Content-Type sea application/json.
function requireJson(req, res, next) {
  if (!(req.is('application/json') || req.is('*/json'))) {
    return res.status(400).json({ ok: false, error: 'Se requiere Content-Type: application/json' });
  }
  next();
}

// Exporta funciones para usarlas desde otros módulos.
module.exports = { requireApiKey, requireJson };
