import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import authRouter from './server/routes/auth';
import projectsRouter from './server/routes/projects';
import toolsRouter from './server/routes/tools';
import adminRouter from './server/routes/admin';

dotenv.config();

const app = express();
const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Body parsing with safe size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for IP rate limiting behind Cloud Run / Applet ingress
app.set('trust proxy', 1);

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api', toolsRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'GiveMePOD Core Engine'
  });
});

async function startServer() {
  if (!isProduction) {
    // Development mode: mount Vite dev server middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('[GiveMePOD] Vite dev middleware mounted.');
  } else {
    // Production mode: serve static files from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[GiveMePOD] Serving production static files.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GiveMePOD] Production SaaS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[GiveMePOD] Fatal server startup error:', err);
  process.exit(1);
});
