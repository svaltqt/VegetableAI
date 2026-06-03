// backend/src/routes/chat.routes.js
import { Router } from 'express';
import { getChatResponse, checkConnection } from '../../../IA/agent.js';

const router = Router();

/**
 * POST /api/chat
 * Body: { message: string, history?: [{ role, content }] }
 * Response: { reply: string }
 */
router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'El campo "message" es requerido.' });
    }

    const reply = await getChatResponse(message, history || []);
    return res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err.message);
    return res.status(500).json({ error: 'Error al generar respuesta del chat.', details: err.message });
  }
});

/**
 * GET /api/chat/health
 * Verifica la conexión con Ollama.
 * Response: { ok, model, modelLoaded, availableModels } | { ok: false, error }
 */
router.get('/health', async (_req, res) => {
  try {
    const status = await checkConnection();
    return res.json(status);
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
