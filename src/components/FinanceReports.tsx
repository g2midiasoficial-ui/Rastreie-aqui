import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Percent, 
  PieChart as PieChartIcon, 
  BarChart2, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { FinancialMode, Transaction } from '../types/finance';

interface FinanceReportsProps {
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
    healthStatus: string;
  };
  transactions: Transaction[];
}

const MONTHS = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' }
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

export function FinanceReports({
  mode,
  metrics,
  transactions
}: FinanceReportsProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('09');
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  const monthPrefix = `${selectedYear}-${selectedMonth}`;
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date?.startsWith(monthPrefix));
  }, [transactions, monthPrefix]);

  // Expenses category distribution for Pie Chart
  const categoryData = useMemo(() => {
    const expenseTxs = monthTransactions.filter(t => t.type === 'expense');
    const map: Record<string, number> = {};

    expenseTxs.forEach(t => {
      const cat = t.category || 'Outros';
      map[cat] = (map[cat] || 0) + t.amount;
    });

    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [monthTransactions]);

  // Daily flow data for Bar Chart (Days 1..30)
  const dailyFlowData = useMemo(() => {
    const daysInMonth = 30;
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const dayStr = `${monthPrefix}-${String(dayNum).padStart(2, '0')}`;
      
      const dayIncomes = monthTransactions
        .filter(t => t.date === dayStr && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const dayExpenses = monthTransactions
        .filter(t => t.date === dayStr && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        day: `${dayNum}`,
        receitas: dayIncomes,
        despesas: dayExpenses
      };
    });

    return daysArray;
  }, [monthTransactions, monthPrefix]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300 pb-16">
      {/* Header Bar matching screenshot 7 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <FileText size={22} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Relatório Mensal</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Análise detalhada do seu fluxo financeiro
          </p>
        </div>

        {/* Top Right Selectors: [ Setembro ▾ ] [ 2026 ▾ ] */}
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-2xl shadow-2xs focus:outline-blue-600 cursor-pointer"
          >
            {MONTHS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-2xl shadow-2xs focus:outline-blue-600 cursor-pointer"
          >
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>
      </div>

      {/* 4 Metric Cards Row matching screenshot 7 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receitas */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase text-slate-500">
            <TrendingUp size={14} className="text-emerald-500" />
            <span>RECEITAS</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatBRL(metrics.incomeReceived)}
          </div>
        </div>

        {/* Gastos Reais (Exclui investimentos) */}
        <div className="bg-rose-50/50 rounded-3xl border border-rose-100 p-6 shadow-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase text-rose-600">
            <TrendingDown size={14} className="text-rose-500" />
            <span>GASTOS REAIS</span>
          </div>
          <span className="text-[10px] text-rose-400 font-medium block -mt-1">
            (Exclui investimentos)
          </span>
          <div className="text-2xl font-black text-rose-600">
            {formatBRL(metrics.expensePaid)}
          </div>
        </div>

        {/* Reservado (Neste mês) */}
        <div className="bg-emerald-50/50 rounded-3xl border border-emerald-100 p-6 shadow-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase text-emerald-700">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>RESERVADO</span>
          </div>
          <span className="text-[10px] text-emerald-500 font-medium block -mt-1">
            (Neste mês)
          </span>
          <div className="text-2xl font-black text-emerald-700">
            {formatBRL(metrics.reservedThisMonth)}
          </div>
        </div>

        {/* Taxa Poupança (Da renda total) */}
        <div className="bg-cyan-50/50 rounded-3xl border border-cyan-100 p-6 shadow-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase text-cyan-700">
            <Percent size={14} className="text-cyan-600" />
            <span>TAXA POUPANÇA</span>
          </div>
          <span className="text-[10px] text-cyan-500 font-medium block -mt-1">
            (Da renda total)
          </span>
          <div className="text-2xl font-black text-cyan-700">
            {metrics.savingsRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* 2 Charts Grid matching screenshot 7 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fluxo Diário (Operacional) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            <h3 className="text-sm font-extrabold text-slate-900">
              Fluxo Diário (Operacional)
            </h3>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyFlowData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(value: any) => formatBRL(Number(value))}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="receitas" fill="#10B981" radius={[4, 4, 0, 0]} name="Receitas" />
                <Bar dataKey="despesas" fill="#EF4444" radius={[4, 4, 0, 0]} name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Onde gastei? (Exclui Reservas) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <PieChartIcon size={18} className="text-blue-600" />
            <h3 className="text-sm font-extrabold text-slate-900">
              Onde gastei? (Exclui Reservas)
            </h3>
          </div>

          {categoryData.length === 0 ? (
            /* Empty state matching screenshot 7 */
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-2 my-auto">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                <PieChartIcon size={24} />
              </div>
              <p className="text-xs font-medium text-slate-400">
                Sem gastos operacionais registrados.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => formatBRL(Number(value))}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '11px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {categoryData.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {categoryData.map((c, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 text-[11px] font-bold text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span>{c.name}: {formatBRL(c.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
