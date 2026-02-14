
import { PricingData, CalculationResult, Platform, CurrencyCode } from '../types.ts';

export const calculatePricing = (data: PricingData, targetMarkup: number, platform: Platform): CalculationResult => {
  const { 
    currency,
    costPrice, 
    freightIn, 
    packagingCost,
    shippingLabel,
    marketingPercent, 
    fixedOpCost, 
    taxPercent,
    estimatedMonthlySales,
    cardTaxPercent,
    paymentReservePercent,
    yampiFeePercent,
    icmsPercent,
    pixTaxPercent,
    newTaxPercent,
    adsTaxPercent,
    fixedFee
  } = data;
  
  // 1. CMV (Custo de Mercadoria Vendida)
  const baseProductCost = costPrice;
  const baseFreightIn = freightIn;
  
  const icmsFee = baseProductCost * (icmsPercent / 100);
  const unitCMV = baseProductCost + baseFreightIn + icmsFee;
  const unitOperatingCost = packagingCost + shippingLabel;
  const totalDirectCost = unitCMV + unitOperatingCost;
  
  // 2. Preço de Venda
  const finalPrice = totalDirectCost * targetMarkup;
  
  // 3. Marketing e Tráfego
  const marketingCost = finalPrice * (marketingPercent / 100);
  const marketingAdsTax = marketingCost * (adsTaxPercent / 100);
  
  // 4. Taxas de Canal / Marketplace
  let marketplaceFees = 0;
  let yampiFee = 0;
  
  if (platform === Platform.DROPSHIPPING) {
    yampiFee = finalPrice * (yampiFeePercent / 100);
  } else {
    // Apenas taxa fixa se houver, marketplaceCommission removida.
    marketplaceFees = fixedFee;
  }
  
  // 5. Financeiro (Gateway e Checkout)
  const cardFee = finalPrice * (cardTaxPercent / 100);
  const reserveFee = finalPrice * (paymentReservePercent / 100);
  const pixFee = finalPrice * (pixTaxPercent / 100);
  const gatewayCost = finalPrice * (data.gatewayFee / 100);
  const newTaxFee = finalPrice * (newTaxPercent / 100);
  
  // 6. Impostos Fiscais (Venda)
  const taxes = finalPrice * (taxPercent / 100);
  
  // Soma de todos os custos variáveis
  const totalVariableCosts = 
    marketingCost + 
    marketingAdsTax + 
    taxes + 
    cardFee + 
    reserveFee + 
    yampiFee + 
    marketplaceFees +
    gatewayCost + 
    pixFee + 
    newTaxFee;

  const profit = finalPrice - totalVariableCosts - totalDirectCost;
  const contributionMargin = finalPrice - totalVariableCosts - unitCMV;
  
  const totalFeesOnly = 
    cardFee + 
    reserveFee + 
    yampiFee + 
    marketplaceFees + 
    gatewayCost + 
    taxes + 
    pixFee + 
    newTaxFee + 
    marketingAdsTax;
  
  const marginPercent = finalPrice > 0 ? (profit / finalPrice) * 100 : 0;
  const roi = totalDirectCost > 0 ? (profit / totalDirectCost) * 100 : 0;

  const monthlyRevenue = finalPrice * estimatedMonthlySales;
  const monthlyProfitProjection = (profit * estimatedMonthlySales) - fixedOpCost;
  
  // Bússola Metrics
  const maxCPA = profit + marketingCost;
  const cpaIdeal = Math.max(0, maxCPA - (finalPrice * 0.15));
  
  const atcIdeal = cpaIdeal * 0.10;
  const atcMax = maxCPA * 0.12; 
  const icIdeal = cpaIdeal * 0.40;
  const icMax = maxCPA * 0.45;

  return {
    markup: targetMarkup,
    finalPrice,
    totalVariableCosts,
    unitCMV,
    marketingCost,
    marketingAdsTax,
    taxes,
    marketplaceFees,
    gatewayCost,
    cardFee,
    reserveFee,
    yampiFee,
    icmsFee,
    pixFee,
    newTaxFee,
    profit,
    marginPercent,
    roi,
    breakEvenUnits: Math.max(0, Math.ceil(fixedOpCost / (profit > 0 ? profit : 1))),
    monthlyRevenue,
    monthlyProfitProjection,
    isViable: profit > 0,
    platform,
    maxCPA,
    cpaIdeal,
    atcIdeal,
    atcMax,
    icIdeal,
    icMax,
    contributionMargin,
    totalFeesOnly
  };
};

export const formatCurrency = (value: number, currency: CurrencyCode = 'BRL') => {
  const locale = currency === 'BRL' ? 'pt-BR' : currency === 'USD' ? 'en-US' : 'de-DE';
  return new Intl.NumberFormat(locale, { 
    style: 'currency', 
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const getCurrencySymbol = (currency: CurrencyCode) => {
  switch(currency) {
    case 'USD': return '$';
    case 'EUR': return '€';
    default: return 'R$';
  }
};
