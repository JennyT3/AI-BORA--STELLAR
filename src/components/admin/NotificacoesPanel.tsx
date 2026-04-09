import { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { 
  listNotificacoes, 
  marcarNotificacaoComoLida, 
  marcarTodasComoLidas, 
  excluirNotificacao,
  subscribeToNotificacoes,
  getNotificacaoIcon,
  Notificacao
} from '../../services/notificacoes';

interface NotificacoesPanelProps {
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export function NotificacoesPanel({ onClose, onNavigate }: NotificacoesPanelProps) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadNotificacoes();
    
    const unsubscribe = subscribeToNotificacoes((notifs) => {
      setNotificacoes(notifs);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const loadNotificacoes = async () => {
    try {
      const data = await listNotificacoes();
      setNotificacoes(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarLida = async (id: string) => {
    await marcarNotificacaoComoLida(id);
    setNotificacoes(prev => 
      prev.map(n => n.id === id ? { ...n, lida: true } : n)
    );
  };

  const handleMarcarTodas = async () => {
    await marcarTodasComoLidas();
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
  };

  const handleExcluir = async (id: string) => {
    await excluirNotificacao(id);
    setNotificacoes(prev => prev.filter(n => n.id !== id));
  };

  const handleNavigate = (notif: Notificacao) => {
    if (notif.tarefaId && onNavigate) {
      onNavigate('tarefas');
    } else if (notif.clienteId && onNavigate) {
      onNavigate('clientes');
    } else if (notif.solicitacaoId && onNavigate) {
      onNavigate('solicitacoes');
    }
    handleMarcarLida(notif.id);
    onClose();
  };

  const formatDate = (data: any) => {
    if (!data) return '';
    const date = new Date(data);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-GB');
  };

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 2000
    }} onClick={onClose}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#fff',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.15)'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bell size={24} color="#F25C05" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1b1c1b', margin: 0 }}>
              Notifications
            </h2>
            {naoLidas > 0 && (
              <span style={{
                backgroundColor: '#ef4444',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px'
              }}>
                {naoLidas}
              </span>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="#666" />
          </button>
        </div>

        {/* Actions */}
        {naoLidas > 0 && (
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={handleMarcarTodas}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: '#6b7280',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
          </div>
        )}

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              Loading...
            </div>
          ) : notificacoes.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Bell size={48} color="#d1d5db" style={{ marginBottom: '12px' }} />
              <p style={{ color: '#6b7280', margin: 0 }}>No notifications</p>
            </div>
          ) : (
            notificacoes.map(notif => (
              <div
                key={notif.id}
                style={{
                  padding: '16px',
                  borderBottom: '1px solid #f3f4f6',
                  backgroundColor: notif.lida ? '#fff' : '#f0f9ff',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onClick={() => handleNavigate(notif)}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{
                    fontSize: '20px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '10px',
                    flexShrink: 0
                  }}>
                    {getNotificacaoIcon(notif.tipo)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <h4 style={{ 
                        fontSize: '14px', 
                        fontWeight: notif.lida ? 500 : 700, 
                        color: '#1b1c1b', 
                        margin: 0 
                      }}>
                        {notif.titulo}
                      </h4>
                      <span style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                        {formatDate(notif.dataCriacao)}
                      </span>
                    </div>
                    <p style={{ 
                      fontSize: '13px', 
                      color: '#6b7280', 
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {notif.mensagem}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      {!notif.lida && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarcarLida(notif.id); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'none',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '11px',
                            color: '#6b7280',
                            cursor: 'pointer'
                          }}
                        >
                          <Check size={12} />
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleExcluir(notif.id); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'none',
                          border: '1px solid #fee2e2',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          color: '#dc2626',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}