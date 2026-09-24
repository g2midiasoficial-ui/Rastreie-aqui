import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  Layers
} from 'lucide-react';
import { Category, FinancialMode } from '../types/finance';

interface FinanceCategoriesProps {
  mode: FinancialMode;
  categories: Category[];
  onAddCategory: (cat: Omit<Category, 'id'>) => void;
}

export function FinanceCategories({
  mode,
  categories,
  onAddCategory
}: FinanceCategoriesProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [color, setColor] = useState<string>('#3B82F6');
  const [budgetLimit, setBudgetLimit] = useState<string>('500');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCategory({
      name: name.trim(),
      type,
      icon: 'Tag',
      color,
      budgetLimit: parseFloat(budgetLimit.replace(',', '.')) || 0,
      mode
    });

    setIsModalOpen(false);
    setName('');
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Tag size={22} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Categorias & Orçamentos</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Defina limites de gastos mensais e organize suas transações
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Nova Categoria</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: cat.color }}
                >
                  <Tag size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{cat.name}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    cat.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {cat.type === 'income' ? 'Receita' : 'Despesa'}
                  </span>
                </div>
              </div>
            </div>

            {cat.type === 'expense' && cat.budgetLimit && (
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teto Mensal Sugerido</span>
                <div className="text-base font-black text-slate-900">{formatBRL(cat.budgetLimit)}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Adicionar Categoria</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Nome da Categoria</label>
                <input required placeholder="Ex: Assinaturas, Combustível, Farmácia" value={name} onChange={e => setName(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Tipo</label>
                  <select value={type} onChange={(e: any) => setType(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs">
                    <option value="expense">Despesa</option>
                    <option value="income">Receita</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Cor</label>
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-9 border rounded-xl p-0.5 cursor-pointer" />
                </div>
              </div>
              {type === 'expense' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Limite / Teto de Gasto (R$)</label>
                  <input placeholder="1000,00" value={budgetLimit} onChange={e => setBudgetLimit(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs" />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs font-bold">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-black">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
