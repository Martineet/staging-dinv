type DashboardHeaderProps = {
  displayName: string;
};

export function DashboardHeader({ displayName }: DashboardHeaderProps) {
  return (
    <div className="header">
      <h1 className="welcome">Welcome, <span>{displayName}</span>!</h1>
    </div>
  );
}
