import Tesseract from 'tesseract.js';

export const processOcrImage = async (imageBuffer) => {
  console.log('🤖 Escaneo Tesseract JS inicializado...');
  const { data: { text } } = await Tesseract.recognize(imageBuffer, 'spa', {
    logger: () => {} // Evitamos flooding de consola
  });

  // Soporte expandido: Fechas numéricas (DD/MM/YYYY) y Alfanuméricas (DD MES YYYY ej. 11 OCT 2017)
  const combinedRegex = /(0[1-9]|[12][0-9]|3[01])[- \/.](0[1-9]|1[012])[- \/.](19|20)\d\d|\b(0[1-9]|[12][0-9]|3[01])[- \/.](0[1-9]|1[012])[- \/.]\d\d\b|([0-3]?[0-9])[- \/.](ENE|FEB|MAR|ABR|MAY|JUN|JUL|AGO|SEP|OCT|NOV|DIC|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*[- \/.](\d{2,4})/i;
  
  const dateMatch = text.match(combinedRegex);

  return {
    rawText: text,
    extractedDate: dateMatch ? dateMatch[0] : null
  };
};
