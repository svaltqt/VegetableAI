import Tesseract from 'tesseract.js';

export const processOcrImage = async (imageBuffer) => {
  console.log('🤖 Escaneo Tesseract JS inicializado...');

  const { data: { text } } = await Tesseract.recognize(imageBuffer, 'spa', {
    logger: () => {} // Evitamos flooding de consola
  });

  // Limpieza básica del texto OCR
  const cleanText = text
    .toUpperCase()
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Regex ampliado para productos colombianos:
  // Soporta:
  // DD/MM/YYYY, DD/MM/YY, DD-MM-YYYY
  // DD MES YYYY, DD MES YY
  // MM/YYYY, MM/YY
  // MES YYYY, MES YY
  // YYYY/MM, YYYY-MM
  // Con palabras como VENCE, FV, VTO, EXP, CAD, etc.
  const combinedRegex =
    /(?:\b(?:VENCE|VENCIMIENTO|FECHA DE VENCIMIENTO|F\.?\s?V\.?|FV|VTO|VEN|EXP|EXPIRA|EXPIRY|CAD|CADUCIDAD|CONSUMIR ANTES DE|CONSUMASE ANTES DE|CONSUMIR PREFERENTEMENTE ANTES DE)\b[:\s]*)?\b((?:0?[1-9]|[12][0-9]|3[01])[-\s/.](?:0?[1-9]|1[0-2])[-\s/.](?:19|20)?\d{2}|(?:0?[1-9]|[12][0-9]|3[01])[-\s/.](?:ENE|FEB|MAR|ABR|MAY|JUN|JUL|AGO|SEP|OCT|NOV|DIC|JAN|APR|AUG|DEC)[A-Z]*[-\s/.](?:19|20)?\d{2}|(?:0?[1-9]|1[0-2])[-\s/.](?:19|20)?\d{2}|(?:ENE|FEB|MAR|ABR|MAY|JUN|JUL|AGO|SEP|OCT|NOV|DIC|JAN|APR|AUG|DEC)[A-Z]*[-\s/.](?:19|20)?\d{2}|(?:19|20)\d{2}[-\s/.](?:0?[1-9]|1[0-2]))\b/i;

  const dateMatch = cleanText.match(combinedRegex);

  return {
    rawText: text,
    cleanText,
    extractedDate: dateMatch ? dateMatch[1] : null
  };
};
