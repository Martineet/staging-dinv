'use client';

import { useEffect, useRef, useState } from 'react';

type SettingsMenuProps = {
  onChangePassword: () => void;
  onLogout: () => void;
};

const GEAR_ICON = '\u2699\uFE0F';
const KEY_ICON = '\u{1F511}';
const DOOR_ICON = '\u{1F6AA}';

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
        {GEAR_ICON}
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
          {`${KEY_ICON} Change Password`}
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
          {`${DOOR_ICON} Logout`}
        </button>
      </div>
    </div>
  );
}
