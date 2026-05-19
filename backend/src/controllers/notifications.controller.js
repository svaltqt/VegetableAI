import { saveSubscription, removeSubscription } from '../services/notifications.service.js';

export const postSubscribe = async (req, res) => {
  try {
    const result = await saveSubscription(req.user.id, req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body; // Depende de cómo lo envíe el frontend, el mock actual elimina por ID, pero el service worker borra la url
    // Para simplificar, en realidad el frontend no manda payload en el DELETE.
    // Lo ideal es que el frontend envíe el endpoint en el body del DELETE. 
    res.json({ ok: true, message: 'Implementación básica sin endpoint (por terminar)' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
