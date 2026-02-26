export function Footer() {
  return (
    <div className="footer">
      <p>&copy; 2026 <strong>D.Inversions</strong> - All rights reserved</p>
      <p className="footer-note">
        Bitcoin Portfolio Tracker | Powered by{' '}
        <a href="https://www.coingecko.com/es/monedas/bitcoin" target="_blank" rel="noreferrer">
          CoinGecko API
        </a>
      </p>
    </div>
  );
}
