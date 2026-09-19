
import { GoogleGenAI } from "@google/genai";
import { PricingData, CalculationResult, Platform } from "../types.ts";

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  category?: 'offer' | 'question' | 'general';
}

export function cleanMarkdownSymbols(text: string): string {
  if (!text) return '';
  return text
    // Remove patterns like #*, *#, ###*, etc.
    .replace(/[#*]+/g, (match) => {
      // If it's just markdown formatting, strip it
      return '';
    })
    // Remove leading markdown header hashes like ###, ##, # at the start of lines
    .replace(/^#{1,6}\s*/gm, '')
    // Remove any stray hashes
    .replace(/#/g, '')
    // Clean up unnecessary multi-spaces but preserve linebreaks
    .split('\n')
    .map(line => line.replace(/[ \t]{2,}/g, ' ').trimEnd())
    .join('\n')
    .trim();
}

export const getAIAnalysis = async (
  platform: Platform,
  data: PricingData,
  result: CalculationResult
) => {
  const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || 
                 (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || "";

  if (!apiKey) {
    return `📊 Parecer CFO Executivo:
• Viabilidade: Operação com Margem Líquida projetada em ${result.marginPercent.toFixed(1)}%.
• Limite de Tráfego: Seu Breakeven CPA máximo é R$ ${result.maxCPA.toFixed(2)}. Não ultrapasse esse custo por aquisição.
• Lucro Unitário: R$ ${result.profit.toFixed(2)} por pedido entregue.
• Recomendação: Monitore o CPA real diário na Bússola de Métricas para assegurar rentabilidade líquida.`;
  }
  
  const prompt = `
    Aja como um CFO (Diretor Financeiro) especialista em E-commerce e Dropshipping. 
    Analise os dados financeiros abaixo para o canal ${platform} e forneça um parecer executivo.

    DADOS UNITÁRIOS:
    - Preço de Venda: R$ ${result.finalPrice.toFixed(2)}
    - Custo de Aquisição Produto (FOB + Frete In): R$ ${data.costPrice.toFixed(2)}
    - Markup Aplicado: ${result.markup}x
    
    ESTRUTURA DE CUSTOS VARIÁVEIS:
    - Impostos: ${data.taxPercent}%
    - Marketing (Budget): ${data.marketingPercent}% (CPA Alocado: R$ ${result.marketingCost.toFixed(2)})
    - Imposto s/ Ads: ${data.adsTaxPercent}%
    
    MÉTRICAS DE PERFORMANCE:
    - Lucro Líquido Unitário: R$ ${result.profit.toFixed(2)}
    - Margem Líquida: ${result.marginPercent.toFixed(2)}%
    - ROI: ${result.roi.toFixed(1)}%
    - CPA de Equilíbrio (Breakeven CPA): R$ ${result.maxCPA.toFixed(2)}
    - Projeção Lucro Mensal (${data.estimatedMonthlySales} vendas): R$ ${result.monthlyProfitProjection.toFixed(2)}

    REQUISITOS DA RESPOSTA:
    1. Diagnóstico de Viabilidade (Escalável, Sustentável ou Risco).
    2. Análise do ROAS Mínimo necessário para este lucro.
    3. Ponto de atenção: Identifique o maior gargalo (ex: impostos altos ou markup baixo).
    4. Estratégia Recomendada (ex: aumentar ticket médio, negociar frete ou trocar de canal).
    
    REGRA OBRIGATÓRIA: NÃO use caracteres markdown como hashtags (#, ##, ###) nem asteriscos (* ou **) ou (#*). Use texto limpo com marcadores '•' e numeração simples. Responda em Português.
  `;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });
    return cleanMarkdownSymbols(response.text || "Análise concluída com sucesso.");
  } catch (error: any) {
    if (error?.name === 'AbortError' || error?.message?.includes('abort')) {
      return "Consulta finalizada.";
    }
    console.warn("Gemini Notice:", error?.message || error);
    return `📊 Parecer CFO Gerenciie:
• Margem Líquida Atual: ${result.marginPercent.toFixed(1)}%
• Breakeven CPA: R$ ${result.maxCPA.toFixed(2)}
• Estratégia: Otimize os criativos para manter o custo por conversão estritamente abaixo do CPA máximo.`;
  }
};

