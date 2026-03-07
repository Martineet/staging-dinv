'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatBtc, formatMoneyRounded } from '@/lib/format';
import { Investment, InvestmentFormInput, InvestmentRow, Portfolio } from '@/lib/types';

type MutationState = {
  loading: boolean;
  error: string | null;
  success: boolean;
};

type InvestmentDraft = {
  asset: string;
  amount: string;
  price: string;
  date: string;
};

type DraftErrors = {
  asset?: string;
  amount?: string;
  price?: string;
  date?: string;
};

type InvestmentsTableProps = {
  investments: Investment[];
  rows: InvestmentRow[];
  loading: boolean;
  error: string | null;
  portfolios: Portfolio[];
  selectedPortfolioId: string | null;
  selectedPortfolioName: string | null;
  onSelectPortfolio: (portfolioId: string) => void;
  onCreatePortfolio: (name: string) => Promise<boolean>;
  onRenamePortfolio: (portfolioId: string, newName: string) => Promise<boolean>;
  onDeletePortfolio: (portfolioId: string) => Promise<boolean>;
  onCreateInvestment: (investmentData: Omit<InvestmentFormInput, 'portfolio_id'> & { portfolio_id?: string }) => Promise<boolean>;
  onUpdateInvestment: (
    investmentId: string,
    updates: Omit<InvestmentFormInput, 'portfolio_id'> & { portfolio_id?: string }
  ) => Promise<boolean>;
  onDeleteInvestment: (investmentId: string, portfolioIdOverride?: string) => Promise<boolean>;
  creatingPortfolio: MutationState;
  renamingPortfolio: MutationState;
  deletingPortfolio: MutationState;
  creatingInvestment: MutationState;
  updatingInvestment: MutationState;
  deletingInvestment: MutationState;
};

const EUR = '\u20AC';

const EMPTY_DRAFT: InvestmentDraft = {
  asset: '',
  amount: '',
  price: '',
  date: ''
};

