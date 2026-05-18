import { getAlerts, updateAlertStatus, markAllSeen } from '../services/alerts.service.js';

export const listAlerts = async (req, res) => {
  try {
    const alerts = await getAlerts(req.user.id);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const patchAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['vista', 'descartada'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const updatedAlert = await updateAlertStatus(req.user.id, id, status);
    res.json(updatedAlert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const postSeenAll = async (req, res) => {
  try {
    const updatedAlerts = await markAllSeen(req.user.id);
    res.json({ ok: true, updated: updatedAlerts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
