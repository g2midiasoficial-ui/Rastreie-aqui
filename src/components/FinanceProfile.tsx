import React from 'react';
import { 
  User, 
  Mail, 
  Database, 
  ShieldCheck, 
  Download, 
  LogOut, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  Globe,
  Sliders
} from 'lucide-react';
import { FinancialMode } from '../types/finance';

interface FinanceProfileProps {
  currentUser: any;
  mode: FinancialMode;
  setMode: (mode: FinancialMode) => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onNavigateCfoTools: (tool: string) => void;
}

export function FinanceProfile({
  currentUser,
  mode,
  setMode,
  onOpenAuthModal,
  onLogout,
  onNavigateCfoTools
}: FinanceProfileProps) {
  const userEmail = currentUser?.email || 'g2midiasoficial@gmail.com';
  const userName = currentUser?.displayName || 'Usuário Gerenciie';

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300 pb-16">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
          <User size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Perfil & Configurações</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Gerencie sua conta, integrações e modo de visualização
          </p>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/20">
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-lg font-black text-slate-900">{userName}</h3>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1"><Mail size={14} className="text-blue-600" /> {userEmail}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle2 size={14} /> Conexão Ativa</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Projeto ID: ai-studio-d584075f-0a72-4c80-9843-378c0ca75fb2
            </p>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sair</span>
          </button>
        </div>

        <div className="h-px bg-slate-100" />

        {/* Account Info Summary */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Status da Conta</h4>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-600 font-medium">Plano Ativo:</span>
            <span className="font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">Gerenciie CFO Pro</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-600 font-medium">Sincronização em Nuvem:</span>
            <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Ativa</span>
          </div>
        </div>
      </div>

      {/* CFO E-commerce Pro Suite Access */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 md:p-8 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
            <Globe size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Módulos CFO E-commerce & Dropshipping</h3>
            <p className="text-xs text-slate-400">Acesse ferramentas avançadas de precificação, ROI e escala</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2">
          <button
            onClick={() => onNavigateCfoTools('overview')}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 text-left text-xs font-bold text-white transition-all cursor-pointer"
          >
            📊 Calculadora Precificação
          </button>
          <button
            onClick={() => onNavigateCfoTools('planning')}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 text-left text-xs font-bold text-white transition-all cursor-pointer"
          >
            🎯 Planejamento Ads
          </button>
          <button
            onClick={() => onNavigateCfoTools('compass')}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 text-left text-xs font-bold text-white transition-all cursor-pointer"
          >
            🧭 Bússola de KPIs
          </button>
          <button
            onClick={() => onNavigateCfoTools('dre')}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 text-left text-xs font-bold text-white transition-all cursor-pointer"
          >
            📑 DRE Financeiro
          </button>
          <button
            onClick={() => onNavigateCfoTools('simulation')}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 text-left text-xs font-bold text-white transition-all cursor-pointer"
          >
            ⚡ Simulação de Escala
          </button>
        </div>
      </div>
    </div>
  );
}
