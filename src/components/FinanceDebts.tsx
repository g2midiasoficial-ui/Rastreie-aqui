import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Clock,
  Percent
} from 'lucide-react';
import { Debt, FinancialMode } from '../types/finance';

interface FinanceDebtsProps {
  mode: FinancialMode;
  debts: Debt[];
  onAddDebt: (debt: Omit<Debt, 'id'>) => Promise<Debt>;
  onPayInstallment: (debtId: string, amount: number) => void;
}

export function FinanceDebts({
  mode,
  debts,
  onAddDebt,
  onPayInstallment
}: FinanceDebtsProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [creditor, setCreditor] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [installmentsCount, setInstallmentsCount] = useState<string>('12');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [interestRate, setInterestRate] = useState<string>('0');

  const totalDebt = debts.reduce((sum, d) => sum + (d.totalAmount - d.paidAmount), 0);
  const totalPaid = debts.reduce((sum, d) => sum + d.paidAmount, 0);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !totalAmount) return;

    const tot = parseFloat(totalAmount.replace(',', '.')) || 0;
    const instCount = parseInt(installmentsCount, 10) || 1;
    const instVal = tot / instCount;

    await onAddDebt({
      title: title.trim(),
      creditor: creditor.trim() || 'Credor',
      totalAmount: tot,
      paidAmount: 0,
      installmentsCount: instCount,
      paidInstallments: 0,
      installmentValue: instVal,
      dueDate,
      interestRate: parseFloat(interestRate.replace(',', '.')) || 0,
      status: 'active',
      mode
    });

    setIsModalOpen(false);
    setTitle('');
    setCreditor('');
    setTotalAmount('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <CreditCard size={22} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dívidas & Empréstimos</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Controle débitos, parcelamentos e planos de quitação
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Nova Dívida</span>
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-1">
          <span className="text-[10px] font-black tracking-wider uppercase text-rose-600">TOTAL RESTANTE A PAGAR</span>
          <div className="text-3xl font-black text-rose-600">{formatBRL(totalDebt)}</div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-1">
          <span className="text-[10px] font-black tracking-wider uppercase text-emerald-600">TOTAL JÁ QUITADO</span>
          <div className="text-3xl font-black text-emerald-600">{formatBRL(totalPaid)}</div>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {debts.map((debt) => {
          const progressPercent = debt.totalAmount > 0 ? (debt.paidAmount / debt.totalAmount) * 100 : 0;
          return (
            <div key={debt.id} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{debt.title}</h3>
                  <p className="text-xs text-slate-500">{debt.creditor} • Vencimento: {debt.dueDate}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  debt.status === 'paid_off' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {debt.status === 'paid_off' ? 'Quitada' : 'Ativa'}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Progresso ({debt.paidInstallments}/{debt.installmentsCount} parcelas)</span>
                  <span>{progressPercent.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Pago: {formatBRL(debt.paidAmount)}</span>
                  <span>Total: {formatBRL(debt.totalAmount)}</span>
                </div>
              </div>

              {debt.status !== 'paid_off' && (
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-800">
                    Parcela: <strong>{formatBRL(debt.installmentValue)}</strong>
                  </div>
                  <button
                    onClick={() => onPayInstallment(debt.id, debt.installmentValue)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    ✓ Pagar Parcela
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Cadastrar Dívida / Empréstimo</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Título / Motivo</label>
                <input required placeholder="Ex: Financiamento Carro, Cartão Renegociado" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Credor / Banco</label>
                <input placeholder="Ex: Banco Itaú, Loja X" value={creditor} onChange={e => setCreditor(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Valor Total (R$)</label>
                  <input required placeholder="5000,00" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Qtd. Parcelas</label>
                  <input type="number" value={installmentsCount} onChange={e => setInstallmentsCount(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs font-bold">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-rose-600 text-white rounded-xl text-xs font-black">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
