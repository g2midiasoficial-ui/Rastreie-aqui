import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  X, 
  Minus, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Sparkles, 
  Layers, 
  TrendingUp, 
  ShieldCheck, 
  Maximize2,
  DollarSign,
  Truck,
  Percent,
  Bookmark,
  User,
  KeyRound,
  LogIn,
  LogOut,
  Trash2,
  Lock,
  Mail,
  Zap
} from 'lucide-react';
import { Platform, PricingData } from '../../types';
import { formatCurrency } from '../../utils/calculations';

interface FloatingExtensionWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  pricingData: PricingData;
  setPricingData: React.Dispatch<React.SetStateAction<PricingData>>;
  currentUser?: any;
  onOpenFullModal: () => void;
  onOpenAuthModal?: () => void;
}

interface SavedProductItem {
  id: string;
  name: string;
  platform: string;
  cost: number;
  freight: number;
  sellingPrice: number;
  markup: number;
  margin: number;
  profit: number;
  sfpFee?: number;
  date: string;
}

export function FloatingExtensionWidget({
  isOpen,
  onClose,
  pricingData,
  setPricingData,
  currentUser,
  onOpenFullModal,
  onOpenAuthModal
}: FloatingExtensionWidgetProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Login Gate State: If user has a currentUser or manually logged in, unlock system
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!(currentUser?.email);
  });
  const [authEmail, setAuthEmail] = useState(currentUser?.email || 'g2midiasoficial@gmail.com');
  const [authPassword, setAuthPassword] = useState('gerenciie123');
  const [authTab, setAuthTab] = useState<'email' | 'token'>('email');
  const [authToken, setAuthToken] = useState('');
  const [loginAlert, setLoginAlert] = useState<string | null>(null);

  // Sync with currentUser prop if logged in at platform level
  useEffect(() => {
    if (currentUser?.email) {
      setIsLoggedIn(true);
      setAuthEmail(currentUser.email);
    }
  }, [currentUser]);

  // System State (Active after login)
  const [activeTab, setActiveTab] = useState<'calc' | 'saved' | 'account'>('calc');
  const [selectedChannel, setSelectedChannel] = useState<'dropshipping' | 'shopee' | 'mercadolivre' | 'tiktok'>('dropshipping');
  const [copiedPrice, setCopiedPrice] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [quickAutoGrabMsg, setQuickAutoGrabMsg] = useState<string | null>(null);

  // Saved products inside widget
  const [savedProducts, setSavedProducts] = useState<SavedProductItem[]>(() => {
    try {
      const s = localStorage.getItem('gerenciie_widget_saved_prods');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  // Local state mirror for rapid tweaking
  const [productTitle, setProductTitle] = useState('Produto Fornecedor');
  const [localCost, setLocalCost] = useState<number>(pricingData.costPrice || 45.00);
  const [localFreight, setLocalFreight] = useState<number>(pricingData.freightIn || 5.00);
  const [localPackaging, setLocalPackaging] = useState<number>(pricingData.packagingCost || 2.00);
  const [localMarkup, setLocalMarkup] = useState<number>(pricingData.desiredMarkup || 2.5);
  const [localAdsPct, setLocalAdsPct] = useState<number>(pricingData.marketingPercent || 20);
  const [localTaxPct, setLocalTaxPct] = useState<number>(pricingData.taxPercent || 6);
  const [localCommission, setLocalCommission] = useState<number>(14);
  const [localFixedFee, setLocalFixedFee] = useState<number>(4);
  const [mode, setMode] = useState<'markup' | 'manual'>('markup');
  const [customSellingPrice, setCustomSellingPrice] = useState<number>(139.90);

  // SFP State
  const [localSfpEnabled, setLocalSfpEnabled] = useState<boolean>(pricingData.sfpEnabled !== false);
  const [localOriginalPrice, setLocalOriginalPrice] = useState<number>(pricingData.originalPrice || 169.90);
  const [localSellerDiscount, setLocalSellerDiscount] = useState<number>(pricingData.sellerDiscount || 0);
  const [localSellerDiscountType, setLocalSellerDiscountType] = useState<'currency' | 'percent'>(pricingData.sellerDiscountType || 'currency');
  const [localSfpPercent, setLocalSfpPercent] = useState<number>(pricingData.sfpPercent !== undefined ? pricingData.sfpPercent : 6);

  // Sync from parent if opened
  useEffect(() => {
    if (pricingData.costPrice) setLocalCost(pricingData.costPrice);
    if (pricingData.freightIn) setLocalFreight(pricingData.freightIn);
    if (pricingData.desiredMarkup) setLocalMarkup(pricingData.desiredMarkup);
    if (pricingData.sfpEnabled !== undefined) setLocalSfpEnabled(pricingData.sfpEnabled);
    if (pricingData.originalPrice !== undefined) setLocalOriginalPrice(pricingData.originalPrice);
  }, [pricingData]);

  const channelPresets = {
    dropshipping: { name: 'Dropshipping', comm: 0, fixed: 0, ads: 25, markup: 2.5, sfp: false },
    shopee: { name: 'Shopee', comm: 14, fixed: 4, ads: 10, markup: 2.2, sfp: true },
    mercadolivre: { name: 'Mercado Livre', comm: 16.5, fixed: 6, ads: 12, markup: 2.3, sfp: true },
    tiktok: { name: 'TikTok Shop', comm: 6, fixed: 2, ads: 20, markup: 2.6, sfp: false }
  };

  const handleSelectChannel = (ch: 'dropshipping' | 'shopee' | 'mercadolivre' | 'tiktok') => {
    setSelectedChannel(ch);
    const preset = channelPresets[ch];
    setLocalCommission(preset.comm);
    setLocalFixedFee(preset.fixed);
    setLocalAdsPct(preset.ads);
    setLocalMarkup(preset.markup);
    setLocalSfpEnabled(preset.sfp);
  };

  // Calculations
  const directCost = (Number(localCost) || 0) + (Number(localFreight) || 0) + (Number(localPackaging) || 0);
  const finalPrice = mode === 'manual' 
    ? (Number(customSellingPrice) || 0) 
    : directCost * (Number(localMarkup) || 2.5);
  
  const effectiveMarkup = directCost > 0 ? (finalPrice / directCost) : localMarkup;
  const adsCost = finalPrice * ((Number(localAdsPct) || 0) / 100);
  const taxesCost = finalPrice * ((Number(localTaxPct) || 0) / 100);
  const marketplaceCost = selectedChannel === 'dropshipping' ? 0 : (finalPrice * (localCommission / 100)) + localFixedFee;

  // SFP Fee calculation
  const discountVal = localSellerDiscountType === 'percent'
    ? (localOriginalPrice * (localSellerDiscount / 100))
    : localSellerDiscount;
  const sfpBase = Math.max(0, localOriginalPrice - discountVal);
  const sfpFee = localSfpEnabled ? sfpBase * (localSfpPercent / 100) : 0;

  const totalFees = taxesCost + marketplaceCost + sfpFee;
  
  const profit = finalPrice - directCost - adsCost - totalFees;
  const marginPercent = finalPrice > 0 ? (profit / finalPrice) * 100 : 0;
  const roi = directCost > 0 ? (profit / directCost) * 100 : 0;
  const cpaBreakeven = Math.max(0, finalPrice - directCost - totalFees);

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!authEmail.trim()) {
      setLoginAlert('Digite seu e-mail para entrar.');
      return;
    }
    setIsLoggedIn(true);
    setLoginAlert(null);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleCopyPrice = () => {
    navigator.clipboard.writeText(`R$ ${finalPrice.toFixed(2).replace('.', ',')}`);
    setCopiedPrice(true);
    setTimeout(() => setCopiedPrice(false), 1800);
  };

  const handleCopySummary = () => {
    const summary = `🚀 GERENCIIE PRO • PRECIFICAÇÃO EXPRESSA
Produto: ${productTitle}
Canal: ${channelPresets[selectedChannel].name}
Custo Produto + Frete: R$ ${(localCost + localFreight).toFixed(2)}
Preço de Venda: R$ ${finalPrice.toFixed(2)}
Markup: ${effectiveMarkup.toFixed(2)}x | Margem: ${marginPercent.toFixed(1)}%
Lucro Líquido: R$ ${profit.toFixed(2)} | ROI: ${roi.toFixed(0)}%
Taxa SFP (Frete Grátis): ${localSfpEnabled ? `R$ ${sfpFee.toFixed(2)} (${localSfpPercent}%)` : 'Desativada'}
CPA Breakeven (Teto Ads): R$ ${cpaBreakeven.toFixed(2)}`;
    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleSaveProduct = () => {
    const newProd: SavedProductItem = {
      id: 'prod_' + Date.now(),
      name: productTitle || 'Item ' + new Date().toLocaleDateString(),
      platform: channelPresets[selectedChannel].name,
      cost: localCost,
      freight: localFreight,
      sellingPrice: finalPrice,
      markup: effectiveMarkup,
      margin: marginPercent,
      profit: profit,
      sfpFee: sfpFee,
      date: new Date().toLocaleDateString('pt-BR')
    };

    const updated = [newProd, ...savedProducts.slice(0, 20)];
    setSavedProducts(updated);
    try {
      localStorage.setItem('gerenciie_widget_saved_prods', JSON.stringify(updated));
    } catch {}

    setQuickAutoGrabMsg('✅ Salvo no Projeto Gerenciie Pro!');
    setTimeout(() => setQuickAutoGrabMsg(null), 2500);
  };

  const handleLoadSavedProduct = (p: SavedProductItem) => {
    setProductTitle(p.name);
    setLocalCost(p.cost);
    setLocalFreight(p.freight);
    setActiveTab('calc');
  };

  const handleDeleteSaved = (id: string) => {
    const updated = savedProducts.filter(p => p.id !== id);
    setSavedProducts(updated);
    try {
      localStorage.setItem('gerenciie_widget_saved_prods', JSON.stringify(updated));
    } catch {}
  };

  const handleSyncToMainApp = () => {
    setPricingData(prev => ({
      ...prev,
      productName: productTitle,
      costPrice: localCost,
      freightIn: localFreight,
      packagingCost: localPackaging,
      desiredMarkup: localMarkup,
      marketingPercent: localAdsPct,
      taxPercent: localTaxPct,
      pricingMode: mode,
      customSellingPrice: customSellingPrice,
      sfpEnabled: localSfpEnabled,
      originalPrice: localOriginalPrice,
      sellerDiscount: localSellerDiscount,
      sellerDiscountType: localSellerDiscountType,
      sfpPercent: localSfpPercent
    }));
    setQuickAutoGrabMsg('Sincronizado com o painel principal!');
    setTimeout(() => setQuickAutoGrabMsg(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end animate-in slide-in-from-bottom-5 duration-300">
      {/* Minimized Pill View */}
      {isMinimized ? (
        <div 
          onClick={() => setIsMinimized(false)}
          className="bg-slate-900 border border-blue-500/40 text-white rounded-full p-2.5 pl-4 pr-5 shadow-2xl flex items-center gap-3 cursor-pointer hover:scale-105 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
            <Calculator size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white">
                {isLoggedIn ? 'Extensão Desbloqueada' : 'Extensão (Requer Login)'}
              </span>
              <span className={`w-2 h-2 rounded-full ${isLoggedIn ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            </div>
            <p className="text-[10px] font-bold text-blue-400">
              {isLoggedIn ? `Venda: R$ ${finalPrice.toFixed(2).replace('.', ',')} (${effectiveMarkup.toFixed(1)}x)` : 'Clique para Acessar'}
            </p>
          </div>
          <Maximize2 size={14} className="text-slate-400 group-hover:text-white transition-colors ml-1" />
        </div>
      ) : (
        /* Full Chrome Extension Window Frame */
        <div className="w-[380px] bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col select-none">
          
          {/* Extension Chrome Bar */}
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
                <Calculator size={14} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black tracking-tight text-white">
                    GERENCIIE <span className="text-blue-400">PRO</span>
                  </h4>
                  <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[8px] font-black uppercase">
                    {isLoggedIn ? 'Sistema Liberado 🟢' : 'Acesso Restrito 🔒'}
                  </span>
                </div>
                <p className="text-[9px] font-semibold text-slate-400">Extensão, Preço & Taxa SFP</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={onOpenFullModal}
                title="Abrir Central da Extensão & Download"
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded-lg transition-colors cursor-pointer"
              >
                <ExternalLink size={14} />
              </button>
              <button 
                onClick={() => setIsMinimized(true)}
                title="Minimizar para botão flutuante"
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <Minus size={14} />
              </button>
              <button 
                onClick={onClose}
                title="Fechar widget"
                className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* STATE 1: LOGIN SCREEN */}
          {!isLoggedIn ? (
            <div className="p-5 space-y-4 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/20 mb-2">
                  <Lock size={22} />
                </div>
                <h3 className="text-sm font-black text-white">Acesse sua Conta</h3>
                <p className="text-[10px] text-slate-400">
                  Faça login para desbloquear a calculadora e sincronizar com o Gerenciie Pro.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => setAuthTab('email')}
                  className={`py-1.5 rounded-lg font-bold transition-all ${
                    authTab === 'email' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  E-mail & Senha
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTab('token')}
                  className={`py-1.5 rounded-lg font-bold transition-all ${
                    authTab === 'token' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Token Rápido
                </button>
              </div>

              {authTab === 'email' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400">E-mail Cadastrado</label>
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                      <Mail size={14} className="text-slate-500" />
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="seuemail@exemplo.com"
                        className="bg-transparent text-xs font-bold text-white outline-none w-full"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400">Senha</label>
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                      <Lock size={14} className="text-slate-500" />
                      <input
                        type="password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-transparent text-xs font-bold text-white outline-none w-full"
                        required
                      />
                    </div>
                  </div>

                  {loginAlert && (
                    <div className="p-2 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-lg text-[10px] font-bold text-center">
                      {loginAlert}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <LogIn size={14} /> Entrar no Sistema
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthEmail(currentUser?.email || 'g2midiasoficial@gmail.com');
                      setIsLoggedIn(true);
                    }}
                    className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-[10.5px] font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Zap size={13} /> Entrar com 1-Clique (Conectar Conta)
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400">Token de Pareamento</label>
                    <textarea
                      value={authToken}
                      onChange={(e) => setAuthToken(e.target.value)}
                      placeholder="Cole a chave gerada no painel web..."
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-[10px] font-mono text-cyan-300 outline-none resize-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsLoggedIn(true)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30"
                  >
                    <Zap size={14} /> Validar Token & Acessar
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* STATE 2: FULL SYSTEM (UNLOCKED AFTER LOGIN) */
            <>
              {/* Navigation Bar inside Widget */}
              <div className="px-3 pt-2 bg-slate-900/60 flex items-center gap-1 border-b border-slate-800/80">
                <button
                  onClick={() => setActiveTab('calc')}
                  className={`flex-1 py-1.5 px-2 rounded-t-lg text-[10px] font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'calc'
                      ? 'bg-slate-950 text-white border-t border-x border-slate-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Calculator size={12} /> Calculadora
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`flex-1 py-1.5 px-2 rounded-t-lg text-[10px] font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'saved'
                      ? 'bg-slate-950 text-white border-t border-x border-slate-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bookmark size={12} /> Salvos ({savedProducts.length})
                </button>
                <button
                  onClick={() => setActiveTab('account')}
                  className={`flex-1 py-1.5 px-2 rounded-t-lg text-[10px] font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'account'
                      ? 'bg-slate-950 text-white border-t border-x border-slate-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <User size={12} /> Conta
                </button>
              </div>

              {/* TAB 1: CALCULATOR */}
              {activeTab === 'calc' && (
                <>
                  {/* Quick Platform Bar */}
                  <div className="p-2.5 bg-slate-900/30 border-b border-slate-800/60">
                    <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                      {(['dropshipping', 'shopee', 'mercadolivre', 'tiktok'] as const).map(ch => (
                        <button
                          key={ch}
                          onClick={() => handleSelectChannel(ch)}
                          className={`py-1.5 px-1 rounded-lg text-[9px] font-black tracking-tight transition-all cursor-pointer truncate ${
                            selectedChannel === ch 
                              ? 'bg-blue-600 text-white shadow-sm' 
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {ch === 'dropshipping' ? 'Drop' : ch === 'mercadolivre' ? 'M. Livre' : ch === 'tiktok' ? 'TikTok' : 'Shopee'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 space-y-3 max-h-[380px] overflow-y-auto custom-scrollbar">
                    {quickAutoGrabMsg && (
                      <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-[10px] font-bold flex items-center justify-between animate-in fade-in">
                        <span>{quickAutoGrabMsg}</span>
                        <Check size={14} />
                      </div>
                    )}

                    {/* Hero Main Price Card */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-700 text-white shadow-lg relative overflow-hidden">
                      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-blue-200 mb-1">
                        <span>{mode === 'manual' ? 'Preço Fixado' : 'Preço Recomendado'}</span>
                        <span className="px-2 py-0.5 bg-white/15 rounded-md backdrop-blur-sm">
                          ROI {roi.toFixed(0)}%
                        </span>
                      </div>

                      <div className="flex items-baseline gap-1 my-1">
                        <span className="text-base font-black opacity-80">R$</span>
                        <span className="text-2xl font-black tracking-tight">
                          {finalPrice.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-white/10 text-center">
                        <div className="bg-black/25 rounded-lg p-1">
                          <span className="block text-[7.5px] uppercase text-white/70 font-bold">Markup</span>
                          <span className="text-[10.5px] font-black text-white">{effectiveMarkup.toFixed(2)}x</span>
                        </div>
                        <div className="bg-black/25 rounded-lg p-1">
                          <span className="block text-[7.5px] uppercase text-white/70 font-bold">Margem</span>
                          <span className="text-[10.5px] font-black text-white">{marginPercent.toFixed(1)}%</span>
                        </div>
                        <div className="bg-black/25 rounded-lg p-1">
                          <span className="block text-[7.5px] uppercase text-white/70 font-bold">Lucro Líq.</span>
                          <span className="text-[10.5px] font-black text-emerald-300">R$ {profit.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* CPA & Fees Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2">
                        <span className="text-[8.5px] font-black text-slate-400 uppercase block">CPA Breakeven</span>
                        <span className="text-xs font-black text-white">R$ {cpaBreakeven.toFixed(2)}</span>
                        <span className="text-[7.5px] text-slate-500 block">Teto para não perder</span>
                      </div>
                      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2">
                        <span className="text-[8.5px] font-black text-slate-400 uppercase block">Total Taxas</span>
                        <span className="text-xs font-black text-rose-400">R$ {totalFees.toFixed(2)}</span>
                        <span className="text-[7.5px] text-slate-500 block">{finalPrice > 0 ? ((totalFees/finalPrice)*100).toFixed(1) : 0}% da venda</span>
                      </div>
                    </div>

                    {/* Inputs Form */}
                    <div className="space-y-2 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-2.5">
                      <div>
                        <label className="text-[8.5px] font-bold text-slate-400 block mb-1">Título do Produto</label>
                        <input 
                          type="text" 
                          value={productTitle}
                          onChange={(e) => setProductTitle(e.target.value)}
                          placeholder="Ex: Fone Bluetooth Pro"
                          className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold focus:border-blue-500 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 block mb-1">Custo Fornec. (R$)</label>
                          <input 
                            type="number" 
                            value={localCost}
                            onChange={(e) => setLocalCost(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs font-bold focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-400 block mb-1">Frete (R$)</label>
                          <input 
                            type="number" 
                            value={localFreight}
                            onChange={(e) => setLocalFreight(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs font-bold focus:border-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[8.5px] font-bold text-slate-400">Markup Alvo</label>
                          <span className="text-[10px] font-black text-blue-400">{localMarkup.toFixed(2)}x</span>
                        </div>
                        <input 
                          type="range"
                          min="1.1"
                          max="5.0"
                          step="0.1"
                          value={localMarkup}
                          onChange={(e) => setLocalMarkup(parseFloat(e.target.value))}
                          className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Taxa de Serviço SFP Block */}
                    <div className="space-y-2 bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-500/30 rounded-2xl p-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Truck size={14} className="text-blue-400" />
                          <span className="text-[9px] font-black uppercase text-blue-300">
                            Taxa de Serviço SFP (Frete Grátis)
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={localSfpEnabled}
                            onChange={(e) => setLocalSfpEnabled(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      {localSfpEnabled && (
                        <div className="space-y-2 pt-1 border-t border-blue-500/20 text-[9px]">
                          <div className="flex items-center justify-between bg-blue-900/30 p-1.5 rounded-lg border border-blue-500/20">
                            <span className="text-slate-300">Fórmula: (Preço Original - Desconto) × %</span>
                            <span className="text-cyan-300 font-bold">R$ {sfpFee.toFixed(2)}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-slate-400 block mb-0.5">Preço Original (R$)</label>
                              <input
                                type="number"
                                value={localOriginalPrice}
                                onChange={(e) => setLocalOriginalPrice(parseFloat(e.target.value) || 0)}
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-[11px] font-bold outline-none"
                              />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="text-slate-400">Desc. Vendedor</label>
                                <div className="flex gap-0.5 bg-slate-800 p-0.5 rounded">
                                  <button
                                    type="button"
                                    onClick={() => setLocalSellerDiscountType('currency')}
                                    className={`px-1 rounded text-[7.5px] font-bold ${localSellerDiscountType === 'currency' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                                  >
                                    R$
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setLocalSellerDiscountType('percent')}
                                    className={`px-1 rounded text-[7.5px] font-bold ${localSellerDiscountType === 'percent' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                                  >
                                    %
                                  </button>
                                </div>
                              </div>
                              <input
                                type="number"
                                value={localSellerDiscount}
                                onChange={(e) => setLocalSellerDiscount(parseFloat(e.target.value) || 0)}
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-[11px] font-bold outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-slate-400">Taxa SFP (%)</label>
                              <span className="text-blue-300 font-bold">{localSfpPercent}%</span>
                            </div>
                            <input
                              type="number"
                              value={localSfpPercent}
                              onChange={(e) => setLocalSfpPercent(parseFloat(e.target.value) || 0)}
                              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-[11px] font-bold outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-3 bg-slate-900 border-t border-slate-800 grid grid-cols-3 gap-1.5">
                    <button
                      onClick={handleSaveProduct}
                      title="Salvar produto no Gerenciie Pro"
                      className="py-2 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10.5px] font-black flex items-center justify-center gap-1 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      <Bookmark size={13} />
                      <span>Salvar</span>
                    </button>

                    <button
                      onClick={handleCopyPrice}
                      className="py-2 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10.5px] font-black flex items-center justify-center gap-1 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                    >
                      {copiedPrice ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedPrice ? 'Copiado' : 'Preço'}</span>
                    </button>

                    <button
                      onClick={handleSyncToMainApp}
                      title="Sincronizar com o Painel Principal"
                      className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10.5px] font-bold flex items-center justify-center gap-1 transition-all border border-slate-700 cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      <span>Sync App</span>
                    </button>
                  </div>
                </>
              )}

              {/* TAB 2: SAVED PRODUCTS */}
              {activeTab === 'saved' && (
                <div className="p-3.5 space-y-3 max-h-[440px] overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">Produtos Salvos</span>
                    {savedProducts.length > 0 && (
                      <button 
                        onClick={() => {
                          setSavedProducts([]);
                          localStorage.removeItem('gerenciie_widget_saved_prods');
                        }}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        Limpar
                      </button>
                    )}
                  </div>

                  {savedProducts.length === 0 ? (
                    <div className="text-center py-10 space-y-2 text-slate-500">
                      <Bookmark size={24} className="mx-auto text-slate-600" />
                      <p className="text-xs font-bold text-slate-400">Nenhum produto salvo ainda</p>
                      <span className="text-[10px]">Clique em "Salvar" na calculadora para guardar itens aqui.</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {savedProducts.map(p => (
                        <div key={p.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-white truncate max-w-[180px]">{p.name}</span>
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded">
                              {p.platform}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 bg-black/30 p-1.5 rounded-lg text-[9.5px]">
                            <div>Custo: <strong>R$ {p.cost.toFixed(2)}</strong></div>
                            <div className="text-cyan-300">Venda: <strong>R$ {p.sellingPrice.toFixed(2)}</strong></div>
                            <div className="text-emerald-400">Lucro: <strong>R$ {p.profit.toFixed(2)}</strong></div>
                          </div>
                          <div className="flex justify-end gap-1.5 pt-1">
                            <button
                              onClick={() => handleLoadSavedProduct(p)}
                              className="px-2 py-1 bg-blue-600 text-white rounded-md text-[9px] font-bold"
                            >
                              Carregar
                            </button>
                            <button
                              onClick={() => handleDeleteSaved(p.id)}
                              className="p-1 text-slate-400 hover:text-rose-400"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ACCOUNT / LOGIN */}
              {activeTab === 'account' && (
                <div className="p-4 space-y-4 max-h-[440px] overflow-y-auto custom-scrollbar">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-black">
                        {authEmail ? authEmail.substring(0, 2).toUpperCase() : 'GP'}
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-white">
                          {currentUser?.displayName || currentUser?.name || authEmail.split('@')[0]}
                        </h5>
                        <p className="text-[10px] text-slate-400">{authEmail}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Status do Projeto:</span>
                      <span className="text-emerald-400 font-bold">● Sincronizado</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <LogOut size={14} /> Sair da Conta (Bloquear Extensão)
                  </button>

                  <div className="p-3 bg-blue-950/30 border border-blue-500/20 rounded-2xl space-y-1.5 text-slate-300 text-[11px]">
                    <span className="font-black text-white block">⚡ Conexão da Extensão Chrome</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Ao baixar o pacote .ZIP, você pode instalá-lo no Chrome para abrir esta mesma tela em qualquer site com cálculo da Taxa SFP.
                    </p>
                    <button
                      onClick={onOpenFullModal}
                      className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-[10.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                    >
                      <ExternalLink size={12} /> Ver Central da Extensão (.ZIP)
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
