import { PRICE_HAIRCUT, TAX_RATE } from '@/lib/constants';
import { Investment, InvestmentRow, PortfolioTotals } from '@/lib/types';

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function buildInvestmentRows(
  investments: Investment[],
  currentBtcPrice: number
): InvestmentRow[] {
  return investments.map((investment) => {
    const btcAmount = toNumber(investment.btc_amount);
    const eurAmount = toNumber(investment.eur_amount);
    const purchasePrice = toNumber(investment.purchase_price);
    const rawCurrentValue = btcAmount * currentBtcPrice;
    const currentValue = rawCurrentValue * PRICE_HAIRCUT;
    const profitLoss = currentValue - eurAmount;

    return {
      date: investment.date_swap,
      btcAmount,
      eurAmount,
      purchasePrice,
      currentValue,
      profitLoss
    };
  });
}

export function calculatePortfolioTotals(
  investments: Investment[],
  currentBtcPrice: number
): PortfolioTotals {
  let totalInvested = 0;
  let totalBTC = 0;
  let totalFinalValue = 0;
  let totalTaxes = 0;

  investments.forEach((investment) => {
    const btcAmount = toNumber(investment.btc_amount);
    const eurAmount = toNumber(investment.eur_amount);

    const rawCurrentValue = btcAmount * currentBtcPrice;
    const currentValue = rawCurrentValue * PRICE_HAIRCUT;

    let taxes = 0;
    let finalValue = currentValue;

    if (currentValue > eurAmount) {
      const profit = currentValue - eurAmount;
      taxes = profit * TAX_RATE;
      finalValue = currentValue - taxes;
    }

    totalInvested += eurAmount;
    totalBTC += btcAmount;
    totalFinalValue += finalValue;
    totalTaxes += taxes;
  });

  const totalCurrentValue = totalBTC * currentBtcPrice * PRICE_HAIRCUT;
  const totalProfitLoss = totalFinalValue - totalInvested;

  return {
    totalInvested,
    totalBTC,
    totalCurrentValue,
    totalFinalValue,
    totalTaxes,
    totalProfitLoss
  };
}
