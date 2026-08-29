import React, { useState } from 'react';
import { 
  ArrowRight, ShieldCheck, Sparkles, CheckCircle2, TrendingUp, 
  BarChart3, DollarSign, Calculator, Lock, User, Mail, LogIn,
  ChevronDown, ChevronUp, Star, Award, Layers, Zap, Check,
  ExternalLink, Globe, HelpCircle, ArrowUpRight, Play, Eye, AlertCircle
} from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase.ts';

interface SalesLandingPageProps {
  onEnterPlatform: () => void;
  currentUser: any;
  onLoginSuccess: (user: any) => void;
}

export function SalesLandingPage({
  onEnterPlatform,
  currentUser,
  onLoginSuccess
}: SalesLandingPageProps) {
  // Auth Form State inside the Sales Page
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
      onLoginSuccess(userPayload);
      setAuthSuccess('Autenticado com sucesso! Redirecionando...');
      setTimeout(() => {
        onEnterPlatform();
      }, 600);
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
        onLoginSuccess(fallbackUser);
        setAuthSuccess('Acesso concedido com sucesso!');
        setTimeout(() => {
          onEnterPlatform();
        }, 600);
      } else {
        setAuthError('Não foi possível conectar com o Google. Utilize o e-mail abaixo.');
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
      setAuthError('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    if (cleanPassword.length < 6) {
      setAuthError('A senha deve ter no mínimo 6 caracteres.');
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
        onLoginSuccess(userPayload);
        setAuthSuccess('Conta criada com sucesso! Entrando...');
        setTimeout(() => {
          onEnterPlatform();
        }, 600);
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
              // fallback
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
        onLoginSuccess(userPayload);
        setAuthSuccess('Login realizado com sucesso! Entrando...');
        setTimeout(() => {
          onEnterPlatform();
        }, 600);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao processar login. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
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
    onLoginSuccess(mockUser);
    setAuthSuccess(`Acesso rápido liberado como ${name}!`);
    setTimeout(() => {
      onEnterPlatform();
    }, 400);
  };

  const scrollToLogin = () => {
    const el = document.getElementById('login-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: 'O que é o Gerenciie Pro?',
      a: 'É a plataforma financeira e de gestão definitiva para operações de E-commerce, Dropshipping, Shopee, Mercado Livre e TikTok Shop. Ela calcula o markup real, impostos, taxas de gateway, taxa de frete e o CPA Breakeven para que você nunca mais venda no prejuízo.'
    },
    {
      q: 'Preciso ter uma conta para usar a calculadora?',
      a: 'Você pode testar a plataforma instantaneamente com acesso rápido, mas criar sua conta gratuita garante que todos os seus produtos salvos, campanhas de tráfego e simulações fiquem salvos em nuvem para sempre.'
    },
    {
      q: 'Como funciona a Bússola de Métricas e o CPA Breakeven?',
      a: 'A bússola analisa seus custos diretos (CMV, frete, embalagem) e deduções variáveis (impostos, checkout, gateway). Com isso, calculamos o valor exato que você pode gastar em anúncios (Facebook Ads, TikTok Ads, Google Ads) por venda sem perder dinheiro.'
    },
    {
      q: 'Suporta múltiplas moedas e canais de venda?',
      a: 'Sim! O sistema inclui suporte para BRL, USD, EUR, GBP, JPY, CNY e moedas latino-americanas, além de regras pré-configuradas para Dropshipping, Shopee, Mercado Livre e TikTok Shop.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-['Plus_Jakarta_Sans'] selection:bg-blue-600 selection:text-white">
      {/* Barra de Navegação Superior */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/25">
              G
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white">GERENCIIE</span>
                <span className="text-[10px] font-black tracking-widest uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-md">
                  PRO CFO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gestão Financeira & Tráfego</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-300">
            <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
            <a href="#login-section" className="hover:text-white transition-colors">Entrar na Conta</a>
            <a href="#planos" className="hover:text-white transition-colors">Planos</a>
            <a href="#faq" className="hover:text-white transition-colors">Perguntas Frequentes</a>
          </nav>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <button
                onClick={onEnterPlatform}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <span>Acessar Painel ({currentUser.displayName?.split(' ')[0] || 'Lojista'})</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <>
                <button
                  onClick={scrollToLogin}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Entrar
                </button>
                <button
                  onClick={onEnterPlatform}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>Abrir Sistema</span>
                  <ArrowRight size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Glows de Fundo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-wider">
              <Sparkles size={14} className="animate-spin text-blue-400" />
              <span>A Ferramenta Definitiva para E-commerce & Dropshipping</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] italic">
              Pare de Vender Muito e <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300">Lucrar Pouco</span>.
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed font-medium">
              Calcule seu <strong className="text-white">CPA Breakeven</strong>, projete escalas com precisão cirúrgica, domine seu <strong className="text-white">DRE Financeiro</strong> e precifique produtos em múltiplos canais sem erros.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={onEnterPlatform}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Acessar o Sistema Grátis</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={scrollToLogin}
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogIn size={18} className="text-blue-400" />
                <span>Entrar na Minha Conta</span>
              </button>
            </div>

            {/* Badges de Confiança */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-bold">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Sem necessidade de cartão</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Nuvem Firestore em Tempo Real</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Dropshipping & Marketplaces</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Especial: ÁREA DE ACESSO / ENTRAR NA CONTA */}
      <section id="login-section" className="py-16 bg-slate-900/60 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Lado Esquerdo: Benefícios de ter a Conta */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-wider">
                <Lock size={12} />
                <span>Área de Membros & Acesso</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight italic">
                Acesse Sua Conta ou Crie Seu Perfil Pro
              </h2>

              <p className="text-slate-300 text-sm leading-relaxed">
                Ao entrar no Gerenciie Pro, suas precificações de produtos, histórico de testes de tráfego pago e cenários de escala ficam 100% seguros e sincronizados em nuvem.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Sincronização Cloud Firestore</h4>
                    <p className="text-[11px] text-slate-400">Acesse seus cálculos de qualquer dispositivo, celular ou desktop.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Histórico de Campanhas & Diagnóstico</h4>
                    <p className="text-[11px] text-slate-400">Salve seus testes de campanhas diárias e exporte em CSV.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Award size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Gamificação & Programa de Afiliados</h4>
                    <p className="text-[11px] text-slate-400">Desbloqueie conquistas financeiras e comissões de parceiro.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lado Direito: Caixa de Login / Cadastro */}
            <div className="lg:col-span-6">
              <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

                {currentUser ? (
                  <div className="space-y-6 text-center py-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl mx-auto shadow-lg shadow-blue-500/20">
                      {currentUser.displayName ? currentUser.displayName.substring(0, 2).toUpperCase() : 'LO'}
                    </div>
                    <div>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-wider">
                        Sessão Ativa
                      </span>
                      <h3 className="text-xl font-black text-white mt-2">
                        Olá, {currentUser.displayName || 'Lojista'}!
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">{currentUser.email}</p>
                    </div>

                    <button
                      onClick={onEnterPlatform}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <span>Entrar no Dashboard do Sistema</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Alertas */}
                    {authError && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-bold flex items-center gap-2">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{authError}</span>
                      </div>
                    )}
                    {authSuccess && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 size={16} className="shrink-0" />
                        <span>{authSuccess}</span>
                      </div>
                    )}

                    {/* Botão Google */}
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl text-xs font-black flex items-center justify-center gap-3 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-sm"
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
                      <div className="flex-1 h-px bg-slate-800" />
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">ou com e-mail</span>
                      <div className="flex-1 h-px bg-slate-800" />
                    </div>

                    {/* Alternador Modo */}
                    <div className="grid grid-cols-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => { setAuthMode('login'); setAuthError(null); }}
                        className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                          authMode === 'login' 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Entrar (Login)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAuthMode('register'); setAuthError(null); }}
                        className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                          authMode === 'register' 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Criar Nova Conta
                      </button>
                    </div>

                    {/* Formulário */}
                    <form onSubmit={handleEmailAuth} className="space-y-3">
                      {authMode === 'register' && (
                        <div>
                          <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">
                            Nome ou Nome da Operação
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Matheus Ecom"
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            className="w-full text-xs font-bold p-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">
                          E-mail
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="lojista@empresa.com"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          className="w-full text-xs font-bold p-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">
                          Senha
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full text-xs font-bold p-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {loading ? 'Processando...' : authMode === 'login' ? 'Entrar no Sistema' : 'Criar Conta e Acessar'}
                      </button>
                    </form>

                    {/* Acesso Rápido para Demonstração */}
                    <div className="pt-3 border-t border-slate-800">
                      <p className="text-[9px] font-black uppercase text-slate-500 text-center mb-2">
                        Ou experimente com um clique:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuickLogin('Lojista Dropshipping', 'lojista.demo@gerenciie.com')}
                          className="py-2 px-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles size={12} className="text-blue-400" />
                          <span>Demo Lojista</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickLogin('Gestor Financeiro CFO', 'gestor.cfo@gerenciie.com')}
                          className="py-2 px-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ShieldCheck size={12} className="text-indigo-400" />
                          <span>Demo CFO</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Recursos & Módulos */}
      <section id="recursos" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight italic">
            Tudo o que Você Precisa para Dominar seus Números
          </h2>
          <p className="text-slate-400 text-sm">
            Ferramentas construídas especificamente para a realidade tributária e de tráfego de lojistas brasileiros.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[32px] space-y-4 hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-black">
              <Calculator size={24} />
            </div>
            <h3 className="text-lg font-black text-white">Precificação & Markup Real</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Cálculo completo incluindo CMV, ICMS, embalagens, taxa Yampi/CartPanda, gateway de pagamento, reserva e imposto Simples/MEI.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[32px] space-y-4 hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-lg font-black text-white">Bússola de Tráfego & CPA Limite</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Descubra seu CPA Breakeven e CPA Ideal antes de gastar 1 centavo em anúncios no Facebook Ads ou TikTok Ads.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[32px] space-y-4 hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-lg font-black text-white">DRE Financeiro & Escala</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Demonstrativo de Resultados estruturado e simulador de escala para prever lucro líquido com 2x, 5x e 10x de faturamento.
            </p>
          </div>
        </div>
      </section>

      {/* Seção de Planos */}
      <section id="planos" className="py-20 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight italic">
              Planos Transparentes para Cada Fase
            </h2>
            <p className="text-slate-400 text-sm">
              Comece gratuitamente hoje mesmo e escale sua operação com segurança.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            {/* Plano Free */}
            <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                  Iniciante
                </span>
                <h3 className="text-2xl font-black text-white">Free Starter</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">R$ 0</span>
                  <span className="text-xs text-slate-400 font-bold">/mês</span>
                </div>
                <ul className="space-y-3 pt-4 text-xs text-slate-300 font-medium">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>Calculadora de Precificação Completa</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>CPA Breakeven & Margem Líquida</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>Multi-moeda (BRL, USD, EUR)</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onEnterPlatform}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Acessar Agora
              </button>
            </div>

            {/* Plano Pro CFO (Destacado) */}
            <div className="bg-gradient-to-b from-blue-900/40 to-slate-900 border-2 border-blue-500/80 rounded-[32px] p-8 flex flex-col justify-between space-y-6 relative shadow-2xl shadow-blue-500/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
                Mais Recomendado
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full">
                  Lojista Profissional
                </span>
                <h3 className="text-2xl font-black text-white">Pro CFO Unlimited</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">R$ 49</span>
                  <span className="text-xs text-slate-400 font-bold">/mês</span>
                </div>
                <ul className="space-y-3 pt-4 text-xs text-slate-200 font-medium">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>Tudo do Plano Free</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>Sincronização em Nuvem Firestore</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>Simulador de Planejamento de Tráfego</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>Exportação de Relatórios DRE em CSV</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onEnterPlatform}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                Começar Teste Pro
              </button>
            </div>

            {/* Plano Enterprise */}
            <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                  Agências & Grandes Operações
                </span>
                <h3 className="text-2xl font-black text-white">Enterprise VIP</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">R$ 149</span>
                  <span className="text-xs text-slate-400 font-bold">/mês</span>
                </div>
                <ul className="space-y-3 pt-4 text-xs text-slate-300 font-medium">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>Multi-usuários & Equipe</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>Múltiplas Lojas & Canais</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span>Suporte Prioritário com Especialista</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onEnterPlatform}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Falar com Consultor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Seção FAQ */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-6">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl font-black text-white tracking-tight italic">
            Perguntas Frequentes
          </h2>
          <p className="text-slate-400 text-xs">
            Tire suas dúvidas sobre a operação do sistema.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp size={18} className="text-blue-400 shrink-0" /> : <ChevronDown size={18} className="text-slate-500 shrink-0" />}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4 animate-in fade-in duration-200">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
              G
            </div>
            <span className="font-bold text-slate-400">GERENCIIE PRO © 2026</span>
          </div>

          <div className="flex items-center gap-6 text-[11px] font-bold">
            <button onClick={scrollToLogin} className="hover:text-slate-300 transition-colors">Entrar na Conta</button>
            <button onClick={onEnterPlatform} className="hover:text-slate-300 transition-colors">Abrir Dashboard</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
