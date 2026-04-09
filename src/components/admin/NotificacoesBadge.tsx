import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { subscribeToNaoLidas } from '../../services/notificacoes';
import { NotificacoesPanel } from './NotificacoesPanel';

interface NotificacoesBadgeProps {
  onNavigate?: (tab: string) => void;
}

export function NotificacoesBadge({ onNavigate }: NotificacoesBadgeProps) {
  const [count, setCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToNaoLidas((n) => {
      setCount(n);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <button
        onClick={() => setShowPanel(true)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Bell size={22} color="#4b5563" />
        {count > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            backgroundColor: '#ef4444',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 700,
            minWidth: '18px',
            height: '18px',
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px'
          }}>
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>
      
      {showPanel && (
        <NotificacoesPanel 
          onClose={() => setShowPanel(false)} 
          onNavigate={onNavigate}
        />
      )}
    </>
  );
}