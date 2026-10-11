import express from 'express';
import { createServer as createViteServer } from 'vite';
import { handleGeminiRequest, readProxyEnv } from './server/geminiProxy';

// Carrega .env.local/.env quando rodando fora da Vercel (npm start)
for (const file of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(file);
  } catch {
    // arquivo ausente
  }
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const proxyEnv = readProxyEnv();

// Sem CORS: o front-end é servido por este mesmo servidor
app.use(express.json({ limit: '1mb' }));

// Server-side Gemini proxy endpoint (exige login no Supabase)
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const result = await handleGeminiRequest(req.headers.authorization, req.body, proxyEnv);
    return res.status(result.status).json(result.body);
  } catch (error: any) {
    console.error('Server-side Gemini Error:', error?.message || error);
    return res.status(500).json({ error: 'Error processing AI request' });
  }
});

// Vite middleware for dev or static serving for prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server ready on http://0.0.0.0:${PORT}`);
  });
}

startServer();
