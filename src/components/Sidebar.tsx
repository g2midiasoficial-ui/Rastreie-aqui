import React from 'react';
import { 
  LayoutDashboard, Target, ShieldCheck, Zap, FileText, 
  Trophy, Globe, Settings, User, Bot
} from 'lucide-react';
import { Platform } from '../../types.ts';

interface SidebarProps {
  activeTab: 'overview' | 'dre' | 'compass' | 'simulation' | 'planning' | 'gamification' | 'settings' | 'agent';
  setActiveTab: (tab: 'overview' | 'dre' | 'compass' | 'simulation' | 'planning' | 'gamification' | 'settings' | 'agent') => void;
  platform: Platform;
  setPlatform: (platform: Platform) => void;
  currentUser?: any;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  platform,
  setPlatform,
  currentUser
}: SidebarProps) {
  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col z-30 shadow-sm">
      <div className="p-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 blue-gradient rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Globe size={20} />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tighter text-black leading-none">Gerenciie</h1>
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">CFO Dashboard</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        <NavItem 
          icon={<LayoutDashboard size={18} />} 
          label="Calculadora" 
          active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')} 
        />
        <NavItem 
          icon={<Target size={18} />} 
          label="Planejamento Ads" 
          active={activeTab === 'planning'} 
          onClick={() => setActiveTab('planning')} 
        />
        <NavItem 
          icon={<ShieldCheck size={18} />} 
          label="Bússola (KPIs)" 
          active={activeTab === 'compass'} 
          onClick={() => setActiveTab('compass')} 
        />
        <NavItem 
          icon={<Zap size={18} />} 
          label="Simulação Escala" 
          active={activeTab === 'simulation'} 
          onClick={() => setActiveTab('simulation')} 
        />
        <NavItem 
          icon={<FileText size={18} />} 
          label="DRE" 
          active={activeTab === 'dre'} 
          onClick={() => setActiveTab('dre')} 
        />
        <NavItem 
          icon={<Trophy size={18} />} 
          label="Gamificação Afiliados" 
          active={activeTab === 'gamification'} 
          onClick={() => setActiveTab('gamification')} 
        />
        <NavItem 
          icon={<Settings size={18} />} 
          label="Configurações & Conta" 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')} 
        />
        <NavItem 
          icon={<Bot size={18} />} 
          label="Agente IA (Ofertas & Dúvidas)" 
          active={activeTab === 'agent'} 
          onClick={() => setActiveTab('agent')} 
        />
        
        <div className="h-px bg-slate-100 my-4" />
        <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Canal de Venda</p>
        <div className="px-2 space-y-1">
          <PlatformButton 
            label="Dropshipping" 
            active={platform === Platform.DROPSHIPPING} 
            onClick={() => setPlatform(Platform.DROPSHIPPING)} 
          />
          <PlatformButton 
            label="Shopee" 
            active={platform === Platform.SHOPEE} 
            onClick={() => setPlatform(Platform.SHOPEE)} 
          />
          <PlatformButton 
            label="Mercado Livre" 
            active={platform === Platform.MERCADO_LIVRE} 
            onClick={() => setPlatform(Platform.MERCADO_LIVRE)} 
          />
          <PlatformButton 
            label="TikTok Shop" 
            active={platform === Platform.TIKTOK_SHOP} 
            onClick={() => setPlatform(Platform.TIKTOK_SHOP)} 
          />
        </div>
      </nav>

      {/* Rodapé da Sidebar com Status do Usuário */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full p-3 rounded-2xl border transition-all flex items-center gap-3 text-left cursor-pointer ${
            activeTab === 'settings' 
              ? 'bg-blue-50 border-blue-200 text-blue-700' 
              : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs shrink-0">
            {currentUser?.displayName ? currentUser.displayName.substring(0, 2).toUpperCase() : <User size={14} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black truncate">
              {currentUser?.displayName || 'Entrar na Conta'}
            </p>
            <p className="text-[9px] font-bold text-slate-400 truncate">
              {currentUser ? 'Conta Conectada' : 'Clique p/ configurar'}
            </p>
          </div>
        </button>
      </div>
    </aside>
  );
}

function NavItem({ 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void; 
}) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all cursor-pointer ${
        active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-700 hover:bg-slate-50'
      }`}
    >
      <div className={active ? 'scale-110' : 'opacity-80'}>{icon}</div>
      <span className="text-xs tracking-tight">{label}</span>
    </button>
  );
}

function PlatformButton({ 
  label, 
  active, 
  onClick 
}: { 
  label: string; 
  active: boolean; 
  onClick: () => void; 
}) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full text-left px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all cursor-pointer ${
        active ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-600 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}