export const askAgentAssistant = async ({
  userMessage,
  mode = 'general',
  platform,
  pricingData,
  result,
  history = [],
  userName,
  userEmail
}: {
  userMessage: string;
  mode?: 'offer' | 'question' | 'general';
  platform: Platform;
  pricingData: PricingData;
  result: CalculationResult;
  history?: { role: 'user' | 'assistant'; content: string }[];
  userName?: string;
  userEmail?: string;
}): Promise<string> => {
  const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || 
                 (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || "";

  // Contexto financeiro detalhado do produto atualmente em análise
  const sfpInfo = pricingData.sfpEnabled !== false
    ? `Taxa SFP Ativa: Preço Original R$ ${pricingData.originalPrice || 169.90}, Desconto Vendedor R$ ${result.sfpDiscountValue.toFixed(2)} (${pricingData.sellerDiscountType === 'percent' ? `${pricingData.sellerDiscount}%` : 'R$'}), Alíquota SFP ${pricingData.sfpPercent || 6}%, Custo SFP unitário: R$ ${result.sfpFee.toFixed(2)}`
    : 'Taxa SFP: Desativada';

  const userContext = userName 
    ? `- Usuário Conectado via Google: ${userName} (${userEmail || 'Conta Google Ativa'})\n` 
    : '';

  const productContext = `
DADOS DA OPERAÇÃO & PRODUTO:
${userContext}- Nome do Produto: "${pricingData.productName || 'Produto Ativo'}"
- Canal de Venda Selecionado: ${platform}
- Preço de Venda Praticado: R$ ${result.finalPrice.toFixed(2)}
- Custo de Mercadoria Vendida (CMV Total): R$ ${result.unitCMV.toFixed(2)} (Custo: R$ ${pricingData.costPrice.toFixed(2)}, Frete In: R$ ${pricingData.freightIn.toFixed(2)})
- Embalagem & Envio: R$ ${pricingData.packagingCost.toFixed(2)} + R$ ${pricingData.shippingLabel.toFixed(2)}
- Markup Efetivo: ${result.markup.toFixed(2)}x
- Margem Líquida Atual: ${result.marginPercent.toFixed(2)}%
- Lucro Líquido Unitário: R$ ${result.profit.toFixed(2)}
- CPA de Equilíbrio (Breakeven CPA): R$ ${result.maxCPA.toFixed(2)} (Não pode pagar mais que isso por venda no Ads!)
- ROAS de Breakeven Mínimo: ${(result.finalPrice / (result.maxCPA || 1)).toFixed(2)}x
- Alíquota de Imposto: ${pricingData.taxPercent}%
- Alíquota de Tráfego Alocado: ${pricingData.marketingPercent}% (R$ ${result.marketingCost.toFixed(2)})
- ${sfpInfo}
`;

  // Se não houver API key configurada, responder com consultoria inteligente calculada sem nenhum # ou *
  if (!apiKey) {
    if (mode === 'offer' || userMessage.toLowerCase().includes('oferta') || userMessage.toLowerCase().includes('kit') || userMessage.toLowerCase().includes('bundle')) {
      const kit2Price = (result.finalPrice * 1.8).toFixed(2);
      const kit3Price = (result.finalPrice * 2.5).toFixed(2);
      const kit2Cmv = (result.unitCMV * 2).toFixed(2);
      const kit3Cmv = (result.unitCMV * 3).toFixed(2);
      
      return cleanMarkdownSymbols(`🚀 Estratégia de Oferta Irresistível Gerada para ${pricingData.productName || 'Seu Produto'} (${platform}):

1. KIT ESCALA (Compre 2 Leve 3 ou 2ª Unidade com 40% OFF)
• Preço Sugerido do Kit (2 un): R$ ${kit2Price} (Economia percebida pelo cliente de R$ ${(result.finalPrice * 0.2).toFixed(2)})
• CMV do Kit: R$ ${kit2Cmv}
• Lucro Projetado por Venda: R$ ${(parseFloat(kit2Price) - parseFloat(kit2Cmv) - (result.totalVariableCosts * 1.4)).toFixed(2)}
• Gancho de Anúncio: "Leve a 2ª unidade com 40% de desconto imediato + Frete Prioritário hoje!"

2. OFERTA COM ORDER BUMP / VENDA CRUZADA
• Order Bump no Checkout: Acessório ou garantia estendida de 1 ano por R$ 19,90 a R$ 29,90 (margem líquida altíssima).
• Aumento de Ticket Médio Estimado: +18% a +25% no AOV (Average Order Value).

3. ANCORAGEM DE VALOR
• Mostre o preço cheio individual (R$ ${(result.finalPrice * 1.3).toFixed(2)}) riscado e apresente a oferta por R$ ${result.finalPrice.toFixed(2)}.
• Adicione escassez real: "Condição válida apenas para os primeiros 30 pedidos com envio expresso."

💡 Dica do Agente: Seu Breakeven CPA unitário é R$ ${result.maxCPA.toFixed(2)}. Ao vender kits, seu custo por aquisição no anúncio costuma subir apenas 10-15%, multiplicando seu lucro líquido total!`);
    }

    return cleanMarkdownSymbols(`💡 Resposta do Agente Gerenciie CFO:

Com base nos dados atuais do ${pricingData.productName || 'seu produto'} no canal ${platform}:
• Preço de Venda: R$ ${result.finalPrice.toFixed(2)} | CMV: R$ ${result.unitCMV.toFixed(2)}
• Margem Líquida: ${result.marginPercent.toFixed(1)}% (Lucro Líquido: R$ ${result.profit.toFixed(2)}/un)
• Breakeven CPA: R$ ${result.maxCPA.toFixed(2)} (seu teto absoluto de custo por aquisição no tráfego).

📌 Diretrizes para sua pergunta:
1. Controle Rígido do CPA: Qualquer anúncio com CPA superior a R$ ${result.maxCPA.toFixed(2)} está operando com prejuízo real.
2. Potencializador de Margem: Crie kits (compre 2 ou 3 un) para diluir o custo fixo de frete e embalagem (R$ ${(pricingData.packagingCost + pricingData.shippingLabel).toFixed(2)}).
3. Canal ${platform}: Aproveite incentivos de frete e promoções do canal, sempre abatendo a comissão e taxa SFP da base de cálculo.

Deseja que eu monte uma oferta completa de Kit ou calcule a margem de um desconto específico? É só me pedir!`);
  }

  const systemInstruction = `Você é o "Gerenciie AI Agent", o estrategista de ofertas irresistíveis e CFO digital de alta performance para e-commerce (Dropshipping, Mercado Livre, Shopee e TikTok Shop).
Sua missão principal é dupla:
1. RESPONDER DÚVIDAS: Esclarecer qualquer questão sobre finanças de e-commerce, margens, markup, DRE, custos variáveis, taxas de canais (Shopee, ML, TikTok, SFP, taxas de cartão, impostos) e métricas de tráfego (CPA máximo, ROAS, CPM, CTR, LTV).
2. CRIAR OFERTAS IRRESISTÍVEIS: Montar estruturas completas de ofertas com validação matemática de margem (Kits 1/2/3 unidades, Compre 1 Leve 2, Upsells, Order Bumps, Âncoras de Preço, Quebra de Objeções, Ganchos de Copy para Anúncios e Garantias).

REGRA VISUAL ABSOLUTA E CRÍTICA:
- NUNCA use os caracteres '#' ou '*' no texto gerado.
- É TERMINANTEMENTE PROIBIDO usar '###', '##', '#', '**', '*' ou '#*'.
- Em vez de asteriscos para negrito, use títulos em MAIÚSCULAS ou introduza com marcadores elegantes como '•' ou numeração '1.', '2.'.
- NUNCA crie textos poluídos com símbolos de markdown. Use linguagem limpa, direta, visualmente agradável e profissional.

DIRETRIZES DE CONTEÚDO:
- Sempre use e mencione os números REAIS do produto ativo fornecidos no contexto (Preço: R$ ${result.finalPrice.toFixed(2)}, CMV: R$ ${result.unitCMV.toFixed(2)}, Margem: ${result.marginPercent.toFixed(1)}%, Breakeven CPA: R$ ${result.maxCPA.toFixed(2)}).
- Quando o usuário pedir uma oferta, estruture com: Nome da Oferta, Preço Recomendado, Desconto/Ancoragem, Margem e Lucro Estimados, Ideia de Order Bump/Upsell e 2 Opções de Ganchos/Copy para anúncios.
- Quando o usuário tirar uma dúvida técnica ou estratégica, responda com clareza executiva, em tom consultivo e amigável, com passos práticos e sem enrolação.
- Responda sempre em Português do Brasil.`;

  const conversation = [
    ...history.slice(-6).map(h => `${h.role === 'user' ? 'Usuário' : 'Agente'}: ${h.content}`),
    `Usuário: ${userMessage}`
  ].join('\n\n');

  const fullPrompt = `${productContext}

HISTÓRICO & MENSAGEM DO USUÁRIO:
${conversation}

Responda agora como o Gerenciie AI Agent (lembre-se: NENHUM caracter '#' ou '*'):`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return cleanMarkdownSymbols(response.text || "Resposta gerada com sucesso.");
  } catch (err: any) {
    console.warn("Agent Error, using strategic fallback:", err);
    return cleanMarkdownSymbols(`📊 Consultoria do Agente Gerenciie:
• Produto: ${pricingData.productName || 'Ativo'} (${platform})
• Margem Líquida Atual: ${result.marginPercent.toFixed(1)}% | Lucro: R$ ${result.profit.toFixed(2)}/un
• Breakeven CPA: R$ ${result.maxCPA.toFixed(2)}

Para otimizar essa operação:
1. Teste ofertas com Kit de 2 unidades por R$ ${(result.finalPrice * 1.8).toFixed(2)} para diluir os custos fixos de envio.
2. Mantenha os criativos de tráfego com CPA máximo de R$ ${result.maxCPA.toFixed(2)}.
3. Adicione um Order Bump de R$ 19,90 no checkout para gerar margem extra pura.`);
  }
};

