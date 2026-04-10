
export enum Platform {
  DROPSHIPPING = 'Dropshipping',
  SHOPEE = 'Shopee',
  MERCADO_LIVRE = 'Mercado Livre'
}

export enum TaxRegime {
  MEI = 'MEI',
  SIMPLES_NACIONAL = 'Simples Nacional',
  LUCRO_PRESUMIDO = 'Lucro Presumido'
}

export type CurrencyCode = 'BRL' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'ARS' | 'CLP' | 'MXN' | 'COP' | 'PEN';

export interface PricingData {
  currency: CurrencyCode;
  costPrice: number;
  freightIn: number;
  packagingCost: number;
  shippingLabel: number;
  fixedFee: number;
  marketplaceCommissionPercent: number; // Nova propriedade
  gatewayFee: number;
  marketingPercent: number;
  fixedOpCost: number;
  taxPercent: number;
  desiredMarkup: number;
  estimatedMonthlySales: number;
  taxRegime: TaxRegime;
  cardTaxPercent: number;
  paymentReservePercent: number;
  yampiFeePercent: number;
  icmsPercent: number;
  pixTaxPercent: number;
  newTaxPercent: number;
  adsTaxPercent: number;
}

export interface CalculationResult {
  markup: number;
  finalPrice: number;
  totalVariableCosts: number;
  unitCMV: number;
  marketingCost: number;
  marketingAdsTax: number;
  taxes: number;
  marketplaceFees: number;
  gatewayCost: number;
  cardFee: number;
  reserveFee: number;
  yampiFee: number;
  icmsFee: number;
  pixFee: number;
  newTaxFee: number;
  profit: number;
  marginPercent: number;
  roi: number;
  breakEvenUnits: number;
  monthlyRevenue: number;
  monthlyProfitProjection: number;
  isViable: boolean;
  platform: Platform;
  maxCPA: number;
  cpaIdeal: number;
  atcIdeal: number;
  atcMax: number;
  icIdeal: number;
  icMax: number;
  contributionMargin: number;
  totalFeesOnly: number;
  // Métricas de Ads Solicitadas
  adSpend1Day: number;
  adSpend7Days: number;
  adSpend30Days: number;
}
