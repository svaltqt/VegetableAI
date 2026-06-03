// IA/agent.js
// Punto de entrada público del módulo IA.
// Expone funciones de alto nivel: chat, análisis de imagen, health check.

import { chat, analyzeImage, healthCheck } from './ollama.js';
import { extractDate } from './dateExtractor.js';

/**
 * Responde un mensaje del chat.
 * @param {string} message - Mensaje del usuario.
 * @param {Array} history - Historial [{ role, content }].
 * @returns {Promise<string>} - Respuesta del asistente.
 */
async function getChatResponse(message, history = []) {
  return await chat(message, history);
}

import { VISION_ANALYSIS_PROMPT } from './prompts.js';

/**
 * Analiza una imagen y extrae la fecha de vencimiento.
 * @param {Buffer} imageBuffer - Buffer de la imagen.
 * @returns {Promise<{ description: string, date: string|null }>}
 */
async function extractDateFromImage(imageBuffer) {
  const base64 = imageBuffer.toString('base64');
  const description = await analyzeImage(
    base64,
    VISION_ANALYSIS_PROMPT
  );
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

export { getChatResponse, extractDateFromImage, checkConnection };
