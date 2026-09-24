import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  X, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Wallet
} from 'lucide-react';
import { FinancialMode, Transaction } from '../types/finance';

interface FinanceOverviewProps {
  mode: FinancialMode;
  metrics: {
    totalBalance: number;
    incomeReceived: number;
    incomePending: number;
    incomeTotalForecast: number;
    expensePaid: number;
    expensePending: number;
    expenseTotalForecast: number;
    reservedThisMonth: number;
    savingsRate: number;
    healthStatus: 'Excelente' | 'Boa' | 'Atenção' | 'Crítica';
  };
  transactions: Transaction[];
  onOpenNewIncome: () => void;
  onOpenNewExpense: () => void;
  onNavigateTab: (tab: any) => void;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function FinanceOverview({
  mode,
  metrics,
  transactions,
  onOpenNewIncome,
  onOpenNewExpense,
  onNavigateTab
}: FinanceOverviewProps) {
  const [showValues, setShowValues] = useState<boolean>(true);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(8); // Setembro (0-indexed 8)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [bannerVisible, setBannerVisible] = useState<boolean>(true);

  const formatBRL = (val: number) => {
    if (!showValues) return 'R$ ••••••';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handlePrevMonth = () => {
    if (selectedMonthIndex === 0) {
      setSelectedMonthIndex(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonthIndex(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonthIndex === 11) {
      setSelectedMonthIndex(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonthIndex(m => m + 1);
    }
  };

  const recentTxs = transactions.slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300 pb-16">
      {/* Top Title & Month Navigator */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Visão Geral</h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            {mode === 'personal' ? 'Resumo financeiro pessoal atualizado' : 'Resumo financeiro empresarial atualizado'}
          </p>
        </div>

        {/* Date selector button */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-2xl px-3 py-1.5 shadow-xs w-fit">
          <button 
            onClick={handlePrevMonth}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="flex items-center gap-2 px-2 text-xs font-bold text-slate-700">
            <CalendarIcon size={14} className="text-blue-600" />
            <span>{MONTH_NAMES[selectedMonthIndex]} De {selectedYear}</span>
          </div>

          <button 
            onClick={handleNextMonth}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Primary Blue Card (Saldo Principal) */}
      {bannerVisible && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-blue-700 text-white p-7 md:p-8 shadow-xl shadow-blue-600/15 border border-blue-500/30">
          <div className="relative z-10 flex flex-col justify-between h-full gap-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-bold text-white mb-2">
                  <Plus size={12} className="text-white" />
                  <span>Saldo Total em Contas</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl md:text-5xl font-black tracking-tight">
                    {formatBRL(metrics.totalBalance)}
                  </span>
                  <button 
                    onClick={() => setShowValues(!showValues)}
                    className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                    title={showValues ? 'Ocultar valores' : 'Mostrar valores'}
                  >
                    {showValues ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setBannerVisible(false)}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white/90 hover:text-white transition-all cursor-pointer"
                title="Minimizar painel"
              >
                <X size={16} />
              </button>
            </div>

            {/* Bottom Incomes & Expenses Frosted Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div 
                onClick={() => onNavigateTab('receitas')}
                className="bg-white/15 hover:bg-white/20 backdrop-blur-md rounded-2xl p-4.5 border border-white/10 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-black tracking-wider uppercase text-blue-100 mb-1">
                  <TrendingUp size={14} className="text-emerald-300" />
                  <span>RECEITAS</span>
                </div>
                <div className="text-2xl font-black text-white group-hover:translate-x-0.5 transition-transform">
                  {formatBRL(metrics.incomeReceived)}
                </div>
              </div>

              <div 
                onClick={() => onNavigateTab('despesas')}
                className="bg-white/15 hover:bg-white/20 backdrop-blur-md rounded-2xl p-4.5 border border-white/10 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-black tracking-wider uppercase text-blue-100 mb-1">
                  <TrendingDown size={14} className="text-rose-300" />
                  <span>DESPESAS</span>
                </div>
                <div className="text-2xl font-black text-white group-hover:translate-x-0.5 transition-transform">
                  {formatBRL(metrics.expensePaid)}
                </div>
              </div>
            </div>
          </div>

          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />
        </div>
      )}

      {/* 4 Action / Metric Cards Grid (2x2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nova Receita */}
        <button
          onClick={onOpenNewIncome}
          className="bg-white hover:bg-slate-50/80 border border-slate-200/80 rounded-3xl p-6 text-left shadow-xs hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 py-9 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp size={24} />
          </div>
          <span className="text-sm font-black text-slate-800 tracking-tight">Nova Receita</span>
        </button>

        {/* Nova Despesa */}
        <button
          onClick={onOpenNewExpense}
          className="bg-white hover:bg-slate-50/80 border border-slate-200/80 rounded-3xl p-6 text-left shadow-xs hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 py-9 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingDown size={24} />
          </div>
          <span className="text-sm font-black text-slate-800 tracking-tight">Nova Despesa</span>
        </button>

        {/* IA Assistente */}
        <button
          onClick={() => onNavigateTab('agente')}
          className="bg-white hover:bg-slate-50/80 border border-slate-200/80 rounded-3xl p-6 text-left shadow-xs hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 py-9 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles size={24} />
          </div>
          <span className="text-sm font-black text-slate-800 tracking-tight">IA Assistente</span>
        </button>

        {/* Saúde Financeira */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-center gap-1.5 py-9">
          <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">SAÚDE FINANCEIRA</span>
          <span className={`text-xl font-black ${
            metrics.healthStatus === 'Excelente' ? 'text-emerald-500' :
            metrics.healthStatus === 'Boa' ? 'text-blue-500' :
            metrics.healthStatus === 'Atenção' ? 'text-amber-500' : 'text-rose-500'
          }`}>
            {metrics.healthStatus}
          </span>
        </div>
      </div>

      {/* Extrato Recente Preview */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-blue-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Últimas Movimentações</h3>
          </div>
          <button 
            onClick={() => onNavigateTab('transacoes')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            Ver Extrato Completo →
          </button>
        </div>

        {recentTxs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-medium space-y-2">
            <p>Nenhuma transação recente registrada.</p>
            <p className="text-[11px] text-slate-500">Clique em Nova Receita ou Nova Despesa acima para começar.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentTxs.map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {tx.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{tx.description}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {tx.category} • {tx.accountName || 'Conta'} • {tx.date}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-black ${
                    tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}{formatBRL(tx.amount)}
                  </span>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-bold mt-0.5">
                    {tx.status === 'paid' ? (
                      <span className="text-emerald-600 flex items-center gap-0.5"><CheckCircle2 size={10} /> Pago</span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-0.5"><Clock size={10} /> Pendente</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
