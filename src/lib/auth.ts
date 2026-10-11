import type { AuthError, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: string;
  role: 'admin' | 'user';
  plan: string;
  status: string;
  isGuest?: boolean;
}

export const SESSION_STORAGE_KEY = 'gerenciie_user_session';

export function saveUserSession(user: AppUser | null) {
  try {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('Local storage write error:', e);
  }
}

/** Monta o usuário do app a partir do login do Supabase + perfil (papel e plano vêm do banco). */
export async function loadAppUser(user: User): Promise<AppUser> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('display_name, photo_url, provider, role, plan, status')
    .eq('id', user.id)
    .maybeSingle();

  if (error) console.warn('Erro ao carregar perfil:', error.message);

  return {
    uid: user.id,
    email: user.email || '',
    displayName:
      profile?.display_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Usuário',
    photoURL: profile?.photo_url || user.user_metadata?.avatar_url || undefined,
    provider: profile?.provider || user.app_metadata?.provider || 'email',
    role: profile?.role === 'admin' ? 'admin' : 'user',
    plan: profile?.plan || 'free',
    status: profile?.status || 'active',
  };
}

export class AuthMessageError extends Error {}

function translateAuthError(err: AuthError | Error): string {
  const code = (err as AuthError).code;
  switch (code) {
    case 'invalid_credentials':
      return 'E-mail ou senha incorretos. Se você criou a conta com o Google, use o botão "Entrar com Google".';
    case 'email_not_confirmed':
      return 'Confirme seu e-mail pelo link que enviamos antes de entrar.';
    case 'user_already_exists':
    case 'email_exists':
      return 'Este e-mail já está cadastrado. Alterne para o modo de Login.';
    case 'weak_password':
      return 'A senha informada é fraca. Utilize pelo menos 6 caracteres.';
    case 'validation_failed':
    case 'email_address_invalid':
      return 'O formato do e-mail inserido é inválido.';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
    default:
      return err.message || 'Ocorreu um erro ao entrar.';
  }
}

export type EmailAuthResult =
  | { status: 'signed_in'; user: AppUser }
  | { status: 'confirm_email' };

/** Login ou cadastro por e-mail e senha. Lança AuthMessageError com mensagem em português. */
export async function authenticateWithEmail(
  mode: 'login' | 'register',
  email: string,
  password: string,
  name?: string
): Promise<EmailAuthResult> {
  const cleanEmail = email.trim();
  if (!cleanEmail || !password) {
    throw new AuthMessageError('Por favor, informe seu e-mail e senha.');
  }
  if (password.length < 6) {
    throw new AuthMessageError('A senha deve conter no mínimo 6 caracteres.');
  }

  if (mode === 'register') {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: name?.trim() ? { full_name: name.trim() } : undefined,
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw new AuthMessageError(translateAuthError(error));
    // Sem sessão = o projeto exige confirmação por e-mail
    if (!data.session || !data.user) return { status: 'confirm_email' };
    return { status: 'signed_in', user: await loadAppUser(data.user) };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
  if (error) throw new AuthMessageError(translateAuthError(error));
  return { status: 'signed_in', user: await loadAppUser(data.user) };
}

const OAUTH_REDIRECT_FLAG = 'gerenciie_oauth_pending';

/** Retorna true (uma única vez) se o usuário acabou de voltar do login do Google. */
export function consumeOAuthRedirectFlag(): boolean {
  try {
    const pending = localStorage.getItem(OAUTH_REDIRECT_FLAG) === '1';
    localStorage.removeItem(OAUTH_REDIRECT_FLAG);
    return pending;
  } catch {
    return false;
  }
}

/** Redireciona para o login do Google; ao voltar, a sessão é detectada pelo listener do App. */
export async function signInWithGoogle(): Promise<void> {
  try {
    localStorage.setItem(OAUTH_REDIRECT_FLAG, '1');
  } catch {
    // sem localStorage: o usuário só cai na landing page após o login
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) {
    throw new AuthMessageError(`Não foi possível autenticar com o Google: ${error.message}`);
  }
}

export async function signOutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) console.warn('Logout notice:', error.message);
  saveUserSession(null);
  localStorage.removeItem('gerenciie_admin_unlocked');
}

/** Acesso de demonstração: dados ficam só no navegador, nada é gravado no banco. */
export function createGuestUser(displayName: string, email: string): AppUser {
  return {
    uid: 'guest_' + Math.random().toString(36).substring(2, 9),
    email,
    displayName,
    provider: 'quick_access',
    role: 'user',
    plan: 'free',
    status: 'active',
    isGuest: true,
  };
}
