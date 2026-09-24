import { PricingData, CalculationResult, Platform, CampaignInput } from "../types.ts";
import { formatCurrency } from "../utils/calculations.ts";

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  category?: 'offer' | 'question' | 'audit' | 'general';
}

export interface ComprehensiveBusinessContext {
  platform: Platform;
  pricingData: PricingData;
  result: CalculationResult;
  savedProducts?: PricingData[];
  planningCampaigns?: CampaignInput[];
  planningHistory?: any[];
  scaleMultiplier?: number;
  scaleResult?: CalculationResult;
  financialMetrics?: {
    totalIncome: number;
    totalExpense: number;
    currentBalance: number;
    pendingIncome: number;
    pendingExpense: number;
    netSavingsRate: number;
  };
  accounts?: any[];
  transactions?: any[];
  debts?: any[];
  goals?: any[];
  categories?: any[];
  vehicles?: any[];
  financialMode?: 'personal' | 'business';
  userName?: string;
  userEmail?: string;
}

export function cleanMarkdownSymbols(text: string): string {
  if (!text) return '';
  return text
    // Remove patterns like #*, *#, ###*, etc.
    .replace(/[#*]+/g, () => '')
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

/**
 * Builds the complete 360-degree context with 100% safe numeric access
 */
export function buildComprehensiveSystemContext(ctx: ComprehensiveBusinessContext): string {
  const {
    platform = Platform.DROPSHIPPING,
    pricingData,
    result,
    savedProducts = [],
    planningCampaigns = [],
    planningHistory = [],
    scaleMultiplier = 2,
    scaleResult,
    financialMetrics,
    accounts = [],
    transactions = [],
    debts = [],
    goals = [],
    categories = [],
    financialMode = 'business',
    userName,
    userEmail
  } = ctx;

  const currentSymbol = pricingData?.currency === 'USD' ? '$' : pricingData?.currency === 'EUR' ? '€' : 'R$';

  // 1. E-COMMERCE & PRODUTO ATIVO (com proteções contra undefined)
  const finalPrice = Number(result?.finalPrice || 0);
  const costPrice = Number(pricingData?.costPrice || 0);
  const freightIn = Number(pricingData?.freightIn || 0);
  const packagingCost = Number(pricingData?.packagingCost || 0);
  const shippingLabel = Number(pricingData?.shippingLabel || 0);
  const unitCMV = Number(result?.unitCMV || 0);
  const markup = Number(result?.markup || pricingData?.desiredMarkup || 2.5);
  const profit = Number(result?.profit || 0);
  const marginPercent = Number(result?.marginPercent || 0);
  const roi = Number(result?.roi || 0);
  const maxCPA = Number(result?.maxCPA || 0);
  const taxes = Number(result?.taxes || 0);
  const marketingCost = Number(result?.marketingCost || 0);
  const marketingAdsTax = Number(result?.marketingAdsTax || 0);
  const totalFees = Number((result?.gatewayCost || 0) + (result?.cardFee || 0));
  const monthlyRevenue = Number(result?.monthlyRevenue || 0);
  const monthlyProfit = Number(result?.monthlyProfitProjection || 0);
  const estimatedSales = Number(pricingData?.estimatedMonthlySales || 0);

  const sfpInfo = pricingData?.sfpEnabled !== false
    ? `Taxa SFP Ativa: Preço Original ${currentSymbol} ${Number(pricingData?.originalPrice || 169.90).toFixed(2)}, Desconto Vendedor ${currentSymbol} ${Number(result?.sfpDiscountValue || 0).toFixed(2)}, Alíquota SFP ${pricingData?.sfpPercent || 6}%, Custo SFP unitário: ${currentSymbol} ${Number(result?.sfpFee || 0).toFixed(2)}`
    : 'Taxa SFP: Desativada';

  const productSection = `
=== 1. PRECIFICAÇÃO E DADOS UNITÁRIOS DO PRODUTO ATIVO ===
- Nome do Produto: "${pricingData?.productName || 'Produto Principal'}"
- Canal de Venda Selecionado: ${platform}
- Preço de Venda Praticado: ${currentSymbol} ${finalPrice.toFixed(2)}
- Custo do Produto (FOB / Fornecedor): ${currentSymbol} ${costPrice.toFixed(2)}
- Frete de Entrada (Frete In): ${currentSymbol} ${freightIn.toFixed(2)}
- Embalagem & Etiqueta de Envio: ${currentSymbol} ${packagingCost.toFixed(2)} + ${currentSymbol} ${shippingLabel.toFixed(2)}
- Custo de Mercadoria Vendida (CMV Unitário Total): ${currentSymbol} ${unitCMV.toFixed(2)}
- Markup Efetivo Aplicado: ${markup.toFixed(2)}x (Desejado: ${Number(pricingData?.desiredMarkup || 2.5).toFixed(2)}x)
- Lucro Líquido Unitário: ${currentSymbol} ${profit.toFixed(2)}
- Margem Líquida Real: ${marginPercent.toFixed(2)}%
- Retorno sobre Investimento (ROI): ${roi.toFixed(1)}%
- Breakeven CPA (Teto Máximo de Custo por Venda no Ads): ${currentSymbol} ${maxCPA.toFixed(2)}
- Breakeven ROAS Mínimo: ${(finalPrice / (maxCPA || 1)).toFixed(2)}x
- Alíquota de Impostos s/ Venda: ${pricingData?.taxPercent || 0}% (${currentSymbol} ${taxes.toFixed(2)})
- Alíquota de Marketing Alocado: ${pricingData?.marketingPercent || 0}% (${currentSymbol} ${marketingCost.toFixed(2)})
- Imposto sobre Ads: ${pricingData?.adsTaxPercent || 0}% (${currentSymbol} ${marketingAdsTax.toFixed(2)})
- Taxas de Gateway & Checkout: ${currentSymbol} ${totalFees.toFixed(2)}
- ${sfpInfo}
- Projeção Mensal (${estimatedSales} vendas/mês): Faturamento ${currentSymbol} ${monthlyRevenue.toFixed(2)} | Lucro Líquido Mensal ${currentSymbol} ${monthlyProfit.toFixed(2)}
`;

  // 2. ESTEIRA DE PRODUTOS SALVOS
  const savedProdsSection = savedProducts.length > 0 
    ? `
=== 2. ESTEIRA DE PRODUTOS CADASTRADOS (${savedProducts.length} PRODUTOS) ===
${savedProducts.map((p, idx) => {
  const pCost = Number(p?.costPrice || 0);
  const pMarkup = Number(p?.desiredMarkup || 2.5);
  return `• [${idx + 1}] "${p?.productName || 'Produto'}": Custo ${currentSymbol} ${pCost.toFixed(2)}, Markup ${pMarkup.toFixed(2)}x, Preço Sugerido ${currentSymbol} ${(pCost * pMarkup).toFixed(2)}`;
}).join('\n')}
`
    : `
=== 2. ESTEIRA DE PRODUTOS ===
(Apenas o produto atual "${pricingData?.productName || 'Ativo'}" cadastrado no momento)
`;

  // 3. PLANEJAMENTO DE TRÁFEGO PAGO & ADS
  const activeCampaigns = planningCampaigns.filter(c => c && c.active !== false);
  const totalAdsSpend = activeCampaigns.reduce((sum, c) => sum + (Number(c?.spend) || 0), 0);
  const totalImpressions = activeCampaigns.reduce((sum, c) => sum + (Number(c?.impressions) || 0), 0);
  const totalClicks = activeCampaigns.reduce((sum, c) => sum + (Number(c?.clicks) || 0), 0);
  const totalAtc = activeCampaigns.reduce((sum, c) => sum + (Number(c?.atc) || 0), 0);
  const totalIc = activeCampaigns.reduce((sum, c) => sum + (Number(c?.ic) || 0), 0);
  const totalSales = activeCampaigns.reduce((sum, c) => sum + (Number(c?.sales) || 0), 0);

  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCpc = totalClicks > 0 ? totalAdsSpend / totalClicks : 0;
  const avgCpm = totalImpressions > 0 ? (totalAdsSpend / totalImpressions) * 1000 : 0;
  const avgAtcRate = totalClicks > 0 ? (totalAtc / totalClicks) * 100 : 0;
  const avgCvr = totalClicks > 0 ? (totalSales / totalClicks) * 100 : 0;
  const realCpa = totalSales > 0 ? totalAdsSpend / totalSales : 0;
  const totalAdsRevenue = totalSales * finalPrice;
  const totalAdsProfit = totalAdsRevenue - (totalSales * costPrice) - totalAdsSpend;
  const realRoas = totalAdsSpend > 0 ? totalAdsRevenue / totalAdsSpend : 0;

  const adsSection = `
=== 3. PAINEL DE TRÁFEGO PAGO & CAMPANHAS ADS ===
- Campanhas Ativas Cadastradas: ${activeCampaigns.length}
- Total Investido em Ads: ${currentSymbol} ${totalAdsSpend.toFixed(2)}
- Impressões Totais: ${totalImpressions.toLocaleString('pt-BR')} | Cliques Totais: ${totalClicks.toLocaleString('pt-BR')}
- CTR Médio: ${avgCtr.toFixed(2)}% | CPC Médio: ${currentSymbol} ${avgCpc.toFixed(2)} | CPM Médio: ${currentSymbol} ${avgCpm.toFixed(2)}
- Taxa de Adição ao Carrinho (ATC %): ${avgAtcRate.toFixed(2)}% (Total ATC: ${totalAtc})
- Checkouts Iniciados (IC): ${totalIc}
- Conversão da Página (CVR %): ${avgCvr.toFixed(2)}% (Vendas Geradas: ${totalSales})
- CPA Real Praticado: ${currentSymbol} ${realCpa.toFixed(2)} (Limite Breakeven: ${currentSymbol} ${maxCPA.toFixed(2)} -> ${realCpa <= maxCPA ? '✅ DENTRO DO LIMITE DE LUCRO' : '⚠️ ACIMA DO LIMITE (GERANDO PREJUÍZO)'})
- ROAS Real das Campanhas: ${realRoas.toFixed(2)}x
- Faturamento Gerado em Ads: ${currentSymbol} ${totalAdsRevenue.toFixed(2)} | Lucro Estimado: ${currentSymbol} ${totalAdsProfit.toFixed(2)}
${activeCampaigns.length > 0 ? `Detalhamento de Campanhas:\n${activeCampaigns.map(c => `  - [${c.phase || 'Fase'}] ${c.name || 'Campanha'}: Gasto ${currentSymbol} ${Number(c.spend || 0).toFixed(2)}, Cliques ${c.clicks || 0}, Vendas ${c.sales || 0}, CVR ${c.clicks && c.clicks > 0 ? (((c.sales || 0) / c.clicks) * 100).toFixed(1) : '0.0'}%`).join('\n')}` : '  (Nenhuma campanha registrada no simulador de planejamento ainda)'}
${planningHistory.length > 0 ? `Histórico de Simulações Salvas: ${planningHistory.length} registros.` : ''}
`;

  // 4. SIMULAÇÃO DE ESCALA
  const scaleSection = scaleResult ? `
=== 4. SIMULAÇÃO DE ESCALA (${scaleMultiplier}x) ===
- Vendas Escaladas Projetadas: ${estimatedSales * scaleMultiplier} pedidos/mês
- Faturamento Escalado: ${currentSymbol} ${Number(scaleResult.monthlyRevenue || 0).toFixed(2)}
- Lucro Líquido Escalado Projetado: ${currentSymbol} ${Number(scaleResult.monthlyProfitProjection || 0).toFixed(2)}
- Custo de Mercadoria na Escala: ${currentSymbol} ${(Number(scaleResult.unitCMV || 0) * estimatedSales * scaleMultiplier).toFixed(2)}
` : '';

  // 5. GESTÃO FINANCEIRA GLOBAL (CONTAS, TRANSAÇÕES, DÍVIDAS, METAS)
  const totalBalance = accounts.reduce((sum, a) => sum + (Number(a?.balance) || 0), 0);
  const totalDebtsRemaining = debts.reduce((sum, d) => sum + (Number(d?.remainingAmount ?? d?.totalAmount) || 0), 0);
  const totalDebtsMonthly = debts.reduce((sum, d) => sum + (Number(d?.installmentValue) || 0), 0);
  const totalGoalsSaved = goals.reduce((sum, g) => sum + (Number(g?.currentAmount) || 0), 0);
  const totalGoalsTarget = goals.reduce((sum, g) => sum + (Number(g?.targetAmount) || 0), 0);

  const finMetrics = financialMetrics || {
    totalIncome: 0,
    totalExpense: 0,
    currentBalance: totalBalance,
    pendingIncome: 0,
    pendingExpense: 0,
    netSavingsRate: 0
  };

  const financeSection = `
=== 5. GESTÃO FINANCEIRA CONSOLIDADA (MODO ${financialMode.toUpperCase()}) ===
- Saldo Consolidado em Contas: ${currentSymbol} ${totalBalance.toFixed(2)}
- Total de Receitas do Mês: ${currentSymbol} ${Number(finMetrics.totalIncome || 0).toFixed(2)}
- Total de Despesas do Mês: ${currentSymbol} ${Number(finMetrics.totalExpense || 0).toFixed(2)}
- Resultado Líquido do Mês: ${currentSymbol} ${(Number(finMetrics.totalIncome || 0) - Number(finMetrics.totalExpense || 0)).toFixed(2)}
- Contas a Receber Pendentes: ${currentSymbol} ${Number(finMetrics.pendingIncome || 0).toFixed(2)}
- Contas a Pagar / Pendentes: ${currentSymbol} ${Number(finMetrics.pendingExpense || 0).toFixed(2)}
- Contas Bancárias Cadastradas (${accounts.length}):
${accounts.map(a => `  • ${a.name || 'Conta'} (${a.type || 'Conta'}): Saldo ${currentSymbol} ${(Number(a?.balance) || 0).toFixed(2)}`).join('\n') || '  (Nenhuma conta bancária)'}

- Dívidas & Parcelas Ativas (${debts.length}):
${debts.map(d => `  • ${d.title || 'Dívida'} (Credor: ${d.creditor || 'N/A'}): Restante ${currentSymbol} ${(Number(d?.remainingAmount ?? d?.totalAmount) || 0).toFixed(2)} | Parcela ${currentSymbol} ${Number(d?.installmentValue || 0).toFixed(2)}/mês (${d.paidInstallments || 0}/${d.totalInstallments || 0} pagas)`).join('\n') || '  (Nenhuma dívida cadastrada - Excelente!)'}
  * Total de Dívidas Restantes: ${currentSymbol} ${totalDebtsRemaining.toFixed(2)} | Comprometimento Mensal: ${currentSymbol} ${totalDebtsMonthly.toFixed(2)}/mês

- Metas Financeiras & Reservas (${goals.length}):
${goals.map(g => `  • ${g.title || 'Meta'}: ${currentSymbol} ${(Number(g?.currentAmount) || 0).toFixed(2)} de ${currentSymbol} ${(Number(g?.targetAmount) || 0).toFixed(2)} (${Number(g?.targetAmount || 0) > 0 ? (((Number(g?.currentAmount) || 0) / Number(g.targetAmount)) * 100).toFixed(1) : '0.0'}%)`).join('\n') || '  (Nenhuma meta financeira)'}
  * Total Guardado em Metas/Reservas: ${currentSymbol} ${totalGoalsSaved.toFixed(2)} de ${currentSymbol} ${totalGoalsTarget.toFixed(2)}

- Tetos Orçamentários por Categoria (${categories.length}):
${categories.map(c => `  • ${c.name || 'Categoria'}: Gasto ${currentSymbol} ${(Number(c?.currentSpent) || 0).toFixed(2)} de Teto ${currentSymbol} ${(Number(c?.budgetedAmount) || 0).toFixed(2)}`).join('\n') || '  (Nenhum teto configurado)'}

- Transações Recentes (Últimas ${Math.min(transactions.length, 10)}):
${transactions.slice(0, 10).map(t => `  • [${t.date || 'Data'}] ${t.type === 'income' ? '(+)' : '(-)'} ${t.description || 'Transação'}: ${currentSymbol} ${Number(t.amount || 0).toFixed(2)} (${t.category || 'Geral'}) - ${t.status === 'paid' ? 'Pago' : 'Pendente'}`).join('\n') || '  (Nenhuma transação recente)'}
`;

  // 6. USUÁRIO
  const userSection = userName ? `
=== 6. PERFIL DO USUÁRIO ===
- Nome: ${userName}
- Email: ${userEmail || 'g2midiasoficial@gmail.com'}
` : '';

  return `${productSection}\n${savedProdsSection}\n${adsSection}\n${scaleSection}\n${financeSection}\n${userSection}`;
}

/**
 * Multi-tier AI execution: Server Proxy -> Direct REST with fallback models
 */
async function executeGeminiRequest(
  prompt: string, 
  systemInstruction?: string, 
  model: string = 'gemini-3.6-flash', 
  temperature: number = 0.7
): Promise<string | null> {
  // 1. Try local server endpoint
  try {
    const resFetch = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction, model, temperature })
    });
    if (resFetch.ok) {
      const data = await resFetch.json();
      if (data?.text) return data.text;
    }
  } catch (e) {
    // Proceed to direct REST fallback
  }

  // 2. Direct REST fallback using inlined API key
  const key = (typeof process !== 'undefined' && (process.env?.GEMINI_API_KEY || process.env?.API_KEY)) || '';
  if (key) {
    const models = [model, 'gemini-3.6-flash', 'gemini-3.7-flash'];
    for (const m of models) {
      try {
        const payload: any = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature }
        };
        if (systemInstruction) {
          payload.systemInstruction = { parts: [{ text: systemInstruction }] };
        }
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const d = await resp.json();
        if (resp.ok && d?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return d.candidates[0].content.parts[0].text;
        }
      } catch (err) {
        // try next model
      }
    }
  }

  return null;
}

