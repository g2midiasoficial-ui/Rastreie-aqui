
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, ShoppingCart, Package, ArrowRightLeft,
  Search, CreditCard, TrendingUp, Target, BarChart3, Calendar,
  Settings, HelpCircle, Truck, Globe, Wallet, Zap, ChevronDown,
  Info, AlertTriangle, CheckCircle2, Percent, ArrowUpRight,
  DollarSign, Activity, FileText, Download, Layers, Sparkles, MousePointer2,
  Lock, CreditCard as CardIcon, Receipt, Coins, Crosshair, TrendingDown,
  Users, MousePointerClick, BarChart, Eye, ShoppingBag, Flame, Filter, Store,
  Plus, Trash2, ExternalLink, Box, Link as LinkIcon, Megaphone, MoveHorizontal,
  ShieldCheck, Navigation, Save, History, CalendarDays, ArrowDown, Tag,
  TrendingUp as TrendUpIcon, Layers3, Rocket, X, Image as ImageIcon,
  LogIn, User, Shield, Check, Star, PlayCircle, Scale, RefreshCw,
  Coins as CoinsIcon,
  BarChart4,
  MousePointer,
  Clock,
  Briefcase,
  XCircle
} from 'lucide-react';
import { Platform, PricingData, CalculationResult, TaxRegime, CurrencyCode } from './types.ts';
import { calculatePricing, formatCurrency, getCurrencySymbol } from './utils/calculations.ts';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart as ReBarChart, Bar, Cell
} from 'recharts';

const MARKUP_STEPS = [1.2, 1.5, 1.8, 2.0, 2.2, 2.5, 2.8, 3.0, 3.5, 4.0, 5.0];

type ProductStatus = 'Mineração' | 'Teste' | 'Validação' | 'Escala' | 'Descontinuado';

