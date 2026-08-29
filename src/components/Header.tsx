import React from 'react';
import { Coins as CoinsIcon, User, Settings } from 'lucide-react';
import { Platform, PricingData, CalculationResult, CurrencyCode } from '../../types.ts';

interface HeaderProps {
  activeTab: 'overview' | 'dre' | 'compass' | 'simulation' | 'planning' | 'gamification' | 'settings';
  setActiveTab: (tab: 'overview' | 'dre' | 'compass' | 'simulation' | 'planning' | 'gamification' | 'settings') => void;
  platform: Platform;
  pricingData: PricingData;
  setPricingData: React.Dispatch<React.SetStateAction<PricingData>>;
  currentResult: CalculationResult;
  currentUser?: any;
}

export function Header({
  activeTab,
  setActiveTab,
  platform,
  pricingData,
  setPricingData,
  currentResult,
  currentUser
}: HeaderProps) {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Calculadora';
      case 'planning': return 'Planejamento Ads';
      case 'compass': return 'Bússola (KPIs)';
      case 'simulation': return 'Simulação Escala';
      case 'dre': return 'Demonstração de Resultados (DRE)';
      case 'gamification': return 'Gamificação & Afiliados';
      case 'settings': return 'Configurações & Conta';
      default: return 'CFO Dashboard';
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-10 bg-white border-b border-slate-100 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
          {getTabTitle()}
        </span>
        <div className="h-4 w-px bg-slate-200"></div>
        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{platform}</span>
      </div>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
          <CoinsIcon size={14} className="text-blue-600" />
          <select 
            value={pricingData.currency}
            onChange={(e) => setPricingData(prev => ({ ...prev, currency: e.target.value as CurrencyCode }))}
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
          <p className={`text-sm font-black ${currentResult.marginPercent > 10 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {currentResult.marginPercent.toFixed(1)}%
          </p>
        </div>

        {/* Botão de Usuário / Configurações */}
        <button
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-2.5 p-1.5 pr-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all cursor-pointer group"
          title="Configurações da Conta"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-xs group-hover:scale-105 transition-transform">
            {currentUser?.displayName ? currentUser.displayName.substring(0, 2).toUpperCase() : <User size={14} />}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[10px] font-black text-slate-900 leading-tight">
              {currentUser?.displayName || 'Minha Conta'}
            </p>
            <p className="text-[8px] font-bold text-slate-400 uppercase">
              {currentUser ? 'Configurações' : 'Entrar / Cadastrar'}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}
