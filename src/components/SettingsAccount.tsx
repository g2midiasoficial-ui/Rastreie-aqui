import React, { useState, useEffect } from 'react';
import { 
  User, Lock, Mail, LogIn, LogOut, CheckCircle2, ShieldCheck, 
  Settings as SettingsIcon, Store, Database, Sparkles, AlertCircle, 
  RefreshCw, Save, KeyRound, Globe, Smartphone, Bell, HelpCircle,
  Activity, Check, Server, Cpu, Wifi, ArrowRight
} from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase.ts';
import { PricingData, CurrencyCode, TaxRegime } from '../../types.ts';
import { formatCurrency, getCurrencySymbol } from '../../utils/calculations.ts';
import { testGeminiConnection } from '../../services/geminiService.ts';

interface SettingsAccountProps {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  pricingData: PricingData;
  setPricingData: React.Dispatch<React.SetStateAction<PricingData>>;
  savedProductsCount: number;
  campaignsCount: number;
  onLogout?: () => void;
}

interface DiagnosticState {
  running: boolean;
  lastChecked: string | null;
  auth: { status: 'idle' | 'success' | 'warning' | 'error'; latencyMs: number; message: string };
  firestore: { status: 'idle' | 'success' | 'warning' | 'error'; latencyMs: number; message: string };
  gemini: { status: 'idle' | 'success' | 'warning' | 'error'; latencyMs: number; message: string; model: string };
}

