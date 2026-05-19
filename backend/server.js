import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importación Rutas Modulares
import ocrRoutes from './src/routes/ocr.routes.js';
import inventoryRoutes from './src/routes/inventory.routes.js';
import usersRoutes from './src/routes/users.routes.js';
import alertsRoutes from './src/routes/alerts.routes.js';
import notificationsRoutes from './src/routes/notifications.routes.js';

// Importación de Cron Jobs
import { initAlertsCron } from './src/jobs/alerts.job.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Montaje N-Capas
app.use('/api/ocr', ocrRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/notifications', notificationsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 VegetableAI App viva en puerto ${PORT}`);
  
  // Iniciar Cron Jobs
  initAlertsCron();
});
