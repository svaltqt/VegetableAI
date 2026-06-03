// IA/agent.js
// Punto de entrada público del módulo IA.
// Expone funciones de alto nivel: chat, análisis de imagen, health check.

import { chat, chatStream, analyzeImage, readDateFromImage, healthCheck } from './ollama.js';
import { extractDate } from './dateExtractor.js';

/**
 * Responde un mensaje del chat.
 * @param {string} message - Mensaje del usuario.
 * @param {Array} history - Historial [{ role, content }].
 * @param {string} contextBlock - Contexto real del usuario (nombre + inventario).
 * @returns {Promise<string>} - Respuesta del asistente.
 */
async function getChatResponse(message, history = [], contextBlock = '') {
  return await chat(message, history, contextBlock);
}

/**
 * Versión en streaming: devuelve un generador que emite el texto por tokens.
 * @param {string} message
 * @param {Array} history
 * @param {string} contextBlock
 * @returns {AsyncGenerator<string>}
 */
function getChatStream(message, history = [], contextBlock = '') {
  return chatStream(message, history, contextBlock);
}

import { VISION_ANALYSIS_PROMPT } from './prompts.js';

/**
 * Analiza una imagen y extrae la fecha de vencimiento.
 * @param {Buffer} imageBuffer - Buffer de la imagen.
 * @returns {Promise<{ description: string, date: string|null }>}
 */
async function extractDateFromImage(imageBuffer) {
  const base64 = imageBuffer.toString('base64');
  // Usamos la lectura OPTIMIZADA (prompt mínimo, sin razonamiento) para que sea
  // mucho más rápida que el prompt de análisis verboso.
  const description = await readDateFromImage(base64);
  const date = extractDate(description);
  return { description, date };
}

/**
 * Verifica la conexión con Ollama.
 * @returns {Promise<{ ok: boolean, model?: string, error?: string }>}
 */
async function checkConnection() {
  return await healthCheck();
}

export { getChatResponse, getChatStream, extractDateFromImage, checkConnection };