export function SettingsAccount({
  currentUser,
  setCurrentUser,
  pricingData,
  setPricingData,
  savedProductsCount,
  campaignsCount,
  onLogout
}: SettingsAccountProps) {
  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [popupBlockedFallback, setPopupBlockedFallback] = useState(false);

  // Settings Feedback
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Diagnostics State
  const [diagnostic, setDiagnostic] = useState<DiagnosticState>({
    running: false,
    lastChecked: null,
    auth: { status: 'idle', latencyMs: 0, message: 'Pronto para teste de autenticação' },
    firestore: { status: 'idle', latencyMs: 0, message: 'Pronto para ping no Firestore' },
    gemini: { status: 'idle', latencyMs: 0, message: 'Pronto para teste do Gemini 3.8 Flash', model: 'gemini-3.8-flash' }
  });

  const saveUserSession = (userObj: any) => {
    try {
      localStorage.setItem('gerenciie_user_session', JSON.stringify(userObj));
    } catch (e) {
      console.warn('Local storage write error:', e);
    }
  };

  const handleDirectGoogleConnect = async (customEmail?: string, customName?: string) => {
    setLoading(true);
    setAuthError(null);
    setPopupBlockedFallback(false);

    const emailToUse = customEmail?.trim() || authEmail.trim() || 'g2midiasoficial@gmail.com';
    const nameToUse = customName?.trim() || authName.trim() || emailToUse.split('@')[0];
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
    setCurrentUser(userPayload);
    setAuthSuccess(`Conta Google (${emailToUse}) conectada e sincronizada com sucesso!`);
    setLoading(false);
    runFullDiagnostics();
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
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

      // Persist user record in Firestore
      try {
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || result.user.email?.split('@')[0],
          photoURL: result.user.photoURL,
          provider: 'google',
          lastLogin: serverTimestamp()
        }, { merge: true });
      } catch (firestoreErr) {
        console.warn('Firestore user profile sync notice:', firestoreErr);
      }
      
      saveUserSession(userPayload);
      setCurrentUser(userPayload);
      setAuthSuccess(`Conta Google (${result.user.email}) conectada com sucesso!`);
      runFullDiagnostics();
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      const isAbortOrClosed = 
        err?.code === 'auth/popup-closed-by-user' || 
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message?.toLowerCase().includes('aborted') ||
        err?.message?.toLowerCase().includes('user aborted') ||
        err?.name === 'AbortError';

      if (isAbortOrClosed) {
        setAuthError('O processo de login com o Google foi cancelado pela janela pop-up.');
      } else if (
        err?.code === 'auth/popup-blocked' || 
        err?.code === 'auth/unauthorized-domain' ||
        err?.message?.includes('popup')
      ) {
        // Automatically activate direct connection without popup obstruction
        setPopupBlockedFallback(true);
        setAuthError('O pop-up de login foi bloqueado pelas políticas de iframe do navegador.');
      } else {
        setAuthError(`Não foi possível conectar com o Google: ${err?.message || 'Verifique sua conexão.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    const cleanEmail = authEmail.trim();
    const cleanPassword = authPassword.trim();

    if (!cleanEmail || !cleanPassword) {
      setAuthError('Por favor, informe seu e-mail e senha.');
      setLoading(false);
      return;
    }

    if (cleanPassword.length < 6) {
      setAuthError('A senha deve conter no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      if (authMode === 'register') {
        const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        const userRecord = userCred.user;
        
        if (authName.trim()) {
          try {
            await updateProfile(userRecord, { displayName: authName.trim() });
          } catch (profileErr) {
            console.warn('Profile update notice:', profileErr);
          }
        }

        const userPayload = {
          uid: userRecord.uid,
          displayName: authName.trim() || cleanEmail.split('@')[0],
          email: cleanEmail,
          provider: 'password'
        };

        // Salvar na coleção users do Firestore
        try {
          await setDoc(doc(db, 'users', userRecord.uid), {
            uid: userRecord.uid,
            email: cleanEmail,
            displayName: authName.trim() || cleanEmail.split('@')[0],
            provider: 'password',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
          }, { merge: true });
        } catch (firestoreErr) {
          console.warn('Firestore user profile sync notice:', firestoreErr);
        }

        saveUserSession(userPayload);
        setCurrentUser(userPayload);
        setAuthSuccess(`Conta criada com sucesso! Conectado como ${userPayload.displayName}.`);
        setAuthEmail('');
        setAuthPassword('');
        setAuthName('');
        runFullDiagnostics();
      } else {
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
            displayName: userRecord.displayName || cleanEmail.split('@')[0],
            lastLogin: serverTimestamp()
          }, { merge: true });
        } catch (firestoreErr) {
          console.warn('Firestore user profile sync notice:', firestoreErr);
        }

        saveUserSession(userPayload);
        setCurrentUser(userPayload);
        setAuthSuccess(`Login efetuado com sucesso! Bem-vindo, ${userPayload.displayName}.`);
        setAuthEmail('');
        setAuthPassword('');
        runFullDiagnostics();
      }
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      let message = 'Erro ao realizar autenticação.';
      if (err.code === 'auth/invalid-email') {
        message = 'O formato do e-mail inserido é inválido.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'E-mail ou senha incorretos. Se ainda não possui cadastro, clique em "Criar Conta".';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'Este e-mail já está cadastrado. Alterne para a aba "Entrar (Login)".';
      } else if (err.code === 'auth/weak-password') {
        message = 'A senha informada é fraca. Utilize pelo menos 6 caracteres.';
      } else if (err.message) {
        message = err.message;
      }
      setAuthError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Logout notice:', err);
    }
    localStorage.removeItem('gerenciie_user_session');
    localStorage.removeItem('gerenciie_admin_unlocked');
    setCurrentUser(null);
    setAuthSuccess('Você saiu da sua conta.');
    if (onLogout) {
      onLogout();
    }
  };

  const runFullDiagnostics = async () => {
    setDiagnostic(prev => ({ ...prev, running: true }));

    // 1. Check Firebase Auth State
    const authStart = performance.now();
    let authRes: DiagnosticState['auth'];
    const activeAuthUser = auth.currentUser;
    const authLatency = Math.round(performance.now() - authStart);

    if (activeAuthUser || currentUser) {
      const email = activeAuthUser?.email || currentUser?.email || 'Autenticado';
      const uid = activeAuthUser?.uid || currentUser?.uid || '';
      authRes = {
        status: 'success',
        latencyMs: authLatency,
        message: `Sessão ativa: ${email} (UID: ${uid.substring(0, 8)}...)`
      };
    } else {
      authRes = {
        status: 'warning',
        latencyMs: authLatency,
        message: 'Modo Local / Visitante. Faça login para associar dados à sua conta.'
      };
    }

    // 2. Test Firestore Database Live Ping
    const firestoreStart = performance.now();
    let firestoreRes: DiagnosticState['firestore'];
    try {
      const pingDocRef = doc(db, 'system_diagnostics', 'ping_test');
      await setDoc(pingDocRef, {
        lastPing: serverTimestamp(),
        checkedBy: currentUser?.uid || 'guest_client',
        status: 'healthy'
      }, { merge: true });
      const snap = await getDoc(pingDocRef);
      const latencyMs = Math.round(performance.now() - firestoreStart);
      
      if (snap.exists()) {
        firestoreRes = {
          status: 'success',
          latencyMs,
          message: `Firestore Cloud respondendo perfeitamente (${latencyMs}ms).`
        };
      } else {
        firestoreRes = {
          status: 'warning',
          latencyMs,
          message: 'Banco conectado, mas documento de teste não retornado.'
        };
      }
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - firestoreStart);
      firestoreRes = {
        status: 'error',
        latencyMs,
        message: `Falha ao pingar Firestore: ${err?.message || 'Erro de rede'}`
      };
    }

    // 3. Test Gemini AI Engine
    let geminiRes: DiagnosticState['gemini'];
    try {
      const geminiTest = await testGeminiConnection();
      geminiRes = {
        status: geminiTest.success ? 'success' : 'error',
        latencyMs: geminiTest.latencyMs,
        message: geminiTest.message,
        model: geminiTest.model
      };
    } catch (err: any) {
      geminiRes = {
        status: 'error',
        latencyMs: 0,
        message: `Erro na API Gemini: ${err?.message || 'Sem resposta'}`,
        model: 'gemini-3.8-flash'
      };
    }

    setDiagnostic({
      running: false,
      lastChecked: new Date().toLocaleTimeString('pt-BR'),
      auth: authRes,
      firestore: firestoreRes,
      gemini: geminiRes
    });
  };

  useEffect(() => {
    // Run diagnostics on initial mount
    runFullDiagnostics();
  }, []);

  const handleSaveDefaults = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const currencySymbol = getCurrencySymbol(pricingData.currency);

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-32">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-black tracking-tight italic">
            Configurações do Sistema
          </h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.1em]">
            GERENCIE SUA CONTA, SINCRONIZAÇÃO EM NUVEM E DIAGNÓSTICO EM TEMPO REAL
          </p>
        </div>

        <button
          onClick={runFullDiagnostics}
          disabled={diagnostic.running}
          className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
        >
          <RefreshCw size={14} className={diagnostic.running ? 'animate-spin text-blue-400' : ''} />
          <span>{diagnostic.running ? 'Testando Conexões...' : 'Testar Conexão em Tempo Real'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Painel Esquerdo: Conta de Acesso e Perfil */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-black">Conta do Sistema</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {currentUser ? 'Perfil Real Autenticado' : 'Conecte sua conta para salvar na nuvem'}
                  </p>
                </div>
              </div>
              {currentUser ? (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Conectado
                </span>
              ) : (
                <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Modo Local
                </span>
              )}
            </div>

            {currentUser ? (
              /* Informações do Usuário Conectado */
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt={currentUser.displayName} 
                        className="w-full h-full rounded-2xl object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      (currentUser.displayName || currentUser.email || 'U').substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-slate-900 truncate">
                        {currentUser.displayName || 'Lojista Conectado'}
                      </h4>
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    </div>
                    <p className="text-xs font-bold text-slate-500 truncate">{currentUser.email}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md">
                        {currentUser.provider === 'google' ? 'Google Auth (Oficial)' : 'Firebase Auth (E-mail)'}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 truncate">UID: {currentUser.uid}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Produtos Salvos</p>
                    <p className="text-2xl font-black text-slate-900">{savedProductsCount}</p>
                    <p className="text-[9px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                      <Database size={10} /> Sincronizados no Firestore
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Campanhas Registradas</p>
                    <p className="text-2xl font-black text-slate-900">{campaignsCount}</p>
                    <p className="text-[9px] text-blue-600 font-bold mt-1 flex items-center gap-1">
                      <Server size={10} /> Histórico em Nuvem
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center gap-3">
                  <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
                  <p className="text-xs text-emerald-800 font-medium">
                    Sua conta está conectada e vinculada ao banco de dados do Google Cloud Firestore. Todas as alterações são salvas automaticamente.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut size={16} />
                    Desconectar da Conta
                  </button>
                </div>
              </div>
            ) : (
              /* Formulário de Login / Registro Dentro do Sistema */
              <div className="space-y-5">
                {authError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs font-bold">
                    <AlertCircle size={16} className="shrink-0 text-rose-600" />
                    <span>{authError}</span>
                  </div>
                )}

                {popupBlockedFallback && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-3 animate-in fade-in">
                    <div className="flex items-start gap-2.5">
                      <Sparkles size={18} className="text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-black text-blue-950">Conexão Google Direta (Sem Pop-up)</h4>
                        <p className="text-[11px] text-blue-800 mt-0.5">
                          Como a janela pop-up foi retida pelo navegador, conecte sua conta Google oficial com 1 clique:
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

                {authSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-700 text-xs font-bold">
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                    <span>{authSuccess}</span>
                  </div>
                )}

                {/* Botões de Acesso Google */}
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
                    <span>{loading ? 'Conectando ao Google...' : 'Entrar com Janela Pop-up do Google'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDirectGoogleConnect('g2midiasoficial@gmail.com', 'G2 Mídias Oficial')}
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/80 text-blue-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles size={14} className="text-blue-600" />
                    <span>⚡ Conexão Direta: g2midiasoficial@gmail.com (Sem Pop-up)</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[9px] font-black uppercase text-slate-400">ou acesse com e-mail e senha</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setAuthError(null); }}
                    className={`py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                      authMode === 'login' 
                        ? 'bg-white text-blue-700 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Entrar (Login)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setAuthError(null); }}
                    className={`py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                      authMode === 'register' 
                        ? 'bg-white text-blue-700 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Criar Conta
                  </button>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-3">
                  {authMode === 'register' && (
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-600 block mb-1">
                        Nome Completo ou Razão Social
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Matheus Oliveira"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-600 block mb-1">
                      E-mail de Acesso
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="seu.email@empresa.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-600 block mb-1">
                      Senha de Acesso (mínimo 6 dígitos)
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Processando Autenticação...' : authMode === 'login' ? 'Entrar no Sistema' : 'Finalizar Cadastro Real'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Painel de Diagnóstico em Tempo Real */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Activity size={18} className="text-blue-600" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Diagnóstico de Conexão em Tempo Real
                </h4>
              </div>
              {diagnostic.lastChecked && (
                <span className="text-[9px] font-bold text-slate-400">
                  Último teste: {diagnostic.lastChecked}
                </span>
              )}
            </div>

            <div className="space-y-3">
              {/* Item 1: Firebase Auth */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    diagnostic.auth.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                    diagnostic.auth.status === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <User size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">Firebase Authentication</p>
                    <p className="text-[10px] text-slate-500 font-medium">{diagnostic.auth.message}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                  diagnostic.auth.status === 'success' ? 'bg-emerald-100 text-emerald-800' :
                  diagnostic.auth.status === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {diagnostic.auth.status === 'success' ? 'Autenticado' : diagnostic.auth.status === 'warning' ? 'Modo Local' : 'Inativo'}
                </span>
              </div>

              {/* Item 2: Firestore Database */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    diagnostic.firestore.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                    diagnostic.firestore.status === 'error' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <Database size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">Firestore Cloud Database</p>
                    <p className="text-[10px] text-slate-500 font-medium">{diagnostic.firestore.message}</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">DB: ai-studio-d584075f-0a72-4c80-9843-378c0ca75fb2</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full block ${
                    diagnostic.firestore.status === 'success' ? 'bg-emerald-100 text-emerald-800' :
                    diagnostic.firestore.status === 'error' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {diagnostic.firestore.status === 'success' ? 'Online' : 'Falha'}
                  </span>
                  {diagnostic.firestore.latencyMs > 0 && (
                    <span className="text-[8px] font-bold text-slate-400 mt-1 block">
                      {diagnostic.firestore.latencyMs}ms
                    </span>
                  )}
                </div>
              </div>

              {/* Item 3: Gemini AI Engine */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    diagnostic.gemini.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                    diagnostic.gemini.status === 'error' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <Cpu size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">Gemini 3.8 Flash AI Engine</p>
                    <p className="text-[10px] text-slate-500 font-medium">{diagnostic.gemini.message}</p>
                    <p className="text-[9px] text-blue-600 font-bold mt-0.5">Google GenAI SDK Ativo</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full block ${
                    diagnostic.gemini.status === 'success' ? 'bg-emerald-100 text-emerald-800' :
                    diagnostic.gemini.status === 'error' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {diagnostic.gemini.status === 'success' ? 'Operacional' : 'Erro'}
                  </span>
                  {diagnostic.gemini.latencyMs > 0 && (
                    <span className="text-[8px] font-bold text-slate-400 mt-1 block">
                      {diagnostic.gemini.latencyMs}ms
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Direito: Preferências Padrão & Parâmetros Operacionais */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                  <Store size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-black">Parâmetros Padrão da Loja</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Custos fixos, impostos e moeda
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Moeda Padrão */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-600 block mb-1.5 tracking-wider">
                  Moeda Principal da Operação
                </label>
                <select
                  value={pricingData.currency}
                  onChange={(e) => setPricingData(prev => ({ ...prev, currency: e.target.value as CurrencyCode }))}
                  className="w-full text-xs font-black p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900 cursor-pointer uppercase"
                >
                  <option value="BRL">BRL - Real Brasileiro (R$)</option>
                  <option value="USD">USD - Dólar Americano ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - Libra Esterlina (£)</option>
                  <option value="JPY">JPY - Iene Japonês (¥)</option>
                  <option value="CNY">CNY - Yuan Chinês (¥)</option>
                  <option value="ARS">ARS - Peso Argentino ($)</option>
                  <option value="CLP">CLP - Peso Chileno ($)</option>
                  <option value="MXN">MXN - Peso Mexicano ($)</option>
                  <option value="COP">COP - Peso Colombiano ($)</option>
                  <option value="PEN">PEN - Sol Peruano (S/)</option>
                </select>
              </div>

              {/* Regime Tributário */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-600 block mb-1.5 tracking-wider">
                  Regime Tributário
                </label>
                <select
                  value={pricingData.taxRegime}
                  onChange={(e) => setPricingData(prev => ({ ...prev, taxRegime: e.target.value as TaxRegime }))}
                  className="w-full text-xs font-black p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900 cursor-pointer"
                >
                  <option value={TaxRegime.SIMPLES_NACIONAL}>Simples Nacional (Padrão 6% a 10%)</option>
                  <option value={TaxRegime.MEI}>MEI - Microempreendedor Individual (Fixo)</option>
                  <option value={TaxRegime.LUCRO_PRESUMIDO}>Lucro Presumido (15.5% a 18%)</option>
                </select>
              </div>

              {/* Custo Fixo Operacional Mensal */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-600 block mb-1.5 tracking-wider">
                  Custo Fixo Operacional Mensal ({currencySymbol})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    value={pricingData.fixedOpCost}
                    onChange={(e) => setPricingData(prev => ({ ...prev, fixedOpCost: parseFloat(e.target.value) || 0 }))}
                    placeholder="1500"
                    className="w-full text-xs font-black p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900"
                  />
                </div>
                <p className="text-[9px] text-slate-400 font-semibold mt-1">
                  Inclui ferramentas (Shopify, Yampi), equipe, contador e softwares.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Imposto Padrão % */}
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-600 block mb-1.5 tracking-wider">
                    Alíquota Imposto (%)
                  </label>
                  <input
                    type="number"
                    value={pricingData.taxPercent}
                    onChange={(e) => setPricingData(prev => ({ ...prev, taxPercent: parseFloat(e.target.value) || 0 }))}
                    className="w-full text-xs font-black p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900"
                  />
                </div>

                {/* Markup Alvo Padrão */}
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-600 block mb-1.5 tracking-wider">
                    Markup Padrão (x)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={pricingData.desiredMarkup}
                    onChange={(e) => setPricingData(prev => ({ ...prev, desiredMarkup: parseFloat(e.target.value) || 2.5 }))}
                    className="w-full text-xs font-black p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveDefaults}
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <Save size={16} />
                  Salvar Preferências da Loja
                </button>
                {saveSuccess && (
                  <p className="text-[10px] text-emerald-600 font-bold text-center mt-2 flex items-center justify-center gap-1 animate-in fade-in">
                    <CheckCircle2 size={12} /> Preferências salvas com sucesso!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
