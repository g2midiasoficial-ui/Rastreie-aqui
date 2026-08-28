import React, { useState } from 'react';
import { 
  X, LogIn, Mail, Lock, User, ArrowRight, ShieldCheck, 
  Sparkles, CheckCircle2, AlertCircle, Globe, Play
} from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData?: any) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      onSuccess(result.user);
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login com Google cancelado.');
      } else {
        // Fallback gracioso para visualização
        setError('Erro ao autenticar com Google. Você também pode entrar no modo Demonstração.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'register') {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim() && userCred.user) {
          await updateProfile(userCred.user, { displayName: name.trim() });
        }
        onSuccess(userCred.user);
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        onSuccess(userCred.user);
      }
      onClose();
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está cadastrado. Tente fazer login.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve conter no mínimo 6 caracteres.');
      } else {
        setError(err.message || 'Erro ao processar autenticação.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    onSuccess({
      displayName: 'Lojista Convidado',
      email: 'demo@gerenciie.com',
      isGuest: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 p-7 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-all"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xs">
              <Globe size={18} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 block">
                Gerenciie Pro Platform
              </span>
              <h3 className="text-xl font-black tracking-tight">
                {mode === 'login' ? 'Entrar na Plataforma' : 'Criar Conta de Acesso'}
              </h3>
            </div>
          </div>
          <p className="text-blue-100 text-xs mt-1">
            {mode === 'login' 
              ? 'Acesse seu dashboard financeiro, bússola de KPIs e métricas de escala.'
              : 'Comece a precificar e gerenciar o lucro real do seu e-commerce.'}
          </p>
        </div>

        <div className="p-7 space-y-5">
          {/* Alternador de Modo Login / Cadastro */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`py-2 text-xs font-black rounded-xl transition-all ${
                mode === 'login' 
                  ? 'bg-white text-black shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Entrar (Login)
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`py-2 text-xs font-black rounded-xl transition-all ${
                mode === 'register' 
                  ? 'bg-white text-black shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-bold animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Botão Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-slate-800 text-xs font-black flex items-center justify-center gap-3 transition-all hover:shadow-xs active:scale-[0.99] disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{loading ? 'Conectando...' : 'Continuar com Google'}</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] font-black uppercase text-slate-400">ou com e-mail</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Formulário de E-mail / Senha */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                  Seu Nome ou Nome da Loja
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lucas Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs font-bold p-3 pl-9 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <User size={15} className="absolute left-3 top-3.5 text-slate-400" />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                E-mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="seuemail@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs font-bold p-3 pl-9 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
                <Mail size={15} className="absolute left-3 top-3.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs font-bold p-3 pl-9 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
                <Lock size={15} className="absolute left-3 top-3.5 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                'Processando...'
              ) : mode === 'login' ? (
                <>
                  <LogIn size={15} /> Entrar na Minha Conta
                </>
              ) : (
                <>
                  <Sparkles size={15} /> Criar Conta Grátis
                </>
              )}
            </button>
          </form>

          {/* Botão de Demonstração Rápida */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleGuestAccess}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <Play size={13} className="text-blue-600 fill-blue-600" />
              Testar Plataforma (Acesso Convidado)
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Ambiente 100% Seguro com Criptografia SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
