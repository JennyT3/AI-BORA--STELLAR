import React from 'react';
import { Sidebar } from '../admin/Sidebar';
import { DashboardOverview } from '../dashboard/DashboardOverview';
import { theme } from '../../styles/theme';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName: string;
  onLogout: () => void;
  proposalCount: number;
  solicitudCount: number;
  clienteCount: number;
}

export function DashboardLayout({ children, activeTab, onTabChange, userName, onLogout, proposalCount, solicitudCount, clienteCount }: DashboardLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.colors.bg.primary, display: 'flex' }}>
      <Sidebar 
        activeTab={activeTab}
        onTabChange={onTabChange}
        userName={userName}
        onLogout={onLogout}
        proposalCount={proposalCount}
        solicitudCount={solicitudCount}
        clienteCount={clienteCount}
      />
      <main style={{ flex: 1, padding: theme.spacing.xxl, overflow: 'auto', marginLeft: 260 }}>
        {children}
      </main>
    </div>
  );
}