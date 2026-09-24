import React, { useState, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronDown
} from 'lucide-react';
import { Account, FinancialMode, Transaction } from '../types/finance';

interface FinanceTransactionsProps {
  mode: FinancialMode;
  accounts: Account[];
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => Promise<void>;
  onToggleStatus: (id: string, newStatus: 'paid' | 'pending') => Promise<void>;
}

export function FinanceTransactions({
  mode,
  accounts,
  transactions,
  onDeleteTransaction,
  onToggleStatus
}: FinanceTransactionsProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [monthFilter, setMonthFilter] = useState<'all' | 'this_month' | 'last_month'>('this_month');

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthPrefix = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;

      if (monthFilter === 'this_month' && !t.date?.startsWith(currentMonthPrefix)) return false;
      if (monthFilter === 'last_month' && !t.date?.startsWith(lastMonthPrefix)) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesDesc = t.description?.toLowerCase().includes(term);
        const matchesCat = t.category?.toLowerCase().includes(term);
        const matchesAcc = t.accountName?.toLowerCase().includes(term);
        if (!matchesDesc && !matchesCat && !matchesAcc) return false;
      }

      return true;
    });
  }, [transactions, typeFilter, monthFilter, searchTerm, currentMonthPrefix, lastMonthPrefix]);

  const totalIncomes = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleExportCSV = () => {
    const headers = 'ID,Descrição,Tipo,Valor,Categoria,Conta,Data,Status\n';
    const rows = filteredTransactions.map(t => 
      `"${t.id}","${t.description}","${t.type}",${t.amount},"${t.category}","${t.accountName || ''}","${t.date}","${t.status}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `extrato_gerenciie_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <ArrowLeftRight size={22} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Extrato</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Visualize suas movimentações financeiras
          </p>
        </div>

        {/* Top Right Badges (ENTRADAS & SAÍDAS) */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>ENTRADAS: {formatBRL(totalIncomes)}</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>SAÍDAS: {formatBRL(totalExpenses)}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar matching screenshot 6 */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="w-full md:w-80 flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Buscar transação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Type Filter Pills */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                typeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tudo
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                typeFilter === 'income' ? 'bg-white text-emerald-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Entradas
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                typeFilter === 'expense' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Saídas
            </button>
          </div>

          {/* Month Selector */}
          <select
            value={monthFilter}
            onChange={(e: any) => setMonthFilter(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl shadow-2xs focus:outline-blue-600 cursor-pointer"
          >
            <option value="this_month">Este Mês</option>
            <option value="last_month">Mês Anterior</option>
            <option value="all">Todo o Histórico</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-2xl shadow-2xs transition-all cursor-pointer"
            title="Exportar CSV"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          /* Empty State matching screenshot 6 */
          <div className="p-16 text-center flex flex-col items-center justify-center space-y-3 min-h-[350px]">
            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
              <Search size={26} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-800">Nenhuma transação encontrada</h3>
              <p className="text-xs text-slate-400">
                Tente alterar os filtros ou o período selecionado.
              </p>
            </div>
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
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {tx.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div>
                        <div>{tx.description}</div>
                        {tx.notes && <div className="text-[10px] text-slate-400 font-normal">{tx.notes}</div>}
                      </div>
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
                    <td className={`px-6 py-4 font-black ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatBRL(tx.amount)}
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
                        <span>{tx.status === 'paid' ? (tx.type === 'income' ? 'Recebido' : 'Pago') : 'Pendente'}</span>
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
    </div>
  );
}
