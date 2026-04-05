import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FilePlus2, 
  FileText, 
  MessageSquare, 
  Users, 
  DollarSign, 
  LogOut, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  X
} from 'lucide-react';
import { theme } from '../../styles/theme';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName: string;
  onLogout: () => void;
  proposalCount: number;
  solicitudCount: number;
  clienteCount: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ 
  activeTab, 
  onTabChange, 
  userName, 
  onLogout,
  proposalCount,
  solicitudCount,
  clienteCount,
  collapsed = false,
  onToggleCollapse,
  isMobile = false,
  onCloseMobile,
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orcamento', label: 'Novo Orçamento', icon: FilePlus2, href: '/admin/orcamento' },
    { id: 'propostas', label: 'Propostas', icon: FileText, count: proposalCount },
    { id: 'solicitacoes', label: 'Solicitações', icon: MessageSquare, count: solicitudCount },
    { id: 'clientes', label: 'Clientes', icon: Users, count: clienteCount },
    { id: 'faturacao', label: 'Faturação', icon: DollarSign },
    { id: 'vendedores', label: 'Vendedores', icon: Users },
    { id: 'tarefas', label: 'Tarefas', icon: CheckSquare },
  ];

  return (
    <aside style={{
      width: isMobile ? 280 : (collapsed ? 80 : 260),
      backgroundColor: theme.colors.bg.sidebar,
      borderRight: `1px solid ${theme.colors.bg.sidebarBorder}`,
      position: 'fixed',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      zIndex: 100,
    }}>
      {/* Mobile Close Button */}
      {isMobile && (
        <div style={{ 
          padding: '16px', 
          borderBottom: `1px solid ${theme.colors.bg.sidebarBorder}`, 
          display: 'flex', 
          justifyContent: 'flex-end' 
        }}>
          <button 
            onClick={onCloseMobile}
            style={{
              background: 'none',
              border: 'none',
              padding: 8,
              cursor: 'pointer',
              color: theme.colors.text.sidebar,
            }}
          >
            <X size={24} />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: collapsed ? theme.spacing.md : theme.spacing.xl, borderBottom: `1px solid ${theme.colors.bg.sidebarBorder}`, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start' }}>
        {collapsed || isMobile ? (
          <img src="/logo.png" alt="AI BORA" style={{ width: 40, height: 40, borderRadius: theme.borderRadius.md }} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src="/logo.png" alt="AI BORA" style={{ width: 40, height: 40, borderRadius: theme.borderRadius.md }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: theme.fontWeight.extrabold, color: theme.colors.text.sidebarActive, fontFamily: theme.fontFamily.sans }}>
                AI BORA
              </div>
              <div style={{ fontSize: 12, color: theme.colors.text.sidebar, fontWeight: theme.fontWeight.semibold }}>
                Admin Panel
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: theme.spacing.lg, overflowY: 'auto' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isLink = !!item.href;

          const buttonStyle: React.CSSProperties = {
            width: '100%',
            padding: collapsed ? '12px' : '12px 16px',
            marginBottom: 4,
            background: isActive ? theme.colors.bg.sidebarHover : 'transparent',
            color: isActive ? theme.colors.text.sidebarActive : theme.colors.text.sidebar,
            border: 'none',
            borderRadius: theme.borderRadius.md,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: collapsed ? 0 : 12,
            fontSize: theme.fontSize.md,
            fontWeight: theme.fontWeight.medium,
            fontFamily: theme.fontFamily.sans,
            textAlign: 'left' as const,
            position: 'relative',
            transition: 'all 0.2s',
          };

          const handleClick = () => {
            if (isLink && item.href) {
              window.location.href = item.href;
            } else {
              onTabChange(item.id);
            }
          };

          return (
            <button key={item.id} onClick={handleClick} style={buttonStyle} title={collapsed ? item.label : undefined}>
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3,
                  height: 20,
                  backgroundColor: theme.colors.accent.primary,
                  borderRadius: '0 2px 2px 0',
                }} />
              )}
              <Icon size={20} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
              {'count' in item && item.count !== undefined && !collapsed && (
                <span style={{
                  backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : theme.colors.accent.primary,
                  color: '#FFFFFF',
                  fontSize: theme.fontSize.xs,
                  fontWeight: theme.fontWeight.bold,
                  padding: '2px 8px',
                  borderRadius: theme.borderRadius.full,
                  marginLeft: 'auto',
                }}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Ver Site button */}
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            width: '100%',
            padding: collapsed ? '12px' : '12px 16px',
            marginTop: theme.spacing.sm,
            marginBottom: 4,
            background: 'transparent',
            color: theme.colors.text.sidebar,
            border: collapsed ? 'none' : `1px solid ${theme.colors.bg.sidebarBorder}`,
            borderRadius: theme.borderRadius.md,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: collapsed ? 0 : 12,
            fontSize: theme.fontSize.md,
            fontWeight: theme.fontWeight.medium,
            fontFamily: theme.fontFamily.sans,
          }}
          title={collapsed ? 'Ver Site' : undefined}
        >
          <ExternalLink size={20} />
          {!collapsed && <span>Ver Site</span>}
        </button>
      </nav>

      {/* User Section */}
      <div style={{ padding: collapsed ? theme.spacing.sm : theme.spacing.lg, borderTop: `1px solid ${theme.colors.bg.sidebarBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 12, marginBottom: theme.spacing.md }}>
          <div style={{
            width: 36,
            height: 36,
            backgroundColor: theme.colors.accent.primary,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: theme.fontWeight.bold,
            color: '#FFFFFF',
            fontSize: 14,
          }}>
            {userName[0]}
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold, color: theme.colors.text.sidebarActive }}>{userName}</div>
              <div style={{ fontSize: theme.fontSize.sm, color: theme.colors.text.sidebar }}>Administrador</div>
            </div>
          )}
        </div>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: 10,
            background: 'transparent',
            border: collapsed ? 'none' : `1px solid ${theme.colors.bg.sidebarBorder}`,
            borderRadius: theme.borderRadius.md,
            color: theme.colors.text.sidebar,
            fontSize: theme.fontSize.md,
            cursor: 'pointer',
            fontFamily: theme.fontFamily.sans,
            fontWeight: theme.fontWeight.medium,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 8,
          }}
          title={collapsed ? 'Terminar sessão' : undefined}
        >
          <LogOut size={16} />
          {!collapsed && <span>Terminar sessão</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          style={{
            position: 'absolute',
            top: '50%',
            right: -12,
            transform: 'translateY(-50%)',
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: theme.colors.bg.sidebarHover,
            border: `1px solid ${theme.colors.bg.sidebarBorder}`,
            color: theme.colors.text.sidebar,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 101,
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      )}
    </aside>
  );
}