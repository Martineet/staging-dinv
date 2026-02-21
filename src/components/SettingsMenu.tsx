'use client';

import { useEffect, useRef, useState } from 'react';

type SettingsMenuProps = {
  onChangePassword: () => void;
  onLogout: () => void;
};

export function SettingsMenu({ onChangePassword, onLogout }: SettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="settings-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="settings-btn"
        title="Settings"
        aria-label="Settings"
        onClick={() => setOpen((prev) => !prev)}
      >
        ⚙️
      </button>
      <div className={`settings-dropdown ${open ? 'open' : ''}`}>
        <button
          type="button"
          className="settings-item"
          onClick={() => {
            setOpen(false);
            onChangePassword();
          }}
        >
          🔑 Change Password
        </button>
        <div className="settings-divider" />
        <button
          type="button"
          className="settings-item danger"
          onClick={() => {
            setOpen(false);
            onLogout();
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
