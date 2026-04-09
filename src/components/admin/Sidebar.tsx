import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  DollarSign, 
  LogOut, 
  CheckSquare,
  X,
  Settings,
  Plus,
  Megaphone,
  ArrowRightLeft
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName: string;
  onLogout: () => void;
  proposalCount: number;
  clienteCount: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ 
  activeTab, 
  onTabChange, 
  onLogout,
  proposalCount,
  clienteCount,
  collapsed = false,
  isMobile = false,
  onCloseMobile,
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'solicitacoes', label: 'Requests', icon: FileText },
    { id: 'clientes', label: 'CRM — clients', icon: Users, count: clienteCount },
    { id: 'propostas', label: 'Proposals', icon: FileText, count: proposalCount },
    { id: 'vendedores', label: 'Sales team', icon: Users },
    { id: 'delegacoes', label: 'Delegations', icon: ArrowRightLeft },
    { id: 'tarefas', label: 'Tasks', icon: CheckSquare },
    { id: 'faturacao', label: 'Billing', icon: DollarSign },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
  ];

  const sidebarWidth = isMobile ? 280 : (collapsed ? 80 : 280);
  const isHidden = isMobile && collapsed;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !collapsed && (
        <div 
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
          }}
        />
      )}

      <aside style={{
        width: sidebarWidth,
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        position: 'fixed',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s ease, width 0.3s ease',
        zIndex: 1000,
        left: 0,
        top: 0,
        transform: isHidden ? 'translateX(-100%)' : 'translateX(0)',
        fontFamily: 'Montserrat, sans-serif',
        boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
      }}>
        {/* Logo Section */}
        <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src="/logo.png" 
              alt="AI BORA" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 }}
            />
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: '#1b1c1b', letterSpacing: '-0.5px' }}>
                AI <span style={{ color: '#F25C05' }}>BORA</span>
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#a23a00', textTransform: 'uppercase', opacity: 0.7 }}>
                Admin Suite
              </span>
            </div>
          )}
          {isMobile && (
            <button onClick={onCloseMobile} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#666' }}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button 
                key={item.id} 
                onClick={() => onTabChange(item.id)} 
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: isActive ? 'rgba(242, 92, 5, 0.08)' : 'transparent',
                  color: isActive ? '#F25C05' : '#4b5563',
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  gap: 12,
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                {'count' in item && item.count !== undefined && item.count > 0 && !collapsed && (
                  <span style={{
                    backgroundColor: isActive ? '#F25C05' : '#f3f4f6',
                    color: isActive ? '#fff' : '#6b7280',
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 100,
                    marginLeft: 'auto',
                  }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          {!collapsed && (
            <div style={{ marginTop: 24, padding: '0 8px' }}>
              <button 
                onClick={() => window.location.href = '/admin/orcamento'}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #F25C05 0%, #F22283 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 16,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 8px 16px rgba(242, 92, 5, 0.2)',
                }}
              >
                <Plus size={18} strokeWidth={3} />
                Create new
              </button>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div style={{ padding: '24px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button 
            style={{
              width: '100%',
              padding: '10px 16px',
              background: 'transparent',
              color: '#6b7280',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <Settings size={18} />
            {!collapsed && <span>Settings</span>}
          </button>

          <button 
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: 'transparent',
              color: '#ef4444',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <LogOut size={18} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
