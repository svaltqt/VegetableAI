// IA/ollama.js
// Cliente HTTP directo para la API REST de Ollama.
// No usa LangChain ni SSH — solo fetch() nativo de Node 18+.
// Mejoras: timeout con AbortController, reintentos automáticos, errores detallados.

import { getConfig } from './config.js';

const CHAT_TIMEOUT_MS = 60_000; // 60s — el modelo puede tardar en generar
const VISION_TIMEOUT_MS = 90_000; // 90s — imágenes son más pesadas
const HEALTH_TIMEOUT_MS = 5_000;  // 5s  — health check debe ser rápido
const MAX_RETRIES = 2;      // reintentos ante fallo de red (no errores HTTP)

/**
 * Hace un fetch con timeout vía AbortController.
 */
async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Wrapper con reintentos para errores de red.
 * No reintenta errores HTTP 4xx/5xx — esos son definitivos.
 */
async function withRetry(fn, retries = MAX_RETRIES) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isNetworkError = err.name === 'AbortError' || err.name === 'TypeError';
      if (!isNetworkError || attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw lastError;
}

/**
 * Envía un mensaje de chat al modelo de Ollama.
 *
 * @param {string} userMessage      - Mensaje del usuario.
 * @param {Array}  history          - Historial [{ role, content }].
 * @param {string} inventoryContext - Productos del usuario (texto plano).
 * @returns {Promise<string>}
 */
async function chat(userMessage, history = [], inventoryContext = '') {
  const { ollamaHost, ollamaModelChat, chatSystemPrompt } = getConfig();

  // Inyectar el inventario al final del system prompt si existe
  const systemContent = inventoryContext
    ? `${chatSystemPrompt}\n\nINVENTARIO ACTUAL DEL USUARIO:\n${inventoryContext}\n\nUsá esta información para dar consejos específicos sobre sus productos cuando sea relevante.`
    : chatSystemPrompt;

  const messages = [
    { role: 'system', content: systemContent },
    ...history,
    { role: 'user', content: userMessage },
  ];

  let res;
  try {
    res = await withRetry(() =>
      fetchWithTimeout(
        `${ollamaHost}/api/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: ollamaModelChat, messages, stream: false }),
        },
        CHAT_TIMEOUT_MS
      )
    );
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`El modelo tardó más de ${CHAT_TIMEOUT_MS / 1000}s en responder. El VPS puede estar cargando el modelo — intentá de nuevo en unos segundos.`);
    }
    throw new Error(`No se pudo conectar con Ollama en ${ollamaHost}: ${err.message}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '(sin cuerpo)');
    throw new Error(`Ollama chat error HTTP ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.message?.content?.trim() || '';
}

/**
 * Analiza una imagen usando el modelo multimodal.
 */
async function analyzeImage(
  base64Image,
  prompt = 'Analiza esta imagen y describe lo que ves. Si hay una fecha de vencimiento, indícala.'
) {
  const { ollamaHost, ollamaModelVision } = getConfig();

  const messages = [
    {
      role: 'user',
      content: prompt,
      images: [base64Image],
    },
  ];

  let res;
  try {
    res = await withRetry(() =>
      fetchWithTimeout(
        `${ollamaHost}/api/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: ollamaModelVision, messages, stream: false }),
        },
        VISION_TIMEOUT_MS
      )
    );
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`El análisis de imagen tardó más de ${VISION_TIMEOUT_MS / 1000}s. Intentá con una imagen más pequeña o esperá que el modelo cargue.`);
    }
    throw new Error(`No se pudo conectar con Ollama (visión) en ${ollamaHost}: ${err.message}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '(sin cuerpo)');
    throw new Error(`Ollama vision error HTTP ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.message?.content?.trim() || '';
}

/**
 * Verifica que Ollama esté accesible y que los modelos estén disponibles.
 */
async function healthCheck() {
  const { ollamaHost, ollamaModelChat, ollamaModelVision } = getConfig();

  try {
    const res = await fetchWithTimeout(
      `${ollamaHost}/api/tags`,
      { method: 'GET' },
      HEALTH_TIMEOUT_MS
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const models = data.models || [];

    const chatFound = models.some((m) => m.name === ollamaModelChat || m.name.startsWith(ollamaModelChat));
    const visionFound = models.some((m) => m.name === ollamaModelVision || m.name.startsWith(ollamaModelVision));

    return {
      ok: true,
      modelChat: ollamaModelChat,
      modelVision: ollamaModelVision,
      modelsLoaded: chatFound && visionFound,
      chatFound,
      visionFound,
      availableModels: models.map((m) => m.name),
    };
  } catch (err) {
    return {
      ok: false,
      error: err.name === 'AbortError'
        ? `Ollama no respondió en ${HEALTH_TIMEOUT_MS / 1000}s — ¿está corriendo el servicio?`
        : err.message,
    };
  }
}

export { chat, analyzeImage, healthCheck };