// IA/config.js
// Configuración centralizada del módulo IA.
// Lee variables de entorno del .env del backend (ya cargado por dotenv).
import { CHAT_SYSTEM_PROMPT } from './prompts.js';

function getConfig() {
  return {
    ollamaHost: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
    ollamaModelChat: process.env.OLLAMA_MODEL_CHAT || 'qwen2.5:7b',
    ollamaModelVision: process.env.OLLAMA_MODEL_VISION || 'qwen3-vl:4b',
    chatSystemPrompt: CHAT_SYSTEM_PROMPT,
  };
}

export { getConfig };
