'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const LOCK_ICON = '\u{1F510}';

export function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupText, setSignupText] = useState('\u2192 Sign up');

  useEffect(() => {
    const changed = sessionStorage.getItem('pw_changed');
    if (changed) {
      setInfo('Password updated. Please log in again.');
      sessionStorage.removeItem('pw_changed');
    }
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    const { error: signInError } = await signIn(email.trim(), password);
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
    }
  };

  return (
    <div className="login-form-wrapper">
      <h2 className="section-title">{`${LOCK_ICON} Member Login`}</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="your@email.com"
            autoComplete="email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <button
          type="button"
          className="signup-placeholder-btn"
          onClick={() => setSignupText('\u2192 Work in progress')}
        >
          {signupText}
        </button>
        {error ? <div className="error">{error}</div> : null}
        {info ? <div className="info-msg">{info}</div> : null}
      </form>
    </div>
  );
}
