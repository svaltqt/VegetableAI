// IA/ollama.js
// Cliente HTTP directo para la API REST de Ollama.
// No usa LangChain ni SSH — solo fetch() nativo de Node 18+.
// Mejoras: timeout con AbortController, reintentos automáticos, errores detallados.

import { getConfig } from './config.js';

const CHAT_TIMEOUT_MS = 60_000; // 60s — el modelo puede tardar en generar
const VISION_TIMEOUT_MS = 240_000; // 240s — margen amplio por arranque en frío en CPU
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
      // Solo reintentamos errores de red reales (conexión). Los timeouts
      // (AbortError) son definitivos: reintentar una espera larga solo agrava
      // el "cuelgue".
      const isRetriableNetworkError = err.name === 'TypeError';
      if (!isRetriableNetworkError || attempt === retries) throw err;
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
// Mantener el modelo cargado en memoria entre peticiones para evitar
// "arranques en frío" lentos (principal causa de los timeouts).
const KEEP_ALIVE = '15m';

/** Arma el arreglo de mensajes inyectando el contexto real del usuario. */
function composeMessages(userMessage, history, contextBlock, chatSystemPrompt) {
  const systemContent = contextBlock
    ? `${chatSystemPrompt}\n\n--- CONTEXTO REAL DE LA CUENTA DEL USUARIO (datos verídicos, úsalos para responder con precisión) ---\n${contextBlock}\n--- FIN DEL CONTEXTO ---`
    : chatSystemPrompt;
  return [
    { role: 'system', content: systemContent },
    ...history,
    { role: 'user', content: userMessage },
  ];
}

async function chat(userMessage, history = [], contextBlock = '') {
  const { ollamaHost, ollamaModelChat, chatSystemPrompt } = getConfig();
  const messages = composeMessages(userMessage, history, contextBlock, chatSystemPrompt);

  let res;
  try {
    res = await withRetry(() =>
      fetchWithTimeout(
        `${ollamaHost}/api/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: ollamaModelChat, messages, stream: false, keep_alive: KEEP_ALIVE }),
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
 * Chat en modo STREAMING: emite el texto token por token a medida que el
 * modelo lo genera. Al fluir datos de forma continua se evita el timeout de
 * una sola petición larga (el problema clásico cuando el modelo tarda).
 *
 * @param {string} userMessage
 * @param {Array}  history
 * @param {string} contextBlock
 * @returns {AsyncGenerator<string>} - Fragmentos de texto.
 */
async function* chatStream(userMessage, history = [], contextBlock = '') {
  const { ollamaHost, ollamaModelChat, chatSystemPrompt } = getConfig();
  const messages = composeMessages(userMessage, history, contextBlock, chatSystemPrompt);

  let res;
  try {
    res = await fetch(`${ollamaHost}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Sin AbortController: no cortamos por tiempo; el stream se cierra solo al terminar.
      body: JSON.stringify({ model: ollamaModelChat, messages, stream: true, keep_alive: KEEP_ALIVE }),
    });
  } catch (err) {
    throw new Error(`No se pudo conectar con Ollama en ${ollamaHost}: ${err.message}`);
  }

  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => '(sin cuerpo)');
    throw new Error(`Ollama chat error HTTP ${res.status}: ${body}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let nl;
    while ((nl = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      let json;
      try {
        json = JSON.parse(line);
      } catch {
        continue; // línea parcial / no-JSON
      }
      const token = json.message?.content || '';
      if (token) yield token;
      if (json.done) return;
    }
  }
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
          body: JSON.stringify({ model: ollamaModelVision, messages, stream: false, keep_alive: KEEP_ALIVE }),
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
 * Lectura de fecha OPTIMIZADA para OCR: prompt mínimo + tope de tokens de
 * salida + thinking desactivado. Reduce drásticamente el tiempo de generación
 * frente al prompt de análisis verboso. Devuelve texto crudo (idealmente solo
 * la fecha) del que luego se extrae la fecha con regex.
 */
async function readDateFromImage(base64Image) {
  const { ollamaHost, ollamaModelVision } = getConfig();
  const messages = [
    {
      role: 'user',
      content:
        'Lee la fecha de vencimiento o caducidad impresa en el empaque. Responde ÚNICAMENTE la fecha en formato DD/MM/AAAA, sin explicaciones. Si hay varias, prioriza la de vencimiento (VENCE/CAD/EXP/CONSUMIR ANTES) e ignora la de producción. Si no hay ninguna, responde NINGUNA.',
      images: [base64Image],
    },
  ];

  let res;
  try {
    res = await fetchWithTimeout(
      `${ollamaHost}/api/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModelVision,
          messages,
          stream: false,
          keep_alive: KEEP_ALIVE,
          // num_predict alto: el modelo "razona" ~290 tokens antes de dar la
          // fecha; con un tope bajo cortaría antes y devolvería vacío.
          options: { temperature: 0, num_predict: 500 },
        }),
      },
      VISION_TIMEOUT_MS
    );
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`El análisis de imagen tardó más de ${VISION_TIMEOUT_MS / 1000}s. Intenta de nuevo o usa una foto más nítida.`);
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

export { chat, chatStream, analyzeImage, readDateFromImage, healthCheck };