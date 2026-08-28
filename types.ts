
export enum Platform {
  DROPSHIPPING = 'Dropshipping',
  SHOPEE = 'Shopee',
  MERCADO_LIVRE = 'Mercado Livre',
  TIKTOK_SHOP = 'TikTok Shop'
}

export enum TaxRegime {
  MEI = 'MEI',
  SIMPLES_NACIONAL = 'Simples Nacional',
  LUCRO_PRESUMIDO = 'Lucro Presumido'
}

export type CurrencyCode = 'BRL' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'ARS' | 'CLP' | 'MXN' | 'COP' | 'PEN';

export interface PricingData {
  productName: string;
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
  freightPercent: number; // Nova propriedade para frete %
  affiliateCommissionPercent: number; // Nova propriedade para comissão afiliados %
  pricingMode?: 'markup' | 'manual'; // Nova propriedade para modo de precificação
  customSellingPrice?: number; // Nova propriedade para preço de venda customizado
  feeTier?: 'below_50' | 'above_50'; // Faixa de taxas (abaixo ou acima de R$ 50)
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
