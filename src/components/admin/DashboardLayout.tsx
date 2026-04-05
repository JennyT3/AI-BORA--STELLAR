import React, { useState, useEffect } from 'react';
import { Sidebar } from '../admin/Sidebar';
import { DashboardOverview } from '../dashboard/DashboardOverview';
import { theme } from '../../styles/theme';
import { Menu, X } from 'lucide-react';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth <= 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setSidebarOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.colors.bg.primary, display: 'flex' }}>
      {/* Mobile/Tablet Header */}
      {(isMobile || isTablet) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          backgroundColor: theme.colors.bg.sidebar,
          borderBottom: `1px solid ${theme.colors.bg.sidebarBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 200,
        }}>
          <button 
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: 8,
              cursor: 'pointer',
              color: theme.colors.text.sidebarActive,
            }}
          >
            <Menu size={24} />
          </button>
          <img src="/logo.png" alt="AI BORA" style={{ width: 32, height: 32, borderRadius: theme.borderRadius.md }} />
          <div style={{ width: 40 }}></div>
        </div>
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 299,
          }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: isMobile ? 300 : 100,
        transform: isMobile 
          ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)')
          : 'translateX(0)',
        transition: 'transform 0.3s ease',
        width: isMobile ? 280 : (isTablet ? 80 : 260),
      }}>
        <Sidebar 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          userName={userName}
          onLogout={onLogout}
          proposalCount={proposalCount}
          solicitudCount={solicitudCount}
          clienteCount={clienteCount}
          collapsed={isTablet}
          onToggleCollapse={isTablet ? undefined : undefined}
          isMobile={isMobile}
          onCloseMobile={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        padding: isMobile ? '80px 16px 24px 16px' : (isTablet ? '80px 16px 24px 16px' : theme.spacing.xxl), 
        overflow: 'auto', 
        marginLeft: isMobile ? 0 : (isTablet ? 80 : 260),
        marginTop: (isMobile || isTablet) ? 60 : 0,
      }}>
        {children}
      </main>
    </div>
  );
}