function isValidDate(value: string): boolean {
  if (!value) return false;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return false;
  const date = new Date(timestamp);
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}` === value;
}

function validateDraft(draft: InvestmentDraft): DraftErrors {
  const errors: DraftErrors = {};
  const amount = Number(draft.amount);
  const price = Number(draft.price);

  if (!draft.asset.trim()) {
    errors.asset = 'Asset is required';
  }

  if (!draft.amount.trim()) {
    errors.amount = 'Amount is required';
  } else if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (!draft.price.trim()) {
    errors.price = 'Price is required';
  } else if (!Number.isFinite(price) || price <= 0) {
    errors.price = 'Price must be greater than 0';
  }

  if (!draft.date.trim()) {
    errors.date = 'Date is required';
  } else if (!isValidDate(draft.date)) {
    errors.date = 'Date must be valid';
  }

  return errors;
}

function mapInvestmentToDraft(investment: Investment): InvestmentDraft {
  return {
    asset: investment.type ?? '',
    amount: String(investment.btc_amount ?? ''),
    price: String(investment.purchase_price ?? ''),
    date: investment.date_swap?.slice(0, 10) ?? ''
  };
}

function findInvestmentByRowId(investments: Investment[], rowId: string): Investment | null {
  return (
    investments.find((investment) => String(investment.id ?? `${investment.portfolio_id}-${investment.date_swap}`) === rowId) ??
    null
  );
}

export function InvestmentsTable({
  investments,
  rows,
  loading,
  error,
  portfolios,
  selectedPortfolioId,
  selectedPortfolioName,
  onSelectPortfolio,
  onCreatePortfolio,
  onRenamePortfolio,
  onDeletePortfolio,
  onCreateInvestment,
  onUpdateInvestment,
  onDeleteInvestment,
  creatingPortfolio,
  renamingPortfolio,
  deletingPortfolio,
  creatingInvestment,
  updatingInvestment,
  deletingInvestment
}: InvestmentsTableProps) {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionMode, setTransactionMode] = useState<'create' | 'edit'>('create');
  const [editingInvestmentId, setEditingInvestmentId] = useState<string | null>(null);
  const [draft, setDraft] = useState<InvestmentDraft>(EMPTY_DRAFT);
  const [draftErrors, setDraftErrors] = useState<DraftErrors>({});
  const [isPortfolioManagerOpen, setIsPortfolioManagerOpen] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [renamePortfolioName, setRenamePortfolioName] = useState('');
  const [managerPortfolioId, setManagerPortfolioId] = useState<string | null>(selectedPortfolioId);

  useEffect(() => {
    setManagerPortfolioId((previous) => {
      if (previous && portfolios.some((portfolio) => portfolio.portfolio_id === previous)) {
        return previous;
      }
      return selectedPortfolioId ?? portfolios[0]?.portfolio_id ?? null;
    });
  }, [portfolios, selectedPortfolioId]);

  useEffect(() => {
    if (!managerPortfolioId) {
      setRenamePortfolioName('');
      return;
    }

    const current = portfolios.find((portfolio) => portfolio.portfolio_id === managerPortfolioId);
    setRenamePortfolioName(current?.name ?? '');
  }, [managerPortfolioId, portfolios]);

  const selectedManagerPortfolio = useMemo(() => {
    if (!managerPortfolioId) return null;
    return portfolios.find((portfolio) => portfolio.portfolio_id === managerPortfolioId) ?? null;
  }, [managerPortfolioId, portfolios]);

  const openCreateTransactionModal = () => {
    setTransactionMode('create');
    setEditingInvestmentId(null);
    setDraft(EMPTY_DRAFT);
    setDraftErrors({});
    setIsTransactionModalOpen(true);
  };

  const openEditTransactionModal = (investmentId: string) => {
    const investment = findInvestmentByRowId(investments, investmentId);
    if (!investment) return;

    setTransactionMode('edit');
    setEditingInvestmentId(investmentId);
    setDraft(mapInvestmentToDraft(investment));
    setDraftErrors({});
    setIsTransactionModalOpen(true);
  };

  const closeTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setEditingInvestmentId(null);
    setDraft(EMPTY_DRAFT);
    setDraftErrors({});
  };

  const handleTransactionSubmit = async () => {
    const validationErrors = validateDraft(draft);
    setDraftErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload = {
      portfolio_id: selectedPortfolioId ?? undefined,
      asset: draft.asset.trim(),
      amount: Number(draft.amount),
      price: Number(draft.price),
      date: draft.date
    };

    if (transactionMode === 'create') {
      const ok = await onCreateInvestment(payload);
      if (ok) closeTransactionModal();
      return;
    }

    if (!editingInvestmentId) return;
    const ok = await onUpdateInvestment(editingInvestmentId, payload);
    if (ok) closeTransactionModal();
  };

  const handleDeleteFromModal = async () => {
    if (!editingInvestmentId || !selectedPortfolioId) return;
    const confirmed = window.confirm('Are you sure you want to delete this transaction?');
    if (!confirmed) return;

    const ok = await onDeleteInvestment(editingInvestmentId, selectedPortfolioId);
    if (ok) closeTransactionModal();
  };

  const handleDeleteFromRow = async (row: InvestmentRow) => {
    const confirmed = window.confirm('Are you sure you want to delete this transaction?');
    if (!confirmed) return;
    await onDeleteInvestment(row.id, row.portfolioId);
  };

  const handleCreatePortfolio = async () => {
    const ok = await onCreatePortfolio(newPortfolioName);
    if (ok) {
      setNewPortfolioName('');
    }
  };

  const handleRenamePortfolio = async () => {
    if (!managerPortfolioId) return;
    await onRenamePortfolio(managerPortfolioId, renamePortfolioName);
  };

  const handleDeletePortfolio = async () => {
    if (!managerPortfolioId) return;
    const targetName = selectedManagerPortfolio?.name ?? 'this portfolio';
    const confirmed = window.confirm(`Are you sure you want to delete ${targetName}?`);
    if (!confirmed) return;

    const ok = await onDeletePortfolio(managerPortfolioId);
    if (ok && portfolios.length <= 1) {
      setIsPortfolioManagerOpen(false);
    }
  };

  const renderTableBody = () => {
    if (loading) {
      return <div className="loading">Loading your investments...</div>;
    }

    if (error) {
      return <p className="error centered-text">{error}</p>;
    }

    if (!portfolios.length) {
      return <p className="muted centered-text">No portfolios available</p>;
    }

    if (!rows.length) {
      return <p className="muted centered-text">No investments yet.</p>;
    }

    return (
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>BTC Amount</th>
              <th>{`${EUR} Invested`}</th>
              <th>Purchase Price</th>
              <th>Current Value</th>
              <th>Profit/Loss</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const profitSign = row.profitLoss >= 0 ? '+' : '';
              return (
                <tr key={row.id}>
                  <td>{row.date}</td>
                  <td>{row.type}</td>
                  <td>{`${formatBtc(row.btcAmount)} BTC`}</td>
                  <td>{`${formatMoneyRounded(row.eurAmount)} ${EUR}`}</td>
                  <td>{`${formatMoneyRounded(row.purchasePrice)} ${EUR}`}</td>
                  <td>{`${formatMoneyRounded(row.currentValue)} ${EUR}`}</td>
                  <td className={row.profitLoss >= 0 ? 'positive' : 'negative'}>
                    {`${profitSign}${formatMoneyRounded(row.profitLoss)} ${EUR}`}
                  </td>
                  <td>{row.notes}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn-table btn-secondary"
                        onClick={() => openEditTransactionModal(row.id)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-table btn-danger"
                        onClick={() => handleDeleteFromRow(row)}
                        disabled={deletingInvestment.loading}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <section className="investments-shell">
      <div className="investments-table">
        <div className="investments-header">
          <h2>{selectedPortfolioName ?? 'Portfolio'}</h2>
          <div className="portfolio-controls">
            <div className="portfolio-select-wrap">
              <select
                id="portfolio-selector"
                className="portfolio-selector"
                value={selectedPortfolioId ?? ''}
                onChange={(event) => onSelectPortfolio(event.target.value)}
                disabled={loading || !portfolios.length}
              >
                {portfolios.map((portfolio) => (
                  <option key={portfolio.portfolio_id} value={portfolio.portfolio_id}>
                    {portfolio.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="btn-inline btn-secondary"
              onClick={() => setIsPortfolioManagerOpen(true)}
              disabled={!portfolios.length}
            >
              Manage Portfolios
            </button>
            <button
              type="button"
              className="btn-inline"
              onClick={openCreateTransactionModal}
              disabled={!selectedPortfolioId}
            >
              Add Transaction
            </button>
          </div>
        </div>

        {renderTableBody()}
      </div>

      {isTransactionModalOpen ? (
        <div className="modal-overlay open" onClick={(event) => event.currentTarget === event.target && closeTransactionModal()}>
          <div className="modal">
            <h3>{transactionMode === 'create' ? 'Create Transaction' : 'Edit Transaction'}</h3>
            <div className="form-group">
              <label htmlFor="asset">Asset</label>
              <input
                id="asset"
                value={draft.asset}
                onChange={(event) => setDraft((prev) => ({ ...prev, asset: event.target.value }))}
                placeholder="bitcoin"
              />
              {draftErrors.asset ? <p className="field-error">{draftErrors.asset}</p> : null}
            </div>
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="number"
                min="0"
                step="any"
                value={draft.amount}
                onChange={(event) => setDraft((prev) => ({ ...prev, amount: event.target.value }))}
              />
              {draftErrors.amount ? <p className="field-error">{draftErrors.amount}</p> : null}
            </div>
            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                id="price"
                type="number"
                min="0"
                step="any"
                value={draft.price}
                onChange={(event) => setDraft((prev) => ({ ...prev, price: event.target.value }))}
              />
              {draftErrors.price ? <p className="field-error">{draftErrors.price}</p> : null}
            </div>
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={draft.date}
                onChange={(event) => setDraft((prev) => ({ ...prev, date: event.target.value }))}
              />
              {draftErrors.date ? <p className="field-error">{draftErrors.date}</p> : null}
            </div>
            {transactionMode === 'create' && creatingInvestment.error ? (
              <div className="error">{creatingInvestment.error}</div>
            ) : null}
            {transactionMode === 'edit' && updatingInvestment.error ? (
              <div className="error">{updatingInvestment.error}</div>
            ) : null}
            {deletingInvestment.error ? <div className="error">{deletingInvestment.error}</div> : null}
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={closeTransactionModal}
                disabled={creatingInvestment.loading || updatingInvestment.loading || deletingInvestment.loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTransactionSubmit}
                disabled={creatingInvestment.loading || updatingInvestment.loading || deletingInvestment.loading}
              >
                {creatingInvestment.loading || updatingInvestment.loading ? 'Saving...' : 'Save'}
              </button>
            </div>
            {transactionMode === 'edit' ? (
              <div className="modal-actions modal-actions-delete">
                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleDeleteFromModal}
                  disabled={creatingInvestment.loading || updatingInvestment.loading || deletingInvestment.loading}
                >
                  {deletingInvestment.loading ? 'Deleting...' : 'Delete Transaction'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {isPortfolioManagerOpen ? (
        <div
          className="modal-overlay open"
          onClick={(event) => event.currentTarget === event.target && setIsPortfolioManagerOpen(false)}
        >
          <div className="modal">
            <h3>Manage Portfolios</h3>
            <div className="form-group">
              <label htmlFor="manager-portfolio">Portfolio</label>
              <select
                id="manager-portfolio"
                value={managerPortfolioId ?? ''}
                onChange={(event) => setManagerPortfolioId(event.target.value)}
                disabled={!portfolios.length}
              >
                {portfolios.map((portfolio) => (
                  <option key={portfolio.portfolio_id} value={portfolio.portfolio_id}>
                    {portfolio.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="new-portfolio">Create new portfolio</label>
              <input
                id="new-portfolio"
                value={newPortfolioName}
                onChange={(event) => setNewPortfolioName(event.target.value)}
                placeholder="Portfolio name"
              />
              {creatingPortfolio.error ? <p className="field-error">{creatingPortfolio.error}</p> : null}
              {creatingPortfolio.success ? <p className="info-msg">Portfolio created.</p> : null}
            </div>
            <div className="modal-actions">
              <button
                type="button"
                onClick={handleCreatePortfolio}
                disabled={creatingPortfolio.loading || deletingPortfolio.loading || renamingPortfolio.loading}
              >
                {creatingPortfolio.loading ? 'Creating...' : 'Create Portfolio'}
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="rename-portfolio">Rename selected portfolio</label>
              <input
                id="rename-portfolio"
                value={renamePortfolioName}
                onChange={(event) => setRenamePortfolioName(event.target.value)}
                placeholder="New name"
                disabled={!selectedManagerPortfolio}
              />
              {renamingPortfolio.error ? <p className="field-error">{renamingPortfolio.error}</p> : null}
              {renamingPortfolio.success ? <p className="info-msg">Portfolio renamed.</p> : null}
            </div>
            <div className="modal-actions">
              <button
                type="button"
                onClick={handleRenamePortfolio}
                disabled={!selectedManagerPortfolio || renamingPortfolio.loading || creatingPortfolio.loading}
              >
                {renamingPortfolio.loading ? 'Saving...' : 'Rename Portfolio'}
              </button>
            </div>

            <div className="modal-actions modal-actions-delete">
              <button
                type="button"
                className="btn-danger"
                onClick={handleDeletePortfolio}
                disabled={!selectedManagerPortfolio || deletingPortfolio.loading}
              >
                {deletingPortfolio.loading ? 'Deleting...' : 'Delete Portfolio'}
              </button>
            </div>
            {deletingPortfolio.error ? <p className="field-error">{deletingPortfolio.error}</p> : null}
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setIsPortfolioManagerOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
