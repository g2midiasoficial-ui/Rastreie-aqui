import React from 'react';
import { Settings, BarChart } from 'lucide-react';
import { 
  ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { PricingData, CalculationResult } from '../../types.ts';
import { formatCurrency } from '../../utils/calculations.ts';

interface ScaleSimulationProps {
  pricingData: PricingData;
  currentResult: CalculationResult;
  scaleResult: CalculationResult;
  scaleMultiplier: number;
  setScaleMultiplier: (multiplier: number) => void;
}

export function ScaleSimulation({
  pricingData,
  currentResult,
  scaleResult,
  scaleMultiplier,
  setScaleMultiplier
}: ScaleSimulationProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom duration-500 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-black tracking-tight italic">Simulação de Escala</h2>
          <p className="text-slate-600 font-bold uppercase text-[10px] tracking-widest mt-1">
            Projete o futuro da sua operação
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-[10px] font-black text-slate-500 uppercase px-3">Multiplicador</span>
          <div className="flex gap-1">
            {[2, 3, 5, 10].map(m => (
              <button 
                key={m}
                onClick={() => setScaleMultiplier(m)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  scaleMultiplier === m 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
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
                <label className="block text-[10px] font-black text-slate-600 uppercase mb-2">
                  Vendas Mensais Projetadas
                </label>
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
              <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">
                Lucro Mensal Projetado
              </p>
              <h4 className={`text-4xl font-black tracking-tighter ${
                scaleResult.monthlyProfitProjection > 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {formatCurrency(scaleResult.monthlyProfitProjection, pricingData.currency)}
              </h4>
              <p className="text-[10px] text-slate-400 font-bold mt-2 italic">
                Vs {formatCurrency(currentResult.monthlyProfitProjection, pricingData.currency)} (Atual)
              </p>
            </div>
            <div className="bg-black rounded-[32px] p-8 shadow-xl text-white">
              <p className="text-[10px] font-black text-blue-400 uppercase mb-2 tracking-widest">
                Faturamento Mensal
              </p>
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
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 'bold', fill: '#000' }} axisLine={false} />
                  <YAxis tickFormatter={v => `R$ ${v/1000}k`} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#000' }} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                  <Bar dataKey="revenue" name="Faturamento" fill="#dbeafe" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="profit" name="Lucro" fill="#2563eb" radius={[10, 10, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
