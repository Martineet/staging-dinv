import { GUARANTEE_YEARS, PRICE_HAIRCUT, TAX_RATE } from '@/lib/constants';
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
    const commissionPct = toNumber(investment.commission);

    const rawCurrentValue = btcAmount * currentBtcPrice;
    const currentValue = rawCurrentValue * PRICE_HAIRCUT;
    const profitLoss = currentValue - eurAmount;

    const purchaseDate = new Date(investment.date_swap);
    const guaranteeDate = new Date(purchaseDate);
    guaranteeDate.setFullYear(guaranteeDate.getFullYear() + GUARANTEE_YEARS);

    return {
      date: investment.date_swap,
      btcAmount,
      eurAmount,
      purchasePrice,
      currentValue,
      profitLoss,
      commissionPct,
      guaranteed: investment.guaranteed,
      guaranteeDate: investment.guaranteed ? guaranteeDate.toISOString().split('T')[0] : null
    };
  });
}

export function calculatePortfolioTotals(
  investments: Investment[],
  currentBtcPrice: number
): PortfolioTotals {
  let totalInvested = 0;
  let totalBTC = 0;
  let totalGuaranteed = 0;
  let totalFinalValue = 0;
  let totalCommissions = 0;
  let totalTaxes = 0;

  investments.forEach((investment) => {
    const btcAmount = toNumber(investment.btc_amount);
    const eurAmount = toNumber(investment.eur_amount);
    const commission = toNumber(investment.commission);

    const rawCurrentValue = btcAmount * currentBtcPrice;
    const currentValue = rawCurrentValue * PRICE_HAIRCUT;

    let commissionFlat = 0;
    let taxes = 0;
    let finalValue = currentValue;

    if (currentValue > eurAmount) {
      const profit = currentValue - eurAmount;
      commissionFlat = profit * commission;
      const afterCommission = currentValue - commissionFlat;
      const taxableProfit = afterCommission - eurAmount;
      taxes = taxableProfit * TAX_RATE;
      finalValue = afterCommission - taxes;
    } else if (investment.guaranteed && finalValue < eurAmount) {
      finalValue = eurAmount;
    }

    totalInvested += eurAmount;
    totalBTC += btcAmount;
    totalFinalValue += finalValue;
    totalCommissions += commissionFlat;
    totalTaxes += taxes;

    if (investment.guaranteed) totalGuaranteed += eurAmount;
  });

  const totalCurrentValue = totalBTC * currentBtcPrice * PRICE_HAIRCUT;
  const totalProfitLoss = totalCurrentValue - totalInvested;

  if (totalCurrentValue < totalInvested) {
    totalCommissions = 0;
    totalTaxes = 0;
    totalFinalValue = totalCurrentValue;
  }

  investments.forEach((investment) => {
    if (!investment.guaranteed) return;
    const currentValue = toNumber(investment.btc_amount) * currentBtcPrice * PRICE_HAIRCUT;
    const eurAmount = toNumber(investment.eur_amount);
    if (currentValue < eurAmount) totalFinalValue += eurAmount - currentValue;
  });

  return {
    totalInvested,
    totalBTC,
    totalCurrentValue,
    totalFinalValue,
    totalCommissions,
    totalTaxes,
    totalGuaranteed,
    totalProfitLoss
  };
}