export const askAgentAssistant = async ({
  userMessage,
  mode = 'general',
  context,
  history = []
}: {
  userMessage: string;
  mode?: 'offer' | 'question' | 'audit' | 'general';
  context: ComprehensiveBusinessContext;
  history?: { role: 'user' | 'assistant'; content: string }[];
}): Promise<string> => {
  const comprehensiveContext = buildComprehensiveSystemContext(context);
  const currentSymbol = context?.pricingData?.currency === 'USD' ? '$' : context?.pricingData?.currency === 'EUR' ? '€' : 'R$';
  const res = context?.result;
  const p = context?.pricingData;

  const systemInstruction = `Você é o "Gerenciie CFO AI", o Diretor Financeiro (CFO) e Estrategista Chefe com VISÃO PANORÂMICA E RAIO-X 360° de toda a operação.
Você tem acesso em tempo real a TODAS as informações do negócio:
1. Precificação, Margens, CMV, Markup, Impostos, Taxas de Canal (Shopee, Mercado Livre, TikTok, Dropshipping/Yampi/Gateway/SFP).
2. Tráfego Pago & Ads (Campanhas em Teste, Validação, Escala, Gastos, CTR, CPC, CPM, Taxa ATC, CVR, ROAS e CPA Real vs Breakeven CPA).
3. Esteira de Produtos cadastrados e Simulações de Escala.
4. Gestão Financeira Global (Saldos de todas as contas bancárias, Receitas, Despesas, Dívidas/Parcelas, Metas/Reservas e Tetos Orçamentários).

SUA POSTURA:
- Você analisa o negócio de ponta a ponta como um CFO sênior de elite.
- Quando o usuário perguntar algo, cruze os dados reais (ex: cruze o saldo bancário com o limite de gastos de Ads e com a margem do produto).
- Aponte riscos imediatamente (ex: CPA real acima do Breakeven CPA, margem líquida inferior a 15%, dívidas comprometendo fluxo de caixa).
- Forneça estratégias práticas e lucrativas (ex: criação de kits, corte de custos variáveis, melhoria de ROAS, negociação de fornecedor).

REGRA VISUAL ABSOLUTA E INEGOCIÁVEL:
- NUNCA use os caracteres '#' ou '*' em nenhuma circunstância.
- É ESTRITAMENTE PROIBIDO usar '###', '##', '#', '**', '*', '#*' ou qualquer marcação markdown semelhante.
- Em vez de asteriscos para negrito, use títulos em CAIXA ALTA (MAIÚSCULAS) e marcadores elegantes '•' ou numeração '1.', '2.', '3.'.
- Responda sempre em Português do Brasil com linguagem clara, executiva, direta e altamente persuasiva.`;

  const conversation = [
    ...history.slice(-8).map(h => `${h.role === 'user' ? 'Usuário' : 'CFO AI'}: ${h.content}`),
    `Usuário: ${userMessage}`
  ].join('\n\n');

  const prompt = `
Abaixo estão TODAS as informações integradas e consolidadas da empresa e das finanças em tempo real:

${comprehensiveContext}

MENSAGEM / DÚVIDA DO USUÁRIO:
${conversation}

Responda agora como o Gerenciie CFO AI (Lembre-se: NENHUM caracter '#' ou '*'):`;

  try {
    const aiText = await executeGeminiRequest(prompt, systemInstruction, 'gemini-3.6-flash', 0.7);
    if (aiText) {
      return cleanMarkdownSymbols(aiText);
    }
  } catch (err: any) {
    console.warn('AI execution notice:', err);
  }

  // Fallback inteligente completo se a requisição de rede falhar
  const finalPrice = Number(res?.finalPrice || 0);
  const marginPct = Number(res?.marginPercent || 0);
  const profitVal = Number(res?.profit || 0);
  const maxCpaVal = Number(res?.maxCPA || 0);
  const unitCmvVal = Number(res?.unitCMV || 0);
  const totalBal = (context?.accounts || []).reduce((sum, a) => sum + (Number(a?.balance) || 0), 0);
  const monthlyRev = Number(res?.monthlyRevenue || 0);
  const monthlyProf = Number(res?.monthlyProfitProjection || 0);
  const estSales = Number(p?.estimatedMonthlySales || 0);

  if (mode === 'offer' || userMessage.toLowerCase().includes('kit') || userMessage.toLowerCase().includes('oferta')) {
    const kit2Price = (finalPrice * 1.8).toFixed(2);
    const kit3Price = (finalPrice * 2.5).toFixed(2);
    const kit2Cmv = (unitCmvVal * 2).toFixed(2);
    return cleanMarkdownSymbols(`🚀 Estratégia de Oferta Irresistível Gerada para ${p?.productName || 'Seu Produto'} (${context.platform}):

1. KIT ESCALA (Compre 2 Leve 3 ou 2ª Unidade com 40% OFF)
• Preço Sugerido do Kit (2 un): ${currentSymbol} ${kit2Price} (Economia percebida pelo cliente de ${currentSymbol} ${(finalPrice * 0.2).toFixed(2)})
• CMV do Kit: ${currentSymbol} ${kit2Cmv}
• Gancho de Anúncio: "Leve a 2ª unidade com 40% de desconto imediato + Frete Prioritário hoje!"

2. OFERTA COM ORDER BUMP
• Order Bump no Checkout: Garantia estendida ou acessório premium por ${currentSymbol} 19,90 a ${currentSymbol} 29,90.
• Aumento de Ticket Médio Estimado: +18% a +25% no AOV.

3. ANCORAGEM DE VALOR
• Preço Individual: ${currentSymbol} ${finalPrice.toFixed(2)} | Breakeven CPA: ${currentSymbol} ${maxCpaVal.toFixed(2)}.`);
  }

  return cleanMarkdownSymbols(`📊 Parecer Executivo do CFO AI (Visão 360°):

1. PRODUTO & PRECIFICAÇÃO (${p?.productName || 'Produto Atual'} - ${context.platform}):
• Preço de Venda: ${currentSymbol} ${finalPrice.toFixed(2)} | CMV Total: ${currentSymbol} ${unitCmvVal.toFixed(2)}
• Margem Líquida Real: ${marginPct.toFixed(1)}% | Lucro por Unidade: ${currentSymbol} ${profitVal.toFixed(2)}
• Teto Máximo de CPA (Ads): ${currentSymbol} ${maxCpaVal.toFixed(2)} (Não pagar mais que isso no tráfego pago)

2. SAÚDE FINANCEIRA & CAIXA:
• Saldo Consolidado em Contas: ${currentSymbol} ${totalBal.toFixed(2)}
• Faturamento Mensal Projetado (${estSales} vendas): ${currentSymbol} ${monthlyRev.toFixed(2)}
• Lucro Líquido Projetado: ${currentSymbol} ${monthlyProf.toFixed(2)}

3. PLANO DE AÇÃO RECOMENDADO:
• Crie Kits com 2 unidades por ${currentSymbol} ${(finalPrice * 1.8).toFixed(2)} para diluir frete e embalagem.
• Otimize criativos para manter o custo por aquisição estritamente abaixo de ${currentSymbol} ${maxCpaVal.toFixed(2)}.
• Garanta que o saldo de caixa cubra o ciclo de pagamento dos fornecedores.`);
};

