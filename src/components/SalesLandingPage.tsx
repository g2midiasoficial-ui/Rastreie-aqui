import React, { useState } from 'react';
import {
  ArrowRight, ShieldCheck, CheckCircle2, BarChart3, Calculator, Lock, X,
  ChevronDown, Award, Layers, Check, Globe, Play, AlertCircle, Menu,
  Receipt, Target, Wallet, Bot, MessageCircle, CalendarClock, PiggyBank,
  ShoppingCart, Car, Puzzle
} from 'lucide-react';
import {
  AuthMessageError,
  authenticateWithEmail,
  createGuestUser,
  saveUserSession,
  signInWithGoogle
} from '../lib/auth.ts';

interface SalesLandingPageProps {
  onEnterPlatform: () => void;
  currentUser: any;
  onLoginSuccess: (user: any) => void;
  onOpenAdmin?: () => void;
}

export function SalesLandingPage({
  onEnterPlatform,
  currentUser,
  onLoginSuccess,
  onOpenAdmin
}: SalesLandingPageProps) {
  // Auth Modal Popup State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setAuthError(null);
    setAuthSuccess(null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthError(null);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      // Redireciona para o Google; ao voltar, o App abre a plataforma
      await signInWithGoogle();
    } catch (err: any) {
      setAuthError(err?.message || 'Não foi possível autenticar com o Google. Por favor, entre com e-mail e senha.');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      const result = await authenticateWithEmail(authMode, authEmail, authPassword, authName);
      if (result.status === 'confirm_email') {
        setAuthSuccess('Conta criada! Enviamos um link de confirmação para o seu e-mail. Confirme e depois faça login.');
        setAuthMode('login');
        setAuthPassword('');
        return;
      }
      saveUserSession(result.user);
      setAuthSuccess(authMode === 'register' ? 'Conta criada com sucesso! Acessando seu painel...' : 'Acessando o painel...');
      // onLoginSuccess já abre a plataforma (onEnterPlatform ainda veria o usuário antigo)
      setTimeout(() => {
        onLoginSuccess(result.user);
      }, 400);
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      setAuthError(err instanceof AuthMessageError ? err.message : 'Ocorreu um erro ao entrar.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (name: string, email: string) => {
    const guestUser = createGuestUser(name, email);
    saveUserSession(guestUser);
    setAuthSuccess(`Acesso rápido liberado como ${name}!`);
    setTimeout(() => {
      onLoginSuccess(guestUser);
    }, 400);
  };

  const faqs = [
    {
      q: 'O que é o Gerenciie Pro?',
      a: 'É uma plataforma de gestão para quem vende em e-commerce, dropshipping, Shopee, Mercado Livre e TikTok Shop. Ela calcula o lucro real de cada venda, considerando custos, taxas, impostos e anúncios, e organiza as finanças da loja e pessoais.'
    },
    {
      q: 'Preciso de cartão de crédito para começar?',
      a: 'Não. Você cria a conta grátis com e-mail ou Google. Também dá para testar sem cadastro, mas nesse modo os dados ficam só no seu navegador.'
    },
    {
      q: 'O que é CPA Breakeven?',
      a: 'É o valor máximo que você pode pagar em anúncios por venda sem ter prejuízo. A plataforma calcula esse número a partir do preço, do custo do produto e de todas as taxas do canal.'
    },
    {
      q: 'Como funcionam os agentes de IA?',
      a: 'O Agente CFO analisa seu produto, suas campanhas e seu caixa e responde perguntas em português. O agente estilo WhatsApp entende mensagens como "gastei 50 no mercado" e lança a despesa automaticamente. É preciso estar logado para usar.'
    },
    {
      q: 'Meus dados ficam seguros?',
      a: 'Sim. Os dados ficam salvos na nuvem e cada conta acessa somente as próprias informações. O login é protegido por senha ou pela sua conta Google.'
    },
    {
      q: 'Funciona com outras moedas?',
      a: 'Sim. A calculadora aceita real, dólar, euro, libra, iene, yuan e moedas da América Latina, como peso argentino, chileno, mexicano e colombiano e o sol peruano.'
    }
  ];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Simulador do topo da página (versão simplificada da calculadora completa)
  const [simCost, setSimCost] = useState(52.5);
  const [simPrice, setSimPrice] = useState(149.9);
  const [simFees, setSimFees] = useState(18);
  const [simAds, setSimAds] = useState(35);

  const simFeesValue = simPrice * (simFees / 100);
  const simBreakevenCpa = simPrice - simCost - simFeesValue;
  const simProfit = simBreakevenCpa - simAds;
  const simMargin = simPrice > 0 ? (simProfit / simPrice) * 100 : 0;
  const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const goToApp = () => (currentUser ? onEnterPlatform() : openAuthModal('register'));

  const navLinks = [
    { href: '#recursos', label: 'Recursos' },
    { href: '#ia', label: 'Agentes de IA' },
    { href: '#como-funciona', label: 'Como funciona' },
    { href: '#planos', label: 'Planos' },
    { href: '#faq', label: 'Dúvidas' }
  ];

  const pains = [
    {
      icon: Receipt,
      title: 'Taxas que comem a margem',
      text: 'Comissão do marketplace, gateway, checkout, imposto e frete somados levam embora um pedaço do preço que você nem percebe.'
    },
    {
      icon: Target,
      title: 'Anúncio acima do limite',
      text: 'Sem saber o CPA máximo, cada venda paga pelo tráfego pode estar dando prejuízo enquanto o faturamento cresce.'
    },
    {
      icon: Layers,
      title: 'Dinheiro da loja e pessoal misturados',
      text: 'Contas, cartões, dívidas e despesas da casa no mesmo lugar escondem quanto a operação realmente lucra.'
    }
  ];

  const pillars = [
    {
      tag: 'E-commerce & Tráfego',
      color: 'blue',
      icon: Calculator,
      title: 'Saiba o lucro real de cada venda',
      items: [
        'Calculadora de preço com CMV, frete, embalagem, ICMS, gateway, checkout e reserva',
        'CPA Breakeven: o máximo que você pode pagar por venda em anúncios',
        'Planejamento de Ads e Bússola de Métricas',
        'DRE financeiro e simulação de escala do faturamento'
      ]
    },
    {
      tag: 'Finanças da loja e pessoais',
      color: 'emerald',
      icon: Wallet,
      title: 'Organize o dinheiro em um só lugar',
      items: [
        'Contas, cartões, receitas, despesas e extrato',
        'Dívidas e parcelas, metas e reservas',
        'Agenda de vencimentos, categorias com teto de gastos e relatórios',
        'Modos separados para você e para a empresa'
      ]
    },
    {
      tag: 'Inteligência Artificial',
      color: 'indigo',
      icon: Bot,
      title: 'Um CFO de bolso que conhece seus números',
      items: [
        'Agente CFO que analisa produto, tráfego e caixa juntos',
        'Agente estilo WhatsApp que registra gastos por mensagem',
        'Sugestões de oferta, kits e pontos de atenção do caixa',
        'Respostas em português, direto ao ponto'
      ]
    }
  ];

  const pillarColors: Record<string, { badge: string; icon: string; check: string }> = {
    blue: { badge: 'text-blue-300 bg-blue-500/10 border-blue-500/20', icon: 'bg-blue-500/10 text-blue-400', check: 'text-blue-400' },
    emerald: { badge: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20', icon: 'bg-emerald-500/10 text-emerald-400', check: 'text-emerald-400' },
    indigo: { badge: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20', icon: 'bg-indigo-500/10 text-indigo-400', check: 'text-indigo-400' }
  };

  const extras = [
    { icon: CalendarClock, label: 'Agenda & vencimentos' },
    { icon: PiggyBank, label: 'Metas & reservas' },
    { icon: BarChart3, label: 'Relatórios & gráficos' },
    { icon: ShoppingCart, label: 'Lista de mercado' },
    { icon: Car, label: 'Veículos & combustível' },
    { icon: Award, label: 'Gamificação & níveis' },
    { icon: Puzzle, label: 'Extensão do navegador' },
    { icon: Globe, label: 'Várias moedas' }
  ];

  const channels = ['Dropshipping', 'Shopee', 'Mercado Livre', 'TikTok Shop'];

  const steps = [
    { n: '1', title: 'Crie sua conta', text: 'Cadastro gratuito com e-mail ou Google, em menos de um minuto.' },
    { n: '2', title: 'Cadastre seus custos', text: 'Informe custo do produto, taxas do canal e quanto investe em anúncios.' },
    { n: '3', title: 'Decida com números', text: 'Veja margem, CPA máximo e lucro projetado, e pergunte ao Agente CFO.' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-['Plus_Jakarta_Sans'] antialiased selection:bg-blue-600 selection:text-white">
      {/* Barra de Navegação Superior */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <a href="#topo" className="flex items-center gap-2.5 shrink-0">
            <img src="/logo-192.png" alt="" className="w-9 h-9 rounded-xl shadow-lg shadow-blue-500/25" />
            <span className="font-extrabold text-lg tracking-tight text-white">Gerenciie</span>
            <span className="hidden sm:inline text-[10px] font-bold tracking-wider uppercase bg-blue-500/15 text-blue-300 border border-blue-500/25 px-1.5 py-0.5 rounded-md">
              Pro
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-white transition-colors">{l.label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {onOpenAdmin && currentUser?.role === 'admin' && (
              <button
                onClick={onOpenAdmin}
                className="hidden sm:flex px-3 py-2 rounded-lg text-amber-300 hover:bg-amber-500/10 font-semibold text-xs items-center gap-1.5 transition-colors cursor-pointer"
                title="Acessar Painel de Administração"
              >
                <ShieldCheck size={14} />
                <span>Admin</span>
              </button>
            )}

            {currentUser ? (
              <button
                onClick={onEnterPlatform}
                className="px-4 py-2 rounded-lg bg-white text-slate-950 hover:bg-slate-200 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Abrir painel</span>
                <ArrowRight size={15} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('login')}
                  className="hidden sm:block px-4 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/5 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Entrar
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  Começar grátis
                </button>
              </>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-300 cursor-pointer"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-white/5 px-4 py-3 flex flex-col text-sm font-medium text-slate-300">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 hover:text-white transition-colors"
              >
                {l.label}
              </a>
            ))}
            {!currentUser && (
              <button
                onClick={() => { setMobileMenuOpen(false); openAuthModal('login'); }}
                className="py-2.5 text-left hover:text-white transition-colors cursor-pointer"
              >
                Entrar na conta
              </button>
            )}
            {onOpenAdmin && currentUser?.role === 'admin' && (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAdmin(); }}
                className="py-2.5 text-left text-amber-300 cursor-pointer"
              >
                Painel Admin
              </button>
            )}
          </nav>
        )}
      </header>

      {/* Hero */}
      <section id="topo" className="relative overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-blue-600/20 blur-[160px] rounded-full pointer-events-none" />
        <div className="absolute top-40 -right-40 w-[500px] h-[500px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-20 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-14 items-center">
          <div className="space-y-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Para e-commerce, dropshipping e marketplaces
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Pare de vender muito e{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-300">
                lucrar pouco.
              </span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Descubra o lucro real de cada venda, o máximo que você pode pagar em anúncios e para onde vai o dinheiro da sua operação. Com um Agente CFO de IA para tirar as dúvidas.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <button
                onClick={goToApp}
                className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-base shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                {currentUser ? `Abrir meu painel, ${currentUser.displayName?.split(' ')[0] || 'lojista'}` : 'Criar conta grátis'}
                <ArrowRight size={18} />
              </button>
              {!currentUser && (
                <button
                  onClick={() => handleQuickLogin('Visitante', 'visitante@gerenciie.com.br')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Play size={16} className="text-blue-300" />
                  Testar sem cadastro
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-400" /> Sem cartão de crédito</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-400" /> Entre com Google</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-400" /> Dados salvos na nuvem</span>
            </div>
          </div>

          {/* Simulador */}
          <div className="relative">
            <div className="absolute -inset-px rounded-[28px] bg-gradient-to-b from-blue-500/40 via-indigo-500/20 to-transparent pointer-events-none" />
            <div className="relative bg-slate-900/90 backdrop-blur rounded-[28px] p-6 sm:p-7 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">Simulador rápido</p>
                  <h2 className="text-lg font-bold text-white">Quanto sobra de cada venda?</h2>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Calculator size={20} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Custo do produto', value: simCost, set: setSimCost, prefix: 'R$' },
                  { label: 'Preço de venda', value: simPrice, set: setSimPrice, prefix: 'R$' },
                  { label: 'Taxas e impostos', value: simFees, set: setSimFees, suffix: '%' },
                  { label: 'Anúncio por venda', value: simAds, set: setSimAds, prefix: 'R$' }
                ].map((f) => (
                  <label key={f.label} className="block">
                    <span className="text-xs font-medium text-slate-400">{f.label}</span>
                    <div className="mt-1 flex items-center bg-slate-950 border border-slate-800 focus-within:border-blue-500 rounded-xl px-3 transition-colors">
                      {f.prefix && <span className="text-sm text-slate-500 mr-1">{f.prefix}</span>}
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        value={Number.isFinite(f.value) ? f.value : 0}
                        onChange={(e) => f.set(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full min-w-0 py-2.5 bg-transparent text-sm font-semibold text-white focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {f.suffix && <span className="text-sm text-slate-500 ml-1">{f.suffix}</span>}
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2.5">
                <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3">
                  <p className="text-[11px] font-medium text-slate-400">Lucro por venda</p>
                  <p className={`mt-1 text-base sm:text-lg font-extrabold ${simProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{brl(simProfit)}</p>
                </div>
                <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3">
                  <p className="text-[11px] font-medium text-slate-400">Margem líquida</p>
                  <p className={`mt-1 text-base sm:text-lg font-extrabold ${simMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{simMargin.toFixed(1)}%</p>
                </div>
                <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3">
                  <p className="text-[11px] font-medium text-slate-400">CPA máximo</p>
                  <p className="mt-1 text-base sm:text-lg font-extrabold text-white">{brl(Math.max(0, simBreakevenCpa))}</p>
                </div>
              </div>

              <p className={`mt-4 text-sm font-medium rounded-xl px-3 py-2.5 flex items-start gap-2 ${
                simProfit >= 0 ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'
              }`}>
                {simProfit >= 0 ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                {simProfit >= 0
                  ? `Cada venda deixa ${brl(simProfit)} no bolso. Acima de ${brl(Math.max(0, simBreakevenCpa))} por venda em anúncio, dá prejuízo.`
                  : `Com esse anúncio, cada venda dá ${brl(Math.abs(simProfit))} de prejuízo. O limite é ${brl(Math.max(0, simBreakevenCpa))} por venda.`}
              </p>

              <p className="mt-3 text-[11px] text-slate-500">
                Versão simplificada. Na plataforma, a calculadora inclui frete, embalagem, ICMS, checkout, reserva e regras de cada canal.
              </p>
            </div>
          </div>
        </div>

        {/* Canais */}
        <div className="relative border-y border-white/5 bg-white/[0.02]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Regras prontas para</span>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
              {channels.map((c) => (
                <span key={c} className="text-base font-bold text-slate-300">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problema */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <div className="max-w-2xl mb-12">
          <p className="text-sm font-semibold text-rose-300 mb-3">O problema</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Faturar alto não significa lucrar.
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            A maioria das lojas descobre o prejuízo só no fim do mês. Estes são os vazamentos mais comuns:
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {pains.map((p) => (
            <div key={p.title} className="rounded-3xl border border-white/5 bg-slate-900/40 p-7">
              <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-5">
                <p.icon size={22} />
              </div>
              <h3 className="text-lg font-bold text-white">{p.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-400">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recursos */}
      <section id="recursos" className="scroll-mt-20 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-blue-300 mb-3">A solução</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Tudo o que você precisa para dominar seus números
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Feito para a realidade de taxas, impostos e tráfego pago de quem vende online no Brasil.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {pillars.map((p) => {
              const c = pillarColors[p.color];
              return (
                <div key={p.tag} className="rounded-3xl border border-white/5 bg-slate-950/60 p-7 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${c.badge}`}>{p.tag}</span>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.icon}`}>
                      <p.icon size={22} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white">{p.title}</h3>
                  <ul className="mt-5 space-y-3">
                    {p.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-[15px] text-slate-300 leading-snug">
                        <Check size={17} className={`shrink-0 mt-0.5 ${c.check}`} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            <p className="text-center text-sm font-medium text-slate-500 mb-5">E ainda:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {extras.map((e) => (
                <div key={e.label} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-950/40 px-4 py-3.5">
                  <e.icon size={18} className="text-slate-400 shrink-0" />
                  <span className="text-sm font-medium text-slate-300">{e.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Agentes de IA */}
      <section id="ia" className="scroll-mt-20 max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-sm font-semibold text-indigo-300 mb-3">Agentes de IA</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Pergunte como falaria com seu financeiro.
          </h2>
          <p className="mt-4 text-lg text-slate-400 leading-relaxed">
            O Agente CFO enxerga seu produto, suas campanhas e seu caixa ao mesmo tempo. Pergunte se dá para subir o investimento em anúncios, como montar um kit ou onde está o vazamento.
          </p>
          <ul className="mt-7 space-y-4">
            <li className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-300 flex items-center justify-center shrink-0"><Bot size={20} /></div>
              <div>
                <p className="font-bold text-white">Agente CFO</p>
                <p className="text-[15px] text-slate-400">Análises de margem, tráfego, escala e saúde do caixa.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-300 flex items-center justify-center shrink-0"><MessageCircle size={20} /></div>
              <div>
                <p className="font-bold text-white">Agente financeiro estilo WhatsApp</p>
                <p className="text-[15px] text-slate-400">Escreva "gastei 50 no mercado" e a despesa é lançada na conta certa.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Exemplo de conversa */}
        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 sm:p-6 shadow-2xl">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center"><Bot size={18} /></div>
            <div>
              <p className="text-sm font-bold">Gerenciie CFO</p>
              <p className="text-xs text-slate-500">Exemplo de conversa</p>
            </div>
          </div>
          <div className="pt-5 space-y-3 text-[15px]">
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-blue-600 px-4 py-2.5">
              Posso subir R$ 500 por dia no Facebook Ads?
            </div>
            <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-slate-800 px-4 py-3 text-slate-200 leading-relaxed">
              Seu CPA máximo hoje é R$ 62,38 e o CPA atual está em R$ 41,00. Há folga, mas suba aos poucos: 20% a cada 2 dias, mantendo o CPA abaixo de R$ 50 para preservar 10% de margem.
            </div>
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-blue-600 px-4 py-2.5">
              E o caixa aguenta?
            </div>
            <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-slate-800 px-4 py-3 text-slate-200 leading-relaxed">
              Com o saldo atual, você cobre 9 dias desse investimento antes do repasse do gateway. Recomendo reservar o pagamento do fornecedor primeiro.
            </div>
          </div>
          <p className="mt-4 text-[11px] text-slate-500">Valores ilustrativos. As respostas usam os dados da sua conta.</p>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="scroll-mt-20 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-emerald-300 mb-3">Como funciona</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Do cadastro à decisão em minutos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {steps.map((s) => (
              <div key={s.n} className="rounded-3xl border border-white/5 bg-slate-950/60 p-7">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-extrabold mb-5">{s.n}</div>
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-[15px] text-slate-400 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-white/5 bg-slate-950/60 p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Lock size={22} />
            </div>
            <div>
              <p className="font-bold">Seus dados são só seus</p>
              <p className="text-[15px] text-slate-400">Cada conta acessa apenas as próprias informações, com login protegido por e-mail ou Google.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="scroll-mt-20 max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold text-blue-300 mb-3">Planos</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Comece grátis. Evolua quando a operação crescer.</h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 items-stretch">
          {/* Free */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-7 flex flex-col">
            <h3 className="text-lg font-bold">Free Starter</h3>
            <p className="text-sm text-slate-400 mt-1">Para validar produtos e preços.</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold">R$ 0</span>
              <span className="text-sm text-slate-400">/mês</span>
            </div>
            <ul className="mt-7 space-y-3 text-[15px] text-slate-300 flex-1">
              {['Calculadora de precificação completa', 'CPA Breakeven e margem líquida', 'Várias moedas (BRL, USD, EUR e outras)'].map((i) => (
                <li key={i} className="flex items-start gap-2.5"><Check size={17} className="text-emerald-400 shrink-0 mt-0.5" />{i}</li>
              ))}
            </ul>
            <button
              onClick={goToApp}
              className="mt-8 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-sm transition-colors cursor-pointer"
            >
              Criar conta grátis
            </button>
          </div>

          {/* Pro */}
          <div className="relative rounded-3xl border-2 border-blue-500 bg-gradient-to-b from-blue-950/60 to-slate-900/60 p-7 flex flex-col shadow-2xl shadow-blue-600/10">
            <span className="absolute -top-3 left-7 bg-blue-600 text-xs font-bold px-3 py-1 rounded-full">Mais escolhido</span>
            <h3 className="text-lg font-bold">Pro CFO Unlimited</h3>
            <p className="text-sm text-slate-400 mt-1">Para quem já investe em tráfego.</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold">R$ 49</span>
              <span className="text-sm text-slate-400">/mês</span>
            </div>
            <ul className="mt-7 space-y-3 text-[15px] text-slate-200 flex-1">
              {['Tudo do plano Free', 'Dados salvos na nuvem', 'Planejamento de tráfego e simulação de escala', 'DRE financeiro e relatórios', 'Agentes de IA (CFO e WhatsApp)'].map((i) => (
                <li key={i} className="flex items-start gap-2.5"><Check size={17} className="text-blue-400 shrink-0 mt-0.5" />{i}</li>
              ))}
            </ul>
            <button
              onClick={goToApp}
              className="mt-8 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm shadow-lg shadow-blue-600/25 transition-colors cursor-pointer"
            >
              Quero o Pro
            </button>
          </div>

          {/* Enterprise */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-7 flex flex-col">
            <h3 className="text-lg font-bold">Enterprise VIP</h3>
            <p className="text-sm text-slate-400 mt-1">Para agências e grandes operações.</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold">R$ 149</span>
              <span className="text-sm text-slate-400">/mês</span>
            </div>
            <ul className="mt-7 space-y-3 text-[15px] text-slate-300 flex-1">
              {['Tudo do plano Pro', 'Multi-usuários e equipe', 'Múltiplas lojas e canais', 'Suporte prioritário com especialista'].map((i) => (
                <li key={i} className="flex items-start gap-2.5"><Check size={17} className="text-emerald-400 shrink-0 mt-0.5" />{i}</li>
              ))}
            </ul>
            <button
              onClick={goToApp}
              className="mt-8 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-sm transition-colors cursor-pointer"
            >
              Falar com consultor
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center mb-10">Perguntas frequentes</h2>
          <div className="divide-y divide-white/5 rounded-3xl border border-white/5 bg-slate-950/60 overflow-hidden">
            {faqs.map((faq, idx) => (
              <div key={idx}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  aria-expanded={openFaq === idx}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-semibold text-base text-white hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={20} className={`shrink-0 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <p className="px-6 pb-5 -mt-1 text-[15px] text-slate-400 leading-relaxed">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-14 sm:px-14 text-center">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="relative text-3xl sm:text-4xl font-extrabold tracking-tight">Descubra hoje quanto você lucra de verdade.</h2>
          <p className="relative mt-4 text-lg text-blue-100 max-w-xl mx-auto">
            Crie sua conta grátis e calcule o lucro real do seu primeiro produto em poucos minutos.
          </p>
          <div className="relative mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={goToApp}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-base flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {currentUser ? 'Abrir meu painel' : 'Criar conta grátis'}
              <ArrowRight size={18} />
            </button>
            {!currentUser && (
              <button
                onClick={() => openAuthModal('login')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-white/30 hover:bg-white/10 font-semibold text-base transition-colors cursor-pointer"
              >
                Já tenho conta
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-5 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <img src="/logo-192.png" alt="" className="w-7 h-7 rounded-lg" />
            <span className="font-semibold text-slate-400">Gerenciie Pro © {new Date().getFullYear()}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-slate-300 transition-colors">{l.label}</a>
            ))}
            {!currentUser && (
              <button onClick={() => openAuthModal('login')} className="hover:text-slate-300 transition-colors cursor-pointer">Entrar</button>
            )}
          </div>
        </div>
      </footer>

      {/* Modal de Autenticação / Acesse Sua Conta ou Crie Seu Perfil Pro */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="fixed inset-0" 
            onClick={closeAuthModal} 
          />

          <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-[32px] p-6 sm:p-8 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

            {/* Botão Fechar */}
            <button
              onClick={closeAuthModal}
              className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Cabeçalho do Modal */}
            <div className="mb-6 pr-8">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                <Lock size={12} />
                <span>Área de Membros & Acesso</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight italic">
                Acesse Sua Conta ou Crie Seu Perfil Pro
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Sincronize cálculos, precificações e cenários em tempo real.
              </p>
            </div>

            {/* Conteúdo */}
            <div className="space-y-4">
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
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl text-xs font-black flex items-center justify-center gap-3 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-md"
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
                  {loading ? 'Processando...' : authMode === 'login' ? 'Acessar Conta' : 'Criar Conta e Acessar'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
