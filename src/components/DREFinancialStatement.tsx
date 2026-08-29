import React from 'react';
import { FileText } from 'lucide-react';
import { PricingData, CalculationResult } from '../../types.ts';
import { formatCurrency } from '../../utils/calculations.ts';
import { DRERow } from './UIComponents.tsx';

interface DREFinancialStatementProps {
  pricingData: PricingData;
  currentResult: CalculationResult;
}

export function DREFinancialStatement({
  pricingData,
  currentResult
}: DREFinancialStatementProps) {
  const contributionMargin1 = currentResult.monthlyRevenue - 
    (currentResult.unitCMV + pricingData.packagingCost + pricingData.shippingLabel) * pricingData.estimatedMonthlySales;

  const taxesAndFees = (currentResult.totalFeesOnly - currentResult.marketingCost - currentResult.marketingAdsTax) * 
    pricingData.estimatedMonthlySales;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-32">
      <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
        {/* HEADER DO DRE */}
        <div className="bg-black p-12 text-white flex justify-between items-center">
          <h2 className="text-4xl font-black italic tracking-tighter">
            Demonstrativo de Resultados (DRE)
          </h2>
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
            value={contributionMargin1} 
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
            value={taxesAndFees} 
            currency={pricingData.currency} 
            isNegative 
          />
          
          <div className="h-10" />

          {/* CARD DE RESUMO INFERIOR */}
          <div className="bg-[#F8FAFC] p-10 rounded-[40px] border border-slate-100 flex justify-between items-center shadow-inner">
            <div>
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">
                LUCRO LÍQUIDO FINAL
              </p>
              <h3 className="text-6xl font-black tracking-tighter text-[#10B981]">
                {formatCurrency(currentResult.monthlyProfitProjection, pricingData.currency)}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">
                MARGEM LÍQUIDA
              </p>
              <p className="text-5xl font-black text-black">
                {currentResult.marginPercent.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
