import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function geminiApiPlugin(apiKey: string): Plugin {
  return {
    name: 'gemini-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/gemini/generate', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method Not Allowed');
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const { prompt, systemInstruction, model = 'gemini-3.6-flash', temperature = 0.7 } = JSON.parse(body || '{}');
            const key = apiKey || process.env.GEMINI_API_KEY || process.env.API_KEY || '';
            
            const modelsToTry = [model, 'gemini-3.6-flash', 'gemini-3.7-flash'];
            let text = null;
            let lastErr = null;

            for (const m of modelsToTry) {
              try {
                const payload: any = {
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: { temperature }
                };
                if (systemInstruction) {
                  payload.systemInstruction = { parts: [{ text: systemInstruction }] };
                }
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                const data = await response.json();
                if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                  text = data.candidates[0].content.parts[0].text;
                  break;
                }
              } catch (e: any) {
                lastErr = e;
              }
            }

            res.setHeader('Content-Type', 'application/json');
            if (text) {
              res.end(JSON.stringify({ text, success: true }));
            } else {
              res.end(JSON.stringify({ error: lastErr?.message || 'Gemini generation error', fallback: true }));
            }
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message, fallback: true }));
          }
        });
      });
    }
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const apiKey = env.GEMINI_API_KEY || env.API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY || '';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [tailwindcss(), react(), geminiApiPlugin(apiKey)],
      define: {
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
