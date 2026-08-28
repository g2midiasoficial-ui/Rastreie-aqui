import React, { useState } from 'react';
import { 
  Globe, ShieldCheck, TrendingUp, Target, Zap, Trophy, 
  ArrowRight, Check, Star, Play, Sparkles, CheckCircle2, 
  DollarSign, BarChart3, HelpCircle, ChevronDown, Lock,
  Users, Layers, ArrowUpRight, Flame, Scale, Gift, Award,
  Smartphone, Laptop, Package, MousePointerClick, FileText,
  BadgeCheck, HeartHandshake
} from 'lucide-react';
import { formatCurrency } from '../../utils/calculations.ts';

interface SalesLandingPageProps {
  onEnterPlatform: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const SalesLandingPage: React.FC<SalesLandingPageProps> = ({
  onEnterPlatform,
  onOpenAuth
}) => {
  // Mini simulador interativo na Landing Page
  const [demoCost, setDemoCost] = useState<number>(45);
  const [demoPrice, setDemoPrice] = useState<number>(149.90);
  const [demoAdsSpend, setDemoAdsSpend] = useState<number>(35);
  const [demoTaxPercent, setDemoTaxPercent] = useState<number>(6);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Cálculos do mini simulador
  const demoTaxValue = demoPrice * (demoTaxPercent / 100);
  const demoGatewayFee = demoPrice * 0.05 + 1.00; // Taxa média gateway/checkout
  const demoTotalCosts = demoCost + demoAdsSpend + demoTaxValue + demoGatewayFee;
  const demoNetProfit = demoPrice - demoTotalCosts;
  const demoMargin = demoPrice > 0 ? (demoNetProfit / demoPrice) * 100 : 0;
  const demoBreakevenCPA = Math.max(0, demoPrice - (demoCost + demoTaxValue + demoGatewayFee));
  const demoMinROAS = demoBreakevenCPA > 0 ? (demoPrice / demoBreakevenCPA) : 0;

  const faqs = [
    {
      q: 'Para quem foi criada a plataforma Gerenciie Pro?',
      a: 'Para lojistas e gestores de Dropshipping, Shopee, Mercado Livre e TikTok Shop que precisam precificar com precisão milimétrica, controlar o CPA Breakeven dos anúncios, projetar DRE mensal e gerenciar afiliados com gamificação.'
    },
    {
      q: 'Como a plataforma me protege de tomar prejuízo em anúncios (Facebook/TikTok/Google Ads)?',
      a: 'Nossa Bússola e Calculadora CFO calculam automaticamente o seu CPA Breakeven (Custo Máximo por Aquisição) e o ROAS Mínimo antes de você colocar dinheiro nas campanhas. Se o CPA subir além do limite, a ferramenta emite um diagnóstico visual de alerta.'
    },
    {
      q: 'A plataforma já suporta impostos brasileiros e taxas de checkout?',
      a: 'Sim! Suporta Simples Nacional, Lucro Presumido, MEI, ICMS, taxas de gateway (Pix, Cartão, Boleto), taxa de checkout (Yampi/Appmax/Shopify) e reserva financeira de segurança.'
    },
    {
      q: 'Como funciona o Módulo de Gamificação de Afiliados?',
      a: 'Você pode cadastrar níveis personalizados (Bronze, Prata, Ouro, Diamante, VIP) com fotos reais das recompensas (iPhone, Apple Watch, PlayStation, Viagens, Troféus) e bônus em dinheiro, além de gerar o extrato de pagamento e marcar quitações via PIX em lote.'
    },
    {
      q: 'Posso acessar no celular ou tablet?',
      a: 'Sim! A interface é 100% responsiva e otimizada para computadores, notebooks, tablets e smartphones.'
    }
  ];

  const testimonials = [
    {
      name: 'Matheus Ribeiro',
      role: 'Fundador de Operação Dropshipping 7D',
      text: 'Antes eu achava que tinha 35% de margem, mas não embutia a reserva de gateway e as taxas ocultas de checkout. A Gerenciie me salvou de escalar um produto que dava prejuízo disfarçado.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      revenue: '+ R$ 240k/mês'
    },
    {
      name: 'Camila Fontana',
      role: 'Top Seller Mercado Livre & Shopee',
      text: 'A precisão com as comissões dos marketplaces e o DRE automático economizam horas da minha semana. Agora sei exatamente quanto dinheiro posso reinvestir no estoque.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      revenue: 'Margem Líquida: 24.8%'
    },
    {
      name: 'Rodrigo Brandão',
      role: 'Gestor de Tráfego & Afiliados',
      text: 'O módulo de gamificação com fotos dos prêmios e o cálculo do CPA breakeven motivou meus afiliados a dobrarem as vendas em menos de 4 semanas. Incrível!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      revenue: 'ROAS Médio: 3.4x'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-['Plus_Jakarta_Sans'] selection:bg-blue-600 selection:text-white">
      {/* HEADER / NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onEnterPlatform}>
            <div className="w-10 h-10 blue-gradient rounded-xl flex items-center justify-center text-white shadow-md">
              <Globe size={22} />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-black flex items-center gap-1.5">
                Gerenciie <span className="text-blue-600 font-black">PRO</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 block -mt-1">
                CFO & Gestão de E-commerce
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-xs font-black text-slate-600 uppercase tracking-wider">
            <a href="#recursos" className="hover:text-blue-600 transition-colors">Recursos</a>
            <a href="#calculadora" className="hover:text-blue-600 transition-colors">Calculadora Ao Vivo</a>
            <a href="#gamificacao" className="hover:text-blue-600 transition-colors">Gamificação</a>
            <a href="#depoimentos" className="hover:text-blue-600 transition-colors">Depoimentos</a>
            <a href="#planos" className="hover:text-blue-600 transition-colors">Planos & Preços</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">Dúvidas</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-700 hover:text-black hover:bg-slate-100 transition-all uppercase tracking-wider"
            >
              Entrar
            </button>
            <button
              onClick={onEnterPlatform}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
            >
              <span>Acessar Plataforma</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-24 overflow-hidden border-b border-slate-200/60 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/60">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Badge de destaque */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider shadow-xs">
              <Sparkles size={14} className="text-blue-600" />
              <span>O Sistema Operacional Financeiro do E-commerce Lucrativo</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 leading-[1.12]">
              Pare de vender no escuro. <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                Descubra o Lucro Líquido Real
              </span> da sua Operação.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
              A única plataforma completa para <strong>Dropshipping, Shopee, Mercado Livre e TikTok Shop</strong> que 
              combina <strong>Precificação Inteligente, Breakeven de Ads, Bússola de KPIs, DRE Instantâneo</strong> e <strong>Gamificação de Afiliados</strong>.
            </p>

            {/* CTAs Principais */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onEnterPlatform}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-black uppercase tracking-wider shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>Acessar Plataforma Agora</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => onOpenAuth('register')}
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-2xl text-sm font-black uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all hover:border-slate-400"
              >
                <Lock size={16} className="text-blue-600" />
                <span>Criar Conta Gratuita</span>
              </button>
            </div>

            {/* Badges de confiança */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-500" /> Sem necessidade de cartão para testar
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-500" /> 11 Moedas Mundiais (BRL, USD, EUR...)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-500" /> Fórmulas Fiscais 100% Atualizadas
              </span>
            </div>
          </div>

          {/* MOCKUP INTERATIVO / PREVIEW DO PAINEL */}
          <div className="mt-14 max-w-5xl mx-auto rounded-[36px] bg-slate-900 p-4 sm:p-6 shadow-2xl border border-slate-800 relative group overflow-hidden">
            <div className="bg-gradient-to-r from-slate-950 to-slate-900 rounded-[28px] p-6 sm:p-8 text-white space-y-6">
              {/* Barra superior de controle do mockup */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-bold text-slate-400">painel.gerenciie.com/cfo-dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-[10px] font-black uppercase">
                    Status: Operação Saudável
                  </span>
                </div>
              </div>

              {/* Cards de Métricas Rápidas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <p className="text-[9px] font-black uppercase text-slate-400">Preço Sugerido</p>
                  <p className="text-2xl font-black text-blue-400 mt-1">R$ 149,90</p>
                  <span className="text-[10px] text-emerald-400 font-bold">Markup 2.8x</span>
                </div>
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <p className="text-[9px] font-black uppercase text-slate-400">Margem Líquida Real</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">28.4%</p>
                  <span className="text-[10px] text-slate-400 font-bold">R$ 42,57 por pedido</span>
                </div>
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <p className="text-[9px] font-black uppercase text-slate-400">CPA Breakeven (Ads)</p>
                  <p className="text-2xl font-black text-yellow-400 mt-1">R$ 68,20</p>
                  <span className="text-[10px] text-slate-400 font-bold">Custo máx por venda</span>
                </div>
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <p className="text-[9px] font-black uppercase text-slate-400">ROAS Mínimo Equilíbrio</p>
                  <p className="text-2xl font-black text-purple-400 mt-1">2.20x</p>
                  <span className="text-[10px] text-slate-400 font-bold">Ponto de lucro zero</span>
                </div>
              </div>

              {/* Banner de Ação no Mockup */}
              <div className="p-4 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">Simule sua Operação na Prática</p>
                    <p className="text-xs text-slate-300">Acesse agora a versão completa com todas as ferramentas liberadas.</p>
                  </div>
                </div>
                <button
                  onClick={onEnterPlatform}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap"
                >
                  Abrir Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MINI CALCULADORA INTERATIVA DIRETO NA LANDING PAGE */}
      <section id="calculadora" className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black uppercase">
              <Zap size={14} /> Demonstração Interativa
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
              Teste Agora: Quanto sobra no seu bolso por venda?
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Altere os valores abaixo e veja a mágica do cálculo financeiro em tempo real.
            </p>
          </div>

          <div className="bg-slate-50 rounded-[36px] p-8 md:p-12 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Controles do Mini Simulador */}
            <div className="lg:col-span-6 space-y-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <DollarSign size={20} className="text-blue-600" /> Parâmetros do Produto
              </h3>

              <div>
                <div className="flex justify-between items-center mb-1 text-xs font-black">
                  <span className="text-slate-600 uppercase">Custo do Produto (CMV + Frete Fábrica)</span>
                  <span className="text-blue-600 font-black">{formatCurrency(demoCost, 'BRL')}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="1"
                  value={demoCost}
                  onChange={(e) => setDemoCost(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 text-xs font-black">
                  <span className="text-slate-600 uppercase">Preço de Venda ao Cliente</span>
                  <span className="text-emerald-600 font-black">{formatCurrency(demoPrice, 'BRL')}</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="500"
                  step="5"
                  value={demoPrice}
                  onChange={(e) => setDemoPrice(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 text-xs font-black">
                  <span className="text-slate-600 uppercase">CPA Médio em Anúncios (Gasto por Venda)</span>
                  <span className="text-purple-600 font-black">{formatCurrency(demoAdsSpend, 'BRL')}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  step="1"
                  value={demoAdsSpend}
                  onChange={(e) => setDemoAdsSpend(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Imposto Simples Nacional</span>
                  <p className="text-sm font-black text-slate-800">{demoTaxPercent}% ({formatCurrency(demoTaxValue, 'BRL')})</p>
                </div>
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Taxa Checkout & Gateway</span>
                  <p className="text-sm font-black text-slate-800">{formatCurrency(demoGatewayFee, 'BRL')}</p>
                </div>
              </div>
            </div>

            {/* Resultado do Mini Simulador */}
            <div className="lg:col-span-6 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 rounded-[32px] p-8 text-white flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">
                    Diagnóstico Financeiro Instantâneo
                  </span>
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${
                    demoNetProfit > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {demoNetProfit > 0 ? 'Lucrativo' : 'Prejuízo!'}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase">Lucro Líquido no Bolso:</span>
                    <h4 className={`text-4xl font-black tracking-tight ${demoNetProfit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(demoNetProfit, 'BRL')}
                    </h4>
                    <p className="text-xs text-slate-300 font-semibold mt-1">
                      Margem Líquida Real: <strong className="text-white">{demoMargin.toFixed(1)}%</strong>
                    </p>
                  </div>

                  <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-300">
                      <span>CPA Breakeven (Limite de Ads):</span>
                      <span className="text-yellow-300 font-black">{formatCurrency(demoBreakevenCPA, 'BRL')}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-300">
                      <span>ROAS de Equilíbrio:</span>
                      <span className="text-purple-300 font-black">{demoMinROAS.toFixed(2)}x</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/10">
                <button
                  onClick={onEnterPlatform}
                  className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <span>Abrir na Plataforma Completa</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO GRID DE RECURSOS */}
      <section id="recursos" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black uppercase">
            <Layers size={14} /> Arsenal de Ferramentas
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950">
            Tudo o que você precisa para dominar as finanças do seu e-commerce.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Desenvolvido por quem vive o campo de batalha das vendas online todos os dias.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Calculadora CFO de Alta Precisão</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Calcule markup desejado, preço ideal de venda e todas as deduções (impostos, gateways, checkouts e fretes) sem esquecer nenhuma taxa invisível.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Planejamento & Diagnóstico de Ads</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Monitore impressões, cliques (CTR/CPC), funil de carrinho (ATC), checkout (IC) e vendas. Saiba exatamente onde está o vazamento de dinheiro da sua campanha.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Bússola de KPIs Financeiros</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Avaliação de saúde da operação com alertas em tempo real. Veja sua margem de contribuição e se seus custos fixos estão bem diluídos.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Simulador de Escala de Vendas</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Veja quanto de caixa e lucro líquido você terá ao multiplicar suas vendas por 2x, 5x ou 10x antes de arriscar o orçamento.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <FileText size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900">DRE Automatizado & Exportação</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Demonstração do Resultado do Exercício profissional gerada automaticamente com um clique, pronta para impressão ou compartilhamento com sócios.
            </p>
          </div>

          {/* Card 6 - Gamificação */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-[32px] p-8 shadow-md space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center border border-yellow-400/30">
              <Trophy size={24} />
            </div>
            <h3 className="text-xl font-black text-white">Gamificação & Fechamento de Afiliados</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Engaje seus afiliados com metas e prêmios (iPhone, Smartwatch, Viagens, Bônus PIX) e feche os pagamentos da equipe inteira com 1 clique.
            </p>
          </div>
        </div>
      </section>

      {/* GAMIFICAÇÃO EM DESTAQUE */}
      <section id="gamificacao" className="py-20 bg-gradient-to-b from-slate-50 to-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-100 text-yellow-900 text-xs font-black uppercase">
                <Trophy size={14} className="text-yellow-600" /> Níveis de Metas & Recompensas
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
                Transforme seus afiliados em uma máquina de vendas imparável.
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Crie níveis com fotos em alta definição dos prêmios, bônus em dinheiro e acompanhe em tempo real 
                o faturamento gerado versus o valor retido pela sua loja.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check size={14} />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Adicione fotos e ícones personalizados para cada premiação</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check size={14} />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Extrato automático de comissão base + bônus PIX</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check size={14} />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Controle de pagamentos pendentes e quitados em lote</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onEnterPlatform}
                  className="px-6 py-3.5 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <Award size={16} className="text-yellow-400" />
                  <span>Ver Módulo de Gamificação</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200">
                  <img 
                    src="https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=200&auto=format&fit=crop&q=80" 
                    alt="Troféu" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-amber-700">Tier Bronze (50 Vendas)</span>
                  <h4 className="text-xs font-black text-slate-900">Kit Boas-Vindas + Troféu</h4>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">+ Bônus R$ 200 via PIX</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200">
                  <img 
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80" 
                    alt="Headset" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-600">Tier Prata (150 Vendas)</span>
                  <h4 className="text-xs font-black text-slate-900">Headset Gamer Pro Bluetooth</h4>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">+ Bônus R$ 600 via PIX</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-yellow-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200">
                  <img 
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80" 
                    alt="Smartwatch" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-yellow-700">Tier Ouro (350 Vendas)</span>
                  <h4 className="text-xs font-black text-slate-900">Apple Watch Ultra</h4>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">+ Bônus R$ 1.500 via PIX</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-cyan-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200">
                  <img 
                    src="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200&auto=format&fit=crop&q=80" 
                    alt="iPhone 16 Pro" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-cyan-700">Tier Diamante (800 Vendas)</span>
                  <h4 className="text-xs font-black text-slate-900">iPhone 16 Pro + Resort VIP</h4>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">+ Bônus R$ 4.000 via PIX</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS / PROVA SOCIAL */}
      <section id="depoimentos" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black uppercase">
            <HeartHandshake size={14} /> Histórias de Sucesso
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950">
            Quem usa a Gerenciie Pro, não troca por planilha nenhuma.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <div key={idx} className="bg-white rounded-[32px] p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex gap-1 text-yellow-400">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 font-medium italic leading-relaxed">
                  "{item.text}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <img 
                  src={item.avatar} 
                  alt={item.name} 
                  className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0" 
                />
                <div className="overflow-hidden">
                  <h4 className="text-xs font-black text-slate-900 truncate">{item.name}</h4>
                  <p className="text-[10px] text-slate-500 font-medium truncate">{item.role}</p>
                  <span className="text-[9px] font-black text-blue-600 block mt-0.5">{item.revenue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PLANOS & PREÇOS (PRICING) */}
      <section id="planos" className="py-24 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black uppercase">
              <BadgeCheck size={14} /> Planos Transparentes
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950">
              Invista no único sistema que se paga no primeiro produto minerado.
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Escolha a melhor opção para a sua fase e tenha acesso imediato a todas as ferramentas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* PLANO STARTER (MENSAL) */}
            <div className="bg-white rounded-[36px] p-8 border border-slate-200 shadow-xs flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">Plano Starter</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">Mensal</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Para quem está testando os primeiros produtos.</p>
                </div>

                <div className="pt-2">
                  <span className="text-4xl font-black text-slate-950">R$ 47</span>
                  <span className="text-xs font-bold text-slate-500"> / mês</span>
                </div>

                <ul className="space-y-3 text-xs font-bold text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-500 shrink-0" />
                    <span>Calculadora CFO Ilimitada</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-500 shrink-0" />
                    <span>Planejamento de Ads & CPA Breakeven</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-500 shrink-0" />
                    <span>Bússola de KPIs Financeiros</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-500 shrink-0" />
                    <span>Suporte a 11 Moedas Mundiais</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onEnterPlatform}
                className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Começar Mensal
              </button>
            </div>

            {/* PLANO PRO / ANUAL (MAIS POPULAR) */}
            <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-white rounded-[36px] p-8 border-2 border-blue-500 shadow-2xl relative flex flex-col justify-between space-y-8 md:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-md">
                Mais Escolhido • 50% OFF
              </div>

              <div className="space-y-6 pt-2">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-blue-400">Plano Anual PRO</span>
                  <h3 className="text-2xl font-black text-white mt-1">Acesso Anual Completo</h3>
                  <p className="text-xs text-slate-300 mt-1 font-medium">Tudo liberado com economia máxima.</p>
                </div>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">R$ 24,75</span>
                    <span className="text-xs font-bold text-slate-400"> / mês</span>
                  </div>
                  <p className="text-[11px] text-blue-300 font-bold mt-1">Cobrado R$ 297 anualmente</p>
                </div>

                <ul className="space-y-3 text-xs font-bold text-slate-200">
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span>Tudo do Plano Starter</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span>Módulo de Gamificação de Afiliados</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span>DRE Financeiro Automático & Exportação</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span>Simulador de Escala de Vendas (10x)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span>Esteira de Produtos e Campanhas Salvas</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onEnterPlatform}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/40 transition-all hover:scale-[1.02] active:scale-95"
              >
                Garantir Plano Anual PRO
              </button>
            </div>

            {/* PLANO VITALÍCIO VIP */}
            <div className="bg-white rounded-[36px] p-8 border border-slate-200 shadow-xs flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-purple-600">Plano Vitalício</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">Scale VIP</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Acesso permanente sem mensalidades futuras.</p>
                </div>

                <div className="pt-2">
                  <span className="text-4xl font-black text-slate-950">R$ 497</span>
                  <span className="text-xs font-bold text-slate-500"> / pagamento único</span>
                </div>

                <ul className="space-y-3 text-xs font-bold text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-500 shrink-0" />
                    <span>Acesso Vitalício a Todas as Ferramentas</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-500 shrink-0" />
                    <span>Atualizações futuras incluídas</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-500 shrink-0" />
                    <span>Suporte VIP Prioritário</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-emerald-500 shrink-0" />
                    <span>Modelos de precificação prontos</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onEnterPlatform}
                className="w-full py-3.5 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Acesso Vitalício
              </button>
            </div>
          </div>

          {/* Selo de Garantia 7 Dias */}
          <div className="mt-16 max-w-2xl mx-auto p-6 bg-emerald-50/80 border border-emerald-200 rounded-3xl flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h4 className="text-sm font-black text-emerald-950">Garantia Blindada de 7 Dias</h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Teste a plataforma por 7 dias inteiros. Se por qualquer motivo não sentir que ela revolucionou a gestão financeira do seu e-commerce, devolvemos 100% do seu dinheiro.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-6">
        <div className="text-center mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black uppercase">
            <HelpCircle size={14} /> Dúvidas Frequentes
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
            Perguntas & Respostas
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left font-black text-sm text-slate-900 flex justify-between items-center gap-4 hover:bg-slate-50/50"
                >
                  <span>{item.q}</span>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed font-medium border-t border-slate-100 pt-3 animate-in fade-in">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-white py-14 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 blue-gradient rounded-xl flex items-center justify-center text-white">
              <Globe size={18} />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight">Gerenciie PRO</span>
              <p className="text-[10px] text-slate-400">Inteligência Financeira e Lucratividade para E-commerce</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
            <button onClick={onEnterPlatform} className="hover:text-white transition-colors">
              Plataforma
            </button>
            <button onClick={() => onOpenAuth('login')} className="hover:text-white transition-colors">
              Fazer Login
            </button>
            <button onClick={() => onOpenAuth('register')} className="hover:text-white transition-colors">
              Criar Conta
            </button>
          </div>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Gerenciie Pro. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};
