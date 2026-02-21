const moneyFormatter = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const moneyRoundedFormatter = new Intl.NumberFormat('de-DE', {
  maximumFractionDigits: 0
});

export function formatMoney(value: number): string {
  return moneyFormatter.format(value);
}

export function formatMoneyRounded(value: number): string {
  return moneyRoundedFormatter.format(value);
}

export function formatBtc(value: number): string {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 5
  });
}