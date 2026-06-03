import sharp from 'sharp';
import { extractDateFromImage, checkConnection } from '../../../IA/agent.js';

/**
 * Servicio OCR: extrae texto con Tesseract y deduce la FECHA DE VENCIMIENTO.
 *
 * Reglas clave:
 *  - Detecta fechas numéricas con separador (12/04/2026), alfanuméricas
 *    (11 OCT 2017) y COMPACTAS sin separador (28012018 → 28/01/2018).
 *  - Cuando hay varias fechas en el empaque (típico PROD + EXP), se ancla en
 *    palabras clave para quedarse con la de vencimiento y descartar la de
 *    producción/fabricación.
 *  - Devuelve la fecha normalizada en ISO (YYYY-MM-DD) lista para el frontend.
 */

const MONTHS = {
  ENE: 1, JAN: 1, FEB: 2, MAR: 3, ABR: 4, APR: 4, MAY: 5, JUN: 6, JUL: 7,
  AGO: 8, AUG: 8, SEP: 9, SET: 9, OCT: 10, NOV: 11, DIC: 12, DEC: 12,
};

// Etiquetas que indican vencimiento / consumo preferente.
const EXP_KEYWORDS = /(VEN|CAD|EXP|CONS|BEST\s*BEF|USE\s*BY|\bBB\b|ANTES)/;
// Etiquetas que indican producción / fabricación / lote (a descartar).
const PROD_KEYWORDS = /(PROD|FAB|ELAB|MFG|MFD|ENVAS|LOTE)/;

const ALPHA_MONTH = Object.keys(MONTHS).join('|');

/** Construye una fecha ISO (YYYY-MM-DD) validando rangos y existencia real. */
function toIso(day, month, year) {
  if (year < 100) year += 2000;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (year < 2000 || year > 2099) return null;
  const d = new Date(Date.UTC(year, month - 1, day));
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day
  ) {
    return null; // descarta imposibles como 31/02
  }
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Interpreta una secuencia compacta de 6 u 8 dígitos como fecha. */
function parseCompact(digits) {
  if (digits.length === 8) {
    return (
      toIso(+digits.slice(0, 2), +digits.slice(2, 4), +digits.slice(4, 8)) || // DDMMYYYY
      toIso(+digits.slice(6, 8), +digits.slice(4, 6), +digits.slice(0, 4)) || // YYYYMMDD
      toIso(+digits.slice(2, 4), +digits.slice(0, 2), +digits.slice(4, 8))    // MMDDYYYY
    );
  }
  if (digits.length === 6) {
    return (
      toIso(+digits.slice(0, 2), +digits.slice(2, 4), +digits.slice(4, 6)) || // DDMMYY
      toIso(+digits.slice(4, 6), +digits.slice(2, 4), +digits.slice(0, 2))    // YYMMDD
    );
  }
  return null;
}

/** Clasifica un candidato según la etiqueta que lo precede en el texto. */
function classify(text, index) {
  const window = text.slice(Math.max(0, index - 20), index);
  if (EXP_KEYWORDS.test(window)) return 'exp';
  if (PROD_KEYWORDS.test(window)) return 'prod';
  return 'neutral';
}

/** Extrae todas las fechas candidatas del texto con su etiqueta y posición. */
function findCandidates(text) {
  const candidates = [];
  const push = (iso, raw, index) => {
    if (iso) candidates.push({ iso, raw, index, label: classify(text, index) });
  };

  // 1) Numéricas con separador: 12/04/2026, 2026-04-12, 12.04.26
  const numeric = /(\d{1,4})\s*[-/.]\s*(\d{1,2})\s*[-/.]\s*(\d{2,4})/g;
  for (const m of text.matchAll(numeric)) {
    const [g1, g2, g3] = [m[1], m[2], m[3]];
    const iso = g1.length === 4
      ? toIso(+g3, +g2, +g1) // AAAA-MM-DD
      : toIso(+g1, +g2, +g3); // DD-MM-AAAA
    push(iso, m[0], m.index);
  }

  // 2) Alfanuméricas: 11 OCT 2017, 15-ABR-2026, 30 DIC 26
  const alpha = new RegExp(
    `(\\d{1,2})\\s*[-/. ]?\\s*(${ALPHA_MONTH})[A-Z]*\\.?\\s*[-/. ]?\\s*(\\d{2,4})`,
    'gi'
  );
  for (const m of text.matchAll(alpha)) {
    const month = MONTHS[m[2].toUpperCase()];
    push(toIso(+m[1], month, +m[3]), m[0], m.index);
  }

  // 3) Compactas sin separador: 28012018, 280118
  const compact = /\b(\d{8}|\d{6})\b/g;
  for (const m of text.matchAll(compact)) {
    push(parseCompact(m[1]), m[0], m.index);
  }

  return candidates;
}

