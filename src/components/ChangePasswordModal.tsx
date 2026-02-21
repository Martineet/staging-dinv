'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

type ChangePasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const resetState = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }

    setLoading(true);

    try {
      await changePassword(currentPassword, newPassword);
      setSuccess('Password updated. Logging out...');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update password.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" onClick={(event) => event.currentTarget === event.target && handleClose()}>
      <div className="modal">
        <h3>Change Password</h3>
        <div className="form-group">
          <label htmlFor="currentPassword">Current password</label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="Enter current password"
            autoComplete="current-password"
          />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">New password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm new password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat password"
            autoComplete="new-password"
          />
        </div>
        {error ? <div className="error">{error}</div> : null}
        {success ? <div className="info-msg">{success}</div> : null}
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}