// scripts/testLM.js
// Verifica la conexión con Ollama y hace una prueba de chat.
// Uso: node scripts/testLM.js


import { checkConnection, getChatResponse } from '../IA/agent.js';

async function main() {
  console.log('🔧 Verificando conexión con Ollama...');
  console.log(`   Host: ${process.env.OLLAMA_HOST}`);
  console.log(`   Model Chat: ${process.env.OLLAMA_MODEL_CHAT}`);
  console.log(`   Model Vision: ${process.env.OLLAMA_MODEL_VISION}`);
  console.log('');

  // 1. Health check
  const health = await checkConnection();
  if (!health.ok) {
    console.error('❌ No se pudo conectar con Ollama:', health.error);
    console.error('   ¿Está Ollama corriendo en el VPS?');
    console.error('   ¿El puerto 11434 está abierto?');
    process.exit(1);
  }

  console.log('✅ Ollama accesible');
  console.log(`   Modelo Chat solicitado: ${health.modelChat}`);
  console.log(`   Modelo Vision solicitado: ${health.modelVision}`);
  console.log(`   Ambos modelos cargados: ${health.modelsLoaded ? 'Sí' : 'No'}`);
  console.log(`   Modelos disponibles: ${health.availableModels.join(', ')}`);
  console.log('');

  if (!health.modelsLoaded) {
    console.warn('⚠️  Alguno de los modelos no está disponible. Ejecuta en el VPS:');
    console.warn(`   ollama pull ${health.modelChat}`);
    console.warn(`   ollama pull ${health.modelVision}`);
    process.exit(1);
  }

  // 2. Chat test
  console.log('🚀 Enviando mensaje de prueba...');
  try {
    const reply = await getChatResponse('Hola, ¿qué eres?');
    console.log('🤖 Respuesta:', reply);
  } catch (err) {
    console.error('❌ Error en chat:', err.message);
    process.exit(1);
  }

  console.log('');
  console.log('✅ Todo funciona correctamente.');
}

main();
