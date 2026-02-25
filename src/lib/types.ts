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
