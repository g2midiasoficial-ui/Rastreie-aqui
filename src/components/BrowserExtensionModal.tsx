import React, { useState } from 'react';
import { 
  Download, 
  Chrome, 
  Copy, 
  Check, 
  X, 
  ExternalLink, 
  Code, 
  FileText, 
  Zap, 
  Sparkles, 
  Monitor, 
  Layers, 
  Terminal, 
  ShieldCheck, 
  HelpCircle,
  Puzzle,
  Laptop,
  KeyRound,
  UserCheck,
  RefreshCw,
  LogIn,
  CheckCircle2,
  Lock,
  Truck
} from 'lucide-react';
import { PricingData } from '../../types';
import { supabase } from '../lib/supabase';
import { generateExtensionFiles, downloadExtensionZip, ExtensionFiles } from '../utils/extensionPackageGenerator';

interface BrowserExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  pricingData: PricingData;
  currentUser?: any;
  onToggleFloatingWidget: () => void;
  onOpenAuthModal?: () => void;
}

export function BrowserExtensionModal({
  isOpen,
  onClose,
  pricingData,
  currentUser,
  onToggleFloatingWidget,
  onOpenAuthModal
}: BrowserExtensionModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'account' | 'download' | 'tutorial' | 'code'>('overview');
  const [selectedFile, setSelectedFile] = useState<keyof ExtensionFiles>('manifest.json');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedFile, setCopiedFile] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const files = generateExtensionFiles(pricingData, currentUser);

  const canSetPassword = !!currentUser?.uid && !currentUser?.isGuest;
  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      await downloadExtensionZip(pricingData, currentUser);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(files[selectedFile]);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  // Define a senha da conta (útil para quem entrou com o Google usar a extensão)
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMsg({ ok: false, text: 'A senha deve ter no mínimo 6 caracteres.' });
      return;
    }
    setPasswordSaving(true);
    setPasswordMsg(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (error) {
      setPasswordMsg({ ok: false, text: error.code === 'same_password' ? 'Essa já é a sua senha atual.' : `Não foi possível salvar: ${error.message}` });
      return;
    }
    setNewPassword('');
    setPasswordMsg({ ok: true, text: 'Senha salva! Use seu e-mail e essa senha para entrar na extensão.' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Puzzle size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">
                  Extensão para Navegador (Chrome & Edge)
                </h3>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase">
                  Login & Sync Conectados
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Calcule markup, lucro e salve produtos direto na sua conta do Gerenciie Pro.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Monitor size={14} /> Visão Geral
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <KeyRound size={14} /> Conexão & Login
            </button>

            <button
              onClick={() => setActiveTab('download')}
              className={`py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'download'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Download size={14} /> Baixar Pacote (.ZIP)
            </button>

            <button
              onClick={() => setActiveTab('tutorial')}
              className={`py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'tutorial'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <HelpCircle size={14} /> Instalação no Chrome
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Code size={14} /> Código Fonte
            </button>
          </div>

          <button
            onClick={() => {
              onToggleFloatingWidget();
              onClose();
            }}
            className="py-1.5 px-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Sparkles size={14} /> Testar Simulador no App
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-200 custom-scrollbar">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Hero Banner */}
              <div className="relative rounded-3xl p-8 bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-blue-500/30 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Sincronização com o Projeto Ativa
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    Precifique qualquer produto e sincronize com o Gerenciie Pro.
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    A extensão Gerenciie Pro para Chrome e Edge adiciona um popup inteligente que calcula markup ideal, margem de lucro líquido, taxas de marketplace (Shopee, Mercado Livre, TikTok) e salva os produtos calculados na sua conta em tempo real.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleDownloadZip}
                      disabled={isDownloading}
                      className="py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-blue-600/30 transition-all cursor-pointer"
                    >
                      <Download size={16} />
                      {isDownloading ? 'Gerando Pacote...' : 'Baixar Extensão (.ZIP)'}
                    </button>
                    <button
                      onClick={() => setActiveTab('account')}
                      className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-700 flex items-center gap-2"
                    >
                      <KeyRound size={14} />
                      Como Entrar na Extensão
                    </button>
                  </div>
                </div>

                {/* Mini Preview Mockup */}
                <div className="w-full md:w-80 bg-slate-950 rounded-2xl border border-slate-800 p-4 shadow-2xl shrink-0">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] font-black text-slate-300">
                    <span className="flex items-center gap-1.5 text-blue-400">
                      <Chrome size={14} /> Extensão Conectada
                    </span>
                    <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {currentUser?.email ? '🟢 Logado' : '⚡ Pronto p/ Entrar'}
                    </span>
                  </div>

                  <div className="mt-3 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-center space-y-0.5">
                    <p className="text-[9px] uppercase font-bold opacity-80">Preço de Venda Sugerido</p>
                    <p className="text-2xl font-black">R$ 139,90</p>
                    <div className="flex justify-center gap-2 text-[9px] font-bold opacity-90 pt-1">
                      <span>Markup: 2.50x</span>
                      <span>•</span>
                      <span>Margem: 38.4%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2.5 text-[10px]">
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[8px] font-bold uppercase">CPA Breakeven</span>
                      <span className="font-black text-white">R$ 54,20</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[8px] font-bold uppercase">Status Nuvem</span>
                      <span className="font-black text-emerald-400">Sincronizado ☁️</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Zap size={16} />
                  </div>
                  <h4 className="text-xs font-black text-white">Login & Conexão Direta</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Entre na extensão com o mesmo e-mail e senha da sua conta Gerenciie Pro.
                  </p>
                </div>

                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Truck size={16} />
                  </div>
                  <h4 className="text-xs font-black text-white">Taxa SFP (Frete Grátis)</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Cálculo automático do Programa de Frete Grátis: (Preço Original - Desconto) × % SFP.
                  </p>
                </div>

                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Layers size={16} />
                  </div>
                  <h4 className="text-xs font-black text-white">Salvar Produtos no Projeto</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Encontrou um produto no fornecedor? Salve direto para a lista do Gerenciie Pro com 1 toque.
                  </p>
                </div>

                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck size={16} />
                  </div>
                  <h4 className="text-xs font-black text-white">Sincronização de Regras</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Suas regras tributárias, taxas e metas de margem vão com você para qualquer aba.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACCOUNT & LOGIN */}
          {activeTab === 'account' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-blue-500/20">
                      {currentUser?.email ? currentUser.email.substring(0, 2).toUpperCase() : 'GP'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-white">
                          {currentUser?.displayName || currentUser?.name || currentUser?.email || 'Conta Gerenciie Pro'}
                        </h3>
                        <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full text-[9px] font-black uppercase">
                          {currentUser ? 'Conectado' : 'Visitante'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{currentUser?.email || 'Faça login para sincronizar seus dados'}</p>
                    </div>
                  </div>

                  {!currentUser && onOpenAuthModal && (
                    <button
                      onClick={onOpenAuthModal}
                      className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/20"
                    >
                      <LogIn size={14} /> Fazer Login na Plataforma
                    </button>
                  )}
                </div>

                {/* Senha para a extensão */}
                <div className="mt-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <KeyRound size={16} className="text-cyan-400" />
                      Senha para a Extensão
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      A extensão entra com e-mail e senha. Se você criou a conta com o Google, defina uma senha aqui. Se já tem senha, pode trocá-la.
                    </p>
                  </div>

                  {canSetPassword ? (
                    <form onSubmit={handleSetPassword} className="flex flex-col sm:flex-row items-stretch gap-2 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nova senha (mínimo 6 caracteres)"
                        autoComplete="new-password"
                        className="flex-1 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-white text-xs font-bold outline-none"
                      />
                      <button
                        type="submit"
                        disabled={passwordSaving}
                        className="py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                      >
                        <Lock size={14} />
                        <span>{passwordSaving ? 'Salvando...' : 'Salvar Senha'}</span>
                      </button>
                    </form>
                  ) : (
                    <p className="text-xs text-slate-400 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
                      Faça login com sua conta (não como visitante) para definir a senha.
                    </p>
                  )}

                  {passwordMsg && (
                    <p className={`text-xs font-bold ${passwordMsg.ok ? 'text-emerald-400' : 'text-rose-400'}`}>{passwordMsg.text}</p>
                  )}
                </div>

                {/* 3 Steps to Connect */}
                <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-black">1</span>
                    <h5 className="text-xs font-black text-white">Baixe o Pacote (.ZIP)</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Baixe o .ZIP e carregue a pasta em chrome://extensions com o "Modo do desenvolvedor" ligado.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-black">2</span>
                    <h5 className="text-xs font-black text-white">Abra a Extensão</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Clique no ícone do Gerenciie Pro no Chrome. A tela de login aparece logo de início.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-black">3</span>
                    <h5 className="text-xs font-black text-white">Entre com sua Conta</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Use o mesmo e-mail e senha do site. A extensão fica conectada até você sair.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DOWNLOAD */}
          {activeTab === 'download' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                  <Download size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Baixar Extensão Gerenciie Pro</h3>
                  <p className="text-xs text-slate-400 max-w-md mt-1">
                    Pacote pronto com suporte nativo a Manifest V3, script de captura de preço e integração com sua conta.
                  </p>
                </div>

                {downloadSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>Download iniciado! Descompacte o arquivo e carregue em chrome://extensions</span>
                  </div>
                )}

                <button
                  onClick={handleDownloadZip}
                  disabled={isDownloading}
                  className="py-3.5 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <Download size={16} />
                  {isDownloading ? 'Gerando Pacote (.ZIP)...' : 'Baixar Pacote Completo (.ZIP)'}
                </button>

                <div className="flex items-center gap-6 pt-4 text-xs text-slate-400 border-t border-slate-800 w-full justify-center">
                  <span className="flex items-center gap-1.5"><Chrome size={14} className="text-blue-400" /> Google Chrome</span>
                  <span className="flex items-center gap-1.5"><Laptop size={14} className="text-cyan-400" /> Microsoft Edge</span>
                  <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-orange-400" /> Brave / Opera</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TUTORIAL */}
          {activeTab === 'tutorial' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">1</span>
                    <h4 className="text-sm font-black text-white">Descompacte o Arquivo ZIP</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Após baixar o arquivo <code className="bg-black/40 text-cyan-300 px-1.5 py-0.5 rounded">gerenciie-pro-extensao-conectada.zip</code>, clique com o botão direito e selecione <strong>Extrair Tudo</strong> em uma pasta permanente.
                  </p>
                </div>

                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">2</span>
                    <h4 className="text-sm font-black text-white">Acesse chrome://extensions</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    No seu Google Chrome, digite <code className="bg-black/40 text-cyan-300 px-1.5 py-0.5 rounded">chrome://extensions</code> na barra de navegação e pressione Enter.
                  </p>
                </div>

                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">3</span>
                    <h4 className="text-sm font-black text-white">Ative o Modo do Desenvolvedor</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    No canto superior direito da página de extensões, ative o interruptor <strong>"Modo do desenvolvedor"</strong> (Developer Mode).
                  </p>
                </div>

                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">4</span>
                    <h4 className="text-sm font-black text-white">Carregar sem compactação</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Clique no botão <strong>"Carregar sem compactação"</strong> (Load unpacked) no topo esquerdo e selecione a pasta que você descompactou. Pronto!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CODE INSPECTOR */}
          {activeTab === 'code' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {(Object.keys(files) as Array<keyof ExtensionFiles>).map(fileName => (
                    <button
                      key={fileName}
                      onClick={() => setSelectedFile(fileName)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        selectedFile === fileName
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {fileName}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleCopyCode}
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedFile ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedFile ? 'Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-x-auto max-h-[420px]">
                <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre">
                  {files[selectedFile]}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
