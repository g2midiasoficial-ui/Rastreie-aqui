import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { FinancialMode, MarketItem } from '../types/finance';

interface FinanceMarketProps {
  mode: FinancialMode;
  items: MarketItem[];
  onAddItem: (item: Omit<MarketItem, 'id'>) => void;
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
}

export function FinanceMarket({
  mode,
  items,
  onAddItem,
  onToggleItem,
  onDeleteItem
}: FinanceMarketProps) {
  const [name, setName] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [unitPrice, setUnitPrice] = useState<string>('0');
  const [category, setCategory] = useState<string>('Alimentos');

  const totalEstimated = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
  const totalChecked = items.filter(i => i.checked).reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddItem({
      name: name.trim(),
      quantity: parseFloat(quantity.replace(',', '.')) || 1,
      unitPrice: parseFloat(unitPrice.replace(',', '.')) || 0,
      unit: 'un',
      category,
      checked: false,
      mode
    });

    setName('');
    setQuantity('1');
    setUnitPrice('0');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <ShoppingCart size={22} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Lista de Mercado</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Organize suas compras de supermercado e controle o total do carrinho
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl">
            <span className="text-[10px] font-bold text-emerald-600 block">NO CARRINHO</span>
            <span className="text-sm font-black text-emerald-700">{formatBRL(totalChecked)}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-500 block">TOTAL ESTIMADO</span>
            <span className="text-sm font-black text-slate-800">{formatBRL(totalEstimated)}</span>
          </div>
        </div>
      </div>

      {/* Add Item Form */}
      <form onSubmit={handleAdd} className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <div className="sm:col-span-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Item / Produto</label>
          <input required placeholder="Ex: Café, Arroz 5kg, Azeite" value={name} onChange={e => setName(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Preço Unit. (R$)</label>
          <input placeholder="0,00" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900" />
        </div>
        <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20">
          <Plus size={16} />
          <span>Adicionar</span>
        </button>
      </form>

      {/* Items List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">
            Sua lista de compras está vazia. Adicione itens acima!
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleItem(item.id)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                    item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {item.checked && <Check size={14} />}
                </button>
                <div>
                  <span className={`text-xs font-bold ${item.checked ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {item.name}
                  </span>
                  <div className="text-[10px] text-slate-400">{item.quantity}x {formatBRL(item.unitPrice)}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-slate-800">
                  {formatBRL(item.quantity * item.unitPrice)}
                </span>
                <button onClick={() => onDeleteItem(item.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
