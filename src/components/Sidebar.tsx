import React from 'react';
import { 
  Calculator, 
  Target, 
  Compass, 
  FileSpreadsheet, 
  TrendingUp, 
  Trophy, 
  Settings, 
  Sparkles,
  LayoutGrid, 
  Bot, 
  Calendar, 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  ArrowLeftRight, 
  CreditCard, 
  Tag, 
  FileText, 
  ShoppingCart, 
  Car, 
  User,
  Globe,
  Shield
} from 'lucide-react';

export type AppTab = 
  | 'overview'
  | 'planning'
  | 'compass'
  | 'dre'
  | 'simulation'
  | 'gamification'
  | 'settings'
  | 'agent'
  | 'painel'
  | 'agente_chat'
  | 'agenda'
  | 'contas'
  | 'receitas'
  | 'despesas'
  | 'transacoes'
  | 'dividas'
  | 'categorias'
  | 'relatorios'
  | 'metas'
  | 'mercado'
  | 'veiculos'
  | 'perfil'
  | 'admin';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  currentUser?: any;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  currentUser
}: SidebarProps) {
  const ecomMenuItems: { id: AppTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Calculadora de Preço', icon: Calculator },
    { id: 'planning', label: 'Planejamento Ads', icon: Target },
    { id: 'compass', label: 'Bússola de Métricas', icon: Compass },
    { id: 'dre', label: 'DRE Financeiro', icon: FileSpreadsheet },
    { id: 'simulation', label: 'Simulação de Escala', icon: TrendingUp },
    { id: 'gamification', label: 'Gamificação & Níveis', icon: Trophy },
    { id: 'agent', label: 'Agente CFO IA', icon: Sparkles },
    { id: 'settings', label: 'Configurações & Conta', icon: Settings },
  ];

  const personalMenuItems: { id: AppTab; label: string; icon: any }[] = [
    { id: 'painel', label: 'Painel Financeiro', icon: LayoutGrid },
    { id: 'agente_chat', label: 'Agente IA (WhatsApp)', icon: Bot },
    { id: 'agenda', label: 'Agenda & Vencimentos', icon: Calendar },
    { id: 'contas', label: 'Minhas Contas', icon: Wallet },
    { id: 'receitas', label: 'Receitas', icon: ArrowUpCircle },
    { id: 'despesas', label: 'Despesas', icon: ArrowDownCircle },
    { id: 'transacoes', label: 'Extrato Transações', icon: ArrowLeftRight },
    { id: 'dividas', label: 'Dívidas & Parcelas', icon: CreditCard },
    { id: 'categorias', label: 'Categorias & Tetos', icon: Tag },
    { id: 'relatorios', label: 'Relatórios & Gráficos', icon: FileText },
    { id: 'metas', label: 'Metas & Reservas', icon: Target },
    { id: 'mercado', label: 'Lista de Mercado', icon: ShoppingCart },
    { id: 'veiculos', label: 'Veículos & Combustível', icon: Car },
    { id: 'perfil', label: 'Meu Perfil', icon: User },
  ];

  return (
    <aside className="w-64 md:w-72 bg-white border-r border-slate-200 flex flex-col z-30 shadow-xs shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Globe size={20} />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tighter text-slate-900 leading-none">
              Gerenciie
            </h1>
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">CFO & Gestão</span>
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-3.5 space-y-6 overflow-y-auto custom-scrollbar pb-8">
        {/* Section 1: E-commerce CFO Suite (Original) */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            E-Commerce & CFO
          </div>
          {ecomMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 font-bold'
                }`}
              >
                <Icon size={17} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section 2: Gestão Financeira Pessoal & Empresarial (Abaixo) */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          <div className="px-3 py-1 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Gestão & Agente IA</span>
            <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md font-bold">Novo</span>
          </div>
          {personalMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 font-bold'
                }`}
              >
                <Icon size={17} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section 3: Administração Master */}
        {(currentUser?.email === 'Betosouza3322@gmail.com' || 
          currentUser?.email?.toLowerCase() === 'betosouza3322@gmail.com' ||
          currentUser?.email === 'g2midiasoficial@gmail.com' || 
          currentUser?.role === 'admin') && (
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <div className="px-3 py-1 text-[10px] font-black text-amber-500 uppercase tracking-widest">
              Controle Master
            </div>
            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.01]'
                  : 'text-amber-600 hover:bg-amber-50 font-bold'
              }`}
            >
              <Shield size={17} className={activeTab === 'admin' ? 'text-slate-950' : 'text-amber-500'} />
              <span>Painel Admin Pro</span>
            </button>
          </div>
        )}
      </nav>
    </aside>
  );
}
