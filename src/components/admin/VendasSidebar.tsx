import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FilePlus2, 
  FileText, 
  Users, 
  DollarSign, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  CheckSquare
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
  vendedorId,
}: VendasSidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orcamento', label: 'Novo Orçamento', icon: FilePlus2, href: vendedorId ? `/admin/orcamento?vendedor=${vendedorId}` : '/admin/orcamento' },
    { id: 'propostas', label: 'Propostas', icon: FileText, count: proposalCount },
    { id: 'clientes', label: 'Meus Clientes', icon: Users, count: clienteCount },
    { id: 'tarefas', label: 'Tarefas', icon: CheckSquare },
    { id: 'faturacao', label: 'Faturação', icon: DollarSign },
    { id: 'perfil', label: 'Meu Perfil', icon: User },
  ];

  return (
    <aside style={{
      width: collapsed ? 80 : 260,
      backgroundColor: '#1A1A1A',
      position: 'fixed',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      zIndex: 100,
    }}>
      <div style={{ padding: collapsed ? '20px 10px' : '24px 20px', borderBottom: '1px solid #333' }}>
        {collapsed ? (
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', textAlign: 'center' }}>AV</div>
        ) : (
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>
              AI BORA <span style={{ color: '#F22283' }}>Vendas</span>
            </div>
            <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>Área do Vendedor</div>
          </div>
        )}
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', overflow: 'auto' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          if (item.href) {
            return (
              <a
                key={item.id}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: collapsed ? '12px' : '12px 16px',
                  borderRadius: 10,
                  backgroundColor: isActive ? 'rgba(242, 92, 5, 0.15)' : 'transparent',
                  color: isActive ? '#F25C05' : '#aaa',
                  textDecoration: 'none',
                  marginBottom: 4,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
              </a>
            );
          }
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '12px' : '12px 16px',
                borderRadius: 10,
                backgroundColor: isActive ? 'rgba(242, 92, 5, 0.15)' : 'transparent',
                color: isActive ? '#F25C05' : '#aaa',
                border: 'none',
                width: '100%',
                marginBottom: 4,
                justifyContent: collapsed ? 'center' : 'flex-start',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
              }}
            >
              <Icon size={20} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.count !== undefined && (
                    <span style={{ 
                      backgroundColor: isActive ? 'rgba(242, 92, 5, 0.3)' : '#333',
                      padding: '2px 8px',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 600
                    }}>
                      {item.count}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '16px 12px', borderTop: '1px solid #333' }}>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px',
              borderRadius: 8,
              backgroundColor: '#333',
              color: '#fff',
              border: 'none',
              width: '100%',
              marginBottom: 8,
              cursor: 'pointer',
            }}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
        
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: collapsed ? '12px' : '12px 16px',
            borderRadius: 10,
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            color: '#dc2626',
            border: 'none',
            width: '100%',
            justifyContent: collapsed ? 'center' : 'flex-start',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <LogOut size={18} />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      {!collapsed && userName && (
        <div style={{ padding: '12px 20px', borderTop: '1px solid #333', backgroundColor: '#222' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Vendedor</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{userName}</div>
        </div>
      )}
    </aside>
  );
}