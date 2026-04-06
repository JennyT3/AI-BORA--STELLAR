import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FilePlus2, 
  FileText, 
  Users, 
  DollarSign, 
  LogOut,
  CheckSquare,
  User,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react';
import { theme } from '../../styles/theme';

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
  onToggleCollapse,
  isMobile = false,
  vendedorId,
}: VendasSidebarProps) {
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orcamento', label: 'Novo Orçamento', icon: FilePlus2, href: `/admin/orcamento?vendedor=${vendedorId}` },
    { id: 'propostas', label: 'Propostas', icon: FileText, count: proposalCount },
    { id: 'clientes', label: 'Meus Clientes', icon: Users, count: clienteCount },
    { id: 'tarefas', label: 'Tarefas', icon: CheckSquare },
    { id: 'faturacao', label: 'Faturação', icon: DollarSign },
    { id: 'perfil', label: 'Meu Perfil', icon: User },
  ];

  const sidebarWidth = collapsed ? 80 : 260;

  const handleClick = (item: typeof navItems[0]) => {
    if (item.href) {
      window.location.href = item.href;
    } else {
      onTabChange(item.id);
    }
  };

  // En móvil, no renderizamos el sidebar - se maneja desde el componente padre
  if (isMobile) {
    return null;
  }

  return (
    <aside style={{
      width: sidebarWidth,
      minWidth: sidebarWidth,
      backgroundColor: '#1F2937',
      borderRight: '1px solid #374151',
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ 
        padding: collapsed ? '12px' : '24px', 
        borderBottom: '1px solid #374151', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: collapsed ? 'center' : 'flex-start',
        flexShrink: 0
      }}>
        {collapsed ? (
          <img src="/logo.png" alt="AI BORA" style={{ width: 40, height: 40, borderRadius: 8 }} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src="/logo.png" alt="AI BORA" style={{ width: 40, height: 40, borderRadius: 8 }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#F9FAFB' }}>
                AI BORA
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                Área Vendas
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isLink = !!item.href;

          return (
            <button 
              key={item.id} 
              onClick={() => handleClick(item)}
              style={{
                width: '100%',
                padding: collapsed ? '12px 8px' : '12px 16px',
                marginBottom: 4,
                background: isActive ? '#374151' : 'transparent',
                color: isActive ? '#F9FAFB' : '#9CA3AF',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? 0 : 12,
                fontSize: 14,
                fontWeight: 500,
                textAlign: 'left' as const,
                position: 'relative',
                transition: 'all 0.2s',
              }}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3,
                  height: 20,
                  backgroundColor: '#F25C05',
                  borderRadius: '0 2px 2px 0',
                }} />
              )}
              <Icon size={20} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
              {'count' in item && item.count !== undefined && !collapsed && (
                <span style={{
                  backgroundColor: '#F25C05',
                  color: '#FFFFFF',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 10,
                  marginLeft: 'auto',
                }}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid #374151', flexShrink: 0 }}>
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: 8,
              background: 'transparent',
              color: '#9CA3AF',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 14,
            }}
          >
            <ChevronLeft size={18} />
          </button>
        )}
        
        <button
          onClick={onLogout}
          style={{
            width: collapsed ? 'auto' : '100%',
            padding: collapsed ? '12px' : '12px 16px',
            background: 'transparent',
            color: '#9CA3AF',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: collapsed ? 0 : 12,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <LogOut size={18} />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      {/* User */}
      {userName && !collapsed && (
        <div style={{ padding: '16px', borderTop: '1px solid #374151', backgroundColor: '#374151', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>VENDEDOR</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#F9FAFB' }}>{userName}</div>
        </div>
      )}
    </aside>
  );
}
