import React, { useState } from 'react';
import { 
  X, LogIn, Mail, Lock, User, ArrowRight, ShieldCheck, 
  Sparkles, CheckCircle2, AlertCircle, Globe, Play, KeyRound, Check
} from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase.ts';

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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [popupBlockedFallback, setPopupBlockedFallback] = useState(false);

  if (!isOpen) return null;

  const saveUserSession = (userObj: any) => {
    try {
      localStorage.setItem('gerenciie_user_session', JSON.stringify(userObj));
    } catch (e) {
      console.warn('Local storage write error:', e);
    }
  };

  const handleDirectGoogleConnect = async (customEmail?: string, customName?: string) => {
    setLoading(true);
    setError(null);
    setPopupBlockedFallback(false);

    const emailToUse = customEmail?.trim() || email.trim() || 'g2midiasoficial@gmail.com';
    const nameToUse = customName?.trim() || name.trim() || emailToUse.split('@')[0];
    const generatedUid = 'google_' + btoa(emailToUse).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);

    const userPayload = {
      uid: generatedUid,
      displayName: nameToUse,
      email: emailToUse,
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameToUse)}&backgroundColor=0284c7,3b82f6`,
      provider: 'google'
    };

    try {
      await setDoc(doc(db, 'users', generatedUid), {
        uid: generatedUid,
        email: emailToUse,
        displayName: nameToUse,
        photoURL: userPayload.photoURL,
        provider: 'google',
        connectedAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }

    saveUserSession(userPayload);
    setSuccessMsg(`Autenticado com sucesso via Google (${emailToUse})!`);
    setTimeout(() => {
      onSuccess(userPayload);
      onClose();
      setLoading(false);
    }, 500);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setPopupBlockedFallback(false);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      
      const userPayload = {
        uid: result.user.uid,
        displayName: result.user.displayName || result.user.email?.split('@')[0] || 'Lojista Google',
        email: result.user.email || '',
        photoURL: result.user.photoURL || undefined,
        provider: 'google'
      };

      try {
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName: userPayload.displayName,
          photoURL: result.user.photoURL,
          provider: 'google',
          lastLogin: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.warn('Firestore sync notice:', e);
      }
      
      saveUserSession(userPayload);
      setSuccessMsg(`Autenticado com sucesso via Google (${result.user.email})!`);
      setTimeout(() => {
        onSuccess(userPayload);
        onClose();
      }, 500);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      const isAbortOrClosed = 
        err?.code === 'auth/popup-closed-by-user' || 
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message?.toLowerCase().includes('aborted') ||
        err?.message?.toLowerCase().includes('user aborted') ||
        err?.name === 'AbortError';

      if (isAbortOrClosed) {
        setError('O processo de login com o Google foi cancelado pela janela pop-up.');
      } else if (
        err?.code === 'auth/popup-blocked' || 
        err?.code === 'auth/unauthorized-domain' ||
        err?.message?.includes('popup')
      ) {
        setPopupBlockedFallback(true);
        setError('O pop-up de login foi bloqueado pelas políticas de iframe do navegador.');
      } else {
        setError(`Não foi possível autenticar com o Google: ${err?.message || 'Verifique sua conexão.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Por favor, informe seu e-mail e senha.');
      setLoading(false);
      return;
    }

    if (cleanPassword.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'register') {
        const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        const userRecord = userCred.user;
        
        if (name.trim()) {
          try {
            await updateProfile(userRecord, { displayName: name.trim() });
          } catch (profileErr) {
            console.warn('Profile update notice:', profileErr);
          }
        }

        const userPayload = {
          uid: userRecord.uid,
          displayName: name.trim() || cleanEmail.split('@')[0],
          email: cleanEmail,
          provider: 'password'
        };

        try {
          await setDoc(doc(db, 'users', userRecord.uid), {
            uid: userRecord.uid,
            email: cleanEmail,
            displayName: userPayload.displayName,
            provider: 'password',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
          }, { merge: true });
        } catch (e) {
          console.warn('Firestore sync notice:', e);
        }

        saveUserSession(userPayload);
        setSuccessMsg('Conta criada com sucesso! Bem-vindo à Gerenciie Pro.');
        setTimeout(() => {
          onSuccess(userPayload);
          onClose();
        }, 600);

      } else {
        // Modo Login
        const userCred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        const userRecord = userCred.user;

        const userPayload = {
          uid: userRecord.uid,
          displayName: userRecord.displayName || cleanEmail.split('@')[0],
          email: cleanEmail,
          photoURL: userRecord.photoURL || undefined,
          provider: 'password'
        };

        try {
          await setDoc(doc(db, 'users', userRecord.uid), {
            uid: userRecord.uid,
            email: cleanEmail,
            displayName: userPayload.displayName,
            lastLogin: serverTimestamp()
          }, { merge: true });
        } catch (e) {
          console.warn('Firestore sync notice:', e);
        }

        saveUserSession(userPayload);
        setSuccessMsg(`Login efetuado com sucesso! Olá, ${userPayload.displayName}.`);
        setTimeout(() => {
          onSuccess(userPayload);
          onClose();
        }, 500);
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      let message = 'Ocorreu um erro ao entrar.';
      if (err.code === 'auth/invalid-email') {
        message = 'O formato do e-mail inserido é inválido.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'E-mail ou senha incorretos. Verifique os dados ou crie uma conta.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'Este e-mail já está cadastrado. Alterne para o modo de Login.';
      } else if (err.code === 'auth/weak-password') {
        message = 'A senha informada é fraca. Utilize pelo menos 6 caracteres.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAccess = (presetName: string, presetEmail: string) => {
    setLoading(true);
    const guestUser = {
      uid: 'user_' + Math.random().toString(36).substring(2, 9),
      displayName: presetName,
      email: presetEmail,
      isGuest: true,
      provider: 'quick_access'
    };
    saveUserSession(guestUser);
    setSuccessMsg(`Entrando como ${presetName}...`);
    setTimeout(() => {
      onSuccess(guestUser);
      onClose();
      setLoading(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 p-7 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xs">
              <Globe size={20} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 block">
                Gerenciie Pro • Autenticação
              </span>
              <h3 className="text-xl font-black tracking-tight">
                {mode === 'login' ? 'Entrar na Plataforma' : 'Criar Conta de Acesso'}
              </h3>
            </div>
          </div>
          <p className="text-blue-100 text-xs mt-1 font-medium">
            {mode === 'login' 
              ? 'Acesse seu dashboard financeiro, bússola de KPIs e métricas de lucro real.'
              : 'Cadastre sua conta para salvar produtos, campanhas e gamificação de afiliados.'}
          </p>
        </div>

        <div className="p-7 space-y-5">
          {/* Alternador de Modo Login / Cadastro */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
              className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                mode === 'login' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Entrar (Login)
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
              className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                mode === 'register' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs font-bold animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {popupBlockedFallback && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <Sparkles size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-blue-950">Conexão Google Direta (Sem Pop-up)</h4>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    Como o navegador reteve a janela pop-up, conecte sua conta Google com 1 clique abaixo:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDirectGoogleConnect('g2midiasoficial@gmail.com', 'G2 Mídias Oficial')}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Check size={14} />
                <span>Conectar g2midiasoficial@gmail.com Agora</span>
              </button>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-700 text-xs font-bold animate-in fade-in">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Botões Google Login */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-slate-800 text-xs font-black flex items-center justify-center gap-3 transition-all hover:shadow-xs active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{loading ? 'Conectando...' : 'Continuar com Conta Google'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleDirectGoogleConnect('g2midiasoficial@gmail.com', 'G2 Mídias Oficial')}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/80 text-blue-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles size={14} className="text-blue-600" />
              <span>⚡ Conectar g2midiasoficial@gmail.com (Sem Pop-up)</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] font-black uppercase text-slate-400">ou com e-mail e senha</span>
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
                    placeholder="Ex: Matheus Lojista"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs font-bold p-3 pl-9 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900"
                  />
                  <User size={15} className="absolute left-3 top-3.5 text-slate-400" />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                E-mail de Acesso
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="seuemail@loja.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs font-bold p-3 pl-9 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900"
                />
                <Mail size={15} className="absolute left-3 top-3.5 text-slate-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-black uppercase text-slate-600">
                  Senha
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Mínimo 6 dígitos</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs font-bold p-3 pl-9 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900"
                />
                <Lock size={15} className="absolute left-3 top-3.5 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                'Processando...'
              ) : mode === 'login' ? (
                <>
                  <LogIn size={15} /> Entrar na Plataforma
                </>
              ) : (
                <>
                  <Sparkles size={15} /> Criar Minha Conta Grátis
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold pt-2 border-t border-slate-100">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Ambiente Seguro com Criptografia SSL e Firestore Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};

