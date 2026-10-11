// Proxy do Gemini usado pelo dev server (vite.config.ts), pelo servidor Express (server.ts)
// e pela função serverless da Vercel (api/gemini/generate.ts).
// A chave do Gemini fica só no servidor; só usuários logados no Supabase podem chamar.

const DEFAULT_MODELS = ['gemini-3.6-flash', 'gemini-3.7-flash'];
const MAX_PROMPT_CHARS = 400_000;

export interface ProxyEnv {
  geminiApiKey?: string;
  geminiModels?: string; // lista separada por vírgula, ex.: "gemini-3.6-flash,gemini-3.7-flash"
  supabaseUrl?: string;
  supabaseKey?: string;
}

export interface ProxyResult {
  status: number;
  body: Record<string, any>;
}

export function readProxyEnv(env: Record<string, string | undefined> = process.env): ProxyEnv {
  return {
    geminiApiKey: env.GEMINI_API_KEY || env.API_KEY,
    geminiModels: env.GEMINI_MODELS,
    supabaseUrl: env.VITE_SUPABASE_URL || env.SUPABASE_URL,
    supabaseKey: env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY,
  };
}

/** Confere o token de sessão do Supabase chamando /auth/v1/user. */
async function isAuthenticated(authorization: string | undefined, env: ProxyEnv): Promise<boolean> {
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token || !env.supabaseUrl || !env.supabaseKey) return false;
  try {
    const res = await fetch(`${env.supabaseUrl}/auth/v1/user`, {
      headers: { apikey: env.supabaseKey, Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function handleGeminiRequest(
  authorization: string | undefined,
  body: any,
  env: ProxyEnv
): Promise<ProxyResult> {
  if (!(await isAuthenticated(authorization, env))) {
    return { status: 401, body: { error: 'Faça login para usar o agente de IA.' } };
  }
  if (!env.geminiApiKey) {
    return { status: 503, body: { error: 'Chave do Gemini não configurada no servidor (GEMINI_API_KEY).' } };
  }

  const { prompt, systemInstruction, model, temperature = 0.7 } = body || {};
  if (typeof prompt !== 'string' || !prompt.trim()) {
    return { status: 400, body: { error: 'Prompt is required' } };
  }
  if (prompt.length + (systemInstruction?.length || 0) > MAX_PROMPT_CHARS) {
    return { status: 413, body: { error: 'Mensagem muito longa.' } };
  }

  const configured = env.geminiModels?.split(',').map(m => m.trim()).filter(Boolean);
  const allowed = configured?.length ? configured : DEFAULT_MODELS;
  const modelsToTry = typeof model === 'string' && allowed.includes(model)
    ? [model, ...allowed.filter(m => m !== model)]
    : allowed;

  let lastError = 'All Gemini models failed to generate response';

  for (const m of modelsToTry) {
    try {
      const payload: any = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: Number(temperature) || 0.7 },
      };
      if (typeof systemInstruction === 'string' && systemInstruction) {
        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.geminiApiKey },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        lastError = data?.error?.message || `HTTP ${response.status}`;
        console.warn(`[Gemini API ${m}] returned status ${response.status}:`, lastError);
        continue;
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return { status: 200, body: { text, success: true, model: m } };
    } catch (err: any) {
      lastError = err?.message || String(err);
      console.warn(`[Gemini API ${m}] network error:`, lastError);
    }
  }

  return { status: 502, body: { error: lastError } };
}
