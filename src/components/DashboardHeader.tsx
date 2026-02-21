import { SettingsMenu } from '@/components/SettingsMenu';

type DashboardHeaderProps = {
  displayName: string;
  onChangePassword: () => void;
  onLogout: () => void;
};

export function DashboardHeader({ displayName, onChangePassword, onLogout }: DashboardHeaderProps) {
  return (
    <div className="header">
      <h1 className="welcome">Welcome, <span>{displayName}</span>!</h1>
      <SettingsMenu onChangePassword={onChangePassword} onLogout={onLogout} />
    </div>
  );
}