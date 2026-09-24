import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertCircle
} from 'lucide-react';
import { FinancialMode, Transaction } from '../types/finance';

interface FinanceCalendarProps {
  mode: FinancialMode;
  transactions: Transaction[];
  onToggleStatus: (id: string, newStatus: 'paid' | 'pending') => Promise<void>;
  onOpenNewTransaction: () => void;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function FinanceCalendar({
  mode,
  transactions,
  onToggleStatus,
  onOpenNewTransaction
}: FinanceCalendarProps) {
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());

  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay();

  const monthPrefix = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;
  const selectedDateStr = `${monthPrefix}-${String(selectedDay).padStart(2, '0')}`;

  const selectedDayTxs = transactions.filter(t => t.date === selectedDateStr);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handlePrev = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonthIndex(m => m - 1);
    }
  };

  const handleNext = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonthIndex(m => m + 1);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <CalendarIcon size={22} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Agenda Financeira</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Acompanhe vencimentos, contas agendadas e compromissos
          </p>
        </div>

        <button
          onClick={onOpenNewTransaction}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Agendar Lançamento</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">
              {MONTHS[currentMonthIndex]} de {currentYear}
            </h3>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider py-2">
            <div>Dom</div>
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div>Sáb</div>
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-14 rounded-2xl bg-transparent" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${monthPrefix}-${String(day).padStart(2, '0')}`;
              const dayTxs = transactions.filter(t => t.date === dateStr);
              const hasIncome = dayTxs.some(t => t.type === 'income');
              const hasExpense = dayTxs.some(t => t.type === 'expense');
              const isSelected = selectedDay === day;

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedDay(day)}
                  className={`h-14 rounded-2xl p-1.5 flex flex-col justify-between items-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-black'
                      : 'hover:bg-slate-50 text-slate-700 font-bold border border-slate-100'
                  }`}
                >
                  <span className="text-xs">{day}</span>
                  <div className="flex items-center gap-1">
                    {hasIncome && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-500'}`} />}
                    {hasExpense && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-rose-300' : 'bg-rose-500'}`} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Side Panel */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Dia {selectedDay} de {MONTHS[currentMonthIndex]}</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{selectedDayTxs.length} lançamento(s)</span>
              </div>
            </div>

            {selectedDayTxs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium space-y-2">
                <p>Nenhuma movimentação para este dia.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDayTxs.map(tx => (
                  <div key={tx.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          tx.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {tx.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        </div>
                        <span className="text-xs font-bold text-slate-900">{tx.description}</span>
                      </div>
                      <span className={`text-xs font-black ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{formatBRL(tx.amount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="text-slate-500 font-medium">{tx.category} • {tx.accountName}</span>
                      <button
                        onClick={() => onToggleStatus(tx.id, tx.status === 'paid' ? 'pending' : 'paid')}
                        className={`px-2 py-0.5 rounded-full font-bold cursor-pointer ${
                          tx.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {tx.status === 'paid' ? '✓ Pago' : '⏱ Pendente'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
