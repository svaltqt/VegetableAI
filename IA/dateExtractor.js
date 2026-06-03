// IA/dateExtractor.js
// Extrae fechas de vencimiento de texto usando regex.
// Formatos soportados: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD,
// "13 OCT 2024", "13 de Octubre de 2024"

const patterns = [
  // 01/12/2024 o 1/2/24
  /\b(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[0-2])[\/\-](\d{2}|\d{4})\b/,
  // 2024-12-01
  /\b(\d{4})[\/\-](0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12][0-9]|3[01])\b/,
  // 13 OCT 2024 / 13 oct 2024 (abreviaturas ES/EN)
  /\b(0?[1-9]|[12][0-9]|3[01])\s?(de\s)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s?(de\s)?(\d{4})\b/i,
];

/**
 * Busca la primera fecha de vencimiento en un texto.
 * @param {string} text - Texto donde buscar.
 * @returns {string|null} - La fecha encontrada o null.
 */
function extractDate(text) {
  if (!text) return null;
  const normalized = text.replace(/\s+/g, ' ').trim();

  for (const pattern of patterns) {
    const match = pattern.exec(normalized);
    if (match) return match[0];
  }

  return null;
}

export { extractDate };
