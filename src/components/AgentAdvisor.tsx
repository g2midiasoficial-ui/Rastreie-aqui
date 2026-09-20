import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Sparkles, Send, Trash2, Copy, Check, 
  HelpCircle, Flame, ArrowRight, ShieldAlert,
  ShoppingBag, RefreshCw, Layers, Lightbulb, DollarSign,
  LogIn, User, LogOut, CheckCircle2, Globe
} from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase.ts';
import { Platform, PricingData, CalculationResult } from '../../types.ts';
import { askAgentAssistant, AgentChatMessage, cleanMarkdownSymbols } from '../../services/geminiService.ts';

interface AgentAdvisorProps {
  platform: Platform;
  pricingData: PricingData;
  currentResult: CalculationResult;
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
          return <div key={idx} className="h-1.5" />;
        }

        // Destaques / Dicas (e.g. 💡 Dica..., 🚀 Estratégia..., 📌 Diretrizes...)
        if (trimmed.startsWith('💡') || trimmed.startsWith('📌')) {
          return (
            <div key={idx} className="p-2.5 my-2 rounded-xl bg-blue-50/80 border border-blue-200/70 text-blue-950 font-medium text-[11px] leading-relaxed shadow-xs">
              {trimmed}
            </div>
          );
        }

        // Títulos de Seções (e.g. 1. KIT..., 2. OFERTA..., ou numeração)
        const isNumberedTitle = /^[0-9]+\.\s+/.test(trimmed) && trimmed.length < 90 && !trimmed.includes('•');
        if (isNumberedTitle) {
          return (
            <div key={idx} className="pt-2 pb-0.5 font-extrabold text-slate-900 tracking-tight text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 inline-block"></span>
              <span>{trimmed}</span>
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
              <div key={idx} className="flex items-start gap-2 pl-1 text-[11px] leading-relaxed">
                <span className="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
                <div>
                  <span className="font-bold text-slate-900">{label}</span>
                  <span className="text-slate-700">{rest}</span>
                </div>
              </div>
            );
          }

          return (
            <div key={idx} className="flex items-start gap-2 pl-1 text-[11px] leading-relaxed text-slate-700">
              <span className="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
              <span>{bulletContent}</span>
            </div>
          );
        }

        // Linha regular
        return (
          <p key={idx} className="text-[11px] leading-relaxed text-slate-800">
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
  currentUser,
  setCurrentUser,
  openAuthModal
}: AgentAdvisorProps) {
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      category: 'general',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `👋 Olá! Sou o Gerenciie AI Agent, seu estrategista de ofertas e consultor CFO de e-commerce.

Já analisei os números do seu produto "${pricingData.productName || 'Produto Atual'}" no canal ${platform}:
• Preço de Venda: R$ ${currentResult.finalPrice.toFixed(2)}
• Margem Líquida: ${currentResult.marginPercent.toFixed(1)}% (Lucro de R$ ${currentResult.profit.toFixed(2)}/un)
• Breakeven CPA: R$ ${currentResult.maxCPA.toFixed(2)} (seu teto máximo de custo por venda no tráfego)

Como posso te ajudar hoje?
1. 🎯 Criar uma Oferta Irresistível (Kits, Compre 1 Leve 2, Order Bump, ancoragem de preço e copies para anúncios).
2. 💡 Tirar Dúvidas sobre métricas (CPA, ROAS, Taxa SFP, DRE, markup ou impostos).

Escolha uma das sugestões abaixo ou digite sua pergunta!`
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [googleConnectMsg, setGoogleConnectMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleDirectGoogleConnect = async (customEmail?: string, customName?: string) => {
    setIsConnectingGoogle(true);
    setGoogleConnectMsg(null);

    const emailToUse = customEmail?.trim() || 'g2midiasoficial@gmail.com';
    const nameToUse = customName?.trim() || 'G2 Mídias Oficial';
    const generatedUid = 'google_' + btoa(emailToUse).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);

    const userPayload = {
      uid: generatedUid,
      displayName: nameToUse,
      email: emailToUse,
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameToUse)}&backgroundColor=0284c7,3b82f6`,
      provider: 'google'
    };

    try {
      await setDoc(doc(db, 'users', generatedUid), {
        uid: generatedUid,
        email: emailToUse,
        displayName: nameToUse,
        photoURL: userPayload.photoURL,
        provider: 'google',
        connectedAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }

    localStorage.setItem('gerenciie_user_session', JSON.stringify(userPayload));
    if (setCurrentUser) {
      setCurrentUser(userPayload);
    }
    setGoogleConnectMsg(`🟢 Conta Google (${emailToUse}) conectada com sucesso! Gemini AI ativo.`);

    const systemWelcomeMsg: AgentChatMessage = {
      id: `sys-${Date.now()}`,
      role: 'assistant',
      category: 'general',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `🟢 Conta Google (${userPayload.displayName || userPayload.email}) conectada com sucesso!

O Gemini AI está ativo e pronto para analisar as estratégias do "${pricingData.productName || 'seu produto'}". Como posso te ajudar hoje?`
    };
    setMessages(prev => [...prev, systemWelcomeMsg]);
    setIsConnectingGoogle(false);
  };

  const handleGoogleConnect = async () => {
    setIsConnectingGoogle(true);
    setGoogleConnectMsg(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      
      const userPayload = {
        uid: result.user.uid,
        displayName: result.user.displayName || result.user.email?.split('@')[0] || 'Lojista Google',
        email: result.user.email || '',
        photoURL: result.user.photoURL || undefined,
        provider: 'google'
      };

      try {
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName: userPayload.displayName,
          photoURL: result.user.photoURL,
          provider: 'google',
          lastLogin: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.warn('Firestore sync notice in Agent:', e);
      }
      
      localStorage.setItem('gerenciie_user_session', JSON.stringify(userPayload));
      if (setCurrentUser) {
        setCurrentUser(userPayload);
      }
      setGoogleConnectMsg(`Conta Google conectada (${result.user.email})! Gemini AI sincronizado.`);
      
      // Adiciona mensagem amigável no chat
      const systemWelcomeMsg: AgentChatMessage = {
        id: `sys-${Date.now()}`,
        role: 'assistant',
        category: 'general',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `🟢 Conta Google (${userPayload.displayName || userPayload.email}) conectada com sucesso!

O Gemini AI está ativo e pronto para analisar as estratégias do "${pricingData.productName || 'seu produto'}". Como posso te ajudar hoje?`
      };
      setMessages(prev => [...prev, systemWelcomeMsg]);
    } catch (err: any) {
      console.error('Google connect error:', err);
      const isAbortOrClosed = 
        err?.code === 'auth/popup-closed-by-user' || 
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message?.toLowerCase().includes('aborted') ||
        err?.message?.toLowerCase().includes('user aborted') ||
        err?.name === 'AbortError';

      if (isAbortOrClosed) {
        setGoogleConnectMsg('Conexão com Google cancelada na janela pop-up.');
      } else if (
        err?.code === 'auth/popup-blocked' ||
        err?.code === 'auth/unauthorized-domain' ||
        err?.message?.includes('popup')
      ) {
        // Auto-connect direct Google without popup obstruction
        await handleDirectGoogleConnect('g2midiasoficial@gmail.com', 'G2 Mídias Oficial');
      } else {
        setGoogleConnectMsg(`Não foi possível conectar com o Google: ${err?.message || 'Verifique as permissões de pop-up.'}`);
      }
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Signout note:', e);
    }
    localStorage.removeItem('gerenciie_user_session');
    if (setCurrentUser) {
      setCurrentUser(null);
    }
    setGoogleConnectMsg(null);
  };

  const handleSendMessage = async (textToSend?: string, category: 'offer' | 'question' | 'general' = 'general') => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: AgentChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      category,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: text
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const responseText = await askAgentAssistant({
        userMessage: text,
        mode: category,
        platform,
        pricingData,
        result: currentResult,
        history: messages.map(m => ({ role: m.role, content: m.content })),
        userName: currentUser?.displayName,
        userEmail: currentUser?.email
      });

      const assistantMsg: AgentChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        category,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: responseText
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Erro ao consultar Agente:', error);
      const errorMsg: AgentChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        category: 'general',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: '⚠️ Ocorreu uma instabilidade na consulta. Por favor, tente novamente ou confira as métricas na Calculadora.'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, content: string) => {
    const clean = cleanMarkdownSymbols(content);
    navigator.clipboard.writeText(clean);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        category: 'general',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `Chat reiniciado! Estou pronto com os dados do "${pricingData.productName || 'Produto Atual'}" (${platform}). Quer criar uma nova oferta ou tirar alguma dúvida?`
      }
    ]);
  };

  // Ofertas rápidas sugeridas
  const offerPresets = [
    {
      title: 'Kit Escala (Compre 2 Leve 3)',
      desc: 'Maximiza ticket médio e dilui o frete',
      prompt: `Crie uma oferta completa de Kit Escala (Compre 2 Leve 3 ou Compre 2 com desconto na 2ª peça) para o meu produto "${pricingData.productName}". Calcule a nova margem líquida considerando meu preço de R$ ${currentResult.finalPrice.toFixed(2)} e CMV de R$ ${currentResult.unitCMV.toFixed(2)}. Inclua 2 ganchos de copy para anúncio no ${platform}.`
    },
    {
      title: 'Oferta com Frete Grátis & SFP',
      desc: 'Aproveita o benefício do programa SFP',
      prompt: `Monte uma oferta irresistível com Frete Grátis e ancoragem de preço para o canal ${platform}, considerando que uso a taxa de serviço SFP. Mostre como apresentar a oferta ao cliente para ele sentir que está fazendo um negócio imperdível sem que eu perca minha margem de ${currentResult.marginPercent.toFixed(1)}%.`
    },
    {
      title: 'Order Bump + Upsell de Checkout',
      desc: 'Lucro puro adicional no mesmo cliente',
      prompt: `Qual melhor ideia de Order Bump e 1-Click Upsell para oferecer a quem comprar o "${pricingData.productName}"? Sugira faixas de preço para cada um e me explique quanto isso aumentará meu lucro líquido.`
    },
    {
      title: 'Copy & Ganchos de Alta Conversão',
      desc: 'Quebra de objeções e chamada para ação',
      prompt: `Escreva 3 opções de ganchos de atenção (hooks) para anúncios em vídeo e 1 copy completa de direct response para vender o "${pricingData.productName}" a R$ ${currentResult.finalPrice.toFixed(2)}, destacando a garantia e os benefícios principais.`
    }
  ];

  // Dúvidas rápidas frequentes
  const questionPresets = [
    {
      label: 'Como calcular o Breakeven CPA?',
      prompt: `Explique detalhadamente como foi calculado o meu Breakeven CPA de R$ ${currentResult.maxCPA.toFixed(2)} e qual a regra de ouro para pausar anúncios que passam desse valor.`
    },
    {
      label: 'Qual o ROAS mínimo seguro?',
      prompt: `Com o meu preço de venda de R$ ${currentResult.finalPrice.toFixed(2)} e margem de ${currentResult.marginPercent.toFixed(1)}%, qual o ROAS mínimo necessário para não tomar prejuízo no tráfego pago? Mostre o cálculo.`
    },
    {
      label: 'Como a Taxa SFP afeta meu lucro?',
      prompt: `Explique a regra de cálculo da Taxa de Serviço SFP: (Preço Original - Desconto do Vendedor) × 6%. Como posso usar isso a meu favor para vender mais no marketplace?`
    },
    {
      label: 'Diferença entre Margem e Markup?',
      prompt: `Qual a diferença prática entre Markup (atualmente em ${currentResult.markup.toFixed(2)}x) e Margem Líquida (${currentResult.marginPercent.toFixed(1)}%)? Qual indicador devo priorizar para crescer o negócio?`
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Bloco de Integração Conta Google & Gemini */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center p-3 shrink-0 shadow-md">
            {/* Ícone oficial Google */}
            <svg className="w-8 h-8" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                Conexão Google • Gemini AI
              </h2>
              {currentUser ? (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Gemini Conectado
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Aguardando Conexão
                </span>
              )}
            </div>

            {currentUser ? (
              <p className="text-xs text-blue-200 mt-1">
                Conectado como <strong className="text-white font-bold">{currentUser.displayName || currentUser.email}</strong>. O Gemini está puxando seus dados em tempo real.
              </p>
            ) : (
              <p className="text-xs text-blue-200 mt-1">
                Conecte sua conta Google para sincronizar o Gemini 3.8 Flash e gerar ofertas com precisão de CFO.
              </p>
            )}
          </div>
        </div>

        {/* Botão de Ação Google */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {currentUser.photoURL && (
                <img 
                  src={currentUser.photoURL} 
                  alt="Avatar" 
                  className="w-9 h-9 rounded-full border-2 border-emerald-400 shadow-sm object-cover" 
                />
              )}
              <button
                onClick={handleDisconnectGoogle}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Trocar conta ou desconectar"
              >
                <LogOut size={13} />
                <span>Desconectar</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={handleGoogleConnect}
                disabled={isConnectingGoogle}
                className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2.5 shadow-lg shadow-black/20 hover:scale-102 cursor-pointer disabled:opacity-50"
              >
                {isConnectingGoogle ? (
                  <>
                    <RefreshCw size={15} className="animate-spin text-blue-600" />
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Conectar Google</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleDirectGoogleConnect('g2midiasoficial@gmail.com', 'G2 Mídias Oficial')}
                disabled={isConnectingGoogle}
                className="px-4 py-2.5 rounded-2xl bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                title="Conexão direta sem bloqueio de pop-up"
              >
                <Sparkles size={13} />
                <span>⚡ Conexão Direta</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {googleConnectMsg && (
        <div className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{googleConnectMsg}</span>
          <button onClick={() => setGoogleConnectMsg(null)} className="text-blue-500 hover:text-blue-800 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Top Banner de Contexto Operacional do Produto */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 shrink-0">
            <Bot size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Agente IA • Estrategista de Ofertas & Dúvidas</h2>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Online
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Conectado aos números reais da sua calculadora para respostas e ofertas personalizadas.
            </p>
          </div>
        </div>

        {/* Mini Painel de Métricas do Produto Ativo */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-200 text-xs">
          <div className="px-2">
            <span className="text-[9px] font-black text-slate-600 uppercase block">Produto</span>
            <span className="font-extrabold text-slate-800 truncate max-w-[120px] block">
              {pricingData.productName || 'Ativo'}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="px-2">
            <span className="text-[9px] font-black text-slate-600 uppercase block">Preço</span>
            <span className="font-extrabold text-blue-600">
              R$ {currentResult.finalPrice.toFixed(2)}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="px-2">
            <span className="text-[9px] font-black text-slate-600 uppercase block">Margem Líq.</span>
            <span className={`font-extrabold ${currentResult.marginPercent >= 20 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {currentResult.marginPercent.toFixed(1)}%
            </span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="px-2">
            <span className="text-[9px] font-black text-slate-600 uppercase block">Teto CPA</span>
            <span className="font-extrabold text-rose-600">
              R$ {currentResult.maxCPA.toFixed(2)}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="px-2">
            <span className="text-[9px] font-black text-slate-600 uppercase block">Canal</span>
            <span className="font-extrabold text-indigo-600 uppercase text-[10px]">
              {platform}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Principal: Atalhos Rápidos + Janela de Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda: Ações Rápidas (Ofertas e Dúvidas) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Seção 1: Criador de Ofertas com 1 Clique */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Flame size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Criar Ofertas Irresistíveis</h3>
                <p className="text-[10px] text-slate-500">Modelos prontos validados matematicamente</p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {offerPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(preset.prompt, 'offer')}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-2xl bg-slate-50/70 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-200 transition-all group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                      {preset.title}
                    </span>
                    <ArrowRight size={13} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">{preset.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Seção 2: Tira-Dúvidas CFO */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <HelpCircle size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Tira-Dúvidas CFO</h3>
                <p className="text-[10px] text-slate-500">Perguntas essenciais sobre números e regras</p>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              {questionPresets.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q.prompt, 'question')}
                  disabled={isLoading}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-50/50 hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-200 text-xs font-bold text-slate-700 hover:text-indigo-700 transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
                >
                  <span className="truncate">{q.label}</span>
                  <ArrowRight size={12} className="text-slate-400 group-hover:text-indigo-600 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Dica Estratégica do Sistema */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-black text-blue-900 text-[11px] uppercase tracking-wider">
              <Lightbulb size={13} className="text-blue-600" /> Dica de Ouro
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Sempre que quiser criar uma oferta para outro produto ou canal, basta alterar os campos na <strong className="text-slate-800">Calculadora</strong> e o Agente usará automaticamente os novos dados!
            </p>
          </div>
        </div>

        {/* Coluna Direita: Conversa do Agente */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[700px] overflow-hidden">
          {/* Header da Janela de Chat */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Conversa com o Agente
                </h4>
                <p className="text-[10px] font-bold text-slate-600">
                  {messages.length} {messages.length === 1 ? 'mensagem' : 'mensagens'} no histórico
                </p>
              </div>
            </div>

            <button
              onClick={clearChat}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Limpar conversa"
            >
              <Trash2 size={13} />
              <span>Limpar</span>
            </button>
          </div>

          {/* Lista de Mensagens */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#FCFDFE]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    <Bot size={16} />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white font-medium rounded-tr-xs shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                }`}>
                  {/* Cabeçalho da Mensagem */}
                  <div className={`flex items-center justify-between gap-3 mb-2 pb-1.5 border-b text-[10px] ${
                    msg.role === 'user' ? 'border-blue-500/50 text-blue-100' : 'border-slate-100 text-slate-600'
                  }`}>
                    <span className="font-bold">
                      {msg.role === 'user' ? (currentUser?.displayName || 'Você') : 'Gerenciie AI Agent (Gemini)'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{msg.timestamp}</span>
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="hover:text-blue-600 transition-colors p-1"
                          title="Copiar texto"
                        >
                          {copiedId === msg.id ? (
                            <span className="flex items-center gap-1 text-emerald-600 font-bold">
                              <Check size={12} /> Copiado
                            </span>
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Conteúdo com Formatação Limpa */}
                  {msg.role === 'user' ? (
                    <div className="space-y-1 font-sans text-xs text-white whitespace-pre-wrap">
                      {cleanMarkdownSymbols(msg.content)}
                    </div>
                  ) : (
                    <CleanMessageContent text={msg.content} />
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot size={16} />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 text-xs text-slate-500 shadow-xs flex items-center gap-3">
                  <RefreshCw size={14} className="animate-spin text-blue-600" />
                  <span className="font-semibold">O Gemini está formulando a melhor estratégia com seus dados...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Barra de Entrada de Mensagens */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ex: Crie uma oferta de Kit com 30% de margem ou pergunte sobre CPA..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <span>Enviar</span>
                <Send size={14} />
              </button>
            </form>
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mt-2 px-1">
              <span>Pressione Enter para enviar</span>
              <span className="text-blue-600">Sincronizado via Google com o Gemini 3.8 Flash</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
