import React from 'react';
import { CurrencyCode } from '../../types.ts';
import { formatCurrency } from '../../utils/calculations.ts';

export function ModernInput({ 
  label, 
  value, 
  onChange, 
  symbol, 
  type 
}: { 
  label: string; 
  value: string | number; 
  onChange: (val: any) => void; 
  symbol?: string; 
  type?: string; 
}) {
  return (
    <div className="group">
      <label className="block text-[8px] font-black text-slate-700 uppercase mb-1.5 tracking-widest group-focus-within:text-blue-600 transition-colors">
        {label}
      </label>
      <div className="relative">
        {symbol && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-black text-[10px]">
            {symbol}
          </div>
        )}
        <input 
          type={type || (typeof value === 'number' ? 'number' : 'text')}
          value={value} 
          onChange={(e) => {
            const val = type === 'number' || typeof value === 'number' 
              ? (parseFloat(e.target.value) || 0) 
              : e.target.value;
            onChange(val);
          }} 
          className={`w-full bg-slate-50 border border-slate-100 rounded-xl py-2 ${
            symbol ? 'pl-8' : 'pl-4'
          } pr-4 outline-none focus:bg-white focus:border-blue-200 transition-all font-bold text-black text-xs`} 
        />
      </div>
    </div>
  );
}

export function Section({ 
  title, 
  icon, 
  children 
}: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
}) {
  return (
    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-5">
      <h3 className="text-xs font-black text-black flex items-center gap-2 uppercase tracking-widest">
        {icon} {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function StatusCard({ 
  icon, 
  label, 
  value, 
  desc, 
  theme 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  desc: string; 
  theme: 'emerald' | 'blue' | 'rose'; 
}) {
  const themes: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
  };
  return (
    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${themes[theme]}`}>
        {icon}
      </div>
      <div className="mt-6">
        <p className="text-[9px] font-black text-slate-600 uppercase mb-1 tracking-widest">{label}</p>
        <h4 className="text-2xl font-black text-black tracking-tighter">{value}</h4>
        <p className="text-[8px] text-slate-600 font-bold mt-1">{desc}</p>
      </div>
    </div>
  );
}

export const MetricCardSmall = ({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: string | number; 
  icon: React.ReactNode; 
}) => (
  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 group hover:border-blue-200 transition-all">
    <div className="flex items-center gap-1.5 mb-1.5 text-slate-800 group-hover:text-blue-600 transition-colors">
      {icon}
      <span className="text-[8px] font-black uppercase tracking-widest truncate">{label}</span>
    </div>
    <p className="text-xs font-black text-black tracking-tight">{value}</p>
  </div>
);

export function DRERow({ 
  label, 
  value, 
  currency, 
  isNegative, 
  isBold 
}: { 
  label: string; 
  value: number; 
  currency: CurrencyCode; 
  isNegative?: boolean; 
  isBold?: boolean; 
}) {
  return (
    <div className={`flex justify-between items-center py-2.5 ${
      isBold ? 'text-2xl font-black text-black' : 'text-xl font-bold text-slate-800'
    }`}>
      <span>{label}</span>
      <span className={isNegative ? 'text-[#EF4444]' : ''}>
        {isNegative ? '-' : ''}{formatCurrency(value, currency)}
      </span>
    </div>
  );
}
