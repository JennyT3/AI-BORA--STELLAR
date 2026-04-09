import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  DollarSign, 
  LogOut,
  CheckSquare,
  User,
  Plus,
  TrendingUp
} from 'lucide-react';

interface VendasSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName: string;
  onLogout: () => void;
  proposalCount: number;
  clienteCount: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
  vendedorId?: string;
}

export function VendasSidebar({ 
  activeTab, 
  onTabChange, 
  userName, 
  onLogout,
  proposalCount,
  clienteCount,
  collapsed = false,
  isMobile = false,
  onCloseMobile,
  vendedorId,
}: VendasSidebarProps & { onCloseMobile?: () => void }) {
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'propostas', label: 'Propostas', icon: FileText, count: proposalCount },
    { id: 'clientes', label: 'Meus Clientes', icon: Users, count: clienteCount },
    { id: 'tarefas', label: 'Minhas Tarefas', icon: CheckSquare },
    { id: 'faturacao', label: 'Comissões', icon: DollarSign },
    { id: 'perfil', label: 'Meu Perfil', icon: User },
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
        width: 280,
        backgroundColor: '#1b1c1b',
        borderRight: '1px solid rgba(242, 92, 5, 0.2)',
        position: 'fixed',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        left: 0,
        top: 0,
        fontFamily: 'Montserrat, sans-serif',
      }}>
      {/* Header / Logo - Static approach */}
      <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <img src="/logo.png" alt="AI BORA" style={{ width: 36, height: 36, borderRadius: 8 }} />
        <span style={{ fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>AI BORA</span>
      </div>

      {/* Motivation Badge */}
      {!collapsed && (
        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ 
            background: 'rgba(242, 92, 5, 0.1)', 
            border: '1px solid rgba(242, 92, 5, 0.2)', 
            borderRadius: 12, 
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <TrendingUp size={16} color="#F25C05" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#F25C05' }}>BORA VENDER MAIS!</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button 
              key={item.id} 
              onClick={() => {
                onTabChange(item.id);
                if (isMobile && onCloseMobile) {
                  onCloseMobile();
                }
              }} 
              style={{
                width: '100%',
                padding: '12px 16px',
                background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                color: isActive ? '#fff' : '#94a3b8',
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
                position: 'relative',
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  width: 4,
                  height: 20,
                  background: 'linear-gradient(to bottom, #F25C05, #F22283)',
                  borderRadius: '0 4px 4px 0'
                }} />
              )}
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {!collapsed && <span>{item.label}</span>}
              {'count' in item && item.count !== undefined && item.count > 0 && !collapsed && (
                <span style={{
                  backgroundColor: isActive ? '#F22283' : 'rgba(255,255,255,0.1)',
                  color: '#fff',
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

        {/* Action Button */}
        {!collapsed && (
          <div style={{ marginTop: 24, padding: '0 8px' }}>
            <button 
              onClick={() => window.location.href = `/admin/orcamento?vendedor=${vendedorId}`}
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
                boxShadow: '0 10px 20px rgba(242, 92, 5, 0.2)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Plus size={18} strokeWidth={3} />
              Novo Orçamento
            </button>
          </div>
        )}
      </nav>

      {/* User Profile Section */}
      <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 12, 
            background: 'linear-gradient(135deg, #F25C05 0%, #F22283 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#fff',
            fontSize: 16,
            fontWeight: 800,
            border: '2px solid rgba(255,255,255,0.1)'
          }}>
            {userName[0]}
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{userName}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>Sales Professional</span>
            </div>
          )}
        </div>
        
        <button 
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 10,
            fontSize: 13,
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
        >
          <LogOut size={18} />
          {!collapsed && <span>Terminar Sessão</span>}
        </button>
      </div>
    </aside>
    </>
  );
}

