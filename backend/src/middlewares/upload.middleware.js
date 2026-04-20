import multer from 'multer';

// Multer configurado para procesar arrays de bytes y buffers sin guardarlos en disco.
export const upload = multer({ storage: multer.memoryStorage() });
