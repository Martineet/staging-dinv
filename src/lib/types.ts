export type Investment = {
  id?: string | number;
  btc_amount: number | string;
  eur_amount: number | string;
  purchase_price: number | string;
  type: string | null;
  notes: string | null;
  commission: number | string;
  guaranteed: boolean;
  date_swap: string;
};

export type MemberProfile = {
  member_id: string;
  display_name: string | null;
  email: string;
};

export type PortfolioSummary = {
  total_btc: number;
  total_invested: number;
  total_guaranteed: number;
  bitcoiners: number;
};

export type InvestmentRow = {
  date: string;
  type: string;
  notes: string;
  btcAmount: number;
  eurAmount: number;
  purchasePrice: number;
  currentValue: number;
  profitLoss: number;
};

export type PortfolioTotals = {
  totalInvested: number;
  totalBTC: number;
  averagePurchasePrice: number;
  totalCurrentValue: number;
  totalFinalValue: number;
  totalTaxes: number;
  totalProfitLoss: number;
  onboardedDate: string | null;
};

export type AssetKind = 'bitcoin' | 'gold' | 'sp500' | 'ibex35';

export type AssetsDailyPrice = {
  price_date: string;
  btc_eur: number;
  btc_source: string | null;
  gold_eur: number;
  gold_source: string | null;
  sp500_eur: number;
  sp500_source: string | null;
  ibex35_eur: number;
  ibex35_source: string | null;
};
