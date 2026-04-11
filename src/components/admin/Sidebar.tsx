import React from 'react';
import { LayoutDashboard, FileText, Users, CheckSquare, LogOut, X, Plus } from 'lucide-react';

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
    { id: 'propostas', label: 'Proposals', icon: FileText, count: proposalCount },
    { id: 'clientes', label: 'Clients', icon: Users, count: clienteCount },
    { id: 'tarefas', label: 'Tasks', icon: CheckSquare },
  ];

  const sidebarWidth = isMobile ? 240 : (collapsed ? 72 : 240);
  const isHidden = isMobile && collapsed;

  return (
    <>
      {isMobile && !collapsed && (
        <div onClick={onCloseMobile} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 999 }} />
      )}

      <aside style={{
        width: sidebarWidth,
        backgroundColor: '#fff',
        borderRight: '1px solid #eee',
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
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            {!collapsed && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A' }}>AI <span style={{ color: '#F25C05' }}>BORA</span></div>
                <div style={{ fontSize: 9, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admin</div>
              </div>
            )}
            {isMobile && <button onClick={onCloseMobile} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#666" /></button>}
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => onTabChange(item.id)} style={{
                width: '100%',
                padding: collapsed ? '10px' : '10px 12px',
                background: isActive ? 'rgba(242, 92, 5, 0.1)' : 'transparent',
                color: isActive ? '#F25C05' : '#666',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 8,
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                transition: 'all 0.2s',
              }}>
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && 'count' in item && item.count > 0 && (
                  <span style={{ marginLeft: 'auto', background: isActive ? '#F25C05' : '#eee', color: isActive ? '#fff' : '#666', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 100 }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          {!collapsed && (
            <button onClick={() => window.location.href = '/admin/orcamento'} style={{
              width: '100%',
              padding: '10px',
              background: 'linear-gradient(135deg, #F25C05, #F22283)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 11,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginTop: 12,
            }}>
              <Plus size={14} /> New Proposal
            </button>
          )}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px', borderTop: '1px solid #f0f0f0' }}>
          <button onClick={onLogout} style={{
            width: '100%',
            padding: '8px 12px',
            background: 'transparent',
            color: '#dc2626',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 8,
            fontSize: 12,
            fontWeight: 600,
          }}>
            <LogOut size={16} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}