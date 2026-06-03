// backend/src/routes/chat.routes.js
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { handleChat, handleChatStream } from '../controllers/chat.controller.js';
import { checkConnection } from '../../../IA/agent.js';

const router = Router();

/**
 * POST /api/chat  (autenticado)
 * Body: { message: string, history?: [{ role, content }] }
 * Response: { reply: string }
 *
 * El asistente recibe el inventario real y el nombre del usuario autenticado.
 */
router.post('/', authenticate, handleChat);

/**
 * POST /api/chat/stream  (autenticado)
 * Respuesta en streaming (SSE) token por token. Evita timeouts.
 */
router.post('/stream', authenticate, handleChatStream);

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
