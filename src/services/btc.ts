export async function fetchBtcPriceEur(): Promise<number> {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur'
  );

  if (!response.ok) {
    throw new Error('Failed to fetch BTC price.');
  }

  const data = await response.json();
  const price = data?.bitcoin?.eur;

  if (!price || typeof price !== 'number') {
    throw new Error('BTC price data unavailable.');
  }

  return price;
}