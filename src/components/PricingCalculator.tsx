import React from 'react';
import { 
  Package, Megaphone, DollarSign, Target, BarChart3 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Platform, PricingData, CalculationResult } from '../../types.ts';
import { calculatePricing, formatCurrency, getCurrencySymbol } from '../../utils/calculations.ts';
import { ModernInput, Section, StatusCard } from './UIComponents.tsx';

const MARKUP_STEPS = [1.2, 1.5, 1.8, 2.0, 2.2, 2.5, 2.8, 3.0, 3.5, 4.0, 5.0];

interface PricingCalculatorProps {
  pricingData: PricingData;
  setPricingData: React.Dispatch<React.SetStateAction<PricingData>>;
  currentResult: CalculationResult;
  platform: Platform;
}

export function PricingCalculator({
  pricingData,
  setPricingData,
  currentResult,
  platform
}: PricingCalculatorProps) {
  const currentSymbol = getCurrencySymbol(pricingData.currency);

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Top Metric Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 blue-gradient rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">
            {pricingData.pricingMode === 'manual' ? 'Preço de Venda Definido' : 'Preço Sugerido (Venda)'}
          </p>
          <h3 className="text-5xl font-black tracking-tighter">
            {formatCurrency(currentResult.finalPrice, pricingData.currency)}
          </h3>
          <div className="mt-6 flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black border border-white/10">
              Markup: {pricingData.pricingMode === 'manual' 
                ? (currentResult.finalPrice / Math.max(1, (currentResult.unitCMV + (pricingData.packagingCost || 0) + (pricingData.shippingLabel || 0)))).toFixed(2)
                : pricingData.desiredMarkup
              }x
            </div>
            <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black border border-white/10">
              Margem: {currentResult.marginPercent.toFixed(1)}%
            </div>
            <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black border border-white/10">
              ROI: {currentResult.roi.toFixed(0)}%
            </div>
          </div>
        </div>
        <StatusCard 
          icon={<DollarSign size={20}/>} 
          label="Lucro Unitário" 
          value={formatCurrency(currentResult.profit, pricingData.currency)} 
          desc="Líquido na conta" 
          theme={currentResult.profit > 0 ? "emerald" : "rose"} 
        />
        <StatusCard 
          icon={<Target size={20}/>} 
          label="CPA Breakeven" 
          value={formatCurrency(currentResult.maxCPA, pricingData.currency)} 
          desc="Limite p/ não perder" 
          theme="blue" 
        />
      </div>

      {/* Verba Ads Planning Cards */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-black text-black flex items-center gap-2 italic">
              <Megaphone size={20} className="text-blue-600"/> Planejamento de Verba Ads
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Quanto investir e quantas vendas buscar
            </p>
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

      {/* Inputs and Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <Section title="Produto & Logística" icon={<Package size={16}/>}>
            <ModernInput 
              label="Nome do Produto" 
              value={pricingData.productName} 
              onChange={v => setPricingData(prev => ({ ...prev, productName: v }))} 
            />
            <ModernInput 
              label="Custo Produto" 
              value={pricingData.costPrice} 
              onChange={v => setPricingData(prev => ({ ...prev, costPrice: v }))} 
              symbol={currentSymbol} 
            />
            <ModernInput 
              label="Frete Fornecedor" 
              value={pricingData.freightIn} 
              onChange={v => setPricingData(prev => ({ ...prev, freightIn: v }))} 
              symbol={currentSymbol} 
            />
            
            <div className="space-y-1 mt-2 mb-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                Método de Precificação
              </label>
              <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPricingData(prev => ({ ...prev, pricingMode: 'markup' }))}
                  className={`py-1.5 px-3 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    pricingData.pricingMode !== 'manual'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
                  }`}
                >
                  Markup Alvo
                </button>
                <button
                  type="button"
                  onClick={() => setPricingData(prev => ({ ...prev, pricingMode: 'manual' }))}
                  className={`py-1.5 px-3 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    pricingData.pricingMode === 'manual'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
                  }`}
                >
                  Preço de Venda
                </button>
              </div>
            </div>

            {pricingData.pricingMode === 'manual' ? (
              <ModernInput 
                label="Preço de Venda Desejado" 
                value={pricingData.customSellingPrice || 0} 
                onChange={v => setPricingData(prev => ({ ...prev, customSellingPrice: v }))} 
                symbol={currentSymbol} 
              />
            ) : (
              <ModernInput 
                label="Markup Alvo" 
                value={pricingData.desiredMarkup} 
                onChange={v => setPricingData(prev => ({ ...prev, desiredMarkup: v }))} 
                symbol="x" 
              />
            )}
            
            <ModernInput 
              label="Estimativa Vendas/Mês" 
              value={pricingData.estimatedMonthlySales} 
              onChange={v => setPricingData(prev => ({ ...prev, estimatedMonthlySales: v }))} 
              symbol="#" 
            />
          </Section>
          
          <Section title="Canal & Marketing" icon={<Megaphone size={16}/>}>
            <div className="space-y-1 mb-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                Faixa de Preço (Regra de Taxas)
              </label>
              <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPricingData(prev => ({
                    ...prev,
                    feeTier: 'below_50',
                    marketplaceCommissionPercent: 4,
                    fixedFee: 4,
                    freightPercent: 4
                  }))}
                  className={`py-2 px-2 rounded-lg text-[10px] font-black transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                    pricingData.feeTier === 'below_50' || (pricingData.marketplaceCommissionPercent === 4 && pricingData.fixedFee === 4 && pricingData.freightPercent === 4)
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
                  }`}
                >
                  <span>Abaixo R$ 50</span>
                  <span className="text-[9px] opacity-75 font-semibold">4% + R$ 4 + 4%</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPricingData(prev => ({
                    ...prev,
                    feeTier: 'above_50',
                    marketplaceCommissionPercent: 6,
                    fixedFee: 6,
                    freightPercent: 6
                  }))}
                  className={`py-2 px-2 rounded-lg text-[10px] font-black transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                    pricingData.feeTier === 'above_50' || (pricingData.marketplaceCommissionPercent === 6 && pricingData.fixedFee === 6 && pricingData.freightPercent === 6)
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
                  }`}
                >
                  <span>+ 50 Reais</span>
                  <span className="text-[9px] opacity-75 font-semibold">6% + R$ 6 + 6%</span>
                </button>
              </div>
            </div>

            <ModernInput 
              label="Budget Ads (%)" 
              value={pricingData.marketingPercent} 
              onChange={v => setPricingData(prev => ({ ...prev, marketingPercent: v }))} 
              symbol="%" 
            />
            {platform !== Platform.DROPSHIPPING && (
              <ModernInput 
                label="Comissão Marketplace (%)" 
                value={pricingData.marketplaceCommissionPercent} 
                onChange={v => setPricingData(prev => ({ ...prev, marketplaceCommissionPercent: v, feeTier: undefined }))} 
                symbol="%" 
              />
            )}
            {platform !== Platform.DROPSHIPPING && (
              <ModernInput 
                label="Taxa Fixa Canal" 
                value={pricingData.fixedFee} 
                onChange={v => setPricingData(prev => ({ ...prev, fixedFee: v, feeTier: undefined }))} 
                symbol={currentSymbol} 
              />
            )}
            <ModernInput 
              label="Frete (%)" 
              value={pricingData.freightPercent} 
              onChange={v => setPricingData(prev => ({ ...prev, freightPercent: v, feeTier: undefined }))} 
              symbol="%" 
            />
            <ModernInput 
              label="Comissão Afiliados (%)" 
              value={pricingData.affiliateCommissionPercent} 
              onChange={v => setPricingData(prev => ({ ...prev, affiliateCommissionPercent: v }))} 
              symbol="%" 
            />
            <ModernInput 
              label="Imposto (%)" 
              value={pricingData.taxPercent} 
              onChange={v => setPricingData(prev => ({ ...prev, taxPercent: v }))} 
              symbol="%" 
            />
            <ModernInput 
              label="Embalagem" 
              value={pricingData.packagingCost} 
              onChange={v => setPricingData(prev => ({ ...prev, packagingCost: v }))} 
              symbol={currentSymbol} 
            />
            
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest">
                Resumo de Taxas por Unidade
              </p>
              
              <div className="space-y-1.5 text-[10px] font-bold text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Impostos Fiscais (%):</span>
                  <span className="text-black font-black">
                    {formatCurrency(currentResult.taxes, pricingData.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Frete (%):</span>
                  <span className="text-black font-black">
                    {formatCurrency(currentResult.finalPrice * ((pricingData.freightPercent || 0) / 100), pricingData.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Comissão de Afiliados:</span>
                  <span className="text-black font-black">
                    {formatCurrency(currentResult.finalPrice * ((pricingData.affiliateCommissionPercent || 0) / 100), pricingData.currency)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-blue-800 uppercase tracking-tight">Total de Taxas:</span>
                  <span className="text-sm font-black text-blue-700">
                    {formatCurrency(currentResult.totalFeesOnly, pricingData.currency)}
                  </span>
                </div>
                <div className="text-[9px] font-bold text-slate-600 text-right">
                  {currentResult.finalPrice > 0 
                    ? `${((currentResult.totalFeesOnly / currentResult.finalPrice) * 100).toFixed(1)}% do preço de venda`
                    : '0% do preço de venda'
                  }
                </div>
              </div>
            </div>
          </Section>
        </div>
        
        <div className="lg:col-span-8 bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 h-full">
          <h3 className="text-lg font-black text-black mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-500"/> Sensibilidade de Margem vs Markup
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MARKUP_STEPS.map(m => calculatePricing(pricingData, m, platform))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="markup" 
                  tickFormatter={v => `${v}x`} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#000' }} 
                  axisLine={false} 
                />
                <YAxis 
                  tickFormatter={v => `${v}%`} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#000' }} 
                  axisLine={false} 
                />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)' }} />
                <Area 
                  type="monotone" 
                  dataKey="marginPercent" 
                  name="Margem" 
                  stroke="#2563eb" 
                  fill="#dbeafe" 
                  strokeWidth={3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
