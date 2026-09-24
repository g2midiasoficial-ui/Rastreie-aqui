import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';

// Priority models with highest availability and zero 404/quota issues
const ACTIVE_MODELS = ['gemini-3.6-flash', 'gemini-3.7-flash'];

/**
 * Call Gemini API with automatic model failover
 */
async function callGeminiREST(prompt: string, systemInstruction?: string, preferredModel?: string, temperature = 0.7): Promise<string> {
  if (!apiKey) {
    throw new Error('API key not configured on server');
  }

  const modelsToTry = preferredModel && ACTIVE_MODELS.includes(preferredModel)
    ? [preferredModel, ...ACTIVE_MODELS.filter(m => m !== preferredModel)]
    : ACTIVE_MODELS;

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const payload: any = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature
        }
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn(`[Gemini API ${model}] returned status ${response.status}:`, data?.error?.message || data);
        lastError = new Error(data?.error?.message || `HTTP ${response.status}`);
        continue;
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (err: any) {
      console.warn(`[Gemini API ${model}] network error:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models failed to generate response');
}

// Server-side Gemini proxy endpoint
app.post('/api/gemini/generate', async (req, res) => {
  const { prompt, systemInstruction, model, temperature = 0.7 } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const text = await callGeminiREST(prompt, systemInstruction, model, temperature);
    return res.json({ text, success: true });
  } catch (error: any) {
    console.error('Server-side Gemini Error:', error?.message || error);
    return res.json({ 
      error: error?.message || 'Error processing AI request',
      fallback: true 
    });
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
