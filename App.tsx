
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
  Clock
} from 'lucide-react';
import { Platform, PricingData, CalculationResult, TaxRegime, CurrencyCode } from './types.ts';
import { calculatePricing, formatCurrency, getCurrencySymbol } from './utils/calculations.ts';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart as ReBarChart, Bar, Cell
} from 'recharts';

const MARKUP_STEPS = [1.2, 1.5, 1.8, 2.0, 2.2, 2.5, 2.8, 3.0, 3.5, 4.0, 5.0];

type ProductStatus = 'Mineração' | 'Teste' | 'Validação' | 'Escala' | 'Descontinuado';

interface ProductItem {
  id: string;
  name: string;
  image: string;
  status: ProductStatus;
  addedAt: string;
}

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
  
  const [platform, setPlatform] = useState<Platform>(Platform.DROPSHIPPING);
  const [activeTab, setActiveTab] = useState<'overview' | 'dre' | 'metas' | 'daily' | 'compass' | 'esteira' | 'simulation'>('overview');
  
  const [pricingData, setPricingData] = useState<PricingData>({
    currency: 'BRL',
    costPrice: 52.50,
    freightIn: 5.00,
    packagingCost: 2.00,
    shippingLabel: 0,
    fixedFee: 5,
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
    icmsPercent: 17,
    pixTaxPercent: 1,
    newTaxPercent: 0,
    adsTaxPercent: 4.38
  });

  const [simBudget, setSimBudget] = useState<number>(200);
  const [simPeriod, setSimPeriod] = useState<1 | 7 | 30>(30);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyAds, setDailyAds] = useState({
    spend: 0,
    impressions: 0,
    clicks: 0,
    atc: 0,
    ic: 0,
    sales: 0,
    manualRevenue: 0
  });

  const [targetProfit, setTargetProfit] = useState<number>(10000);

  const [products, setProducts] = useState<ProductItem[]>(() => {
    const saved = localStorage.getItem('gerenciie_products');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Smartwatch Ultra 9', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400', status: 'Escala', addedAt: new Date().toISOString() },
      { id: '2', name: 'Fone Noise Cancelling', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', status: 'Teste', addedAt: new Date().toISOString() }
    ];
  });

  const [newProduct, setNewProduct] = useState({ name: '', image: '', status: 'Mineração' as ProductStatus });
  const [dailyHistory, setDailyHistory] = useState<DailyHistoryEntry[]>(() => {
    const saved = localStorage.getItem('gerenciie_daily_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('gerenciie_daily_history', JSON.stringify(dailyHistory));
  }, [dailyHistory]);

  useEffect(() => {
    localStorage.setItem('gerenciie_products', JSON.stringify(products));
  }, [products]);

  const currentResult = useMemo(() => calculatePricing(pricingData, pricingData.desiredMarkup, platform), [pricingData, platform]);

  const simulationResults = useMemo(() => {
    const scenarios = [
      { name: 'Pior Cenário', cpm: 35, ctr: 0.8, cvr: 0.8, color: '#f43f5e', theme: 'rose' },
      { name: 'Médio Cenário', cpm: 25, ctr: 1.2, cvr: 1.8, color: '#64748b', theme: 'slate' },
      { name: 'Melhor Cenário', cpm: 18, ctr: 2.2, cvr: 3.5, color: '#10b981', theme: 'emerald' }
    ];

    return scenarios.map(s => {
      const dailyImpressions = (simBudget / s.cpm) * 1000;
      const dailyClicks = dailyImpressions * (s.ctr / 100);
      const dailySales = dailyClicks * (s.cvr / 100);
      
      const totalSales = Math.floor(dailySales * simPeriod);
      const totalRevenue = totalSales * currentResult.finalPrice;
      const totalBudget = simBudget * simPeriod;
      const totalImpressions = dailyImpressions * simPeriod;
      const totalClicks = dailyClicks * simPeriod;
      
      const periodFixedCost = (pricingData.fixedOpCost / 30) * simPeriod;
      
      // Variable costs excluding marketing (since budget is manual)
      const unitVariableCostsNoAds = (currentResult.totalFeesOnly / currentResult.finalPrice) * currentResult.finalPrice - (currentResult.marketingCost + currentResult.marketingAdsTax);
      const totalVarCosts = (totalSales * (unitVariableCostsNoAds + currentResult.unitCMV));
      
      const profit = totalRevenue - totalVarCosts - totalBudget - periodFixedCost;
      const roas = totalBudget > 0 ? totalRevenue / totalBudget : 0;
      const cpa = totalSales > 0 ? totalBudget / totalSales : 0;
      const cpc = totalClicks > 0 ? totalBudget / totalClicks : 0;
      const roi = (totalVarCosts + totalBudget) > 0 ? (profit / (totalVarCosts + totalBudget)) * 100 : 0;
      
      const atc = Math.floor(totalClicks * 0.08); // 8% ATC rate
      const ic = Math.floor(atc * 0.35); // 35% IC rate from ATC

      return {
        ...s,
        cpa,
        sales: totalSales,
        revenue: totalRevenue,
        profit,
        roas,
        impressions: totalImpressions,
        clicks: totalClicks,
        atc,
        ic,
        cpc,
        roi
      };
    });
  }, [simBudget, simPeriod, currentResult, pricingData.fixedOpCost]);

  const goalCalculations = useMemo(() => {
    const unitProfit = currentResult.profit > 0 ? currentResult.profit : 0.01;
    const unitsNeeded = Math.ceil((targetProfit + pricingData.fixedOpCost) / unitProfit);
    const revenueGoal = unitsNeeded * currentResult.finalPrice;
    const salesPerDay = Math.ceil(unitsNeeded / 30);
    const totalAdSpend = unitsNeeded * currentResult.marketingCost;
    const targetROAS = totalAdSpend > 0 ? revenueGoal / totalAdSpend : 0;
    return { unitsNeeded, revenueGoal, salesPerDay, targetROAS };
  }, [targetProfit, currentResult, pricingData.fixedOpCost]);

  const dailyStats = useMemo(() => {
    const revenue = dailyAds.manualRevenue || (dailyAds.sales * currentResult.finalPrice);
    const realCPA = dailyAds.sales > 0 ? dailyAds.spend / dailyAds.sales : 0;
    const realROAS = dailyAds.spend > 0 ? revenue / dailyAds.spend : 0;
    const ctr = (dailyAds.clicks / (dailyAds.impressions || 1)) * 100;
    const atcRate = (dailyAds.atc / (dailyAds.clicks || 1)) * 100;
    const cpc = dailyAds.clicks > 0 ? dailyAds.spend / dailyAds.clicks : 0;
    const cpm = dailyAds.impressions > 0 ? (dailyAds.spend / dailyAds.impressions) * 1000 : 0;
    const cvr = dailyAds.clicks > 0 ? (dailyAds.sales / dailyAds.clicks) * 100 : 0;
    
    return {
      revenue, realCPA, realROAS, ctr, atcRate, cpc, cpm, cvr,
      isCPAGood: realCPA > 0 && realCPA <= currentResult.maxCPA,
      isROASGood: realROAS >= (currentResult.finalPrice / currentResult.maxCPA),
      healthStatus: realCPA === 0 ? 'neutral' : (realCPA <= currentResult.cpaIdeal ? 'scale' : (realCPA <= currentResult.maxCPA ? 'maintain' : 'danger'))
    };
  }, [dailyAds, currentResult]);

  const saveDailyMetrics = () => {
    if (dailyAds.spend === 0 && dailyAds.sales === 0) return;
    const entry: DailyHistoryEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      spend: dailyAds.spend,
      impressions: dailyAds.impressions,
      clicks: dailyAds.clicks,
      atc: dailyAds.atc,
      ic: dailyAds.ic,
      sales: dailyAds.sales,
      revenue: dailyStats.revenue,
      profit: dailyStats.revenue - (dailyAds.sales * currentResult.unitCMV) - (dailyAds.sales * (currentResult.totalFeesOnly / currentResult.finalPrice * currentResult.finalPrice)) - dailyAds.spend,
      cpa: dailyStats.realCPA,
      roas: dailyStats.realROAS,
      ctr: dailyStats.ctr,
      atcRate: dailyStats.atcRate,
      cpc: dailyStats.cpc,
      cpm: dailyStats.cpm,
      cvr: dailyStats.cvr,
      status: dailyStats.healthStatus === 'danger' ? 'bad' : (dailyStats.healthStatus === 'scale' ? 'good' : 'warning'),
      platform: platform
    };
    setDailyHistory(prev => [entry, ...prev.filter(h => h.date !== selectedDate)].sort((a, b) => b.date.localeCompare(a.date)));
    alert("Dados consolidados com sucesso!");
  };

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

  const addProduct = () => {
    if (!newProduct.name) return;
    const item: ProductItem = {
      id: Date.now().toString(),
      name: newProduct.name,
      image: newProduct.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      status: newProduct.status,
      addedAt: new Date().toISOString()
    };
    const updated = [item, ...products];
    setProducts(updated);
    setNewProduct({ name: '', image: '', status: 'Mineração' });
    localStorage.setItem('gerenciie_products', JSON.stringify(updated));
  };

  const updateProductStatus = (id: string, status: ProductStatus) => {
    const updated = products.map(p => p.id === id ? { ...p, status } : p);
    setProducts(updated);
    localStorage.setItem('gerenciie_products', JSON.stringify(updated));
  };

  const deleteProduct = (id: string) => {
    if(confirm("Remover produto da esteira?")) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      localStorage.setItem('gerenciie_products', JSON.stringify(updated));
    }
  };

  const currentSymbol = getCurrencySymbol(pricingData.currency);

  if (!isAuthenticated && !showLogin) {
    return (
      <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-x-hidden">
        <nav className="fixed top-0 w-full z-50 px-10 py-6 flex justify-between items-center backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 blue-gradient rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Globe size={20} />
            </div>
            <span className="font-black text-xl tracking-tighter italic">GERENCIIE<span className="text-blue-500">PRO</span></span>
          </div>
          <button onClick={() => setShowLogin(true)} className="px-8 py-3 rounded-full font-bold text-sm bg-white text-black hover:bg-blue-500 hover:text-white transition-all shadow-xl shadow-white/5">
            Acessar Plataforma
          </button>
        </nav>
        <section className="relative pt-40 pb-20 px-10 max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-8 animate-pulse">
            <Sparkles size={12}/> O Futuro do E-commerce High-Ticket
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.95] mb-8 italic">
            DOMINE SUAS <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">MARGENS AGORA</span>
          </h1>
          <p className="text-slate-200 text-lg max-w-2xl font-medium mb-12 leading-relaxed">
            A primeira calculadora com inteligência CFO integrada. Pare de queimar dinheiro em anúncios e comece a escalar com lucro real no bolso.
          </p>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <button onClick={() => setShowLogin(true)} className="px-12 py-5 bg-blue-600 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-4 hover:scale-105 transition-all shadow-2xl shadow-blue-500/40">
              <Rocket size={18}/> Iniciar Teste Grátis
            </button>
            <button className="px-12 py-5 border border-white/10 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-3">
              <PlayCircle size={18}/> Ver Demonstração
            </button>
          </div>
        </section>
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
            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1">PRO v4.0</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <NavItem icon={<LayoutDashboard size={18} />} label="Calculadora" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={<Activity size={18} />} label="Métricas Diárias" active={activeTab === 'daily'} onClick={() => setActiveTab('daily')} />
          <NavItem icon={<ShieldCheck size={18} />} label="Bússola (KPIs)" active={activeTab === 'compass'} onClick={() => setActiveTab('compass')} />
          <NavItem icon={<Zap size={18} />} label="Simulação Escala" active={activeTab === 'simulation'} onClick={() => setActiveTab('simulation')} />
          <NavItem icon={<Layers3 size={18} />} label="Esteira de Produtos" active={activeTab === 'esteira'} onClick={() => setActiveTab('esteira')} />
          <NavItem icon={<Crosshair size={18} />} label="Metas" active={activeTab === 'metas'} onClick={() => setActiveTab('metas')} />
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-4 space-y-6">
                    <Section title="Produto & Logística" icon={<Package size={16}/>}>
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black text-slate-700 uppercase tracking-widest block">Moeda Venda</label>
                        <select 
                          value={pricingData.currency} 
                          onChange={e => setPricingData(prev => ({...prev, currency: e.target.value as CurrencyCode}))}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 font-bold text-xs outline-none focus:border-blue-500/50"
                        >
                          <option value="BRL">BRL (Real)</option>
                          <option value="USD">USD (Dólar)</option>
                          <option value="EUR">EUR (Euro)</option>
                        </select>
                      </div>
                      <ModernInput label="Custo Produto (Ref)" value={pricingData.costPrice} onChange={v => setPricingData(prev => ({...prev, costPrice: v}))} symbol={currentSymbol} />
                      <ModernInput label="Frete Fornecedor" value={pricingData.freightIn} onChange={v => setPricingData(prev => ({...prev, freightIn: v}))} symbol={currentSymbol} />
                      <ModernInput label="Markup Alvo" value={pricingData.desiredMarkup} onChange={v => setPricingData(prev => ({...prev, desiredMarkup: v}))} symbol="x" />
                    </Section>
                    
                    <Section title="Canal & Marketing" icon={<Megaphone size={16}/>}>
                      <ModernInput label="Budget Ads (%)" value={pricingData.marketingPercent} onChange={v => setPricingData(prev => ({...prev, marketingPercent: v}))} symbol="%" />
                      <ModernInput label="Imposto s/ Ads (%)" value={pricingData.adsTaxPercent} onChange={v => setPricingData(prev => ({...prev, adsTaxPercent: v}))} symbol="%" />
                    </Section>

                    <Section title="Financeiro & Fiscal" icon={<Receipt size={16}/>}>
                      <div className="grid grid-cols-2 gap-4">
                        <ModernInput label="Checkout/Shopify (%)" value={pricingData.yampiFeePercent} onChange={v => setPricingData(prev => ({...prev, yampiFeePercent: v}))} symbol="%" />
                        <ModernInput label="Taxa Cartão (%)" value={pricingData.cardTaxPercent} onChange={v => setPricingData(prev => ({...prev, cardTaxPercent: v}))} symbol="%" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <ModernInput label="Gateway/Finance (%)" value={pricingData.gatewayFee} onChange={v => setPricingData(prev => ({...prev, gatewayFee: v}))} symbol="%" />
                        <ModernInput label="Imposto Venda (%)" value={pricingData.taxPercent} onChange={v => setPricingData(prev => ({...prev, taxPercent: v}))} symbol="%" />
                      </div>
                    </Section>
                  </div>
                  
                  <div className="lg:col-span-8 bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 h-full">
                     <h3 className="text-lg font-black text-black mb-6 flex items-center gap-2"><BarChart3 size={20} className="text-blue-500"/> Performance de Markup</h3>
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

          {activeTab === 'compass' && (
             <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-32">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h2 className="text-3xl font-black text-black tracking-tight italic">Bússola de Tráfego</h2>
                    <p className="text-slate-600 font-bold uppercase text-[10px] tracking-widest mt-1">Seus limites operacionais de tráfego pago</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <Section title="Limites de Aquisição (CPA)" icon={<Target size={16}/>}>
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 mb-4">
                       <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">CPA Breakeven (Máximo)</p>
                       <h4 className="text-3xl font-black text-black">{formatCurrency(currentResult.maxCPA, pricingData.currency)}</h4>
                       <p className="text-[9px] font-bold text-rose-500 mt-2">Se gastar mais que isso por venda, você perde dinheiro.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                       <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">CPA Ideal (Escala)</p>
                       <h4 className="text-3xl font-black text-black">{formatCurrency(currentResult.cpaIdeal, pricingData.currency)}</h4>
                       <p className="text-[9px] font-bold text-emerald-500 mt-2">Margem líquida atual está em {currentResult.marginPercent.toFixed(1)}%.</p>
                    </div>
                  </Section>

                  <Section title="Topo de Funil (ATC)" icon={<ShoppingCart size={16}/>}>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">ATC Máximo</p>
                       <h4 className="text-3xl font-black text-black">{formatCurrency(currentResult.atcMax, pricingData.currency)}</h4>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                       <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">ATC Ideal</p>
                       <h4 className="text-3xl font-black text-black">{formatCurrency(currentResult.atcIdeal, pricingData.currency)}</h4>
                    </div>
                  </Section>

                  <Section title="Meio de Funil (IC)" icon={<CreditCard size={16}/>}>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">IC Máximo</p>
                       <h4 className="text-3xl font-black text-black">{formatCurrency(currentResult.icMax, pricingData.currency)}</h4>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                       <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">IC Ideal</p>
                       <h4 className="text-3xl font-black text-black">{formatCurrency(currentResult.icIdeal, pricingData.currency)}</h4>
                    </div>
                  </Section>
                </div>

                <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
                  <h3 className="text-xl font-black text-black mb-8 italic flex items-center gap-3"><Scale size={24} className="text-blue-600"/> Por que seguir a Bússola?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">01</div>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">A Bússola calcula seus limites baseados nos <span className="font-bold text-black">custos reais</span> da sua operação, incluindo taxas de gateway, impostos e custos fixos.</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">02</div>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">O <span className="font-bold text-black">CPA de Equilíbrio</span> é o "fio da navalha". Passou dele, sua operação é uma caridade para o Facebook/Google.</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">03</div>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">Os benchmarks de <span className="font-bold text-black">ATC e IC</span> ajudam você a identificar onde o funil está quebrando antes mesmo de queimar todo o budget.</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">04</div>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">Use o <span className="font-bold text-black">CPA Ideal</span> para escalar com segurança, garantindo que o lucro no bolso compense o risco da operação.</p>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          )}

          {activeTab === 'simulation' && (
            <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-32">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-3xl font-black text-black tracking-tight italic">Simulação de Escala</h2>
                  <p className="text-slate-600 font-bold uppercase text-[10px] tracking-widest mt-1">Projeções Financeiras & Benchmarks Ads</p>
                </div>
                
                <div className="flex flex-col items-end gap-4">
                   {/* Period Selector Tabs */}
                   <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                      {[1, 7, 30].map(p => (
                        <button 
                          key={p} 
                          onClick={() => setSimPeriod(p as any)}
                          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${simPeriod === p ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          {p === 1 ? '1 Dia' : `${p} Dias`}
                        </button>
                      ))}
                   </div>

                   <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">Investimento Diário em Ads</p>
                      <div className="flex items-center gap-2">
                         <span className="font-black text-slate-400">{currentSymbol}</span>
                         <input 
                           type="number" 
                           value={simBudget} 
                           onChange={e => setSimBudget(parseFloat(e.target.value) || 0)} 
                           className="bg-transparent font-black text-3xl outline-none w-32 focus:text-blue-600 transition-colors"
                         />
                      </div>
                    </div>
                    <div className="h-10 w-px bg-slate-100" />
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">Preço de Venda</p>
                      <p className="font-black text-xl">{formatCurrency(currentResult.finalPrice, pricingData.currency)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {simulationResults.map((sim, idx) => (
                  <div key={idx} className={`bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-xl transition-all ${sim.name === 'Melhor Cenário' ? 'border-emerald-200 ring-4 ring-emerald-50' : sim.name === 'Pior Cenário' ? 'border-rose-200' : ''}`}>
                    {sim.name === 'Melhor Cenário' && <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-2xl">Escala Ideal</div>}
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-xl font-black text-black italic">{sim.name}</h3>
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black ${sim.profit > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {sim.profit > 0 ? 'Lucrativo' : 'Prejuízo'}
                      </div>
                    </div>

                    {/* Lucro em Destaque */}
                    <div className={`p-6 rounded-[24px] mb-8 ${sim.profit > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-70">Lucro Projetado ({simPeriod}d)</p>
                      <p className="text-3xl font-black tracking-tighter">{formatCurrency(sim.profit, pricingData.currency)}</p>
                      <p className="text-[9px] font-bold mt-1">ROI Final: {sim.roi.toFixed(1)}%</p>
                    </div>

                    <div className="space-y-8">
                      {/* Métricas de Negócio */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-700">Métricas de Negócio</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                           <SimRow label="Receita Bruta" value={formatCurrency(sim.revenue, pricingData.currency)} />
                           <SimRow label="Unidades Vendidas" value={`${sim.sales} un`} />
                           <SimRow label="CPA Médio" value={formatCurrency(sim.cpa, pricingData.currency)} />
                           <SimRow label="ROAS" value={`${sim.roas.toFixed(2)}x`} />
                        </div>
                      </div>

                      {/* Métricas Facebook Ads */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-700">Facebook Ads Benchmarks</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                           <SimRow label="Impressões" value={new Intl.NumberFormat('pt-BR').format(Math.floor(sim.impressions))} />
                           <SimRow label="Cliques" value={new Intl.NumberFormat('pt-BR').format(Math.floor(sim.clicks))} />
                           <SimRow label="CPM" value={formatCurrency(sim.cpm, pricingData.currency)} />
                           <SimRow label="CTR" value={`${sim.ctr.toFixed(2)}%`} />
                           <SimRow label="CPC" value={formatCurrency(sim.cpc, pricingData.currency)} />
                           <SimRow label="CVR" value={`${sim.cvr.toFixed(2)}%`} />
                           <SimRow label="ATC (Carrinhos)" value={new Intl.NumberFormat('pt-BR').format(sim.atc)} />
                           <SimRow label="IC (Checkouts)" value={new Intl.NumberFormat('pt-BR').format(sim.ic)} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <h3 className="text-xl font-black text-black italic flex items-center gap-3"><BarChart4 size={24} className="text-blue-600"/> Comparativo Faturamento vs Lucro ({simPeriod} Dias)</h3>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-200"></div><span className="text-[10px] font-black text-slate-500 uppercase">Receita</span></div>
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600"></div><span className="text-[10px] font-black text-slate-500 uppercase">Lucro</span></div>
                  </div>
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={simulationResults} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{fontSize: 11, fontWeight: 'bold', fill: '#64748b'}} axisLine={false} />
                      <YAxis tickFormatter={v => formatCurrency(v, pricingData.currency)} tick={{fontSize: 9, fontWeight: 'bold', fill: '#64748b'}} axisLine={false} />
                      <Tooltip 
                        contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)'}} 
                        formatter={(value: any, name: any) => [formatCurrency(value, pricingData.currency), name === 'profit' ? 'Lucro' : 'Receita']}
                      />
                      <Bar dataKey="revenue" name="Receita" fill="#e2e8f0" radius={[8, 8, 0, 0]} barSize={40} />
                      <Bar dataKey="profit" name="Lucro" radius={[8, 8, 0, 0]} barSize={40}>
                        {simulationResults.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dre' && (
             <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom duration-500 pb-32">
                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                   <div className="bg-black p-10 text-white flex justify-between items-center">
                      <h2 className="text-2xl font-black italic tracking-tighter">Demonstrativo de Resultados (DRE)</h2>
                      <FileText size={32} className="text-blue-500 opacity-50" />
                   </div>

                   <div className="p-10 space-y-2">
                      <DRERow label="(+) Receita Bruta Total" value={currentResult.monthlyRevenue} currency={pricingData.currency} isMain />
                      <div className="h-4" />
                      <DRERow label="(-) Custo de Mercadoria (CMV)" value={currentResult.unitCMV * pricingData.estimatedMonthlySales} currency={pricingData.currency} isNegative />
                      <DRERow label="(-) Embalagem e Logística" value={(pricingData.packagingCost + pricingData.shippingLabel) * pricingData.estimatedMonthlySales} currency={pricingData.currency} isNegative />
                      <div className="h-px bg-slate-100 my-4" />
                      <DRERow label="(=) Margem de Contribuição I" value={currentResult.monthlyRevenue - (currentResult.unitCMV + pricingData.packagingCost + pricingData.shippingLabel) * pricingData.estimatedMonthlySales} currency={pricingData.currency} isBold />
                      <div className="h-4" />
                      <DRERow label="(-) Investimento em Tráfego (Ads)" value={currentResult.marketingCost * pricingData.estimatedMonthlySales} currency={pricingData.currency} isNegative />
                      <DRERow label="(-) Impostos e Taxas" value={currentResult.totalFeesOnly * pricingData.estimatedMonthlySales} currency={pricingData.currency} isNegative />
                      <div className="h-px bg-slate-100 my-4" />
                      <div className="h-4" />
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex justify-between items-center">
                         <div>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Lucro Líquido Final</p>
                            <h3 className={`text-4xl font-black tracking-tighter ${currentResult.monthlyProfitProjection > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                               {formatCurrency(currentResult.monthlyProfitProjection, pricingData.currency)}
                            </h3>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Margem Líquida</p>
                            <p className="text-2xl font-black text-black">{currentResult.marginPercent.toFixed(1)}%</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'daily' && (
            <div className="max-w-7xl mx-auto space-y-10 animate-in slide-in-from-bottom duration-700 pb-32">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                 <div>
                    <h2 className="text-3xl font-black text-black tracking-tight italic">Centro de Performance Consolidada</h2>
                    <p className="text-slate-600 font-bold uppercase text-[10px] tracking-widest mt-1">Consolide seus gastos e valide sua escala</p>
                 </div>
               </div>
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 <div className="lg:col-span-8 bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
                    <div className="mb-10">
                       <label className="text-[10px] font-black text-slate-700 uppercase block px-1 mb-2">Data de Referência</label>
                       <input 
                         type="date" 
                         value={selectedDate} 
                         onChange={e => setSelectedDate(e.target.value)} 
                         className="bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-sm outline-none focus:border-blue-500/50" 
                       />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                       <ModernInput label="Gasto Total Ads" value={dailyAds.spend} onChange={v => setDailyAds(prev => ({...prev, spend: v}))} symbol={currentSymbol} />
                       <ModernInput label="Vendas (Un)" value={dailyAds.sales} onChange={v => setDailyAds(prev => ({...prev, sales: v}))} symbol="#" />
                       <ModernInput label="Faturamento Real" value={dailyAds.manualRevenue} onChange={v => setDailyAds(prev => ({...prev, manualRevenue: v}))} symbol={currentSymbol} />
                       <ModernInput label="Impressões" value={dailyAds.impressions} onChange={v => setDailyAds(prev => ({...prev, impressions: v}))} symbol="#" />
                       <ModernInput label="Cliques (Site)" value={dailyAds.clicks} onChange={v => setDailyAds(prev => ({...prev, clicks: v}))} symbol="#" />
                       <ModernInput label="Carrinhos (ATC)" value={dailyAds.atc} onChange={v => setDailyAds(prev => ({...prev, atc: v}))} symbol="#" />
                       <ModernInput label="Checkout (IC)" value={dailyAds.ic} onChange={v => setDailyAds(prev => ({...prev, ic: v}))} symbol="#" />
                    </div>
                    <button onClick={saveDailyMetrics} className="w-full bg-black text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3">
                      <Save size={18}/> Salvar Resultados
                    </button>
                 </div>
                 <div className="lg:col-span-4 bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 flex flex-col">
                    <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-6">Lucratividade (15d)</h3>
                    <div className="flex-1 min-h-[200px]">
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={[...dailyHistory].reverse().slice(-15)}>
                           <Area type="monotone" dataKey="profit" stroke="#3b82f6" fill="#dbeafe" strokeWidth={3} />
                         </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                  <MiniMetricCard label="CPA Real" value={formatCurrency(dailyStats.realCPA, pricingData.currency)} bad={!dailyStats.isCPAGood && dailyAds.spend > 0} icon={<Target size={14}/>} />
                  <MiniMetricCard label="ROAS" value={`${dailyStats.realROAS.toFixed(2)}x`} bad={!dailyStats.isROASGood && dailyAds.spend > 0} icon={<TrendingUp size={14}/>} />
                  <MiniMetricCard label="CPC" value={formatCurrency(dailyStats.cpc, pricingData.currency)} icon={<MousePointerClick size={14}/>} />
                  <MiniMetricCard label="CPM" value={formatCurrency(dailyStats.cpm, pricingData.currency)} icon={<Eye size={14}/>} />
                  <MiniMetricCard label="ATC %" value={`${dailyStats.atcRate.toFixed(1)}%`} icon={<ShoppingCart size={14}/>} />
                  <MiniMetricCard label="CVR %" value={`${dailyStats.cvr.toFixed(1)}%`} icon={<ShoppingBag size={14}/>} />
               </div>
            </div>
          )}

          {activeTab === 'esteira' && (
            <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-32">
              <div>
                <h2 className="text-3xl font-black text-black tracking-tight italic">Esteira de Operação</h2>
                <p className="text-slate-600 font-bold uppercase text-[10px] tracking-widest mt-1">Gerencie seu fluxo de mineração e escala</p>
              </div>

              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 border-l-4 border-l-blue-600">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-700 uppercase block px-1">Nome do Produto</label>
                    <input type="text" placeholder="Ex: Smartwatch Ultra..." value={newProduct.name} onChange={e => setNewProduct(prev => ({...prev, name: e.target.value}))} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 font-bold text-sm outline-none focus:border-blue-500/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-700 uppercase block px-1">URL da Imagem</label>
                    <input type="text" placeholder="https://..." value={newProduct.image} onChange={e => setNewProduct(prev => ({...prev, image: e.target.value}))} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 font-bold text-sm outline-none focus:border-blue-500/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-700 uppercase block px-1">Status Inicial</label>
                    <select value={newProduct.status} onChange={e => setNewProduct(prev => ({...prev, status: e.target.value as ProductStatus}))} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 font-bold text-sm outline-none focus:border-blue-500/50 appearance-none">
                      <option>Mineração</option>
                      <option>Teste</option>
                      <option>Validação</option>
                      <option>Escala</option>
                    </select>
                  </div>
                  <button onClick={addProduct} disabled={!newProduct.name} className="h-[52px] px-10 rounded-2xl font-black text-xs uppercase tracking-widest blue-gradient text-white hover:scale-[1.02] transition-all shadow-lg shadow-blue-500/20">
                    Minerar!
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {(['Mineração', 'Teste', 'Validação', 'Escala'] as ProductStatus[]).map(status => (
                  <div key={status} className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 pl-2 border-l-2 border-slate-200">{status}</h3>
                    <div className="space-y-4 min-h-[100px]">
                      {products.filter(p => p.status === status).map(product => (
                        <div key={product.id} className="bg-white rounded-[32px] p-4 shadow-sm border border-slate-200 group relative">
                          <button onClick={() => deleteProduct(product.id)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                             <Trash2 size={16}/>
                          </button>
                          <div className="aspect-square w-full rounded-2xl overflow-hidden mb-4 bg-slate-100">
                             <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <h4 className="font-extrabold text-black text-sm mb-4 truncate pr-6">{product.name}</h4>
                          <div className="relative">
                            <select value={product.status} onChange={(e) => updateProductStatus(product.id, e.target.value as ProductStatus)} className="w-full text-[10px] font-black uppercase text-slate-700 bg-slate-50 px-3 py-2.5 rounded-xl border-none appearance-none">
                              <option>Mineração</option>
                              <option>Teste</option>
                              <option>Validação</option>
                              <option>Escala</option>
                              <option>Descontinuado</option>
                            </select>
                            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'metas' && (
             <div className="animate-in slide-in-from-bottom duration-500 max-w-5xl mx-auto space-y-10 pb-20 pt-10">
                <div className="bg-black text-white rounded-[40px] p-10 flex items-center justify-between shadow-xl">
                   <div>
                      <h3 className="text-3xl font-black tracking-tighter uppercase italic">Escalômetro</h3>
                      <p className="text-xs font-bold text-slate-300">Objetivo de lucro mensal</p>
                   </div>
                   <div className="bg-slate-900 rounded-3xl p-6 text-right border border-white/10">
                      <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Lucro Alvo ({currentSymbol})</p>
                      <input type="number" value={targetProfit} onChange={e => setTargetProfit(parseFloat(e.target.value) || 0)} className="bg-transparent outline-none font-black text-4xl w-44 text-right text-white" />
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <GoalMini label="Faturamento" value={formatCurrency(goalCalculations.revenueGoal, pricingData.currency)} color="blue" icon={<Coins size={16}/>} />
                   <GoalMini label="Vendas/Mês" value={`${goalCalculations.unitsNeeded} un`} color="green" icon={<Package size={16}/>} />
                   <GoalMini label="Vendas/Dia" value={`${goalCalculations.salesPerDay} un`} color="green" icon={<Zap size={16}/>} />
                   <GoalMini label="ROAS" value={`${(goalCalculations.targetROAS || 0).toFixed(2)}x`} color="blue" icon={<TrendingUp size={16}/>} />
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

function MiniMetricCard({ label, value, bad, icon }: any) {
  return (
    <div className={`bg-white rounded-2xl p-4 border shadow-sm transition-all ${bad ? 'border-rose-200 bg-rose-50' : 'border-slate-100'}`}>
       <div className="flex items-center gap-2 mb-2 text-slate-600">
          {icon}
          <p className="text-[8px] font-black uppercase tracking-widest">{label}</p>
       </div>
       <p className={`text-sm font-black tracking-tight ${bad ? 'text-rose-600' : 'text-black'}`}>{value}</p>
    </div>
  );
}

function GoalMini({ label, value, color, icon }: any) {
  const colors: any = { green: "bg-emerald-50 text-emerald-700 border-emerald-100", blue: "bg-blue-600 text-white border-blue-500" };
  return (
    <div className={`p-6 rounded-[28px] border shadow-sm flex flex-col justify-center ${colors[color]}`}>
       <div className="flex items-center gap-2 mb-2 opacity-90">{icon}<p className="text-[9px] font-black uppercase tracking-widest">{label}</p></div>
       <h4 className="text-2xl font-black tracking-tight italic">{value}</h4>
    </div>
  );
}

function DRERow({ label, value, currency, isNegative, isBold, isMain }: { label: string, value: number, currency: CurrencyCode, isNegative?: boolean, isBold?: boolean, isMain?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-2 ${isMain ? 'text-lg font-black text-black' : isBold ? 'font-black text-black' : 'text-sm font-bold text-slate-700'}`}>
       <span>{label}</span>
       <span className={isNegative ? 'text-rose-600' : ''}>
         {isNegative ? '-' : ''}{formatCurrency(value, currency)}
       </span>
    </div>
  );
}

function SimRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col">
       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
       <span className="text-xs font-black text-black">{value}</span>
    </div>
  );
}