/** Elige el candidato de fecha más tardío de un grupo (la mayor en ISO). */
function pickLatest(list) {
  return list.reduce((a, b) => (b.iso > a.iso ? b : a));
}

/**
 * Selecciona la fecha de vencimiento entre los candidatos.
 * Prioridad: etiquetadas como vencimiento > sin etiqueta > producción (fallback).
 * Dentro de cada grupo se prefiere la fecha más tardía.
 */
function selectExpiration(candidates) {
  if (!candidates.length) return null;
  const exp = candidates.filter((c) => c.label === 'exp');
  if (exp.length) return pickLatest(exp);
  const neutral = candidates.filter((c) => c.label === 'neutral');
  if (neutral.length) return pickLatest(neutral);
  return pickLatest(candidates); // solo quedan etiquetadas como producción
}

/**
 * Deduce la fecha de vencimiento a partir del texto OCR ya extraído.
 * Pública para pruebas unitarias sin depender de Tesseract.
 * @returns {{ iso: string, raw: string } | null}
 */
export function extractExpirationFromText(text) {
  if (!text) return null;
  const upper = text.toUpperCase();
  const chosen = selectExpiration(findCandidates(upper));
  return chosen ? { iso: chosen.iso, raw: chosen.raw } : null;
}

/**
 * Orienta y reduce la imagen (si es muy grande) para enviarla rápido al
 * modelo de visión sin perder legibilidad. Si algo falla, usa el original.
 */
async function prepareForVision(imageBuffer) {
  try {
    const meta = await sharp(imageBuffer).metadata();
    let pipeline = sharp(imageBuffer).rotate();
    if (meta.width && meta.width > 1600) pipeline = pipeline.resize({ width: 1600 });
    return await pipeline.jpeg({ quality: 90 }).toBuffer();
  } catch {
    return imageBuffer;
  }
}

/**
 * Lee la fecha de vencimiento usando el modelo de VISIÓN (Ollama, multimodal).
 * Reemplaza a Tesseract: es más robusto con sellos dot-matrix, superficies
 * metálicas y etiquetas, y tiene timeout propio (no se queda colgado).
 *
 * @param {Buffer} imageBuffer
 * @returns {Promise<{ rawText: string, extractedDate: string|null, detectedRaw: string|null }>}
 */
export const processOcrImage = async (imageBuffer) => {
  console.log('🔍 OCR por visión (Ollama) inicializado...');

  // Verificación rápida: si Ollama no responde (≤5s), fallamos de inmediato
  // con un mensaje claro en vez de quedarnos colgados esperando.
  const health = await checkConnection();
  if (!health.ok) {
    const err = new Error(
      `El servicio de visión (Ollama) no está disponible: ${health.error || 'sin conexión'}. Verifica OLLAMA_HOST.`
    );
    err.code = 'OLLAMA_UNAVAILABLE';
    throw err;
  }

  const buf = await prepareForVision(imageBuffer);
  const { description, date } = await extractDateFromImage(buf);

  // Normalizamos a ISO y aplicamos la lógica EXP/PROD sobre la salida del modelo.
  const text = [date, description].filter(Boolean).join('\n');
  const chosen = extractExpirationFromText(text);

  return {
    rawText: description || text,
    extractedDate: chosen ? chosen.iso : null,        // ISO YYYY-MM-DD (o null)
    detectedRaw: chosen ? chosen.raw : (date || null), // texto crudo coincidente
  };
};
