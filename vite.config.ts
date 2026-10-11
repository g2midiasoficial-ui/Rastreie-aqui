import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { handleGeminiRequest, readProxyEnv, ProxyEnv } from './server/geminiProxy';

// Em desenvolvimento, atende /api/gemini/generate com o mesmo proxy usado em produção.
// A chave do Gemini nunca vai para o navegador.
function geminiApiPlugin(env: ProxyEnv): Plugin {
  return {
    name: 'gemini-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/gemini/generate', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method Not Allowed');
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          let result;
          try {
            result = await handleGeminiRequest(req.headers.authorization, JSON.parse(body || '{}'), env);
          } catch (err: any) {
            result = { status: 400, body: { error: err?.message || 'Requisição inválida' } };
          }
          res.statusCode = result.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result.body));
        });
      });
    }
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [tailwindcss(), react(), geminiApiPlugin(readProxyEnv({ ...process.env, ...env }))],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
