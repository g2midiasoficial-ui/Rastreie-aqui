
import { GoogleGenAI } from "@google/genai";
import { PricingData, CalculationResult, Platform } from "../types.ts";

export const getAIAnalysis = async (
  platform: Platform,
  data: PricingData,
  result: CalculationResult
) => {
  // Obtain the API key exclusively from process.env.API_KEY as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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

    REQUISITOS DA RESPOSTA (Seja direto e profissional):
    1. Diagnóstico de Viabilidade (Escalável, Sustentável ou Risco).
    2. Análise do ROAS Mínimo necessário para este lucro.
    3. Ponto de atenção: Identifique o maior gargalo (ex: impostos altos ou markup baixo).
    4. Estratégia Recomendada (ex: aumentar ticket médio, negociar frete ou trocar de canal).
    
    Use tom de consultoria estratégica. Formate em bullet points elegantes. Responda em Português.
  `;

  try {
    // Generate content using the correct model name and prompt structure.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    // Directly access the .text property of GenerateContentResponse.
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Falha na auditoria. Verifique sua conexão e tente novamente.";
  }
};
