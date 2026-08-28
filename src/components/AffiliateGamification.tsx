import React, { useState, useMemo, useRef } from 'react';
import { 
  Trophy, Award, Gift, Crown, Medal, Calculator, Flame, 
  Sparkles, DollarSign, CheckCircle2, Plus, Trash2, Users, 
  Percent, ChevronRight, Download, Check, AlertCircle, TrendingUp,
  Package, ArrowRight, ShieldCheck, Zap, Coins, Image as ImageIcon,
  Upload, Link2, RefreshCw, Star, Laptop, Smartphone, Watch, Headphones,
  Plane, Gamepad2
} from 'lucide-react';
import { PricingData, CalculationResult, CurrencyCode } from '../../types.ts';
import { formatCurrency } from '../../utils/calculations.ts';

export interface AffiliateTier {
  id: string;
  name: string;
  minSalesUnits: number;
  rewardTitle: string;
  rewardCost: number; // Custo do prêmio físico/experiência em R$
  cashBonus: number; // Bônus direto em dinheiro R$
  colorTheme: 'amber' | 'slate' | 'yellow' | 'cyan' | 'purple' | 'emerald' | 'rose';
  icon: 'bronze' | 'silver' | 'gold' | 'diamond' | 'crown' | 'custom';
  imageUrl?: string; // Imagem do prêmio/ícone
}

export interface AffiliateMember {
  id: string;
  name: string;
  salesUnits: number;
  pixKey?: string;
  paid: boolean;
}

// Catálogo de imagens pré-configuradas em alta qualidade
export const PRESET_REWARD_IMAGES = [
  {
    name: 'Troféu Ouro Campeão',
    category: 'Troféu',
    url: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=300&auto=format&fit=crop&q=80'
  },
  {
    name: 'Headset Pro Bluetooth',
    category: 'Áudio',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80'
  },
  {
    name: 'Apple Watch Ultra',
    category: 'Smartwatch',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80'
  },
  {
    name: 'iPhone 16 Pro Titanium',
    category: 'Smartphone',
    url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=300&auto=format&fit=crop&q=80'
  },
  {
    name: 'MacBook Air / Pro M3',
    category: 'Computador',
    url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80'
  },
  {
    name: 'PlayStation 5 Console',
    category: 'Games',
    url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300&auto=format&fit=crop&q=80'
  },
  {
    name: 'Viagem Resort / Férias VIP',
    category: 'Experiência',
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=300&auto=format&fit=crop&q=80'
  },
  {
    name: 'Relógio de Luxo Ouro',
    category: 'Luxo',
    url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=80'
  },
  {
    name: 'Kit Premium Boas-Vindas',
    category: 'Kit',
    url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&auto=format&fit=crop&q=80'
  }
];

const DEFAULT_TIERS: AffiliateTier[] = [
  {
    id: 'tier-1',
    name: 'Nível Bronze',
    minSalesUnits: 50,
    rewardTitle: 'Kit Boas-Vindas Exclusivo + Troféu',
    rewardCost: 150,
    cashBonus: 200,
    colorTheme: 'amber',
    icon: 'bronze',
    imageUrl: PRESET_REWARD_IMAGES[0].url
  },
  {
    id: 'tier-2',
    name: 'Nível Prata',
    minSalesUnits: 150,
    rewardTitle: 'Headset Gamer / Fone Bluetooth Premium',
    rewardCost: 400,
    cashBonus: 600,
    colorTheme: 'slate',
    icon: 'silver',
    imageUrl: PRESET_REWARD_IMAGES[1].url
  },
  {
    id: 'tier-3',
    name: 'Nível Ouro (Elite)',
    minSalesUnits: 350,
    rewardTitle: 'Apple Watch / Smartwatch Topo de Linha',
    rewardCost: 1800,
    cashBonus: 1500,
    colorTheme: 'yellow',
    icon: 'gold',
    imageUrl: PRESET_REWARD_IMAGES[2].url
  },
  {
    id: 'tier-4',
    name: 'Nível Diamante (Black)',
    minSalesUnits: 800,
    rewardTitle: 'iPhone 16 Pro + Final de Semana Resort',
    rewardCost: 6500,
    cashBonus: 4000,
    colorTheme: 'cyan',
    icon: 'diamond',
    imageUrl: PRESET_REWARD_IMAGES[3].url
  }
];

