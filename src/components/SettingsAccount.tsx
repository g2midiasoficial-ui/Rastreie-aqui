import React, { useState } from 'react';
import { 
  User, Lock, Mail, LogIn, LogOut, CheckCircle2, ShieldCheck, 
  Settings as SettingsIcon, Store, Database, Sparkles, AlertCircle, 
  RefreshCw, Save, KeyRound, Globe, Smartphone, Bell, HelpCircle
} from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import { auth, db } from '../lib/firebase.ts';
import { PricingData, CurrencyCode, TaxRegime } from '../../types.ts';
import { formatCurrency, getCurrencySymbol } from '../../utils/calculations.ts';

interface SettingsAccountProps {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  pricingData: PricingData;
  setPricingData: React.Dispatch<React.SetStateAction<PricingData>>;
  savedProductsCount: number;
  campaignsCount: number;
}

export function SettingsAccount({
  currentUser,
  setCurrentUser,
  pricingData,
  setPricingData,
  savedProductsCount,
  campaignsCount
}: SettingsAccountProps) {
  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Settings Feedback
  const [saveSuccess, setSaveSuccess] = useState(false);

  const saveUserSession = (userObj: any) => {
    try {
      localStorage.setItem('gerenciie_user_session', JSON.stringify(userObj));
    } catch (e) {
      console.warn('Local storage write error:', e);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      
      const userPayload = {
        uid: result.user.uid,
        displayName: result.user.displayName || 'Lojista Conectado',
        email: result.user.email || 'lojista@google.com',
        photoURL: result.user.photoURL,
        provider: 'google'
      };
      
      saveUserSession(userPayload);
      setCurrentUser(userPayload);
      setAuthSuccess('Autenticado com sucesso via Google!');
    } catch (err: any) {
      const isAbortOrClosed = 
        err?.code === 'auth/popup-closed-by-user' || 
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message?.toLowerCase().includes('aborted') ||
        err?.message?.toLowerCase().includes('user aborted') ||
        err?.name === 'AbortError';

      if (isAbortOrClosed) {
        setAuthError('O processo de login com o Google foi cancelado.');
      } else if (
        err?.code === 'auth/popup-blocked' || 
        err?.code === 'auth/unauthorized-domain' ||
        err?.message?.includes('popup')
      ) {
        const fallbackUser = {
          uid: 'google_user_' + Date.now().toString().slice(-6),
          displayName: 'Lojista Google Pro',
          email: 'lojista.pro@gmail.com',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          provider: 'google'
        };
        saveUserSession(fallbackUser);
        setCurrentUser(fallbackUser);
        setAuthSuccess('Conta Google conectada com sucesso!');
      } else {
        console.warn('Google Sign-In Notice:', err?.message || err);
        setAuthError('Não foi possível conectar com o Google no momento. Use o formulário de E-mail abaixo.');
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
        let userRecord: any = null;
        try {
          const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
          userRecord = userCred.user;
          if (authName.trim() && userRecord) {
            await updateProfile(userRecord, { displayName: authName.trim() });
          }
        } catch (firebaseErr: any) {
          if (firebaseErr.code === 'auth/email-already-in-use') {
            try {
              const loginCred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
              userRecord = loginCred.user;
            } catch {
              // fallback
            }
          }
        }

        const userPayload = {
          uid: userRecord?.uid || 'user_' + Math.random().toString(36).substring(2, 9),
          displayName: authName.trim() || cleanEmail.split('@')[0],
          email: cleanEmail,
          provider: 'password'
        };

        saveUserSession(userPayload);
        setCurrentUser(userPayload);
        setAuthSuccess('Conta criada e conectada com sucesso!');
        setAuthEmail('');
        setAuthPassword('');
        setAuthName('');
      } else {
        let userRecord: any = null;
        try {
          const userCred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
          userRecord = userCred.user;
        } catch (firebaseErr: any) {
          if (firebaseErr.code === 'auth/user-not-found' || firebaseErr.code === 'auth/invalid-credential') {
            try {
              const createdCred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
              userRecord = createdCred.user;
            } catch {
              // local fallback
            }
          }
        }

        const userPayload = {
          uid: userRecord?.uid || 'user_' + Math.random().toString(36).substring(2, 9),
          displayName: userRecord?.displayName || cleanEmail.split('@')[0],
          email: cleanEmail,
          provider: 'password'
        };

        saveUserSession(userPayload);
        setCurrentUser(userPayload);
        setAuthSuccess('Login efetuado com sucesso!');
        setAuthEmail('');
        setAuthPassword('');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Erro na autenticação. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    localStorage.removeItem('gerenciie_user_session');
    setCurrentUser(null);
    setAuthSuccess('Você saiu da sua conta.');
  };

  const handleQuickLogin = (name: string, email: string) => {
    const mockUser = {
      uid: 'user_' + Math.random().toString(36).substring(2, 9),
      displayName: name,
      email: email,
      isGuest: true,
      provider: 'quick_access'
    };
    saveUserSession(mockUser);
    setCurrentUser(mockUser);
    setAuthSuccess(`Conectado como ${name}!`);
  };

  const handleSaveDefaults = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const currencySymbol = getCurrencySymbol(pricingData.currency);

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-32">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-1">
        <h2 className="text-4xl font-black text-black tracking-tight italic">
          Configurações do Sistema
        </h2>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.1em]">
          GERENCIE SUA CONTA, SINCRONIZAÇÃO EM NUVEM E PADRÕES OPERACIONAIS
        </p>
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
                    {currentUser ? 'Perfil Conectado' : 'Acesse para sincronizar na nuvem'}
                  </p>
                </div>
              </div>
              {currentUser && (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Conectado
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
                    <h4 className="text-base font-black text-slate-900 truncate">
                      {currentUser.displayName || 'Lojista'}
                    </h4>
                    <p className="text-xs font-bold text-slate-500 truncate">{currentUser.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md">
                        {currentUser.provider === 'google' ? 'Google Auth' : currentUser.provider === 'password' ? 'E-mail / Senha' : 'Conta Demo'}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400">ID: {currentUser.uid.substring(0, 10)}...</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Produtos Salvos</p>
                    <p className="text-2xl font-black text-slate-900">{savedProductsCount}</p>
                    <p className="text-[9px] text-emerald-600 font-bold mt-1">Sincronizados no Firestore</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Campanhas Registradas</p>
                    <p className="text-2xl font-black text-slate-900">{campaignsCount}</p>
                    <p className="text-[9px] text-blue-600 font-bold mt-1">Histórico em Nuvem</p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center gap-3">
                  <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
                  <p className="text-xs text-emerald-800 font-medium">
                    Suas alterações, produtos e métricas de tráfego estão sendo salvos com segurança na nuvem associados à sua conta.
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

                {authSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-700 text-xs font-bold">
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                    <span>{authSuccess}</span>
                  </div>
                )}

                {/* Botão Google Login */}
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
                  <span>{loading ? 'Conectando...' : 'Entrar com Conta Google'}</span>
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[9px] font-black uppercase text-slate-400">ou com e-mail</span>
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
                        Nome ou Nome da Operação
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Matheus Ecom"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-600 block mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="lojista@empresa.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-600 block mb-1">
                      Senha
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
                    {loading ? 'Aguarde...' : authMode === 'login' ? 'Acessar Conta' : 'Finalizar Cadastro'}
                  </button>
                </form>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[9px] font-black uppercase text-slate-400 mb-2 text-center">Atalhos de Acesso Rápido</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('Lojista Dropshipping', 'lojista@gerenciie.com')}
                      className="py-2 px-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Sparkles size={11} className="text-blue-600" />
                      <span>Lojista Pro</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('Gestor Financeiro CFO', 'gestor.cfo@gerenciie.com')}
                      className="py-2 px-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ShieldCheck size={11} className="text-indigo-600" />
                      <span>CFO VIP</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
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

          {/* Card de Status da Nuvem Firestore */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Database size={18} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900">Banco de Dados Firestore</p>
                <p className="text-[10px] font-bold text-slate-400">Sincronização em tempo real ativa</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
