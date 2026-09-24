import React, { useState } from 'react';
import { 
  Wallet, 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit3, 
  Landmark, 
  DollarSign, 
  CheckCircle2, 
  Building2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Account, FinancialMode } from '../types/finance';

interface FinanceAccountsProps {
  mode: FinancialMode;
  accounts: Account[];
  onAddAccount: (acc: Omit<Account, 'id'>) => Promise<Account>;
  onDeleteAccount: (id: string) => Promise<void>;
  onOpenNewTransactionForAccount?: (accId: string) => void;
}

const BANK_PRESETS = [
  { name: 'Nubank', bank: 'Nubank', color: '#820AD1', type: 'checking' as const },
  { name: 'Itaú', bank: 'Itaú', color: '#EC7000', type: 'checking' as const },
  { name: 'Bradesco', bank: 'Bradesco', color: '#CC092F', type: 'checking' as const },
  { name: 'Inter', bank: 'Inter', color: '#FF7A00', type: 'checking' as const },
  { name: 'Santander', bank: 'Santander', color: '#EA1D2C', type: 'checking' as const },
  { name: 'C6 Bank', bank: 'C6 Bank', color: '#242424', type: 'checking' as const },
  { name: 'Carteira Física', bank: 'Dinheiro', color: '#10B981', type: 'wallet' as const },
  { name: 'Cartão de Crédito', bank: 'Mastercard/Visa', color: '#3B82F6', type: 'credit_card' as const },
];

export function FinanceAccounts({
  mode,
  accounts,
  onAddAccount,
  onDeleteAccount,
  onOpenNewTransactionForAccount
}: FinanceAccountsProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [bank, setBank] = useState<string>('Nubank');
  const [type, setType] = useState<'checking' | 'savings' | 'credit_card' | 'wallet' | 'investment'>('checking');
  const [balance, setBalance] = useState<string>('0');
  const [creditLimit, setCreditLimit] = useState<string>('0');
  const [color, setColor] = useState<string>('#3B82F6');

  const handleOpenPreset = (preset: typeof BANK_PRESETS[0]) => {
    setName(preset.name);
    setBank(preset.bank);
    setType(preset.type);
    setColor(preset.color);
    setBalance('0');
    setCreditLimit('0');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onAddAccount({
      name: name.trim(),
      bank: bank.trim() || name.trim(),
      type,
      balance: parseFloat(balance.replace(',', '.')) || 0,
      creditLimit: type === 'credit_card' ? parseFloat(creditLimit.replace(',', '.')) || 0 : undefined,
      color,
      mode
    });

    setIsModalOpen(false);
    setName('');
    setBalance('0');
    setCreditLimit('0');
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Wallet size={20} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Minhas Contas</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Gerencie seus cartões e contas bancárias
          </p>
        </div>

        <button
          onClick={() => {
            setName('');
            setBank('Nubank');
            setType('checking');
            setColor('#3B82F6');
            setBalance('0');
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
        >
          <Plus size={16} />
          <span>Nova Conta</span>
        </button>
      </div>

      {/* Empty State matching screenshot 3 */}
      {accounts.length === 0 ? (
        <div className="border border-dashed border-slate-300/80 bg-white/70 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[420px] space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
            <CreditCard size={32} />
          </div>

          <div className="space-y-1 max-w-md">
            <h3 className="text-base font-extrabold text-slate-800">Sua carteira está vazia</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cadastre suas contas bancárias, dinheiro físico ou cartões de crédito para ter um controle preciso.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-2xl text-xs font-extrabold transition-all shadow-xs hover:shadow-sm cursor-pointer mt-2"
          >
            Adicionar Primeira Conta
          </button>

          {/* Quick presets buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 max-w-lg">
            <span className="text-[11px] font-bold text-slate-400 w-full mb-1">Ou adicione rapidamente:</span>
            {BANK_PRESETS.slice(0, 4).map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleOpenPreset(p)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span>+ {p.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Accounts Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between group"
            >
              {/* Colored top indicator */}
              <div 
                className="absolute top-0 left-0 right-0 h-2"
                style={{ backgroundColor: acc.color || '#3B82F6' }}
              />

              <div className="space-y-4 pt-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black shadow-xs"
                      style={{ backgroundColor: acc.color || '#3B82F6' }}
                    >
                      {acc.type === 'wallet' ? <DollarSign size={20} /> : <Landmark size={20} />}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">{acc.name}</h3>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {acc.type === 'checking' ? 'Conta Corrente' :
                         acc.type === 'savings' ? 'Poupança' :
                         acc.type === 'credit_card' ? 'Cartão de Crédito' :
                         acc.type === 'wallet' ? 'Dinheiro Físico' : 'Investimento'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteAccount(acc.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                    title="Excluir Conta"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="space-y-1 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Saldo Atual</span>
                  <div className={`text-2xl font-black ${
                    acc.balance >= 0 ? 'text-slate-900' : 'text-rose-600'
                  }`}>
                    {formatBRL(acc.balance)}
                  </div>

                  {acc.type === 'credit_card' && acc.creditLimit && (
                    <div className="pt-2 text-[11px] text-slate-500 font-medium flex justify-between">
                      <span>Limite de Crédito:</span>
                      <strong className="text-slate-700">{formatBRL(acc.creditLimit)}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add Another Account Card */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-3xl p-6 flex flex-col items-center justify-center text-slate-500 hover:text-blue-600 transition-all min-h-[190px] gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
              <Plus size={20} />
            </div>
            <span className="text-xs font-bold">Adicionar Nova Conta</span>
          </button>
        </div>
      )}

      {/* Modal Nova Conta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Adicionar Conta ou Cartão</h3>
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
                  Nome da Conta / Banco
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Nubank, Itaú Corrente, Carteira"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Tipo de Conta
                  </label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-blue-600"
                  >
                    <option value="checking">Conta Corrente</option>
                    <option value="savings">Poupança</option>
                    <option value="credit_card">Cartão de Crédito</option>
                    <option value="wallet">Dinheiro Físico</option>
                    <option value="investment">Investimento</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Cor
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 p-0.5"
                    />
                    <span className="text-xs font-mono text-slate-600">{color}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Saldo Inicial (R$)
                </label>
                <input
                  type="text"
                  placeholder="0,00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>

              {type === 'credit_card' && (
                <div>
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Limite do Cartão (R$)
                  </label>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-blue-600"
                  />
                </div>
              )}

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
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
