import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Trash2, 
  PiggyBank, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { FinancialMode, Goal } from '../types/finance';

interface FinanceGoalsProps {
  mode: FinancialMode;
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => Promise<Goal>;
  onDeposit: (goalId: string, amount: number) => void;
}

export function FinanceGoals({
  mode,
  goals,
  onAddGoal,
  onDeposit
}: FinanceGoalsProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [depositModalOpen, setDepositModalOpen] = useState<string | null>(null);
  const [depositVal, setDepositVal] = useState<string>('');

  const [title, setTitle] = useState<string>('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [currentAmount, setCurrentAmount] = useState<string>('0');
  const [targetDate, setTargetDate] = useState<string>('2026-12-31');
  const [color, setColor] = useState<string>('#10B981');

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) return;

    await onAddGoal({
      title: title.trim(),
      targetAmount: parseFloat(targetAmount.replace(',', '.')) || 0,
      currentAmount: parseFloat(currentAmount.replace(',', '.')) || 0,
      targetDate,
      category: 'Metas',
      color,
      icon: 'Target',
      mode
    });

    setIsModalOpen(false);
    setTitle('');
    setTargetAmount('');
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalOpen || !depositVal) return;
    onDeposit(depositModalOpen, parseFloat(depositVal.replace(',', '.')) || 0);
    setDepositModalOpen(null);
    setDepositVal('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Target size={22} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Metas Financeiras</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Planeje objetivos de poupança, investimentos e reservas
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Nova Meta</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const progressPercent = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
          return (
            <div key={goal.id} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: goal.color || '#10B981' }}
                  >
                    <PiggyBank size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">{goal.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prazo: {goal.targetDate}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Progresso</span>
                  <span>{progressPercent.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="flex justify-between text-xs font-bold pt-1">
                  <span className="text-emerald-600">{formatBRL(goal.currentAmount)}</span>
                  <span className="text-slate-400">{formatBRL(goal.targetAmount)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setDepositModalOpen(goal.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>Aportar Valor</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Nova Meta Financeira</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Objetivo</label>
                <input required placeholder="Ex: Reserva de Emergência, Viagem, Carro Novo" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Valor Alvo (R$)</label>
                  <input required placeholder="10000,00" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Valor Atual (R$)</label>
                  <input placeholder="0,00" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Data Limite / Prazo</label>
                <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs font-bold">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black">Salvar Meta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {depositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Aportar na Meta</h3>
            <form onSubmit={handleDepositSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Valor do Aporte (R$)</label>
                <input required autoFocus placeholder="500,00" value={depositVal} onChange={e => setDepositVal(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs font-bold" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setDepositModalOpen(null)} className="px-3 py-1.5 border rounded-xl text-xs font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-black">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