const INITIAL_AFFILIATES: AffiliateMember[] = [
  { id: '1', name: 'Lucas Silva (Top Afiliado)', salesUnits: 180, pixKey: 'lucas.afiliado@gmail.com', paid: false },
  { id: '2', name: 'Mariana Costa', salesUnits: 75, pixKey: '11988776655', paid: false },
  { id: '3', name: 'Pedro Henrique', salesUnits: 420, pixKey: 'pedro.ads@hotmail.com', paid: false },
  { id: '4', name: 'Juliana Mendes', salesUnits: 35, pixKey: 'juliana.pix@banco.com', paid: false }
];

interface AffiliateGamificationProps {
  pricingData: PricingData;
  currentResult: CalculationResult;
}

export const AffiliateGamification: React.FC<AffiliateGamificationProps> = ({
  pricingData,
  currentResult
}) => {
  const [tiers, setTiers] = useState<AffiliateTier[]>(DEFAULT_TIERS);
  const [affiliates, setAffiliates] = useState<AffiliateMember[]>(INITIAL_AFFILIATES);
  
  // Simulador rápido individual
  const [singleSalesInput, setSingleSalesInput] = useState<number>(150);
  const [customCommissionRate, setCustomCommissionRate] = useState<number>(pricingData.affiliateCommissionPercent || 10);
  const [showTierEditor, setShowTierEditor] = useState<boolean>(false);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);

  // Novos afiliados
  const [newAffiliateName, setNewAffiliateName] = useState('');
  const [newAffiliateSales, setNewAffiliateSales] = useState<number>(50);
  const [newAffiliatePix, setNewAffiliatePix] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadTierId, setActiveUploadTierId] = useState<string | null>(null);

  const currency = pricingData.currency;
  const unitSellingPrice = currentResult.finalPrice > 0 ? currentResult.finalPrice : 100;

  // Encontra o tier conquistado com base nas vendas
  const getTierForSales = (units: number): AffiliateTier | null => {
    const sorted = [...tiers].sort((a, b) => b.minSalesUnits - a.minSalesUnits);
    return sorted.find(t => units >= t.minSalesUnits) || null;
  };

  const getNextTier = (units: number): { nextTier: AffiliateTier | null; missingUnits: number } => {
    const sorted = [...tiers].sort((a, b) => a.minSalesUnits - b.minSalesUnits);
    const next = sorted.find(t => units < t.minSalesUnits);
    if (!next) return { nextTier: null, missingUnits: 0 };
    return { nextTier: next, missingUnits: next.minSalesUnits - units };
  };

  // Cálculo para o simulador individual
  const singleSimulation = useMemo(() => {
    const units = singleSalesInput || 0;
    const revenue = units * unitSellingPrice;
    const baseCommission = revenue * ((customCommissionRate || 0) / 100);
    const currentTier = getTierForSales(units);
    const rewardCost = currentTier ? currentTier.rewardCost : 0;
    const cashBonus = currentTier ? currentTier.cashBonus : 0;
    const totalPrizes = rewardCost + cashBonus;
    const totalToPay = baseCommission + totalPrizes;
    
    // Custos da loja
    const cmvTotal = currentResult.unitCMV * units;
    const opCostsTotal = (pricingData.packagingCost + pricingData.shippingLabel) * units;
    
    // Taxas variáveis exceto afiliados
    const otherFeesUnit = Math.max(0, currentResult.totalFeesOnly - (currentResult.finalPrice * ((pricingData.affiliateCommissionPercent || 0) / 100)));
    const feesTotal = otherFeesUnit * units;

    const totalShopCosts = cmvTotal + opCostsTotal + feesTotal + totalToPay;
    const shopNetProfit = revenue - totalShopCosts;
    const shopMargin = revenue > 0 ? (shopNetProfit / revenue) * 100 : 0;
    const effectiveAffiliatePayoutRate = revenue > 0 ? (totalToPay / revenue) * 100 : 0;
    const affiliateROI = totalToPay > 0 ? (shopNetProfit / totalToPay) : 0;

    const { nextTier, missingUnits } = getNextTier(units);

    return {
      units,
      revenue,
      baseCommission,
      currentTier,
      rewardCost,
      cashBonus,
      totalPrizes,
      totalToPay,
      shopNetProfit,
      shopMargin,
      effectiveAffiliatePayoutRate,
      affiliateROI,
      nextTier,
      missingUnits
    };
  }, [singleSalesInput, unitSellingPrice, customCommissionRate, tiers, currentResult, pricingData]);

  // Consolidado de todos os afiliados na lista
  const consolidatedTeam = useMemo(() => {
    let totalUnits = 0;
    let totalRevenue = 0;
    let totalBaseCommission = 0;
    let totalPrizesCost = 0;
    let totalCashBonus = 0;
    let totalToPayAll = 0;
    let totalPaidSoFar = 0;
    let totalPendingPay = 0;

    const memberDetails = affiliates.map(member => {
      const rev = member.salesUnits * unitSellingPrice;
      const baseComm = rev * ((customCommissionRate || 0) / 100);
      const tier = getTierForSales(member.salesUnits);
      const prize = tier ? tier.rewardCost : 0;
      const bonus = tier ? tier.cashBonus : 0;
      const totalMemberPay = baseComm + prize + bonus;

      totalUnits += member.salesUnits;
      totalRevenue += rev;
      totalBaseCommission += baseComm;
      totalPrizesCost += prize;
      totalCashBonus += bonus;
      totalToPayAll += totalMemberPay;

      if (member.paid) {
        totalPaidSoFar += totalMemberPay;
      } else {
        totalPendingPay += totalMemberPay;
      }

      return {
        ...member,
        revenue: rev,
        baseCommission: baseComm,
        tier,
        prizeCost: prize,
        cashBonus: bonus,
        totalPay: totalMemberPay
      };
    });

    const cmvTotal = currentResult.unitCMV * totalUnits;
    const opCostsTotal = (pricingData.packagingCost + pricingData.shippingLabel) * totalUnits;
    const otherFeesUnit = Math.max(0, currentResult.totalFeesOnly - (currentResult.finalPrice * ((pricingData.affiliateCommissionPercent || 0) / 100)));
    const feesTotal = otherFeesUnit * totalUnits;

    const shopNetProfit = totalRevenue - (cmvTotal + opCostsTotal + feesTotal + totalToPayAll);
    const shopMargin = totalRevenue > 0 ? (shopNetProfit / totalRevenue) * 100 : 0;

    return {
      memberDetails,
      totalUnits,
      totalRevenue,
      totalBaseCommission,
      totalPrizesCost,
      totalCashBonus,
      totalToPayAll,
      totalPaidSoFar,
      totalPendingPay,
      shopNetProfit,
      shopMargin
    };
  }, [affiliates, unitSellingPrice, customCommissionRate, tiers, currentResult, pricingData]);

  const handleAddAffiliate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAffiliateName.trim()) return;
    const newMember: AffiliateMember = {
      id: Date.now().toString(),
      name: newAffiliateName.trim(),
      salesUnits: Number(newAffiliateSales) || 0,
      pixKey: newAffiliatePix.trim() || undefined,
      paid: false
    };
    setAffiliates([...affiliates, newMember]);
    setNewAffiliateName('');
    setNewAffiliateSales(50);
    setNewAffiliatePix('');
  };

  const handleTogglePaid = (id: string) => {
    setAffiliates(affiliates.map(a => a.id === id ? { ...a, paid: !a.paid } : a));
  };

  const handlePayAll = () => {
    setAffiliates(affiliates.map(a => ({ ...a, paid: true })));
  };

  const handleResetPayments = () => {
    setAffiliates(affiliates.map(a => ({ ...a, paid: false })));
  };

  const handleDeleteAffiliate = (id: string) => {
    setAffiliates(affiliates.filter(a => a.id !== id));
  };

  const handleAddTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newUnits = (lastTier?.minSalesUnits || 500) + 250;
    const newTier: AffiliateTier = {
      id: `tier-${Date.now()}`,
      name: `Nível Premium VIP`,
      minSalesUnits: newUnits,
      rewardTitle: 'PlayStation 5 / Setup Gamer Completo',
      rewardCost: 4500,
      cashBonus: 3000,
      colorTheme: 'purple',
      icon: 'crown',
      imageUrl: PRESET_REWARD_IMAGES[5].url
    };
    setTiers([...tiers, newTier]);
    setEditingTierId(newTier.id);
  };

  const handleUpdateTier = (id: string, updates: Partial<AffiliateTier>) => {
    setTiers(tiers.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleDeleteTier = (id: string) => {
    if (tiers.length <= 1) return;
    setTiers(tiers.filter(t => t.id !== id));
  };

  // Upload local de imagem via FileReader
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUploadTierId) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        handleUpdateTier(activeUploadTierId, { imageUrl: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUploadForTier = (tierId: string) => {
    setActiveUploadTierId(tierId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const renderTierIconOrImage = (tier: AffiliateTier, size: number = 24, className: string = '') => {
    if (tier.imageUrl) {
      return (
        <img 
          src={tier.imageUrl} 
          alt={tier.rewardTitle || tier.name} 
          className={`rounded-xl object-cover shadow-sm ${className}`}
          style={{ width: `${size}px`, height: `${size}px` }}
          referrerPolicy="no-referrer"
          onError={(e) => {
            // fallback se link quebrar
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }

    switch (tier.icon) {
      case 'bronze': return <Medal size={size} className="text-amber-600" />;
      case 'silver': return <Medal size={size} className="text-slate-400" />;
      case 'gold': return <Trophy size={size} className="text-yellow-500" />;
      case 'diamond': return <Sparkles size={size} className="text-cyan-500" />;
      case 'crown': return <Crown size={size} className="text-purple-500" />;
      default: return <Award size={size} className="text-blue-500" />;
    }
  };

  const getTierThemeClasses = (color: AffiliateTier['colorTheme']) => {
    switch (color) {
      case 'amber': return 'border-amber-200 bg-gradient-to-br from-amber-50/80 to-orange-50/40 text-amber-950';
      case 'slate': return 'border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/70 text-slate-800';
      case 'yellow': return 'border-yellow-200 bg-gradient-to-br from-yellow-50/90 to-amber-50/50 text-yellow-950';
      case 'cyan': return 'border-cyan-200 bg-gradient-to-br from-cyan-50/80 to-blue-50/40 text-cyan-950';
      case 'purple': return 'border-purple-200 bg-gradient-to-br from-purple-50/80 to-pink-50/40 text-purple-950';
      case 'emerald': return 'border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-teal-50/40 text-emerald-950';
      case 'rose': return 'border-rose-200 bg-gradient-to-br from-rose-50/80 to-pink-50/40 text-rose-950';
      default: return 'border-slate-200 bg-slate-50 text-slate-900';
    }
  };

  return (
    <div className="space-y-10">
      {/* Input invisível para upload de imagem */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageFileUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* HEADER DA GAMIFICAÇÃO */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white rounded-[40px] p-8 md:p-12 shadow-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 opacity-10 pointer-events-none">
          <Trophy size={320} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                <Trophy size={22} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                Programa Premium de Gamificação
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-black italic tracking-tight">
              Metas, Premiações & Fechamento Financeiro
            </h3>
            <p className="text-slate-400 text-xs md:text-sm font-medium mt-2 max-w-2xl">
              Crie prêmios premium com fotos personalizadas (iPhone, Viagens, Smartwatch, MacBooks e Troféus), 
              calcule o valor gerado e feche comissões e bônus com um clique.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => {
                setShowTierEditor(!showTierEditor);
                setEditingTierId(null);
              }}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border flex items-center gap-2 ${
                showTierEditor
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
              }`}
            >
              <Award size={16} className="text-yellow-400" />
              {showTierEditor ? 'Concluir Edição de Metas' : 'Gerenciar Níveis & Imagens'}
            </button>
          </div>
        </div>
      </div>

      {/* PAINEL DE NÍVEIS & METAS (TIERS) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
          <div>
            <h4 className="text-lg font-black text-black tracking-tight flex items-center gap-2">
              <Flame size={20} className="text-orange-500" /> Níveis de Metas & Recompensas Premium
            </h4>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Personalize imagens dos prêmios, valores, bônus em dinheiro e temas visuais
            </p>
          </div>
          {showTierEditor && (
            <button
              onClick={handleAddTier}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase rounded-2xl flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Plus size={16} /> Criar Novo Nível Premium
            </button>
          )}
        </div>

        {/* LISTA DE CARDS DE TIERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier, idx) => {
            const minRevenue = tier.minSalesUnits * unitSellingPrice;
            const totalRewardVal = tier.rewardCost + tier.cashBonus;
            const isEditingThis = showTierEditor && editingTierId === tier.id;

            return (
              <div 
                key={tier.id}
                className={`rounded-[32px] p-6 border transition-all duration-300 relative group flex flex-col justify-between shadow-sm hover:shadow-md ${getTierThemeClasses(tier.colorTheme)}`}
              >
                <div>
                  {/* Topo do Card com Ícone/Foto do Prêmio */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-1 flex items-center justify-center overflow-hidden">
                        {tier.imageUrl ? (
                          <img 
                            src={tier.imageUrl} 
                            alt={tier.rewardTitle}
                            className="w-full h-full object-cover rounded-xl"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          renderTierIconOrImage(tier, 30)
                        )}
                      </div>
                      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-black text-white text-[8px] font-black rounded-md shadow">
                        0{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {showTierEditor && (
                        <button
                          onClick={() => setEditingTierId(isEditingThis ? null : tier.id)}
                          className="px-2.5 py-1 bg-white/80 hover:bg-white text-slate-800 rounded-xl text-[9px] font-black uppercase shadow-xs border border-slate-200"
                        >
                          {isEditingThis ? 'Salvar' : 'Editar Foto/Dados'}
                        </button>
                      )}
                      <span className="text-[9px] font-black uppercase px-2.5 py-1 bg-black/5 rounded-full">
                        Tier 0{idx + 1}
                      </span>
                    </div>
                  </div>

                  {/* FORMULÁRIO DE EDIÇÃO DO TIER */}
                  {isEditingThis ? (
                    <div className="space-y-3 mb-4 bg-white/90 p-4 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in">
                      <div>
                        <label className="text-[8px] font-black uppercase text-slate-600 block mb-1">Nome do Nível</label>
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => handleUpdateTier(tier.id, { name: e.target.value })}
                          className="w-full text-xs font-black p-2 bg-slate-50 rounded-xl border border-slate-200"
                          placeholder="Ex: Nível Diamante"
                        />
                      </div>

                      {/* CONFIGURADOR DA FOTO/ÍCONE DO PRÊMIO */}
                      <div className="space-y-2 pt-1 border-t border-slate-100">
                        <div className="flex justify-between items-center">
                          <label className="text-[8px] font-black uppercase text-slate-600 block">
                            Imagem / Ícone do Prêmio
                          </label>
                          <button
                            type="button"
                            onClick={() => triggerUploadForTier(tier.id)}
                            className="text-[9px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <Upload size={11} /> Carregar Imagem
                          </button>
                        </div>

                        {/* Presets Rápidos de Imagens */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                          {PRESET_REWARD_IMAGES.map((preset, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => handleUpdateTier(tier.id, { imageUrl: preset.url })}
                              title={preset.name}
                              className={`shrink-0 w-8 h-8 rounded-lg border overflow-hidden transition-all ${
                                tier.imageUrl === preset.url ? 'ring-2 ring-blue-600 border-blue-600 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                              }`}
                            >
                              <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-1.5 items-center">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={tier.imageUrl || ''}
                              onChange={(e) => handleUpdateTier(tier.id, { imageUrl: e.target.value })}
                              className="w-full text-[10px] font-bold p-1.5 pl-6 bg-slate-50 rounded-lg border border-slate-200"
                              placeholder="Ou cole a URL da imagem (https://...)"
                            />
                            <Link2 size={11} className="absolute left-2 top-2.5 text-slate-400" />
                          </div>
                          {tier.imageUrl && (
                            <button
                              type="button"
                              onClick={() => handleUpdateTier(tier.id, { imageUrl: undefined })}
                              className="p-1.5 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black"
                              title="Remover Imagem"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Escolha do Tema de Cores */}
                      <div>
                        <label className="text-[8px] font-black uppercase text-slate-600 block mb-1">Tema Visual</label>
                        <div className="grid grid-cols-5 gap-1">
                          {(['amber', 'slate', 'yellow', 'cyan', 'purple', 'emerald', 'rose'] as const).slice(0, 5).map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => handleUpdateTier(tier.id, { colorTheme: color })}
                              className={`py-1 rounded-md text-[8px] font-black uppercase transition-all ${
                                tier.colorTheme === color ? 'bg-black text-white' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[8px] font-black uppercase text-slate-600 block mb-1">Meta Vendas (Unidades)</label>
                        <input
                          type="number"
                          value={tier.minSalesUnits}
                          onChange={(e) => handleUpdateTier(tier.id, { minSalesUnits: Number(e.target.value) || 0 })}
                          className="w-full text-xs font-black p-2 bg-slate-50 rounded-xl border border-slate-200"
                        />
                      </div>

                      <div>
                        <label className="text-[8px] font-black uppercase text-slate-600 block mb-1">Título do Prêmio</label>
                        <input
                          type="text"
                          value={tier.rewardTitle}
                          onChange={(e) => handleUpdateTier(tier.id, { rewardTitle: e.target.value })}
                          className="w-full text-xs font-black p-2 bg-slate-50 rounded-xl border border-slate-200"
                          placeholder="Ex: iPhone 16 Pro"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8px] font-black uppercase text-slate-600 block mb-1">Custo Prêmio (R$)</label>
                          <input
                            type="number"
                            value={tier.rewardCost}
                            onChange={(e) => handleUpdateTier(tier.id, { rewardCost: Number(e.target.value) || 0 })}
                            className="w-full text-xs font-black p-2 bg-slate-50 rounded-xl border border-slate-200"
                          />
                        </div>
                        <div>
                          <label className="text-[8px] font-black uppercase text-slate-600 block mb-1">Bônus PIX (R$)</label>
                          <input
                            type="number"
                            value={tier.cashBonus}
                            onChange={(e) => handleUpdateTier(tier.id, { cashBonus: Number(e.target.value) || 0 })}
                            className="w-full text-xs font-black p-2 bg-slate-50 rounded-xl border border-slate-200"
                          />
                        </div>
                      </div>

                      {tiers.length > 1 && (
                        <button
                          onClick={() => handleDeleteTier(tier.id)}
                          className="w-full py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-black rounded-xl transition-colors flex items-center justify-center gap-1 mt-2"
                        >
                          <Trash2 size={13} /> Excluir este Nível
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <h5 className="text-base font-black tracking-tight mb-1">{tier.name}</h5>
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/10 rounded-xl text-[10px] font-black mb-3">
                        Meta: {tier.minSalesUnits} vendas ({formatCurrency(minRevenue, currency)})
                      </div>

                      {/* Showcase da Recompensa */}
                      <div className="bg-white/85 backdrop-blur-sm rounded-2xl p-3.5 border border-black/5 space-y-2.5 mb-4 shadow-xs">
                        <div className="flex items-center gap-3">
                          {tier.imageUrl ? (
                            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-white">
                              <img src={tier.imageUrl} alt={tier.rewardTitle} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <Gift size={20} />
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Prêmio Conquistado</p>
                            <p className="text-xs font-black text-slate-900 leading-tight truncate">{tier.rewardTitle}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                            <span>Valor do Prêmio:</span>
                            <span className="font-black text-black">{formatCurrency(tier.rewardCost, currency)}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                            <span>Bônus PIX em Conta:</span>
                            <span className="font-black text-emerald-700">+{formatCurrency(tier.cashBonus, currency)}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-3 border-t border-black/5 flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">Total Premiação:</span>
                  <span className="text-sm font-black text-black">{formatCurrency(totalRewardVal, currency)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CALCULADORA DE METAS & FECHAMENTO DO AFILIADO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SIMULADOR INDIVIDUAL */}
        <div className="lg:col-span-5 bg-white rounded-[36px] p-8 border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calculator size={20} className="text-blue-600" />
                <h4 className="text-base font-black text-black tracking-tight">
                  Simulador de Metas por Afiliado
                </h4>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-1 bg-blue-50 text-blue-700 rounded-lg">
                Tempo Real
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black uppercase text-slate-700">
                    Vendas Geradas pelo Afiliado
                  </label>
                  <span className="text-xs font-black text-blue-600">
                    {singleSalesInput} unidades
                  </span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="1200"
                  step="5"
                  value={singleSalesInput}
                  onChange={(e) => setSingleSalesInput(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[8px] font-bold text-slate-400 mt-1">
                  <span>0 unid</span>
                  <span>300 unid</span>
                  <span>600 unid</span>
                  <span>1000+ unid</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <label className="text-[8px] font-black uppercase text-slate-500 block mb-1">
                    Preço Unitário de Venda
                  </label>
                  <p className="text-sm font-black text-black">
                    {formatCurrency(unitSellingPrice, currency)}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <label className="text-[8px] font-black uppercase text-slate-500 block mb-1">
                    Comissão Base (%)
                  </label>
                  <input
                    type="number"
                    value={customCommissionRate}
                    onChange={(e) => setCustomCommissionRate(Number(e.target.value) || 0)}
                    className="text-sm font-black text-black bg-transparent w-full border-none p-0 focus:ring-0"
                  />
                </div>
              </div>

              {/* Status do Nível Desbloqueado com Foto */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                    Status de Gamificação
                  </span>
                  {singleSimulation.currentTier && (
                    <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 rounded-lg text-[9px] font-black">
                      {singleSimulation.currentTier.name} Desbloqueado!
                    </span>
                  )}
                </div>

                {singleSimulation.currentTier ? (
                  <div className="flex items-center gap-3">
                    {singleSimulation.currentTier.imageUrl ? (
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/20 shrink-0 bg-white/10">
                        <img 
                          src={singleSimulation.currentTier.imageUrl} 
                          alt={singleSimulation.currentTier.rewardTitle}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-yellow-400/20 text-yellow-300 flex items-center justify-center shrink-0 border border-yellow-400/30">
                        <Gift size={24} />
                      </div>
                    )}
                    <div className="space-y-0.5 overflow-hidden">
                      <p className="text-sm font-black text-white truncate">
                        {singleSimulation.currentTier.rewardTitle}
                      </p>
                      <p className="text-[10px] text-slate-300 font-bold">
                        Prêmio de {formatCurrency(singleSimulation.rewardCost, currency)} + Bônus PIX de {formatCurrency(singleSimulation.cashBonus, currency)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 font-bold italic">
                    Ainda não atingiu o primeiro nível ({tiers[0]?.minSalesUnits} vendas).
                  </p>
                )}

                {singleSimulation.nextTier && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center text-[9px] font-bold text-slate-300">
                    <span>Próximo nível ({singleSimulation.nextTier.name}):</span>
                    <span className="text-blue-300 font-black">Faltam {singleSimulation.missingUnits} vendas</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TOTAL DO SIMULADOR INDIVIDUAL */}
          <div className="p-5 rounded-3xl bg-blue-50/70 border border-blue-100 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>(+) Faturamento Gerado pelo Afiliado:</span>
              <span className="text-black font-black">{formatCurrency(singleSimulation.revenue, currency)}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>(-) Comissão Base ({customCommissionRate}%):</span>
              <span className="text-blue-700 font-black">{formatCurrency(singleSimulation.baseCommission, currency)}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>(-) Prêmio & Bônus de Gamificação:</span>
              <span className="text-purple-700 font-black">{formatCurrency(singleSimulation.totalPrizes, currency)}</span>
            </div>

            <div className="pt-3 border-t border-blue-200 flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-blue-900">Total a Pagar ao Afiliado:</p>
                <p className="text-xs font-bold text-slate-600">
                  {singleSimulation.effectiveAffiliatePayoutRate.toFixed(1)}% do faturamento gerado
                </p>
              </div>
              <span className="text-xl font-black text-blue-800">
                {formatCurrency(singleSimulation.totalToPay, currency)}
              </span>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-emerald-100 flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black uppercase text-emerald-700">Lucro Líquido para a Loja:</p>
                <p className="text-[9px] font-bold text-slate-500">Margem líquida de {singleSimulation.shopMargin.toFixed(1)}%</p>
              </div>
              <span className={`text-base font-black ${singleSimulation.shopNetProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(singleSimulation.shopNetProfit, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* GESTÃO DE EQUIPE DE AFILIADOS & PAGAMENTO EM LOTE */}
        <div className="lg:col-span-7 bg-white rounded-[36px] p-8 border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-blue-600" />
                  <h4 className="text-base font-black text-black tracking-tight">
                    Fechamento de Afiliados do Mês
                  </h4>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                  Calcule o extrato de cada afiliado e marque pagamentos
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePayAll}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                  title="Marcar todos como pagos"
                >
                  <CheckCircle2 size={14} /> Pagar Tudo
                </button>
                <button
                  onClick={handleResetPayments}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                  title="Desmarcar pagamentos"
                >
                  Resetar
                </button>
              </div>
            </div>

            {/* TABELA DE AFILIADOS */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-[9px] font-black uppercase tracking-wider text-slate-400">Afiliado / Chave PIX</th>
                    <th className="pb-3 text-[9px] font-black uppercase tracking-wider text-slate-400 text-center">Vendas</th>
                    <th className="pb-3 text-[9px] font-black uppercase tracking-wider text-slate-400 text-center">Nível / Prêmio</th>
                    <th className="pb-3 text-[9px] font-black uppercase tracking-wider text-slate-400 text-right">Comissão + Bônus</th>
                    <th className="pb-3 text-[9px] font-black uppercase tracking-wider text-slate-400 text-right">Total a Pagar</th>
                    <th className="pb-3 text-[9px] font-black uppercase tracking-wider text-slate-400 text-center">Status</th>
                    <th className="pb-3 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {consolidatedTeam.memberDetails.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="py-3.5">
                        <p className="text-xs font-black text-black">{member.name}</p>
                        {member.pixKey && (
                          <p className="text-[9px] font-semibold text-slate-400 flex items-center gap-1">
                            <span>PIX:</span> {member.pixKey}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 text-center">
                        <span className="text-xs font-black text-slate-800">{member.salesUnits}</span>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">unid</p>
                      </td>
                      <td className="py-3.5 text-center">
                        {member.tier ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl text-[9px] font-black bg-yellow-50 text-yellow-900 border border-yellow-200">
                            {member.tier.imageUrl ? (
                              <img src={member.tier.imageUrl} alt={member.tier.name} className="w-4 h-4 rounded-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              renderTierIconOrImage(member.tier, 12)
                            )}
                            {member.tier.name.replace('Nível ', '')}
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-400">Sem Nível</span>
                        )}
                      </td>
                      <td className="py-3.5 text-right">
                        <p className="text-xs font-bold text-slate-700">
                          {formatCurrency(member.baseCommission, currency)}
                        </p>
                        {(member.prizeCost + member.cashBonus) > 0 && (
                          <p className="text-[9px] font-black text-purple-600">
                            +{formatCurrency(member.prizeCost + member.cashBonus, currency)} prêmio
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="text-xs font-black text-blue-700">
                          {formatCurrency(member.totalPay, currency)}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => handleTogglePaid(member.id)}
                          className={`px-2.5 py-1 rounded-xl text-[9px] font-black transition-all flex items-center gap-1 mx-auto ${
                            member.paid 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200'
                          }`}
                        >
                          {member.paid ? (
                            <>
                              <Check size={11} /> Pago
                            </>
                          ) : (
                            'Pendente'
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteAffiliate(member.id)}
                          className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                          title="Remover Afiliado"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* FORMULÁRIO RÁPIDO PARA ADICIONAR AFILIADO */}
            <form onSubmit={handleAddAffiliate} className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
              <input
                type="text"
                placeholder="Nome do Afiliado"
                value={newAffiliateName}
                onChange={(e) => setNewAffiliateName(e.target.value)}
                className="text-xs font-bold p-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-blue-400"
              />
              <input
                type="number"
                placeholder="Vendas (ex: 80)"
                value={newAffiliateSales || ''}
                onChange={(e) => setNewAffiliateSales(Number(e.target.value) || 0)}
                className="text-xs font-bold p-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-blue-400"
              />
              <input
                type="text"
                placeholder="Chave PIX (opcional)"
                value={newAffiliatePix}
                onChange={(e) => setNewAffiliatePix(e.target.value)}
                className="text-xs font-bold p-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-blue-400"
              />
              <button
                type="submit"
                className="py-2 px-3 bg-black hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
              >
                <Plus size={14} /> Adicionar
              </button>
            </form>
          </div>

          {/* RESUMO CONSOLIDADO DO TIME */}
          <div className="pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/80 p-5 rounded-3xl">
            <div>
              <p className="text-[8px] font-black uppercase tracking-wider text-slate-500">Faturamento da Equipe</p>
              <h5 className="text-base font-black text-black">{formatCurrency(consolidatedTeam.totalRevenue, currency)}</h5>
              <p className="text-[8px] text-slate-400 font-bold">{consolidatedTeam.totalUnits} vendas no total</p>
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-wider text-slate-500">Total em Prêmios & Bônus</p>
              <h5 className="text-base font-black text-purple-700">{formatCurrency(consolidatedTeam.totalPrizesCost + consolidatedTeam.totalCashBonus, currency)}</h5>
              <p className="text-[8px] text-slate-400 font-bold">Gamificação ativa</p>
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-wider text-slate-500">Total a Pagar (Geral)</p>
              <h5 className="text-base font-black text-blue-700">{formatCurrency(consolidatedTeam.totalToPayAll, currency)}</h5>
              <p className="text-[8px] text-amber-600 font-black">
                {formatCurrency(consolidatedTeam.totalPendingPay, currency)} pendente
              </p>
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-wider text-emerald-600">Lucro Líquido da Loja</p>
              <h5 className="text-base font-black text-emerald-600">{formatCurrency(consolidatedTeam.shopNetProfit, currency)}</h5>
              <p className="text-[8px] text-emerald-700 font-bold">{consolidatedTeam.shopMargin.toFixed(1)}% margem final</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