export const getAIAnalysis = async (
  platform: Platform,
  data: PricingData,
  result: CalculationResult
) => {
  const currentSymbol = data?.currency === 'USD' ? '$' : data?.currency === 'EUR' ? '€' : 'R$';
  const finalPrice = Number(result?.finalPrice || 0);
  const costPrice = Number(data?.costPrice || 0);
  const markup = Number(result?.markup || data?.desiredMarkup || 2.5);
  const profit = Number(result?.profit || 0);
  const marginPercent = Number(result?.marginPercent || 0);
  const roi = Number(result?.roi || 0);
  const maxCPA = Number(result?.maxCPA || 0);
  const monthlyProfit = Number(result?.monthlyProfitProjection || 0);

  const prompt = `
    Aja como um CFO (Diretor Financeiro) especialista em E-commerce e Dropshipping. 
    Analise os dados financeiros abaixo para o canal ${platform} e forneça um parecer executivo.

    DADOS UNITÁRIOS:
    - Preço de Venda: ${currentSymbol} ${finalPrice.toFixed(2)}
    - Custo de Aquisição Produto (FOB + Frete In): ${currentSymbol} ${costPrice.toFixed(2)}
    - Markup Aplicado: ${markup.toFixed(2)}x
    
    ESTRUTURA DE CUSTOS VARIÁVEIS:
    - Impostos: ${data?.taxPercent || 0}%
    - Marketing (Budget): ${data?.marketingPercent || 0}% (CPA Alocado: ${currentSymbol} ${Number(result?.marketingCost || 0).toFixed(2)})
    - Imposto s/ Ads: ${data?.adsTaxPercent || 0}%
    
    MÉTRICAS DE PERFORMANCE:
    - Lucro Líquido Unitário: ${currentSymbol} ${profit.toFixed(2)}
    - Margem Líquida: ${marginPercent.toFixed(2)}%
    - ROI: ${roi.toFixed(1)}%
    - CPA de Equilíbrio (Breakeven CPA): ${currentSymbol} ${maxCPA.toFixed(2)}
    - Projeção Lucro Mensal (${data?.estimatedMonthlySales || 0} vendas): ${currentSymbol} ${monthlyProfit.toFixed(2)}

    REQUISITOS DA RESPOSTA:
    1. Diagnóstico de Viabilidade (Escalável, Sustentável ou Risco).
    2. Análise do ROAS Mínimo necessário para este lucro.
    3. Ponto de atenção: Identifique o maior gargalo (ex: impostos altos ou markup baixo).
    4. Estratégia Recomendada (ex: aumentar ticket médio, negociar frete ou trocar de canal).
    
    REGRA OBRIGATÓRIA: NÃO use caracteres markdown como hashtags (#, ##, ###) nem asteriscos (* ou **) ou (#*). Use texto limpo com marcadores '•' e numeração simples. Responda em Português.
  `;

  try {
    const aiText = await executeGeminiRequest(prompt, undefined, 'gemini-3.6-flash', 0.7);
    if (aiText) {
      return cleanMarkdownSymbols(aiText);
    }
  } catch (error: any) {
    console.warn('Gemini analysis fallback notice:', error);
  }

  return `📊 Parecer CFO Gerenciie:
• Margem Líquida Atual: ${marginPercent.toFixed(1)}%
• Breakeven CPA: ${currentSymbol} ${maxCPA.toFixed(2)}
• Lucro Unitário: ${currentSymbol} ${profit.toFixed(2)}
• Estratégia: Otimize os criativos para manter o custo por conversão estritamente abaixo do CPA máximo.`;
};

export const testGeminiConnection = async (): Promise<{ success: boolean; latencyMs: number; message: string; model: string }> => {
  const start = performance.now();
  try {
    const resFetch = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: "Responda apenas 'OK' se a conexão com o Gemini estiver funcionando perfeitamente.",
        model: 'gemini-3.6-flash',
        temperature: 0.1
      })
    });

    const latencyMs = Math.round(performance.now() - start);
    if (resFetch.ok) {
      const data = await resFetch.json();
      return {
        success: true,
        latencyMs,
        message: `Gemini 3.6 Flash conectado com sucesso via backend (${data.text?.trim() || 'OK'}).`,
        model: "gemini-3.6-flash"
      };
    } else {
      return {
        success: false,
        latencyMs,
        message: "Servidor Gemini indisponível ou chave não configurada.",
        model: "gemini-3.6-flash"
      };
    }
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      success: false,
      latencyMs,
      message: err?.message || "Erro ao comunicar com o servidor da API Gemini.",
      model: "gemini-3.6-flash"
    };
  }
};
