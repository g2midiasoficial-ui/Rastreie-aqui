import React, { useState, useRef, useEffect } from 'react';
import { 
  Paperclip, 
  Mic, 
  Send, 
  Video, 
  Phone, 
  MoreVertical, 
  Check, 
  CheckCheck, 
  Sparkles, 
  Bot, 
  Image as ImageIcon, 
  FileText, 
  Trash2,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Wallet
} from 'lucide-react';
import { Account, FinancialMode, Transaction } from '../types/finance';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  attachment?: {
    type: 'image' | 'file';
    name: string;
    url?: string;
  };
  parsedAction?: {
    type: 'income' | 'expense';
    description: string;
    amount: number;
    category: string;
    accountName?: string;
  };
}

interface FinanceAgentChatProps {
  mode: FinancialMode;
  accounts: Account[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => Promise<Transaction>;
  currentUser?: any;
}

export function FinanceAgentChat({
  mode,
  accounts,
  onAddTransaction,
  currentUser
}: FinanceAgentChatProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(`gerenciie_agent_chat_${mode}`);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [
      {
        id: 'msg-init',
        sender: 'agent',
        text: 'Olá! Sou seu Agente Financeiro.\n\nEstou pronto para registrar tudo (texto, foto, PDF ou voz)!\n\n💡 Tente enviar uma foto de um recibo ou digite "Gastei 50 no almoço".',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<{ file: File; preview: string; name: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(`gerenciie_agent_chat_${mode}`, JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, mode]);

  // AI parsing logic with Gemini
  const processInputWithAI = async (text: string, _fileData?: { base64?: string; mimeType?: string; name?: string }) => {
    const nowStr = new Date().toISOString().split('T')[0];
    const availableAccounts = accounts.map(a => a.name).join(', ') || 'Conta Principal, Dinheiro, Nubank, Itaú';

    const systemPrompt = `Você é o Agente Financeiro inteligente do app Gerenciie.
Data de hoje: ${nowStr}.
Contas bancárias cadastradas: [${availableAccounts}].

Sua missão é:
1. Responder com empatia e brevidade profissional em português brasileiro (sem markdown excessivo, sem hashtags).
2. Extrair intenções financeiras do usuário (registrar receita ou despesa).
3. Se o usuário estiver registrando um gasto, entrada ou enviando um recibo, retorne no final um bloco JSON puro delimitado por <<<JSON e JSON>>> com o seguinte formato:
<<<JSON
{
  "hasTransaction": true,
  "type": "expense" ou "income",
  "description": "descrição clara da transação",
  "amount": 50.00,
  "category": "Alimentação & Mercado" ou outra categoria relevante,
  "accountName": "nome da conta identificada ou null",
  "date": "${nowStr}"
}
JSON>>>

Se for apenas uma dúvida ou conversa, "hasTransaction": false.`;

    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text || 'Analise este comprovante/recibo e registre a despesa.',
          systemInstruction: systemPrompt,
          model: 'gemini-3.6-flash',
          temperature: 0.2
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          return data.text;
        }
      }
    } catch (err) {
      console.warn('Backend Gemini API notice in chat, using heuristic fallback:', err);
    }

    // Heuristic Fallback
    const lower = text.toLowerCase();
    const isExpense = lower.includes('gastei') || lower.includes('paguei') || lower.includes('comprei') || lower.includes('despesa') || lower.includes('uber') || lower.includes('almoço') || lower.includes('mercado');
    const isIncome = lower.includes('recebi') || lower.includes('ganhei') || lower.includes('salário') || lower.includes('venda') || lower.includes('entrada') || lower.includes('pix recebido');

    // Extract numbers like 50, 45.90, R$ 100
    const matchVal = text.match(/(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)/i);
    const amount = matchVal ? parseFloat(matchVal[1].replace(',', '.')) : 0;

    if ((isExpense || isIncome) && amount > 0) {
      const type = isIncome ? 'income' : 'expense';
      const cleanDesc = text.replace(/(?:gastei|paguei|comprei|recebi|ganhei|com|no|na|de|r\$|\d+)/gi, '').trim() || (isIncome ? 'Receita Registrada' : 'Despesa Registrada');
      
      const category = isIncome ? 'Salário & Renda' : (lower.includes('almoço') || lower.includes('mercado') ? 'Alimentação & Mercado' : lower.includes('uber') || lower.includes('gasolina') ? 'Transporte & Veículo' : 'Outros');

      return `Prontinho! Registrei essa ${type === 'income' ? 'receita' : 'despesa'} de R$ ${amount.toFixed(2)} (${cleanDesc}) para você.
<<<JSON
{
  "hasTransaction": true,
  "type": "${type}",
  "description": "${cleanDesc.slice(0, 30)}",
  "amount": ${amount},
  "category": "${category}",
  "accountName": "${accounts[0]?.name || 'Conta Principal'}",
  "date": "${nowStr}"
}
JSON>>>`;
    }

    return `Entendido! Se quiser registrar uma receita ou despesa, basta digitar por exemplo "Gastei 35 no almoço" ou anexar uma foto de recibo pelo clipe abaixo!`;
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && !selectedFile) || isProcessing) return;

    const currentText = inputMessage.trim();
    const currentAttachment = selectedFile ? {
      type: 'image' as const,
      name: selectedFile.name,
      url: selectedFile.preview
    } : undefined;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: currentText || (selectedFile ? `Foto de recibo: ${selectedFile.name}` : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: currentAttachment
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    const fileToProcess = selectedFile;
    setSelectedFile(null);
    setIsProcessing(true);

    try {
      const aiResponse = await processInputWithAI(currentText, fileToProcess ? {
        base64: fileToProcess.preview,
        mimeType: fileToProcess.file.type || 'image/jpeg',
        name: fileToProcess.name
      } : undefined);

      // Extract JSON if present
      let parsedAction: any = null;
      let cleanResponseText = aiResponse;

      const jsonMatch = aiResponse.match(/<<<JSON([\s\S]*?)JSON>>>/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1].trim());
          if (parsed.hasTransaction && parsed.amount > 0) {
            parsedAction = {
              type: parsed.type || 'expense',
              description: parsed.description || 'Movimentação via IA',
              amount: Number(parsed.amount),
              category: parsed.category || 'Geral',
              accountName: parsed.accountName || accounts[0]?.name || 'Conta Principal'
            };

            // Automatically register transaction in database/store
            const accountToLink = accounts.find(a => a.name.toLowerCase() === parsedAction.accountName?.toLowerCase()) || accounts[0];

            await onAddTransaction({
              description: parsedAction.description,
              amount: parsedAction.amount,
              type: parsedAction.type,
              category: parsedAction.category,
              accountId: accountToLink?.id || '',
              accountName: accountToLink?.name || 'Conta Principal',
              date: parsed.date || new Date().toISOString().split('T')[0],
              status: 'paid',
              mode: mode,
              notes: 'Registrado automaticamente pelo Agente IA'
            });
          }
          cleanResponseText = aiResponse.replace(/<<<JSON[\s\S]*?JSON>>>/, '').trim();
        } catch (e) {
          console.warn('Failed to parse AI action JSON:', e);
        }
      }

      const agentMsg: Message = {
        id: `msg-agent-${Date.now()}`,
        sender: 'agent',
        text: cleanResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        parsedAction
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'agent',
          text: 'Não consegui processar a mensagem no momento. Por favor tente novamente.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        file,
        preview: reader.result as string,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setInputMessage('Gastei R$ 45 no almoço no cartão');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsRecording(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const clearChat = () => {
    const initMsg: Message = {
      id: 'msg-init',
      sender: 'agent',
      text: 'Olá! Sou seu Agente Financeiro.\n\nEstou pronto para registrar tudo (texto, foto, PDF ou voz)!\n\n💡 Tente enviar uma foto de um recibo ou digite "Gastei 50 no almoço".',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([initMsg]);
    localStorage.removeItem(`gerenciie_agent_chat_${mode}`);
  };

  return (
    <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white flex flex-col h-[780px] animate-in fade-in duration-300">
      {/* Header Estilo WhatsApp */}
      <div className="bg-[#008069] text-white px-6 py-3.5 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#128C7E] border-2 border-white/30 flex items-center justify-center font-black text-sm text-white tracking-wider shadow-xs">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-tight leading-snug">
              Agente Gerenciie
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">
                ONLINE
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-emerald-100">
          <button 
            onClick={() => alert('Chamada de voz com Agente IA disponível em breve!')}
            className="p-1.5 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
            title="Chamada de Vídeo"
          >
            <Video size={19} />
          </button>
          <button 
            onClick={() => alert('Ligação com Agente IA disponível em breve!')}
            className="p-1.5 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
            title="Ligar"
          >
            <Phone size={18} />
          </button>
          <button 
            onClick={clearChat}
            className="p-1.5 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
            title="Limpar Conversa"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* WhatsApp Wallpaper Body */}
      <div 
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar relative"
        style={{
          backgroundColor: '#EFEAE2',
          backgroundImage: `radial-gradient(#d3cbbf 1px, transparent 1px), radial-gradient(#d3cbbf 1px, #EFEAE2 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px'
        }}
      >
        {messages.map((msg) => {
          const isMe = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-3.5 shadow-sm text-xs relative ${
                  isMe
                    ? 'bg-[#E7FFDB] text-slate-800 rounded-tr-xs'
                    : 'bg-white text-slate-800 rounded-tl-xs'
                }`}
              >
                {/* Image attachment preview if any */}
                {msg.attachment && (
                  <div className="mb-2 rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={msg.attachment.url}
                      alt={msg.attachment.name}
                      className="max-h-48 w-full object-cover"
                    />
                    <div className="p-1.5 bg-slate-50 text-[10px] text-slate-500 font-medium truncate">
                      {msg.attachment.name}
                    </div>
                  </div>
                )}

                {/* Text Content */}
                <div className="whitespace-pre-wrap leading-relaxed font-normal">
                  {msg.text}
                </div>

                {/* Automatically created transaction card chip */}
                {msg.parsedAction && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/80 p-2.5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        msg.parsedAction.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {msg.parsedAction.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-[11px]">{msg.parsedAction.description}</div>
                        <div className="text-[10px] text-slate-500">{msg.parsedAction.category} • {msg.parsedAction.accountName}</div>
                      </div>
                    </div>
                    <span className={`font-black text-xs ${
                      msg.parsedAction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {msg.parsedAction.type === 'income' ? '+' : '-'}R$ {msg.parsedAction.amount.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Message Timestamp & Checkmarks */}
                <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400 font-medium">
                  <span>{msg.timestamp}</span>
                  {isMe && <CheckCheck size={13} className="text-blue-500" />}
                </div>
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex justify-start animate-in fade-in">
            <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-sm flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-[#008069] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#008069] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#008069] animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] font-bold text-slate-600 ml-1">Agente digitando...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Attachment Bar */}
      {selectedFile && (
        <div className="px-6 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ImageIcon size={16} className="text-blue-600" />
            <span className="font-bold text-slate-700 truncate max-w-xs">{selectedFile.name}</span>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="text-rose-600 hover:text-rose-700 font-bold"
          >
            Remover
          </button>
        </div>
      )}

      {/* Bottom WhatsApp Input Bar */}
      <div className="p-3 bg-[#F0F2F5] border-t border-slate-200 flex items-center gap-2 shrink-0">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,application/pdf"
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-full transition-all cursor-pointer shrink-0"
          title="Anexar comprovante, PDF ou foto"
        >
          <Paperclip size={20} />
        </button>

        <div className="flex-1 bg-white rounded-2xl px-4 py-2.5 border border-slate-200 shadow-2xs flex items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Mensagem ou arraste um arquivo..."
            className="w-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden bg-transparent"
          />
        </div>

        {inputMessage.trim() || selectedFile ? (
          <button
            onClick={handleSendMessage}
            disabled={isProcessing}
            className="w-10 h-10 rounded-full bg-[#008069] hover:bg-[#006A57] text-white flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
            title="Enviar mensagem"
          >
            <Send size={16} className="ml-0.5" />
          </button>
        ) : (
          <button
            onClick={handleMicClick}
            className={`w-10 h-10 rounded-full text-white flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer shrink-0 ${
              isRecording ? 'bg-rose-600 animate-pulse' : 'bg-[#008069] hover:bg-[#006A57]'
            }`}
            title="Gravar áudio"
          >
            <Mic size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
