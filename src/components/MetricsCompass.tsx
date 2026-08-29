import React from 'react';
import { Target, ShoppingCart, CreditCard as CardIcon, Scale } from 'lucide-react';
import { PricingData, CalculationResult } from '../../types.ts';
import { formatCurrency } from '../../utils/calculations.ts';

interface MetricsCompassProps {
  pricingData: PricingData;
  currentResult: CalculationResult;
}

export function MetricsCompass({
  pricingData,
  currentResult
}: MetricsCompassProps) {
  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col gap-1">
        <h2 className="text-4xl font-black text-black tracking-tight italic text-shadow-sm">
          Bússola de Tráfego
        </h2>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.1em]">
          SEUS LIMITES OPERACIONAIS DE TRÁFEGO PAGO
        </p>
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
              <p className="text-[10px] font-black text-rose-600 uppercase mb-2 tracking-widest">
                CPA BREAKEVEN (MÁXIMO)
              </p>
              <h4 className="text-3xl font-black text-black tracking-tighter">
                {formatCurrency(currentResult.maxCPA, pricingData.currency)}
              </h4>
              <p className="text-[9px] text-rose-500 font-bold mt-2">
                Se gastar mais que isso por venda, você perde dinheiro.
              </p>
            </div>

            <div className="bg-emerald-50 rounded-[24px] p-6 border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-600 uppercase mb-2 tracking-widest">
                CPA IDEAL (ESCALA)
              </p>
              <h4 className="text-3xl font-black text-black tracking-tighter">
                {formatCurrency(currentResult.cpaIdeal, pricingData.currency)}
              </h4>
              <p className="text-[9px] text-emerald-500 font-bold mt-2">
                Margem líquida atual está em {currentResult.marginPercent.toFixed(1)}%.
              </p>
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
              <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">
                ATC MÁXIMO
              </p>
              <h4 className="text-3xl font-black text-black tracking-tighter">
                {formatCurrency(currentResult.atcMax, pricingData.currency)}
              </h4>
            </div>

            <div className="bg-blue-50 rounded-[24px] p-6 border border-blue-100">
              <p className="text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest">
                ATC IDEAL
              </p>
              <h4 className="text-3xl font-black text-black tracking-tighter">
                {formatCurrency(currentResult.atcIdeal, pricingData.currency)}
              </h4>
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
              <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">
                IC MÁXIMO
              </p>
              <h4 className="text-3xl font-black text-black tracking-tighter">
                {formatCurrency(currentResult.icMax, pricingData.currency)}
              </h4>
            </div>

            <div className="bg-blue-50 rounded-[24px] p-6 border border-blue-100">
              <p className="text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest">
                IC IDEAL
              </p>
              <h4 className="text-3xl font-black text-black tracking-tighter">
                {formatCurrency(currentResult.icIdeal, pricingData.currency)}
              </h4>
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
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
              01
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              A Bússola calcula seus limites baseados nos <span className="font-black text-black">custos reais</span> da sua operação, incluindo taxas de gateway, impostos e custos fixos.
            </p>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
              03
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Os benchmarks de <span className="font-black text-black">ATC e IC</span> ajudam você a identificar onde o funil está quebrando antes mesmo de queimar todo o budget.
            </p>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
              02
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              O <span className="font-black text-black">CPA de Equilíbrio</span> é o "fio da navalha". Passou dele, sua operação é uma caridade para o Facebook/Google.
            </p>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
              04
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Use o <span className="font-black text-black">CPA Ideal</span> para escalar com segurança, garantindo que o lucro no bolso compense o risco da operação.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
