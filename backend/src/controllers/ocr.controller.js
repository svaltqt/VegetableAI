import { processOcrImage } from '../services/ocr.service.js';

export const handleOcrUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ninguna foto' });
    }

    const result = await processOcrImage(req.file.buffer);
    
    res.json({ 
      success: true, 
      textExtracted: result.rawText, 
      detectedDate: result.extractedDate 
    });
  } catch (error) {
    res.status(500).json({ error: 'Fallo al procesar el OCR.', detail: error.message });
  }
};
