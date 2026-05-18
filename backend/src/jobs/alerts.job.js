import cron from 'node-cron';
import { generateAlerts } from '../services/alerts.service.js';

export const initAlertsCron = () => {
  // Ejecutar todos los días a la medianoche (00:00)
  cron.schedule('0 0 * * *', () => {
    console.log('Cron: Iniciando generación de alertas...');
    generateAlerts();
  });

  // También lo ejecutamos al iniciar el servidor para tener alertas actualizadas inmediatamente
  console.log('Cron: Ejecutando generación de alertas inicial...');
  generateAlerts();
};
