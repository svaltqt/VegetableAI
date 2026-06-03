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
      detectedDate: result.extractedDate,
      detectedRaw: result.detectedRaw
    });
  } catch (error) {
    if (error.code === 'OLLAMA_UNAVAILABLE') {
      return res.status(503).json({ error: error.message, code: error.code });
    }
    res.status(500).json({ error: 'Fallo al procesar el OCR.', detail: error.message });
  }
};

/**
 * Lectura con IA en modo ASÍNCRONO (evita que la petición se caiga en esperas
 * largas). El cliente arranca el trabajo, recibe un jobId y luego consulta el
 * estado con peticiones cortas.
 */
const aiJobs = new Map(); // jobId -> { status, result?, error?, code?, ts }
let jobSeq = 0;
const JOB_TTL_MS = 10 * 60 * 1000;

function cleanupJobs() {
  const now = Date.now();
  for (const [id, job] of aiJobs) {
    if (now - job.ts > JOB_TTL_MS) aiJobs.delete(id);
  }
}

// POST /api/ocr/ai  → inicia el trabajo y responde { jobId } al instante.
export const startAiOcr = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se envió ninguna foto' });
  }
  cleanupJobs();
  const jobId = `${Date.now()}-${++jobSeq}`;
  aiJobs.set(jobId, { status: 'pending', ts: Date.now() });

  // Se ejecuta en segundo plano: NO bloqueamos la respuesta.
  processOcrImage(req.file.buffer)
    .then((result) => aiJobs.set(jobId, { status: 'done', result, ts: Date.now() }))
    .catch((err) =>
      aiJobs.set(jobId, { status: 'error', error: err.message, code: err.code, ts: Date.now() })
    );

  return res.status(202).json({ jobId });
};

// GET /api/ocr/ai/:jobId → estado del trabajo.
export const getAiOcr = (req, res) => {
  const job = aiJobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ status: 'error', error: 'Trabajo no encontrado o expirado.' });
  }
  if (job.status === 'pending') return res.json({ status: 'pending' });
  if (job.status === 'error') {
    return res.json({ status: 'error', error: job.error, code: job.code });
  }
  const r = job.result;
  return res.json({
    status: 'done',
    success: true,
    textExtracted: r.rawText,
    detectedDate: r.extractedDate,
    detectedRaw: r.detectedRaw,
  });
};
