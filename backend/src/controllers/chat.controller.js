import { getChatResponse, getChatStream } from '../../../IA/agent.js';
import { buildUserChatContext } from '../services/chat.service.js';

/** Normaliza y recorta el historial recibido del cliente. */
function sanitizeHistory(history) {
  return Array.isArray(history)
    ? history
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }))
    : [];
}

/**
 * POST /api/chat  (requiere autenticación)
 * Body: { message: string, history?: [{ role, content }] }
 *
 * Inyecta el contexto real del usuario (nombre + inventario) antes de
 * consultar al modelo, para que el asistente responda con datos concretos.
 */
export const handleChat = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'El campo "message" es requerido.' });
    }

    const { contextBlock } = await buildUserChatContext(req.user.id);
    const reply = await getChatResponse(message, sanitizeHistory(history), contextBlock);
    return res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err.message);
    return res
      .status(500)
      .json({ error: 'Error al generar respuesta del chat.', details: err.message });
  }
};

/**
 * POST /api/chat/stream  (autenticado) — respuesta por Server-Sent Events.
 *
 * Emite eventos `data: { token }` a medida que el modelo genera texto, un
 * `event: done` al terminar y `event: error` si algo falla. Al fluir datos de
 * forma continua se evita el timeout de una petición larga.
 */
export const handleChatStream = async (req, res) => {
  const { message, history } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'El campo "message" es requerido.' });
  }

  // Cabeceras SSE. X-Accel-Buffering desactiva el buffering de Nginx.
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // Latido cada 15s: mantiene viva la conexión mientras el modelo "arranca".
  const heartbeat = setInterval(() => res.write(': keep-alive\n\n'), 15000);
  let closed = false;
  const cleanup = () => {
    if (closed) return;
    closed = true;
    clearInterval(heartbeat);
  };
  req.on('close', cleanup);

  try {
    const { contextBlock } = await buildUserChatContext(req.user.id);
    for await (const token of getChatStream(message, sanitizeHistory(history), contextBlock)) {
      if (closed) break;
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }
    if (!closed) res.write('event: done\ndata: {}\n\n');
  } catch (err) {
    console.error('Chat stream error:', err.message);
    if (!closed) res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
  } finally {
    cleanup();
    res.end();
  }
};
