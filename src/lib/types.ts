export type Investment = {
  id?: string | number;
  btc_amount: number | string;
  eur_amount: number | string;
  purchase_price: number | string;
  commission: number | string;
  guaranteed: boolean;
  date_swap: string;
};

export type ClientProfile = {
  client_id: string;
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
  btcAmount: number;
  eurAmount: number;
  purchasePrice: number;
  currentValue: number;
  profitLoss: number;
  commissionPct: number;
  guaranteed: boolean;
  guaranteeDate: string | null;
};

export type PortfolioTotals = {
  totalInvested: number;
  totalBTC: number;
  totalCurrentValue: number;
  totalFinalValue: number;
  totalCommissions: number;
  totalTaxes: number;
  totalGuaranteed: number;
  totalProfitLoss: number;
};