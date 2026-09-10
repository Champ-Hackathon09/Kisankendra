import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import authRoutes from './routes/auth.routes.js';
import centreRoutes from './routes/centre.routes.js';
import tokenRoutes from './routes/token.routes.js';
import queueRoutes from './routes/queue.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/centres', centreRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/queue', queueRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'KisanKendra API is running' });
});

// Serve crop images statically from frontend/public/crops
const publicCropsPath = path.resolve(__dirname, '../../frontend/public/crops');
if (fs.existsSync(publicCropsPath)) {
  app.use('/crops', express.static(publicCropsPath));
}

// Serve frontend dist build if present
const distPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
} else {
  const apiIndexHandler = (req, res) => {
    res.json({
      success: true,
      name: 'KisanKendra Backend API Server',
      version: '1.0.0',
      status: 'ONLINE',
      database: 'SQLite (prisma/dev.db)',
      frontendUrl: 'http://localhost:5173',
      message: 'KisanKendra API is live and fully operational!',
    });
  };
  app.get('/', apiIndexHandler);
  app.get('/api', apiIndexHandler);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`KisanKendra Server running on port ${PORT}`);
});

