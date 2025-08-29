require('dotenv').config();
const express = require('express');
const { requireApiKey, requireJson } = require('./src/middleware');
const webhookRouter = require('./src/routes/webhook');

// Crea la app de Express.
const app = express();

// Middleware para parsear JSON y manejar errores de JSON inválido.
app.use(express.json());

// Middleware para manejar errores de JSON inválido
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ ok: false, error: 'JSON inválido' });
  }
  return next(err);
});

// Ruta para el webhook, protegida con API Key y que requiere JSON.
app.use('/webhook', requireApiKey, requireJson, webhookRouter);

// Middleware de manejo de errores genéricos.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: 'Error interno' });
});

// determina el puerto y arranca el servidor.
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => console.log(`Webhook en :${PORT}`));
