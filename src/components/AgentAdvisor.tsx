import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Trash2, 
  Copy, 
  Check, 
  Layers, 
  TrendingUp, 
  DollarSign,
  ShieldCheck,
  Package,
  Activity,
  Wallet,
  Target,
  RefreshCw,
  Zap,
  ShoppingBag,
  CreditCard,
  Building2,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { Platform, PricingData, CalculationResult, CampaignInput } from '../../types.ts';
import { 
  askAgentAssistant, 
  AgentChatMessage, 
  cleanMarkdownSymbols, 
  ComprehensiveBusinessContext 
} from '../../services/geminiService.ts';
import { formatCurrency, getCurrencySymbol } from '../../utils/calculations.ts';

interface AgentAdvisorProps {
  platform: Platform;
  pricingData: PricingData;
  currentResult: CalculationResult;
  savedProducts?: PricingData[];
  planningCampaigns?: CampaignInput[];
  planningHistory?: any[];
  scaleMultiplier?: number;
  scaleResult?: CalculationResult;
  financeStore?: any;
  financialMode?: 'personal' | 'business';
  currentUser?: any;
  setCurrentUser?: (user: any) => void;
  openAuthModal?: () => void;
}

function CleanMessageContent({ text }: { text: string }) {
  const sanitized = cleanMarkdownSymbols(text);
  const lines = sanitized.split('\n');

  return (
    <div className="space-y-2 font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Destaques / Dicas (e.g. 💡 Dica..., 🚀 Estratégia..., 📌 Diretrizes...)
        if (trimmed.startsWith('💡') || trimmed.startsWith('📌') || trimmed.startsWith('🚨') || trimmed.startsWith('✅')) {
          return (
            <div key={idx} className="p-3 my-2 rounded-xl bg-blue-50/90 border border-blue-200/80 text-blue-950 font-medium text-xs leading-relaxed shadow-xs">
              {trimmed}
            </div>
          );
        }

        // Títulos de Seções (e.g. 1. PRODUTO..., 2. SAÚDE..., ou numeração)
        const isNumberedTitle = /^[0-9]+\.\s+/.test(trimmed) && trimmed.length < 90 && !trimmed.includes('•');
        if (isNumberedTitle) {
          return (
            <div key={idx} className="pt-2 pb-0.5 font-extrabold text-slate-900 tracking-tight text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 inline-block"></span>
              <span className="uppercase">{trimmed}</span>
            </div>
          );
        }

        // Bullet point lines (• ou -)
        if (trimmed.startsWith('•') || trimmed.startsWith('- ')) {
          const bulletContent = trimmed.replace(/^[•\-]\s*/, '');
          const colonIndex = bulletContent.indexOf(':');
          
          if (colonIndex > 0 && colonIndex < 40) {
            const label = bulletContent.slice(0, colonIndex + 1);
            const rest = bulletContent.slice(colonIndex + 1);
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 text-xs leading-relaxed">
                <span className="text-blue-600 font-bold shrink-0 mt-0.5">•</span>
                <div>
                  <span className="font-extrabold text-slate-900">{label}</span>
                  <span className="text-slate-700">{rest}</span>
                </div>
              </div>
            );
          }

          return (
            <div key={idx} className="flex items-start gap-2 pl-1 text-xs leading-relaxed text-slate-700">
              <span className="text-blue-600 font-bold shrink-0 mt-0.5">•</span>
              <span>{bulletContent}</span>
            </div>
          );
        }

        // Linha regular
        return (
          <p key={idx} className="text-xs leading-relaxed text-slate-800 font-normal">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

export function AgentAdvisor({
  platform,
  pricingData,
  currentResult,
  savedProducts = [],
  planningCampaigns = [],
  planningHistory = [],
  scaleMultiplier = 2,
  scaleResult,
  financeStore,
  financialMode = 'business',
  currentUser
}: AgentAdvisorProps) {
  const currentSymbol = getCurrencySymbol(pricingData.currency);

  // Financial summary metrics
  const totalBalance = useMemo(() => {
    return (financeStore?.accounts || []).reduce((acc: number, a: any) => acc + (Number(a.balance) || 0), 0);
  }, [financeStore?.accounts]);

  const activeCampaigns = useMemo(() => {
    return planningCampaigns.filter(c => c.active !== false);
  }, [planningCampaigns]);

  const totalAdsSpend = useMemo(() => {
    return activeCampaigns.reduce((sum, c) => sum + (Number(c.spend) || 0), 0);
  }, [activeCampaigns]);

  const totalSalesFromAds = useMemo(() => {
    return activeCampaigns.reduce((sum, c) => sum + (Number(c.sales) || 0), 0);
  }, [activeCampaigns]);

  const realCpa = totalSalesFromAds > 0 ? totalAdsSpend / totalSalesFromAds : 0;

  // Build complete business context object
  const fullContext: ComprehensiveBusinessContext = useMemo(() => {
    return {
      platform,
      pricingData,
      result: currentResult,
      savedProducts,
      planningCampaigns,
      planningHistory,
      scaleMultiplier,
      scaleResult,
      financialMetrics: financeStore?.metrics,
      accounts: financeStore?.accounts || [],
      transactions: financeStore?.transactions || [],
      debts: financeStore?.debts || [],
      goals: financeStore?.goals || [],
      categories: financeStore?.categories || [],
      vehicles: financeStore?.vehicles || [],
      financialMode,
      userName: currentUser?.displayName,
      userEmail: currentUser?.email
    };
  }, [
    platform,
    pricingData,
    currentResult,
    savedProducts,
    planningCampaigns,
    planningHistory,
    scaleMultiplier,
    scaleResult,
    financeStore,
    financialMode,
    currentUser
  ]);

  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      category: 'general',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `👋 Olá! Sou o Gerenciie CFO AI, seu Diretor Financeiro e Estrategista Chefe com VISÃO 360° TOTALMENTE CONECTADA.

Já puxei e cruzei todas as informações da sua operação em tempo real:
• E-commerce & Precificação: "${pricingData?.productName || 'Produto Atual'}" (${platform}) | Preço: ${currentSymbol} ${(Number(currentResult?.finalPrice) || 0).toFixed(2)} | Margem Líquida: ${(Number(currentResult?.marginPercent) || 0).toFixed(1)}% | Lucro: ${currentSymbol} ${(Number(currentResult?.profit) || 0).toFixed(2)}/un
• Tráfego Pago & Ads: Breakeven CPA Máximo de ${currentSymbol} ${(Number(currentResult?.maxCPA) || 0).toFixed(2)} | ${activeCampaigns.length} campanhas ativas no simulador
• Gestão Financeira Global: Saldo Consolidado em Contas de ${currentSymbol} ${(Number(totalBalance) || 0).toFixed(2)} | ${(financeStore?.accounts || []).length} contas bancárias conectadas

Estou pronto para auditar seu negócio, criar ofertas irresistíveis ou responder qualquer dúvida estratégica. O que deseja analisar agora?`
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string, category: 'offer' | 'question' | 'audit' | 'general' = 'general') => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: AgentChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      category,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const responseText = await askAgentAssistant({
        userMessage: text,
        mode: category,
        context: fullContext,
        history: historyPayload
      });

      const assistantMsg: AgentChatMessage = {
        id: 'msg_ai_' + Date.now(),
        role: 'assistant',
        content: responseText,
        category,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Error contacting CFO agent:', err);
      const errorMsg: AgentChatMessage = {
        id: 'msg_err_' + Date.now(),
        role: 'assistant',
        content: `Ocorreu uma instabilidade na consulta. Mas com base nos seus números atuais: Margem de ${(Number(currentResult?.marginPercent) || 0).toFixed(1)}% e Breakeven CPA de ${currentSymbol} ${(Number(currentResult?.maxCPA) || 0).toFixed(2)}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome_reset',
        role: 'assistant',
        category: 'general',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `Chat reiniciado. O CFO AI continua conectado com a visão 360° dos seus produtos, campanhas e finanças. Como posso ajudar?`
      }
    ]);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
      {/* 360° Live Dashboard Header Badge */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-[32px] p-6 text-white shadow-lg border border-slate-700/60 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Bot size={20} />
              </div>
              <h1 className="text-2xl md:text-3xl font-black italic tracking-tight">
                Agente CFO IA • Visão Panorâmica 360°
              </h1>
            </div>
            <p className="text-slate-300 text-xs font-semibold max-w-2xl">
              Diretor Financeiro autônomo conectado a 100% dos dados: Precificação, Tráfego Pago (Ads), DRE, Contas Bancárias, Dívidas e Metas.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-[11px] font-bold text-emerald-300">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Todos os dados sincronizados em tempo real</span>
          </div>
        </div>

        {/* 4 Connected Context Snapshot Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          {/* 1. Produto & Margem */}
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-extrabold uppercase">
              <span className="truncate">🛍 PRODUTO ATIVO</span>
              <Package size={13} className="text-blue-400" />
            </div>
            <p className="text-sm font-black text-white mt-1 truncate">
              {pricingData?.productName || 'Produto Atual'}
            </p>
            <p className="text-[10px] font-bold text-emerald-400 mt-0.5">
              Margem: {(Number(currentResult?.marginPercent) || 0).toFixed(1)}% ({currentSymbol} {(Number(currentResult?.profit) || 0).toFixed(2)}/un)
            </p>
          </div>

          {/* 2. Tráfego & Breakeven */}
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-extrabold uppercase">
              <span>📢 ADS & BREAKEVEN</span>
              <Activity size={13} className="text-amber-400" />
            </div>
            <p className="text-sm font-black text-white mt-1">
              Max CPA: {currentSymbol} {(Number(currentResult?.maxCPA) || 0).toFixed(2)}
            </p>
            <p className="text-[10px] font-bold text-slate-300 mt-0.5 truncate">
              {activeCampaigns.length} campanhas ({currentSymbol} {(Number(totalAdsSpend) || 0).toFixed(0)} investido)
            </p>
          </div>

          {/* 3. Saldo em Contas */}
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-extrabold uppercase">
              <span>🏦 CAIXA CONSOLIDADO</span>
              <Wallet size={13} className="text-emerald-400" />
            </div>
            <p className="text-sm font-black text-emerald-400 mt-1">
              {currentSymbol} {(Number(totalBalance) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] font-bold text-slate-300 mt-0.5">
              {(financeStore?.accounts || []).length} contas cadastradas
            </p>
          </div>

          {/* 4. DRE Projetado */}
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-extrabold uppercase">
              <span>⚖️ DRE MENSAL</span>
              <TrendingUp size={13} className="text-purple-400" />
            </div>
            <p className="text-sm font-black text-white mt-1">
              {currentSymbol} {(Number(currentResult?.monthlyProfitProjection) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] font-bold text-purple-300 mt-0.5">
              {pricingData?.estimatedMonthlySales || 0} vendas projetadas
            </p>
          </div>
        </div>
      </div>

      {/* Quick 1-Click CFO Audit Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <button
          onClick={() => handleSendMessage("Faça uma auditoria financeira completa 360° do meu negócio cruzando precificação, limite de CPA do tráfego, saldo em contas bancárias, contas a pagar e esteira de produtos.", "audit")}
          disabled={isLoading}
          className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl text-left shadow-xs transition-all hover:border-blue-400 group cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full">
            <span className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              🔍
            </span>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="mt-2">
            <p className="text-xs font-black text-slate-900">Auditoria Raio-X 360°</p>
            <p className="text-[10px] text-slate-500 font-medium">Diagnóstico executivo de ponta a ponta</p>
          </div>
        </button>

        <button
          onClick={() => handleSendMessage("Analise minhas campanhas de Ads atuais e verifique se o CPA real e os custos de tráfego estão saudáveis comparados ao meu Breakeven CPA.", "question")}
          disabled={isLoading}
          className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl text-left shadow-xs transition-all hover:border-blue-400 group cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full">
            <span className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              📢
            </span>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
          <div className="mt-2">
            <p className="text-xs font-black text-slate-900">Tráfego vs Breakeven CPA</p>
            <p className="text-[10px] text-slate-500 font-medium">Verificar risco de prejuízo em Ads</p>
          </div>
        </button>

        <button
          onClick={() => handleSendMessage("Crie uma estratégia de oferta irresistível para o meu produto ativo, incluindo Kit 2 unidades, Kit 3 unidades e Order Bump com preços e margens calculadas.", "offer")}
          disabled={isLoading}
          className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl text-left shadow-xs transition-all hover:border-blue-400 group cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full">
            <span className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              🚀
            </span>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="mt-2">
            <p className="text-xs font-black text-slate-900">Gerador de Kits & Ofertas</p>
            <p className="text-[10px] text-slate-500 font-medium">Multiplicar ticket médio e margem</p>
          </div>
        </button>

        <button
          onClick={() => handleSendMessage("Com base no meu saldo bancário atual, contas pendentes e margens de venda, qual é a recomendação de fluxo de caixa para os próximos 30 dias?", "question")}
          disabled={isLoading}
          className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl text-left shadow-xs transition-all hover:border-blue-400 group cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full">
            <span className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              💰
            </span>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-purple-600 transition-colors" />
          </div>
          <div className="mt-2">
            <p className="text-xs font-black text-slate-900">Saúde de Caixa & Liquidez</p>
            <p className="text-[10px] text-slate-500 font-medium">Controle de contas a pagar e reservas</p>
          </div>
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-[32px] border border-slate-200/90 shadow-sm flex flex-col overflow-hidden min-h-[560px]">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Conversa com Gerenciie CFO AI</h3>
              <p className="text-[10px] font-bold text-slate-500">
                Modelo: Gemini 3.8 Flash • Contexto 360° Ativo
              </p>
            </div>
          </div>

          <button
            onClick={clearChat}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
            title="Limpar Conversa"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Limpar</span>
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[500px] custom-scrollbar bg-gradient-to-b from-slate-50/30 to-white">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    <Bot size={16} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4.5 shadow-xs ${
                    isUser
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-white border border-slate-200/90 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-slate-100/60">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isUser ? 'text-blue-100' : 'text-blue-600'}`}>
                      {isUser ? 'Você' : 'Gerenciie CFO AI'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
                        {m.timestamp}
                      </span>
                      {!isUser && (
                        <button
                          onClick={() => copyToClipboard(m.id, m.content)}
                          className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                          title="Copiar resposta"
                        >
                          {copiedId === m.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {isUser ? (
                    <p className="text-xs whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  ) : (
                    <CleanMessageContent text={m.content} />
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center gap-3">
                <RefreshCw size={16} className="text-blue-600 animate-spin" />
                <span className="text-xs font-bold text-slate-600">
                  CFO AI cruzando todas as informações e analisando finanças...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-blue-500 focus-within:bg-white transition-all shadow-xs"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Pergunte ao CFO AI (ex: 'Como aumentar o lucro do produto?', 'Posso subir R$ 500 no Ads hoje?', 'Audite meu caixa')"
              disabled={isLoading}
              className="flex-1 bg-transparent border-none text-xs font-bold text-slate-900 placeholder:text-slate-400 px-3 py-1.5 focus:outline-hidden focus:ring-0"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 shrink-0"
            >
              <span>Enviar</span>
              <Send size={13} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
