import React, { useState } from 'react';
import { 
  ArrowUpCircle, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Tag, 
  Wallet,
  ArrowUpRight
} from 'lucide-react';
import { Account, Category, FinancialMode, Transaction } from '../types/finance';

interface FinanceIncomesProps {
  mode: FinancialMode;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => Promise<Transaction>;
  onDeleteTransaction: (id: string) => Promise<void>;
  onToggleStatus: (id: string, newStatus: 'paid' | 'pending') => Promise<void>;
}

export function FinanceIncomes({
  mode,
  accounts,
  categories,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  onToggleStatus
}: FinanceIncomesProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Salário & Renda');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'paid' | 'pending'>('paid');

  const incomeCategories = categories.filter(c => c.type === 'income');

  // Filter only income transactions
  const incomeTxs = transactions.filter(t => t.type === 'income');

  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthIncomes = incomeTxs.filter(t => t.date?.startsWith(currentMonthPrefix));

  const receivedThisMonth = thisMonthIncomes
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingThisMonth = thisMonthIncomes
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalForecast = receivedThisMonth + pendingThisMonth;

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    const parsedAmount = parseFloat(amount.replace(',', '.')) || 0;
    const targetAccount = accounts.find(a => a.id === accountId) || accounts[0];

    await onAddTransaction({
      description: description.trim(),
      amount: parsedAmount,
      type: 'income',
      category: category || 'Outras Receitas',
      accountId: targetAccount?.id || '',
      accountName: targetAccount?.name || 'Conta Padrão',
      date: date || new Date().toISOString().split('T')[0],
      status: status,
      mode: mode
    });

    setIsModalOpen(false);
    setDescription('');
    setAmount('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <ArrowUpCircle size={22} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Receitas</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Gerencie suas fontes de renda e entradas.
          </p>
        </div>

        <button
          onClick={() => {
            setAccountId(accounts[0]?.id || '');
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
        >
          <Plus size={16} />
          <span>Nova Receita</span>
        </button>
      </div>

      {/* 3 Summary Cards Row matching screenshot 4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recebido Este Mês */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-1.5">
          <span className="text-[10px] font-black tracking-wider uppercase text-slate-500">
            RECEBIDO ESTE MÊS
          </span>
          <div className="text-2xl font-black text-slate-900">
            {formatBRL(receivedThisMonth)}
          </div>
        </div>

        {/* Pendente */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-1.5">
          <span className="text-[10px] font-black tracking-wider uppercase text-slate-500">
            PENDENTE
          </span>
          <div className="text-2xl font-black text-amber-500">
            {formatBRL(pendingThisMonth)}
          </div>
        </div>

        {/* Previsão Total */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-1.5">
          <span className="text-[10px] font-black tracking-wider uppercase text-slate-500">
            PREVISÃO TOTAL
          </span>
          <div className="text-2xl font-black text-emerald-600">
            {formatBRL(totalForecast)}
          </div>
        </div>
      </div>

      {/* Table Card (Últimas Entradas) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-900">Últimas Entradas</h3>
        </div>

        {incomeTxs.length === 0 ? (
          /* Empty state matching screenshot 4 */
          <div className="p-16 text-center flex flex-col items-center justify-center space-y-3 min-h-[300px]">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
              <TrendingUp size={28} />
            </div>
            <p className="text-xs font-semibold text-slate-400">
              Nenhuma receita registrada ainda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">DESCRIÇÃO</th>
                  <th className="px-6 py-3.5">CATEGORIA</th>
                  <th className="px-6 py-3.5">CONTA</th>
                  <th className="px-6 py-3.5">DATA</th>
                  <th className="px-6 py-3.5">VALOR</th>
                  <th className="px-6 py-3.5">STATUS</th>
                  <th className="px-6 py-3.5 text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomeTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <ArrowUpRight size={14} />
                      </div>
                      <span>{tx.description}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {tx.accountName || 'Conta'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {tx.date}
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-600">
                      +{formatBRL(tx.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onToggleStatus(tx.id, tx.status === 'paid' ? 'pending' : 'paid')}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all ${
                          tx.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {tx.status === 'paid' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        <span>{tx.status === 'paid' ? 'Recebido' : 'Pendente'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Nova Receita */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Nova Receita</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Salário, Venda de Produto, Rendimentos"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-emerald-600 focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-emerald-600"
                  >
                    {incomeCategories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                    <option value="Outras Receitas">Outras Receitas</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Conta Destino
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-emerald-600"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                    {accounts.length === 0 && <option value="">Conta Padrão</option>}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Status
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('paid')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      status === 'paid'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    ✓ Já Recebido
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('pending')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      status === 'pending'
                        ? 'bg-amber-50 border-amber-500 text-amber-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    ⏱ A Receber (Pendente)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Salvar Receita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
