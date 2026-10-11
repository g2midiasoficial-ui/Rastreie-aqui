// Função serverless da Vercel: POST /api/gemini/generate
import { handleGeminiRequest, readProxyEnv } from '../../server/geminiProxy';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
  const result = await handleGeminiRequest(req.headers.authorization, body, readProxyEnv());
  return res.status(result.status).json(result.body);
}