interface DailyHistoryEntry {
  id: string;
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  atc: number;
  ic: number;
  sales: number;
  revenue: number;
  profit: number;
  cpa: number;
  roas: number;
  ctr: number;
  atcRate: number;
  cpc: number;
  cpm: number;
  cvr: number;
  status: 'good' | 'bad' | 'warning';
  platform: Platform;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('gerenciie_auth') === 'true';
  });
  const [showLogin, setShowLogin] = useState(false);
  
  const [planningData, setPlanningData] = useState(() => {
    const saved = localStorage.getItem('gerenciie_planning_data');
    return saved ? JSON.parse(saved) : {
      monthlyBudget: 5000,
      expectedCTR: 1.5,
      expectedCVR: 2.0,
      expectedCPM: 15.00,
      expectedATCRate: 8.0,
      expectedICRate: 40.0
    };
  });

  const [planningCampaigns, setPlanningCampaigns] = useState<any[]>(() => {
    const saved = localStorage.getItem('gerenciie_planning_campaigns');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'teste reino unido - 03/05', spend: 12.65, impressions: 116, clicks: 3, atc: 1, ic: 0, sales: 0, active: true, selected: true },
      { id: '2', name: 'teste big fiver - 02/05', spend: 158.87, impressions: 5218, clicks: 211, atc: 45, ic: 18, sales: 5, active: true, selected: true },
    ];
  });

  const addPlanningCampaign = () => {
    const newCamp = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Nova Entrada - ${new Date().toLocaleDateString('pt-BR')}`,
      spend: 0,
      impressions: 0,
      clicks: 0,
      atc: 0,
      ic: 0,
      sales: 0,
      active: true,
      selected: true
    };
    setPlanningCampaigns([...planningCampaigns, newCamp]);
  };

  const updatePlanningCampaign = (id: string, updates: any) => {
    setPlanningCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removePlanningCampaign = (id: string) => {
    setPlanningCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const toggleSelectAllPlanning = (val: boolean) => {
    setPlanningCampaigns(prev => prev.map(c => ({ ...c, selected: val })));
  };

  const [planningHistory, setPlanningHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('gerenciie_planning_history');
    return saved ? JSON.parse(saved) : [];
  });

  const savePlanningSimulation = () => {
    if (planningDiagnostic.budget === 0 && planningDiagnostic.sales === 0) return;
    
    const newEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('pt-BR'),
      spend: planningDiagnostic.budget,
      revenue: planningDiagnostic.revenue,
      roas: planningDiagnostic.roas,
      cpa: planningDiagnostic.cpa,
      profit: planningDiagnostic.profit
    };
    
    setPlanningHistory([newEntry, ...planningHistory]);
  };

  const [planningFilter, setPlanningFilter] = useState<'all' | 'top' | 'middle' | 'bottom'>('all');

  const [platform, setPlatform] = useState<Platform>(() => {
    const saved = localStorage.getItem('gerenciie_platform');
    return (saved as Platform) || Platform.DROPSHIPPING;
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'dre' | 'daily' | 'compass' | 'simulation' | 'planning'>(() => {
    const saved = localStorage.getItem('gerenciie_active_tab');
    return (saved as any) || 'overview';
  });
  const [funnelFilter, setFunnelFilter] = useState<'all' | 'top' | 'middle' | 'bottom'>(() => {
    const saved = localStorage.getItem('gerenciie_funnel_filter');
    return (saved as any) || 'all';
  });
  
  const [pricingData, setPricingData] = useState<PricingData>(() => {
    const saved = localStorage.getItem('gerenciie_pricing_data');
    return saved ? JSON.parse(saved) : {
      currency: 'BRL',
      costPrice: 52.50,
      freightIn: 5.00,
      packagingCost: 2.00,
      shippingLabel: 0,
      fixedFee: 0,
      marketplaceCommissionPercent: 0,
      gatewayFee: 0,
      marketingPercent: 25,
      fixedOpCost: 1500,
      taxPercent: 6,
      desiredMarkup: 2.5,
      estimatedMonthlySales: 200,
      taxRegime: TaxRegime.SIMPLES_NACIONAL,
      cardTaxPercent: 5.99,
      paymentReservePercent: 5,
      yampiFeePercent: 2.5,
      icmsPercent: 0,
      pixTaxPercent: 1,
      newTaxPercent: 0,
      adsTaxPercent: 4.38
    };
  });

  const [scaleMultiplier, setScaleMultiplier] = useState<number>(() => {
    const saved = localStorage.getItem('gerenciie_scale_multiplier');
    return saved ? parseFloat(saved) : 2;
  });

  // States para Métricas Diárias
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyAds, setDailyAds] = useState({
    spend: 0,
    impressions: 0,
    clicks: 0,
    atc: 0,
    ic: 0,
    sales: 0,
    revenue: 0
  });

  const [dailyHistory, setDailyHistory] = useState<DailyHistoryEntry[]>(() => {
    const saved = localStorage.getItem('gerenciie_daily_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('gerenciie_daily_history', JSON.stringify(dailyHistory));
  }, [dailyHistory]);

  useEffect(() => {
    localStorage.setItem('gerenciie_platform', platform);
  }, [platform]);

  useEffect(() => {
    localStorage.setItem('gerenciie_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('gerenciie_funnel_filter', funnelFilter);
  }, [funnelFilter]);

  useEffect(() => {
    localStorage.setItem('gerenciie_pricing_data', JSON.stringify(pricingData));
  }, [pricingData]);

  useEffect(() => {
    localStorage.setItem('gerenciie_scale_multiplier', scaleMultiplier.toString());
  }, [scaleMultiplier]);

  useEffect(() => {
    localStorage.setItem('gerenciie_planning_data', JSON.stringify(planningData));
  }, [planningData]);

  useEffect(() => {
    localStorage.setItem('gerenciie_planning_campaigns', JSON.stringify(planningCampaigns));
  }, [planningCampaigns]);

  useEffect(() => {
    localStorage.setItem('gerenciie_planning_history', JSON.stringify(planningHistory));
  }, [planningHistory]);

  useEffect(() => {
    if (platform === Platform.SHOPEE) {
      setPricingData(prev => ({
        ...prev,
        marketplaceCommissionPercent: 14,
        fixedFee: 4,
        yampiFeePercent: 0,
        cardTaxPercent: 0,
        gatewayFee: 0
      }));
    } else if (platform === Platform.MERCADO_LIVRE) {
      setPricingData(prev => ({
        ...prev,
        marketplaceCommissionPercent: 11.5,
        fixedFee: 6,
        yampiFeePercent: 0,
        cardTaxPercent: 0,
        gatewayFee: 0
      }));
    } else {
      setPricingData(prev => ({
        ...prev,
        marketplaceCommissionPercent: 0,
        fixedFee: 0,
        yampiFeePercent: 2.5,
        cardTaxPercent: 4.99,
        gatewayFee: 1
      }));
    }
  }, [platform]);

  const currentResult = useMemo(() => calculatePricing(pricingData, pricingData.desiredMarkup, platform), [pricingData, platform]);

  const planningDiagnostic = useMemo(() => {
    const selectedCamps = planningCampaigns.filter(c => c.selected && c.active);
    
    const budget = selectedCamps.reduce((acc, c) => acc + Number(c.spend || 0), 0);
    const impressions = selectedCamps.reduce((acc, c) => acc + Number(c.impressions || 0), 0);
    const clicks = selectedCamps.reduce((acc, c) => acc + Number(c.clicks || 0), 0);
    const atc = selectedCamps.reduce((acc, c) => acc + Number(c.atc || 0), 0);
    const ic = selectedCamps.reduce((acc, c) => acc + Number(c.ic || 0), 0);
    const sales = selectedCamps.reduce((acc, c) => acc + Number(c.sales || 0), 0);
    
    const revenue = sales * currentResult.finalPrice;
    
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cvr = clicks > 0 ? (sales / clicks) * 100 : 0;
    const atcRate = clicks > 0 ? (atc / clicks) * 100 : 0;
    const icRate = atc > 0 ? (ic / atc) * 100 : 0;
    const cpm = impressions > 0 ? (budget / impressions) * 1000 : 0;
    const cpc = clicks > 0 ? budget / clicks : 0;

    // Custos variáveis unitários
    const unitVariableCostsNoAds = (currentResult.unitCMV + pricingData.packagingCost + pricingData.shippingLabel + (currentResult.totalFeesOnly - currentResult.marketingCost - currentResult.marketingAdsTax));
    
    const totalCosts = (unitVariableCostsNoAds * sales) + budget + (pricingData.fixedOpCost / 30 * (selectedCamps.length || 1)); 
    const profit = revenue - totalCosts;
    const cpa = sales > 0 ? budget / sales : 0;
    const roas = budget > 0 ? revenue / budget : 0;

    const issues = [];
    
    if (selectedCamps.length === 0) {
      return { budget: 0, impressions: 0, clicks: 0, atc: 0, ic: 0, sales: 0, revenue: 0, profit: 0, cpa: 0, roas: 0, cpc: 0, ctr: 0, cvr: 0, atcRate: 0, icRate: 0, cpm: 0, issues: [], dailyData: [], scaleGuidance: 'Selecione entradas para analisar.' };
    }

    // Diagnóstico
    if (ctr < 1) issues.push({ type: 'error', label: 'CTR Baixo', msg: 'Anúncio pouco atraente. Melhore criativo.' });
    if (atcRate < 5) issues.push({ type: 'error', label: 'ATC Baixo', msg: 'Muitos cliques, poucas intenções. Melhore a oferta.' });
    if (cvr < 1) issues.push({ type: 'error', label: 'CVR Crítica', msg: 'Sua conversão final está drenando lucro.' });
    if (cpa > currentResult.maxCPA) issues.push({ type: 'error', label: 'CPA ALTO', msg: 'Você está no prejuízo por venda.' });

    // Orientação
    let scaleGuidance = 'Mantenha os testes.';
    if (profit > 0 && roas > 3 && cpa < currentResult.cpaIdeal) scaleGuidance = 'ESCALA LIBERADA: Aumente o budget em 20%.';
    else if (profit < 0) scaleGuidance = 'ALERTA: Reduza o budget ou congele a campanha.';
    else if (cpa > currentResult.maxCPA) scaleGuidance = 'PERIGO: CPA furando o breakeven.';

    return { budget, impressions, clicks, atc, ic, sales, revenue, profit, cpa, roas, cpc, ctr, cvr, atcRate, icRate, cpm, issues, dailyData: [], scaleGuidance };
  }, [planningCampaigns, planningFilter, currentResult, pricingData]);

  const dailyMetrics = useMemo(() => {
    const { spend, revenue, sales, impressions, clicks, atc } = dailyAds;
    const unitVariableCostsNoAds = (currentResult.unitCMV + pricingData.packagingCost + pricingData.shippingLabel + (currentResult.totalFeesOnly - currentResult.marketingCost - currentResult.marketingAdsTax));
    
    return {
      roas: spend > 0 ? revenue / spend : 0,
      cpa: sales > 0 ? spend / sales : 0,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? spend / clicks : 0,
      cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
      cvr: clicks > 0 ? (sales / clicks) * 100 : 0,
      atcRate: clicks > 0 ? (atc / clicks) * 100 : 0,
      profit: revenue - (unitVariableCostsNoAds * sales) - spend
    };
  }, [dailyAds, currentResult, pricingData]);

  const scaleOrientation = useMemo(() => {
    if (dailyAds.spend === 0) return { status: 'neutral', message: 'Aguardando dados de investimento para análise.' };
    
    const { cpa, roas, profit } = dailyMetrics;
    const { maxCPA, cpaIdeal } = currentResult;

    if (cpa > 0 && cpa <= cpaIdeal && profit > 0) {
      return { 
        status: 'scale', 
        message: '🔥 OPORTUNIDADE DE ESCALA: Seus custos estão abaixo do ideal e a operação está lucrativa. Aumente o orçamento gradualmente (15-20%).' 
      };
    } else if (cpa > cpaIdeal && cpa <= maxCPA) {
      return { 
        status: 'maintain', 
        message: '✅ OPERAÇÃO ESTÁVEL: Você está dentro da margem de segurança. Mantenha o orçamento e foque em otimizar criativos para baixar o CPA.' 
      };
    } else if (cpa > maxCPA) {
      return { 
        status: 'pause', 
        message: '🚨 ALERTA DE PREJUÍZO: Seu CPA ultrapassou o Breakeven. Pause ou reduza drasticamente o orçamento. Verifique oferta e criativos imediatamente.' 
      };
    } else if (dailyAds.spend > 0 && dailyAds.sales === 0) {
      if (dailyAds.spend > maxCPA * 1.5) {
        return { status: 'pause', message: '⚠️ GASTO ALTO SEM VENDAS: Você já gastou 1.5x o seu CPA máximo sem converter. Reavalie a campanha.' };
      }
      return { status: 'warning', message: '⏳ EM TESTE: Aguardando volume de dados para conclusão. Monitore o CTR e Taxa de ATC.' };
    }

    return { status: 'neutral', message: 'Analise as métricas acima para tomar sua decisão.' };
  }, [dailyAds.spend, dailyAds.sales, dailyMetrics, currentResult]);

  const scaleResult = useMemo(() => {
    const scaledData = {
      ...pricingData,
      estimatedMonthlySales: pricingData.estimatedMonthlySales * scaleMultiplier,
      fixedOpCost: pricingData.fixedOpCost * (1 + (scaleMultiplier * 0.1))
    };
    return calculatePricing(scaledData, pricingData.desiredMarkup, platform);
  }, [pricingData, platform, scaleMultiplier]);

  const currentSymbol = getCurrencySymbol(pricingData.currency);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
    localStorage.setItem('gerenciie_auth', 'true');
    setShowLogin(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('gerenciie_auth');
  };

  const saveDailyMetrics = () => {
    const { spend, revenue, sales, impressions, clicks, atc, ic } = dailyAds;
    if (spend === 0 && revenue === 0) return;

    const unitVariableCostsNoAds = (currentResult.unitCMV + pricingData.packagingCost + pricingData.shippingLabel + (currentResult.totalFeesOnly - currentResult.marketingCost - currentResult.marketingAdsTax));
    
    const profit = revenue - (unitVariableCostsNoAds * sales) - spend;
    const cpa = sales > 0 ? spend / sales : 0;
    const roas = spend > 0 ? revenue / spend : 0;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cvr = clicks > 0 ? (sales / clicks) * 100 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;

    const entry: DailyHistoryEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      spend,
      impressions,
      clicks,
      atc,
      ic,
      sales,
      revenue,
      profit,
      cpa,
      roas,
      ctr,
      atcRate: clicks > 0 ? (atc / clicks) * 100 : 0,
      cpc,
      cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
      cvr,
      status: cpa <= currentResult.maxCPA ? 'good' : cpa <= currentResult.maxCPA * 1.2 ? 'warning' : 'bad',
      platform
    };

    setDailyHistory([entry, ...dailyHistory]);
    setDailyAds({ spend: 0, impressions: 0, clicks: 0, atc: 0, ic: 0, sales: 0, revenue: 0 });
  };

  const deleteHistoryItem = (id: string) => {
    setDailyHistory(dailyHistory.filter(item => item.id !== id));
  };

  if (!isAuthenticated && !showLogin) {
    return (
      <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-x-hidden">
        {/* Navbar */}
        <nav className="fixed top-0 w-full z-50 px-6 md:px-10 py-6 flex justify-between items-center backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 blue-gradient rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Globe size={20} />
            </div>
            <span className="font-black text-xl tracking-tighter italic">GERENCIIE<span className="text-blue-500">PRO</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Recursos</a>
            <a href="#stats" className="hover:text-white transition-colors">Resultados</a>
            <a href="#pricing" className="hover:text-white transition-colors">Planos</a>
          </div>
          <button onClick={() => setShowLogin(true)} className="px-6 md:px-8 py-3 rounded-full font-bold text-sm bg-white text-black hover:bg-blue-500 hover:text-white transition-all shadow-xl shadow-white/5">
            Entrar
          </button>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-40 pb-32 px-6 md:px-10 max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] md:w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-8 animate-pulse">
            <Sparkles size={12}/> O Futuro do E-commerce High-Ticket
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.95] mb-8 italic">
            DOMINE SUAS <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">MARGENS AGORA</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-medium mb-12 leading-relaxed">
            A primeira calculadora com inteligência CFO integrada. Pare de queimar dinheiro em anúncios e comece a escalar com lucro real no bolso.
          </p>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <button onClick={() => setShowLogin(true)} className="px-12 py-5 bg-blue-600 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-4 hover:scale-105 transition-all shadow-2xl shadow-blue-500/40">
              <Rocket size={18}/> Iniciar Teste Grátis
            </button>
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck size={16} className="text-emerald-500"/> Sem cartão de crédito
            </div>
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="mt-24 relative w-full max-w-5xl group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[40px] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-slate-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl aspect-video flex items-center justify-center">
               <div className="flex flex-col items-center gap-4 opacity-40">
                  <LayoutDashboard size={64} className="text-blue-500" />
                  <p className="text-xs font-black uppercase tracking-[0.3em]">Dashboard Preview</p>
               </div>
               {/* Floating elements for visual interest */}
               <div className="absolute top-10 left-10 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md animate-bounce-slow">
                  <div className="w-12 h-2 bg-blue-500 rounded-full mb-2"></div>
                  <div className="w-8 h-2 bg-white/20 rounded-full"></div>
               </div>
               <div className="absolute bottom-10 right-10 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md animate-pulse-slow">
                  <div className="w-16 h-4 bg-emerald-500/20 text-emerald-500 text-[8px] font-black rounded-full flex items-center justify-center">PROFITABLE</div>
               </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="py-24 bg-white/5 border-y border-white/5">
           <div className="max-w-7xl mx-auto px-10 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
              <div>
                 <h4 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter italic text-blue-500">10k+</h4>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Usuários Ativos</p>
              </div>
              <div>
                 <h4 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter italic text-blue-500">R$ 50M+</h4>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Margem Gerenciada</p>
              </div>
              <div>
                 <h4 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter italic text-blue-500">98%</h4>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Precisão de Dados</p>
              </div>
              <div>
                 <h4 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter italic text-blue-500">24/7</h4>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Suporte Especializado</p>
              </div>
           </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-10 max-w-7xl mx-auto">
           <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black mb-6 italic tracking-tight">TUDO QUE VOCÊ PRECISA <br /> <span className="text-blue-500">PARA ESCALAR</span></h2>
              <p className="text-slate-400 font-medium max-w-xl mx-auto">Ferramentas profissionais desenhadas por quem opera milhões no e-commerce todos os meses.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                icon={<LayoutDashboard size={24}/>} 
                title="Calculadora CFO" 
                desc="Cálculo de margem real com todas as taxas de gateway, impostos e custos fixos."
              />
              <FeatureCard 
                icon={<Activity size={24}/>} 
                title="Métricas Diárias" 
                desc="Acompanhe ROAS, CPA e Lucro diário em uma interface limpa e objetiva."
              />
              <FeatureCard 
                icon={<ShieldCheck size={24}/>} 
                title="Bússola de KPIs" 
                desc="Saiba exatamente seus limites de CPA, ATC e IC para não queimar dinheiro."
              />
              <FeatureCard 
                icon={<Zap size={24}/>} 
                title="Simulador de Escala" 
                desc="Projete seu faturamento e lucro ao aumentar o investimento em anúncios."
              />
           </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-10 max-w-7xl mx-auto">
           <div className="bg-blue-600 rounded-[50px] p-12 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 max-w-md">
                 <h2 className="text-4xl md:text-5xl font-black text-white mb-6 italic tracking-tight leading-none">PRONTO PARA <br /> O PRÓXIMO NÍVEL?</h2>
                 <p className="text-blue-100 font-medium mb-8">Junte-se aos maiores players do mercado e tenha o controle total da sua operação na palma da mão.</p>
                 <ul className="space-y-4 mb-10">
                    <li className="flex items-center gap-3 text-sm font-bold text-white">
                       <CheckCircle2 size={18} className="text-blue-200" /> Acesso vitalício às ferramentas
                    </li>
                    <li className="flex items-center gap-3 text-sm font-bold text-white">
                       <CheckCircle2 size={18} className="text-blue-200" /> Atualizações constantes
                    </li>
                    <li className="flex items-center gap-3 text-sm font-bold text-white">
                       <CheckCircle2 size={18} className="text-blue-200" /> Comunidade exclusiva
                    </li>
                 </ul>
              </div>
              <div className="relative z-10 bg-white rounded-[40px] p-10 text-black w-full max-w-sm shadow-2xl">
                 <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Plano Anual</p>
                 <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-2xl font-black">R$</span>
                    <span className="text-6xl font-black tracking-tighter">97</span>
                    <span className="text-xl font-bold text-slate-400">/mês</span>
                 </div>
                 <button onClick={() => setShowLogin(true)} className="w-full py-5 blue-gradient text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 transition-all">
                    Começar Agora
                 </button>
                 <p className="text-center text-[9px] text-slate-400 font-bold mt-6 uppercase tracking-widest">Garantia de 7 dias ou seu dinheiro de volta</p>
              </div>
           </div>
        </section>

        {/* Footer */}
        <footer className="py-20 px-10 border-t border-white/5">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 blue-gradient rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Globe size={16} />
                </div>
                <span className="font-black text-lg tracking-tighter italic">GERENCIIE<span className="text-blue-500">PRO</span></span>
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">© 2026 Gerenciie Pro. Todos os direitos reservados.</p>
              <div className="flex items-center gap-6">
                 <a href="#" className="text-slate-400 hover:text-white transition-colors"><ImageIcon size={20}/></a>
                 <a href="#" className="text-slate-400 hover:text-white transition-colors"><Globe size={20}/></a>
                 <a href="#" className="text-slate-400 hover:text-white transition-colors"><Megaphone size={20}/></a>
              </div>
           </div>
        </footer>
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 selection:bg-blue-500/30">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[50px] p-12 backdrop-blur-xl shadow-2xl relative">
          <button onClick={() => setShowLogin(false)} className="absolute top-10 right-10 text-slate-400 hover:text-white transition-colors">
            <X size={24}/>
          </button>
          <div className="flex flex-col items-center text-center mb-12">
            <div className="w-16 h-16 blue-gradient rounded-2xl flex items-center justify-center text-white mb-6 shadow-2xl shadow-blue-500/20">
              <Lock size={28} />
            </div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter">BEM-VINDO AO <span className="text-blue-500">PRO</span></h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block px-1">E-mail Profissional</label>
              <input required type="email" placeholder="cfo@seu-ecom.com" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 outline-none text-white font-bold focus:border-blue-500/50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block px-1">Chave</label>
              <input required type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 outline-none text-white font-bold focus:border-blue-500/50" />
            </div>
            <button type="submit" className="w-full blue-gradient text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest">
              Autenticar e Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-black font-['Plus_Jakarta_Sans']">
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col z-30 shadow-sm">
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 blue-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
            <Globe size={20} />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tighter text-black leading-none">Gerenciie</h1>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <NavItem icon={<LayoutDashboard size={18} />} label="Calculadora" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={<Activity size={18} />} label="Métricas Diárias" active={activeTab === 'daily'} onClick={() => setActiveTab('daily')} />
          <NavItem icon={<Target size={18} />} label="Planejamento Ads" active={activeTab === 'planning'} onClick={() => setActiveTab('planning')} />
          <NavItem icon={<ShieldCheck size={18} />} label="Bússola (KPIs)" active={activeTab === 'compass'} onClick={() => setActiveTab('compass')} />
          <NavItem icon={<Zap size={18} />} label="Simulação Escala" active={activeTab === 'simulation'} onClick={() => setActiveTab('simulation')} />
          <NavItem icon={<FileText size={18} />} label="DRE" active={activeTab === 'dre'} onClick={() => setActiveTab('dre')} />
          
          <div className="h-px bg-slate-100 my-4" />
          <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Canal de Venda</p>
          <div className="px-2 space-y-1">
             <PlatformButton label="Dropshipping" active={platform === Platform.DROPSHIPPING} onClick={() => setPlatform(Platform.DROPSHIPPING)} />
             <PlatformButton label="Shopee" active={platform === Platform.SHOPEE} onClick={() => setPlatform(Platform.SHOPEE)} />
             <PlatformButton label="Mercado Livre" active={platform === Platform.MERCADO_LIVRE} onClick={() => setPlatform(Platform.MERCADO_LIVRE)} />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
           <button onClick={handleLogout} className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-slate-600 hover:text-rose-600 transition-all font-bold text-xs">
             <LogIn size={16} className="rotate-180" /> Logout
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-10 bg-white border-b border-slate-100 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{activeTab}</span>
            <div className="h-4 w-px bg-slate-200"></div>
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{platform}</span>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <CoinsIcon size={14} className="text-blue-600" />
                <select 
                  value={pricingData.currency}
                  onChange={(e) => setPricingData(prev => ({...prev, currency: e.target.value as CurrencyCode}))}
                  className="bg-transparent border-none outline-none text-[10px] font-black uppercase cursor-pointer"
                >
                  <option value="BRL">BRL (R$)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CNY">CNY (¥)</option>
                  <option value="ARS">ARS ($)</option>
                  <option value="CLP">CLP ($)</option>
                  <option value="MXN">MXN ($)</option>
                  <option value="COP">COP ($)</option>
                  <option value="PEN">PEN (S/)</option>
                </select>
             </div>
             <div className="text-right">
                <p className="text-[9px] font-black text-slate-600 uppercase">Margem Líquida</p>
                <p className={`text-sm font-black ${currentResult.marginPercent > 10 ? 'text-emerald-600' : 'text-rose-600'}`}>{currentResult.marginPercent.toFixed(1)}%</p>
             </div>
             <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-black text-[10px]">JS</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
          
          {activeTab === 'overview' && (
             <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-2 blue-gradient rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Preço Sugerido (Venda)</p>
                    <h3 className="text-5xl font-black tracking-tighter">{formatCurrency(currentResult.finalPrice, pricingData.currency)}</h3>
                    <div className="mt-6 flex items-center gap-4">
                       <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black border border-white/10">Markup: {pricingData.desiredMarkup}x</div>
                       <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black border border-white/10">ROI: {currentResult.roi.toFixed(0)}%</div>
                    </div>
                  </div>
                  <StatusCard icon={<DollarSign size={20}/>} label="Lucro Unitário" value={formatCurrency(currentResult.profit, pricingData.currency)} desc="Líquido na conta" theme={currentResult.profit > 0 ? "emerald" : "rose"} />
                  <StatusCard icon={<Target size={20}/>} label="CPA Breakeven" value={formatCurrency(currentResult.maxCPA, pricingData.currency)} desc="Limite p/ não perder" theme="blue" />
                </div>

                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-black text-black flex items-center gap-2 italic"><Megaphone size={20} className="text-blue-600"/> Planejamento de Verba Ads</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Quanto investir e quantas vendas buscar</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                       <div>
                         <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Investimento 1 Dia</p>
                         <h4 className="text-3xl font-black text-black">{formatCurrency(currentResult.adSpend1Day, pricingData.currency)}</h4>
                       </div>
                       <div className="mt-4 pt-4 border-t border-slate-200">
                          <p className="text-[10px] font-black text-blue-600 uppercase">Meta de Vendas</p>
                          <p className="text-lg font-black">{Math.ceil(pricingData.estimatedMonthlySales / 30)} Vendas/dia</p>
                       </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col justify-between">
                       <div>
                         <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Investimento 7 Dias</p>
                         <h4 className="text-3xl font-black text-black">{formatCurrency(currentResult.adSpend7Days, pricingData.currency)}</h4>
                       </div>
                       <div className="mt-4 pt-4 border-t border-blue-100">
                          <p className="text-[10px] font-black text-blue-600 uppercase">Meta de Vendas</p>
                          <p className="text-lg font-black">{Math.ceil((pricingData.estimatedMonthlySales / 30) * 7)} Vendas/semana</p>
                       </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-black text-white flex flex-col justify-between shadow-xl">
                       <div>
                         <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Investimento 30 Dias (Mês)</p>
                         <h4 className="text-3xl font-black">{formatCurrency(currentResult.adSpend30Days, pricingData.currency)}</h4>
                       </div>
                       <div className="mt-4 pt-4 border-t border-white/10">
                          <p className="text-[10px] font-black text-blue-400 uppercase">Meta de Vendas</p>
                          <p className="text-lg font-black">{pricingData.estimatedMonthlySales} Vendas/mês</p>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-4 space-y-6">
                    <Section title="Produto & Logística" icon={<Package size={16}/>}>
                      <ModernInput label="Custo Produto" value={pricingData.costPrice} onChange={v => setPricingData(prev => ({...prev, costPrice: v}))} symbol={currentSymbol} />
                      <ModernInput label="Frete Fornecedor" value={pricingData.freightIn} onChange={v => setPricingData(prev => ({...prev, freightIn: v}))} symbol={currentSymbol} />
                      <ModernInput label="Markup Alvo" value={pricingData.desiredMarkup} onChange={v => setPricingData(prev => ({...prev, desiredMarkup: v}))} symbol="x" />
                      <ModernInput label="Estimativa Vendas/Mês" value={pricingData.estimatedMonthlySales} onChange={v => setPricingData(prev => ({...prev, estimatedMonthlySales: v}))} symbol="#" />
                    </Section>
                    
                    <Section title="Canal & Marketing" icon={<Megaphone size={16}/>}>
                      <ModernInput label="Budget Ads (%)" value={pricingData.marketingPercent} onChange={v => setPricingData(prev => ({...prev, marketingPercent: v}))} symbol="%" />
                      {platform !== Platform.DROPSHIPPING && (
                        <ModernInput label="Comissão Marketplace (%)" value={pricingData.marketplaceCommissionPercent} onChange={v => setPricingData(prev => ({...prev, marketplaceCommissionPercent: v}))} symbol="%" />
                      )}
                      {platform !== Platform.DROPSHIPPING && (
                        <ModernInput label="Taxa Fixa Canal" value={pricingData.fixedFee} onChange={v => setPricingData(prev => ({...prev, fixedFee: v}))} symbol={currentSymbol} />
                      )}
                    </Section>
                  </div>
                  
                  <div className="lg:col-span-8 bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 h-full">
                     <h3 className="text-lg font-black text-black mb-6 flex items-center gap-2"><BarChart3 size={20} className="text-blue-500"/> Sensibilidade de Margem vs Markup</h3>
                     <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={MARKUP_STEPS.map(m => calculatePricing(pricingData, m, platform))}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="markup" tickFormatter={v => `${v}x`} tick={{fontSize: 10, fontWeight: 'bold', fill: '#000'}} axisLine={false} />
                            <YAxis tickFormatter={v => `${v}%`} tick={{fontSize: 10, fontWeight: 'bold', fill: '#000'}} axisLine={false} />
                            <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)'}} />
                            <Area type="monotone" dataKey="marginPercent" name="Margem" stroke="#2563eb" fill="#dbeafe" strokeWidth={3} />
                          </AreaChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
                </div>
             </div>
          )}

          {activeTab === 'daily' && (
            <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-32">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-3xl font-black text-black tracking-tight italic">Métricas de Performance</h2>
                  <p className="text-slate-600 font-bold uppercase text-[10px] tracking-widest mt-1">Gestão diária de tráfego e vendas</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                   <Calendar size={16} className="ml-3 text-blue-600" />
                   <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent border-none outline-none font-bold text-xs p-2 pr-4"
                   />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                  <Section title="Log de Hoje" icon={<Plus size={16}/>}>
                    <div className="grid grid-cols-2 gap-4">
                      <ModernInput label="Investido (Ads)" value={dailyAds.spend} onChange={v => setDailyAds({...dailyAds, spend: v})} symbol={currentSymbol} />
                      <ModernInput label="Faturamento" value={dailyAds.revenue} onChange={v => setDailyAds({...dailyAds, revenue: v})} symbol={currentSymbol} />
                      <ModernInput label="Vendas" value={dailyAds.sales} onChange={v => setDailyAds({...dailyAds, sales: v})} symbol="#" />
                      <ModernInput label="Impressões" value={dailyAds.impressions} onChange={v => setDailyAds({...dailyAds, impressions: v})} symbol="#" />
                      <ModernInput label="Cliques" value={dailyAds.clicks} onChange={v => setDailyAds({...dailyAds, clicks: v})} symbol="#" />
                      <ModernInput label="ATC" value={dailyAds.atc} onChange={v => setDailyAds({...dailyAds, atc: v})} symbol="#" />
                    </div>
                    <button onClick={saveDailyMetrics} className="w-full blue-gradient text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
                      <Save size={16} /> Salvar Métricas do Dia
                    </button>
                  </Section>

                  <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Calculadora Tempo Real</p>
                      <div className="flex gap-1 bg-slate-50 p-1 rounded-lg">
                        <button 
                          onClick={() => setFunnelFilter('all')}
                          className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${funnelFilter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          TUDO
                        </button>
                        <button 
                          onClick={() => setFunnelFilter('top')}
                          className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${funnelFilter === 'top' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          TOPO
                        </button>
                        <button 
                          onClick={() => setFunnelFilter('middle')}
                          className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${funnelFilter === 'middle' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          MEIO
                        </button>
                        <button 
                          onClick={() => setFunnelFilter('bottom')}
                          className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${funnelFilter === 'bottom' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          FUNDO
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                       {(funnelFilter === 'all' || funnelFilter === 'top') && (
                         <>
                           <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-[8px] font-black text-slate-500 uppercase">CTR</p>
                              <p className="text-lg font-black">{dailyMetrics.ctr.toFixed(2)}%</p>
                           </div>
                           <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-[8px] font-black text-slate-500 uppercase">CPC</p>
                              <p className="text-lg font-black">{formatCurrency(dailyMetrics.cpc, pricingData.currency)}</p>
                           </div>
                           <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-[8px] font-black text-slate-500 uppercase">CPM</p>
                              <p className="text-lg font-black">{formatCurrency(dailyMetrics.cpm, pricingData.currency)}</p>
                           </div>
                         </>
                       )}

                       {(funnelFilter === 'all' || funnelFilter === 'middle') && (
                         <>
                           <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-[8px] font-black text-slate-500 uppercase">Taxa ATC</p>
                              <p className="text-lg font-black">{dailyMetrics.atcRate.toFixed(2)}%</p>
                           </div>
                           <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-[8px] font-black text-slate-500 uppercase">ATC</p>
                              <p className="text-lg font-black">{dailyAds.atc}</p>
                           </div>
                           <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-[8px] font-black text-slate-500 uppercase">IC</p>
                              <p className="text-lg font-black">{dailyAds.ic}</p>
                           </div>
                         </>
                       )}

                       {(funnelFilter === 'all' || funnelFilter === 'bottom') && (
                         <>
                           <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-[8px] font-black text-slate-500 uppercase">ROAS</p>
                              <p className="text-lg font-black">{dailyMetrics.roas.toFixed(2)}</p>
                           </div>
                           <div className={`p-3 rounded-xl ${ (dailyMetrics.cpa > currentResult.maxCPA) ? 'bg-rose-50' : 'bg-emerald-50' }`}>
                              <p className="text-[8px] font-black text-slate-500 uppercase">CPA</p>
                              <p className={`text-lg font-black ${ (dailyMetrics.cpa > currentResult.maxCPA) ? 'text-rose-600' : 'text-emerald-600' }`}>
                                {formatCurrency(dailyMetrics.cpa, pricingData.currency)}
                              </p>
                           </div>
                           <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-[8px] font-black text-slate-500 uppercase">CVR</p>
                              <p className="text-lg font-black">{dailyMetrics.cvr.toFixed(2)}%</p>
                           </div>
                         </>
                       )}
                       
                       {funnelFilter === 'all' && (
                         <div className={`p-3 rounded-xl col-span-full ${ dailyMetrics.profit >= 0 ? 'bg-emerald-50' : 'bg-rose-50' }`}>
                            <p className="text-[8px] font-black text-slate-500 uppercase">Lucro Est. (Dia)</p>
                            <p className={`text-xl font-black ${ dailyMetrics.profit >= 0 ? 'text-emerald-600' : 'text-rose-600' }`}>
                              {formatCurrency(dailyMetrics.profit, pricingData.currency)}
                            </p>
                         </div>
                       )}
                    </div>

                    <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                      scaleOrientation.status === 'scale' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                      scaleOrientation.status === 'pause' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                      scaleOrientation.status === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                      'bg-slate-50 border-slate-100 text-slate-600'
                    }`}>
                      <div className="mt-0.5">
                        {scaleOrientation.status === 'scale' && <TrendingUp size={16} />}
                        {scaleOrientation.status === 'pause' && <AlertTriangle size={16} />}
                        {scaleOrientation.status === 'warning' && <Info size={16} />}
                        {scaleOrientation.status === 'maintain' && <CheckCircle2 size={16} />}
                        {scaleOrientation.status === 'neutral' && <MousePointer2 size={16} />}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1">Orientação de Escala</p>
                        <p className="text-xs font-bold leading-relaxed">{scaleOrientation.message}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8">
                   <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                         <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                           <History size={16} className="text-blue-500"/> Histórico Recente
                         </h3>
                         <button className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1">
                           <Download size={12}/> Exportar CSV
                         </button>
                      </div>
                      <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100">
                              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Data</th>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Gasto</th>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Receita</th>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">ROAS</th>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">CPA</th>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Lucro Est.</th>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {dailyHistory.map((item) => (
                              <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4 text-xs font-bold text-slate-800">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                                <td className="px-6 py-4 text-xs font-bold">{formatCurrency(item.spend, pricingData.currency)}</td>
                                <td className="px-6 py-4 text-xs font-bold">{formatCurrency(item.revenue, pricingData.currency)}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${item.roas > 2 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {item.roas.toFixed(2)}x
                                  </span>
                                </td>
                                <td className={`px-6 py-4 text-xs font-bold ${item.status === 'bad' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  {formatCurrency(item.cpa, pricingData.currency)}
                                </td>
                                <td className={`px-6 py-4 text-xs font-bold ${item.profit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {formatCurrency(item.profit, pricingData.currency)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button onClick={() => deleteHistoryItem(item.id)} className="p-2 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 size={14}/>
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {dailyHistory.length === 0 && (
                              <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic text-sm font-bold">Nenhum dado registrado para este produto.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'simulation' && (
            <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom duration-500 pb-32">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-3xl font-black text-black tracking-tight italic">Simulação de Escala</h2>
                  <p className="text-slate-600 font-bold uppercase text-[10px] tracking-widest mt-1">Projete o futuro da sua operação</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                  <span className="text-[10px] font-black text-slate-500 uppercase px-3">Multiplicador</span>
                  <div className="flex gap-1">
                    {[2, 3, 5, 10].map(m => (
                      <button 
                        key={m}
                        onClick={() => setScaleMultiplier(m)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${scaleMultiplier === m ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                      >
                        {m}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                  <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                    <h3 className="text-sm font-black text-black mb-6 uppercase tracking-widest flex items-center gap-2">
                      <Settings size={18} className="text-blue-500"/> Parâmetros
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-600 uppercase mb-2">Vendas Mensais Projetadas</label>
                        <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 focus-within:border-blue-500/50 transition-all">
                          <input 
                            type="number"
                            value={Math.ceil(pricingData.estimatedMonthlySales * scaleMultiplier)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (val > 0 && pricingData.estimatedMonthlySales > 0) {
                                setScaleMultiplier(val / pricingData.estimatedMonthlySales);
                              }
                            }}
                            className="text-2xl font-black text-blue-600 bg-transparent border-none outline-none w-full"
                          />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">unidades</span>
                        </div>
                        <input 
                          type="range" 
                          min="1.1" 
                          max="20" 
                          step="0.1"
                          value={scaleMultiplier} 
                          onChange={(e) => setScaleMultiplier(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer mt-4 accent-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Lucro Mensal Projetado</p>
                      <h4 className={`text-4xl font-black tracking-tighter ${scaleResult.monthlyProfitProjection > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatCurrency(scaleResult.monthlyProfitProjection, pricingData.currency)}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-2 italic">
                        Vs {formatCurrency(currentResult.monthlyProfitProjection, pricingData.currency)} (Atual)
                      </p>
                    </div>
                    <div className="bg-black rounded-[32px] p-8 shadow-xl text-white">
                      <p className="text-[10px] font-black text-blue-400 uppercase mb-2 tracking-widest">Faturamento Mensal</p>
                      <h4 className="text-4xl font-black tracking-tighter">
                        {formatCurrency(scaleResult.monthlyRevenue, pricingData.currency)}
                      </h4>
                    </div>
                  </div>

                  <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                    <h3 className="text-sm font-black text-black mb-8 uppercase tracking-widest flex items-center gap-2">
                      <BarChart size={18} className="text-blue-500"/> Comparativo
                    </h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReBarChart
                          data={[
                            { name: 'Atual', revenue: currentResult.monthlyRevenue, profit: currentResult.monthlyProfitProjection },
                            { name: 'Escala', revenue: scaleResult.monthlyRevenue, profit: scaleResult.monthlyProfitProjection }
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{fontSize: 12, fontWeight: 'bold', fill: '#000'}} axisLine={false} />
                          <YAxis tickFormatter={v => `R$ ${v/1000}k`} tick={{fontSize: 10, fontWeight: 'bold', fill: '#000'}} axisLine={false} />
                          <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
                          <Bar dataKey="revenue" name="Faturamento" fill="#dbeafe" radius={[10, 10, 0, 0]} />
                          <Bar dataKey="profit" name="Lucro" fill="#2563eb" radius={[10, 10, 0, 0]} />
                        </ReBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'planning' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex flex-col gap-1">
                  <h2 className="text-4xl font-black text-black tracking-tight italic">Simulador de Planejamento</h2>
                  <p className="text-slate-900 font-bold uppercase text-[10px] tracking-[0.1em]">ORGANIZE SUAS METAS E PREVEJA O LUCRO</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={addPlanningCampaign}
                    className="px-6 py-2.5 bg-black text-white rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-slate-800 transition-all flex items-center gap-2"
                  >
                    <Plus size={16} />
                    ADICIONAR DIA/CAMPANHA
                  </button>
                  <div className="flex gap-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-100 h-fit">
                    {['all', 'top', 'middle', 'bottom'].map((f: any) => (
                      <button 
                        key={f}
                        onClick={() => setPlanningFilter(f)}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all ${planningFilter === f ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-800 hover:bg-slate-50'}`}
                      >
                        {f === 'all' ? 'Ver Tudo' : f === 'top' ? 'Topo' : f === 'middle' ? 'Meio' : 'Fundo'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tabela de Campanhas Estilo Image */}
              <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="p-4 w-12 text-center">
                          <input 
                            type="checkbox" 
                            className="rounded accent-blue-600" 
                            checked={planningCampaigns.length > 0 && planningCampaigns.every(c => c.selected)}
                            onChange={(e) => toggleSelectAllPlanning(e.target.checked)}
                          />
                        </th>
                        <th className="p-4 w-16 text-center text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100">ON</th>
                        <th className="p-4 text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 whitespace-nowrap">ID/Nome da Campanha</th>
                        <th className="p-4 text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 text-right whitespace-nowrap">Investido ({currentSymbol})</th>
                        <th className="p-4 text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 text-right whitespace-nowrap">Impressões</th>
                        <th className="p-4 text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 text-right whitespace-nowrap">Cliques Link</th>
                        <th className="p-4 text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 text-right whitespace-nowrap">Taxa ATC (%)</th>
                        <th className="p-4 text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 text-right whitespace-nowrap">Add Carrinho</th>
                        <th className="p-4 text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 text-right whitespace-nowrap">Checkouts</th>
                        <th className="p-4 text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 text-right whitespace-nowrap">CVR (%)</th>
                        <th className="p-4 text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 text-right whitespace-nowrap">Vendas</th>
                        <th className="p-4 text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {planningCampaigns.map((camp) => (
                        <tr key={camp.id} className={`hover:bg-slate-50/50 transition-colors group ${!camp.active ? 'opacity-40' : ''}`}>
                          <td className="p-4 text-center">
                            <input 
                              type="checkbox" 
                              className="rounded accent-blue-600" 
                              checked={!!camp.selected} 
                              onChange={(e) => updatePlanningCampaign(camp.id, { selected: e.target.checked })}
                            />
                          </td>
                          <td className="p-4">
                            <button 
                              onClick={() => updatePlanningCampaign(camp.id, { active: !camp.active })}
                              className={`w-8 h-4 rounded-full relative transition-all mx-auto ${camp.active ? 'bg-blue-600' : 'bg-slate-400'}`}
                            >
                              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${camp.active ? 'right-0.5' : 'left-0.5'}`} />
                            </button>
                          </td>
                          <td className="p-4">
                            <input 
                              type="text" 
                              value={camp.name} 
                              onChange={(e) => updatePlanningCampaign(camp.id, { name: e.target.value })}
                              className="w-full bg-transparent text-xs font-black text-blue-700 border-none p-0 focus:ring-0"
                            />
                          </td>
                          <td className="p-2">
                             <input 
                              type="number" 
                              value={camp.spend} 
                              onChange={(e) => updatePlanningCampaign(camp.id, { spend: Number(e.target.value) })}
                              className="w-full bg-transparent text-right text-xs font-black text-slate-800 border-none p-2 focus:ring-0 focus:bg-white rounded-lg transition-all"
                            />
                          </td>
                          <td className="p-2">
                             <input 
                              type="number" 
                              value={camp.impressions} 
                              onChange={(e) => updatePlanningCampaign(camp.id, { impressions: Number(e.target.value) })}
                              className="w-full bg-transparent text-right text-xs font-black text-slate-800 border-none p-2 focus:ring-0 focus:bg-white rounded-lg"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="number" 
                              value={camp.clicks} 
                              onChange={(e) => updatePlanningCampaign(camp.id, { clicks: Number(e.target.value) })}
                              className="w-full bg-transparent text-right text-xs font-black text-slate-800 border-none p-2 focus:ring-0 focus:bg-white rounded-lg"
                            />
                          </td>
                          <td className="p-4 text-right text-xs font-black text-slate-800">
                            {camp.clicks > 0 ? ((camp.atc / camp.clicks) * 100).toFixed(1) : 0}%
                          </td>
                          <td className="p-2">
                            <input 
                              type="number" 
                              value={camp.atc} 
                              onChange={(e) => updatePlanningCampaign(camp.id, { atc: Number(e.target.value) })}
                              className="w-full bg-transparent text-right text-xs font-black text-slate-800 border-none p-2 focus:ring-0 focus:bg-white rounded-lg"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="number" 
                              value={camp.ic} 
                              onChange={(e) => updatePlanningCampaign(camp.id, { ic: Number(e.target.value) })}
                              className="w-full bg-transparent text-right text-xs font-black text-slate-800 border-none p-2 focus:ring-0 focus:bg-white rounded-lg"
                            />
                          </td>
                          <td className="p-4 text-right text-xs font-black text-slate-800">
                             {camp.clicks > 0 ? ((camp.sales / camp.clicks) * 100).toFixed(1) : 0}%
                          </td>
                          <td className="p-2">
                            <input 
                              type="number" 
                              value={camp.sales} 
                              onChange={(e) => updatePlanningCampaign(camp.id, { sales: Number(e.target.value) })}
                              className="w-full bg-transparent text-right text-xs font-black text-slate-800 border-none p-2 focus:ring-0 focus:bg-white rounded-lg"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <button onClick={() => removePlanningCampaign(camp.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Calculadora Tempo Real (Estilo Image) */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex flex-col">
                        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Calculadora</h3>
                        <p className="text-xs font-black italic text-black">TEMPO REAL</p>
                      </div>
                      <div className="flex gap-1 bg-slate-50 p-1 rounded-lg">
                        {[
                          { id: 'all', label: 'TUDO' },
                          { id: 'top', label: 'TOPO' },
                          { id: 'middle', label: 'MEIO' },
                          { id: 'bottom', label: 'FUNDO' }
                        ].map((t) => (
                          <button 
                            key={t.id} 
                            onClick={() => setPlanningFilter(t.id as any)}
                            className={`px-2 py-1 rounded text-[8px] font-bold transition-all ${planningFilter === t.id ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600'}`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {(planningFilter === 'all' || planningFilter === 'top') && (
                        <>
                          <MetricCardSmall label="CTR" value={`${planningDiagnostic.ctr.toFixed(2)}%`} icon={<MousePointer2 size={12}/>} />
                          <MetricCardSmall label="CPC" value={formatCurrency(planningDiagnostic.cpc, pricingData.currency)} icon={<MousePointerClick size={12}/>} />
                          <MetricCardSmall label="CPM" value={formatCurrency(planningDiagnostic.cpm, pricingData.currency)} icon={<Eye size={12}/>} />
                        </>
                      )}
                      
                      {(planningFilter === 'all' || planningFilter === 'middle') && (
                        <>
                          <MetricCardSmall label="TAXA ATC" value={`${planningDiagnostic.atcRate.toFixed(2)}%`} icon={<ShoppingCart size={12}/>} />
                          <MetricCardSmall label="ATC" value={Math.floor(planningDiagnostic.atc)} icon={<ShoppingCart size={12}/>} />
                          <MetricCardSmall label="IC" value={Math.floor(planningDiagnostic.ic)} icon={<CreditCard size={12}/>} />
                        </>
                      )}
                      
                      {(planningFilter === 'all' || planningFilter === 'bottom') && (
                        <>
                          <MetricCardSmall label="ROAS" value={planningDiagnostic.roas.toFixed(2)} icon={<TrendingUp size={12}/>} />
                          <MetricCardSmall label="CPA" value={formatCurrency(planningDiagnostic.cpa, pricingData.currency)} icon={<Target size={12}/>} />
                          <MetricCardSmall label="CVR" value={`${planningDiagnostic.cvr.toFixed(2)}%`} icon={<ShoppingBag size={12}/>} />
                        </>
                      )}
                    </div>

                    <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center">
                      <div>
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Lucro Est. (DIA)</p>
                        <p className={`text-xl font-black ${planningDiagnostic.profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {formatCurrency(planningDiagnostic.profit / (planningCampaigns.filter(c => c.selected && c.active).length || 30), pricingData.currency)}
                        </p>
                      </div>
                      <button 
                        onClick={savePlanningSimulation}
                        className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                        title="Salvar no Histórico"
                      >
                        <Save size={16} />
                      </button>
                    </div>

                    <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Navigation size={14} className="text-blue-600" />
                        <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Orientação de Escala</p>
                      </div>
                      <p className="text-[10px] font-black text-slate-700 italic">
                        {planningDiagnostic.scaleGuidance}
                      </p>
                      {planningDiagnostic.issues.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {planningDiagnostic.issues.slice(0, 2).map((issue, idx) => (
                            <div key={idx} className="flex items-center gap-1 text-rose-500">
                              <XCircle size={10} />
                              <span className="text-[8px] font-black uppercase">{issue.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Histórico Recente (Estilo Image) */}
                <div className="lg:col-span-8">
                  <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm min-h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-3">
                        <History size={24} className="text-blue-600" />
                        <h3 className="text-xl font-black italic">HISTÓRICO RECENTE</h3>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Download size={14} />
                        EXPORTAR CSV
                      </button>
                    </div>

                    <div className="flex-1">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr>
                            <th className="pb-4 text-[10px] font-black text-slate-800 uppercase tracking-widest">DATA</th>
                            <th className="pb-4 text-[10px] font-black text-slate-800 uppercase tracking-widest">GASTO</th>
                            <th className="pb-4 text-[10px] font-black text-slate-800 uppercase tracking-widest text-right">RECEITA</th>
                            <th className="pb-4 text-[10px] font-black text-slate-800 uppercase tracking-widest text-right">ROAS</th>
                            <th className="pb-4 text-[10px] font-black text-slate-800 uppercase tracking-widest text-right">CPA</th>
                            <th className="pb-4 text-[10px] font-black text-slate-800 uppercase tracking-widest text-right">LUCRO EST.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {planningHistory.length > 0 ? (
                            planningHistory.map((h, i) => (
                              <tr key={i} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0 group">
                                <td className="py-4 text-xs font-black text-slate-700">{h.date}</td>
                                <td className="py-4 text-xs font-black text-slate-900">{formatCurrency(h.spend, pricingData.currency)}</td>
                                <td className="py-4 text-xs font-black text-emerald-700 text-right">{formatCurrency(h.revenue, pricingData.currency)}</td>
                                <td className="py-4 text-xs font-black text-blue-700 text-right">{h.roas.toFixed(2)}x</td>
                                <td className="py-4 text-xs font-black text-slate-800 text-right">{formatCurrency(h.cpa, pricingData.currency)}</td>
                                <td className={`py-4 text-xs font-black text-right ${h.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {formatCurrency(h.profit, pricingData.currency)}
                                </td>
                                <td className="py-4 text-right pr-2">
                                  <button 
                                    onClick={() => setPlanningHistory(planningHistory.filter((_, idx) => idx !== i))}
                                    className="text-slate-200 hover:text-rose-500 transition-colors"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="py-20 text-center">
                                <p className="text-xl font-black text-slate-300 italic mb-2">Nenhum dado registrado para este produto.</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Seus registros salvos aparecerão aqui</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compass' && (
             <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-32">
                <div className="flex flex-col gap-1">
                  <h2 className="text-4xl font-black text-black tracking-tight italic text-shadow-sm">Bússola de Tráfego</h2>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.1em]">SEUS LIMITES OPERACIONAIS DE TRÁFEGO PAGO</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* LIMITES DE AQUISIÇÃO (CPA) */}
                  <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 flex flex-col gap-8">
                    <div className="flex items-center gap-3 text-black">
                      <Target size={20} />
                      <h3 className="text-xs font-black uppercase tracking-widest">LIMITES DE AQUISIÇÃO (CPA)</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-rose-50 rounded-[24px] p-6 border border-rose-100">
                        <p className="text-[10px] font-black text-rose-600 uppercase mb-2 tracking-widest">CPA BREAKEVEN (MÁXIMO)</p>
                        <h4 className="text-3xl font-black text-black tracking-tighter">{formatCurrency(currentResult.maxCPA, pricingData.currency)}</h4>
                        <p className="text-[9px] text-rose-500 font-bold mt-2">Se gastar mais que isso por venda, você perde dinheiro.</p>
                      </div>

                      <div className="bg-emerald-50 rounded-[24px] p-6 border border-emerald-100">
                        <p className="text-[10px] font-black text-emerald-600 uppercase mb-2 tracking-widest">CPA IDEAL (ESCALA)</p>
                        <h4 className="text-3xl font-black text-black tracking-tighter">{formatCurrency(currentResult.cpaIdeal, pricingData.currency)}</h4>
                        <p className="text-[9px] text-emerald-500 font-bold mt-2">Margem líquida atual está em {currentResult.marginPercent.toFixed(1)}%.</p>
                      </div>
                    </div>
                  </div>

                  {/* TOPO DE FUNIL (ATC) */}
                  <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 flex flex-col gap-8">
                    <div className="flex items-center gap-3 text-black">
                      <ShoppingCart size={20} />
                      <h3 className="text-xs font-black uppercase tracking-widest">TOPO DE FUNIL (ATC)</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-slate-50 rounded-[24px] p-6 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">ATC MÁXIMO</p>
                        <h4 className="text-3xl font-black text-black tracking-tighter">{formatCurrency(currentResult.atcMax, pricingData.currency)}</h4>
                      </div>

                      <div className="bg-blue-50 rounded-[24px] p-6 border border-blue-100">
                        <p className="text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest">ATC IDEAL</p>
                        <h4 className="text-3xl font-black text-black tracking-tighter">{formatCurrency(currentResult.atcIdeal, pricingData.currency)}</h4>
                      </div>
                    </div>
                  </div>

                  {/* MEIO DE FUNIL (IC) */}
                  <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 flex flex-col gap-8">
                    <div className="flex items-center gap-3 text-black">
                      <CardIcon size={20} />
                      <h3 className="text-xs font-black uppercase tracking-widest">MEIO DE FUNIL (IC)</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-slate-50 rounded-[24px] p-6 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">IC MÁXIMO</p>
                        <h4 className="text-3xl font-black text-black tracking-tighter">{formatCurrency(currentResult.icMax, pricingData.currency)}</h4>
                      </div>

                      <div className="bg-blue-50 rounded-[24px] p-6 border border-blue-100">
                        <p className="text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest">IC IDEAL</p>
                        <h4 className="text-3xl font-black text-black tracking-tighter">{formatCurrency(currentResult.icIdeal, pricingData.currency)}</h4>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Por que seguir a Bússola? Section */}
                <div className="bg-white rounded-[40px] p-12 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-4 mb-10">
                    <Scale size={28} className="text-blue-600" />
                    <h3 className="text-2xl font-black italic">Por que seguir a Bússola?</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">01</div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        A Bússola calcula seus limites baseados nos <span className="font-black text-black">custos reais</span> da sua operação, incluindo taxas de gateway, impostos e custos fixos.
                      </p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">03</div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Os benchmarks de <span className="font-black text-black">ATC e IC</span> ajudam você a identificar onde o funil está quebrando antes mesmo de queimar todo o budget.
                      </p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">02</div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        O <span className="font-black text-black">CPA de Equilíbrio</span> é o "fio da navalha". Passou dele, sua operação é uma caridade para o Facebook/Google.
                      </p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">04</div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Use o <span className="font-black text-black">CPA Ideal</span> para escalar com segurança, garantindo que o lucro no bolso compense o risco da operação.
                      </p>
                    </div>
                  </div>
                </div>
             </div>
          )}

          {activeTab === 'dre' && (
             <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-32">
                <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
                   {/* HEADER DO DRE (PRETO) */}
                   <div className="bg-black p-12 text-white flex justify-between items-center">
                      <h2 className="text-4xl font-black italic tracking-tighter">Demonstrativo de Resultados (DRE)</h2>
                      <FileText size={42} className="text-blue-500 opacity-80" />
                   </div>

                   {/* CORPO DO DRE */}
                   <div className="p-12 space-y-2">
                      <DRERow 
                        label="(+) Receita Bruta Total" 
                        value={currentResult.monthlyRevenue} 
                        currency={pricingData.currency} 
                        isBold 
                      />
                      
                      <div className="h-4" />
                      
                      <DRERow 
                        label="(-) Custo de Mercadoria (CMV)" 
                        value={currentResult.unitCMV * pricingData.estimatedMonthlySales} 
                        currency={pricingData.currency} 
                        isNegative 
                      />
                      
                      <DRERow 
                        label="(-) Embalagem e Logística" 
                        value={(pricingData.packagingCost + pricingData.shippingLabel) * pricingData.estimatedMonthlySales} 
                        currency={pricingData.currency} 
                        isNegative 
                      />
                      
                      <div className="h-px bg-slate-100 my-6" />
                      
                      <DRERow 
                        label="(=) Margem de Contribuição I" 
                        value={currentResult.monthlyRevenue - (currentResult.unitCMV + pricingData.packagingCost + pricingData.shippingLabel) * pricingData.estimatedMonthlySales} 
                        currency={pricingData.currency} 
                        isBold 
                      />
                      
                      <div className="h-4" />
                      
                      <DRERow 
                        label="(-) Investimento em Tráfego (Ads)" 
                        value={currentResult.adSpend30Days} 
                        currency={pricingData.currency} 
                        isNegative 
                      />
                      
                      <DRERow 
                        label="(-) Impostos e Taxas" 
                        value={(currentResult.totalFeesOnly - currentResult.marketingCost - currentResult.marketingAdsTax) * pricingData.estimatedMonthlySales} 
                        currency={pricingData.currency} 
                        isNegative 
                      />
                      
                      <div className="h-10" />

                      {/* CARD DE RESUMO INFERIOR */}
                      <div className="bg-[#F8FAFC] p-10 rounded-[40px] border border-slate-100 flex justify-between items-center shadow-inner">
                         <div>
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">LUCRO LÍQUIDO FINAL</p>
                            <h3 className="text-6xl font-black tracking-tighter text-[#10B981]">
                               {formatCurrency(currentResult.monthlyProfitProjection, pricingData.currency)}
                            </h3>
                         </div>
                         <div className="text-right">
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">MARGEM LÍQUIDA</p>
                            <p className="text-5xl font-black text-black">{currentResult.marginPercent.toFixed(1)}%</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          )}

        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-700 hover:bg-slate-50'}`}>
      <div className={active ? 'scale-110' : 'opacity-80'}>{icon}</div>
      <span className="text-xs tracking-tight">{label}</span>
    </button>
  );
}

function PlatformButton({ label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full text-left px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${active ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-600 hover:bg-slate-50'}`}>
       {label}
    </button>
  );
}

const MetricCardSmall = ({ label, value, icon, trend }: { label: string; value: string | number; icon: React.ReactNode; trend?: 'up' | 'down' }) => (
  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 group hover:border-blue-200 transition-all">
    <div className="flex items-center gap-1.5 mb-1.5 text-slate-800 group-hover:text-blue-600 transition-colors">
      {icon}
      <span className="text-[8px] font-black uppercase tracking-widest truncate">{label}</span>
    </div>
    <p className="text-xs font-black text-black tracking-tight">{value}</p>
  </div>
);

function Section({ title, icon, children }: any) {
  return (
    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-5">
      <h3 className="text-xs font-black text-black flex items-center gap-2 uppercase tracking-widest">
        {icon} {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ModernInput({ label, value, onChange, symbol }: any) {
  return (
    <div className="group">
      <label className="block text-[8px] font-black text-slate-700 uppercase mb-1.5 tracking-widest group-focus-within:text-blue-600 transition-colors">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-black text-[10px]">{symbol}</div>
        <input 
          type={typeof value === 'number' ? 'number' : 'text'}
          value={value} 
          onChange={(e) => onChange(typeof value === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value)} 
          className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-8 pr-4 outline-none focus:bg-white focus:border-blue-200 transition-all font-bold text-black text-xs" 
        />
      </div>
    </div>
  );
}

function StatusCard({ icon, label, value, desc, theme }: any) {
  const themes: any = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
  };
  return (
    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
       <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${themes[theme]}`}>{icon}</div>
       <div className="mt-6">
         <p className="text-[9px] font-black text-slate-600 uppercase mb-1 tracking-widest">{label}</p>
         <h4 className="text-2xl font-black text-black tracking-tighter">{value}</h4>
         <p className="text-[8px] text-slate-600 font-bold mt-1">{desc}</p>
       </div>
    </div>
  );
}

function DRERow({ label, value, currency, isNegative, isBold }: { label: string, value: number, currency: CurrencyCode, isNegative?: boolean, isBold?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-2.5 ${isBold ? 'text-2xl font-black text-black' : 'text-xl font-bold text-slate-800'}`}>
       <span>{label}</span>
       <span className={isNegative ? 'text-[#EF4444]' : ''}>
         {isNegative ? '-' : ''}{formatCurrency(value, currency)}
       </span>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] hover:bg-white/10 transition-all group">
       <div className="w-12 h-12 blue-gradient rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
          {icon}
       </div>
       <h3 className="text-lg font-black italic mb-3 tracking-tight">{title}</h3>
       <p className="text-slate-400 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
