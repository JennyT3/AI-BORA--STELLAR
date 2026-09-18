import { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { 
  listNotifications, 
  markNotificationAsRead, 
  markAllAsRead, 
  deleteNotification,
  subscribeToNotifications,
  getNotificationIcon,
  Notification
} from '../../services/notifications';

interface NotificationsPanelProps {
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export function NotificationsPanel({ onClose, onNavigate }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    
    const unsubscribe = subscribeToNotifications((notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await listNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNavigate = (notif: Notification) => {
    if (notif.taskId && onNavigate) {
      onNavigate('tasks');
    } else if (notif.clientId && onNavigate) {
      onNavigate('clients');
    } else if (notif.requestId && onNavigate) {
      onNavigate('requests');
    }
    handleMarkRead(notif.id);
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

  const notRead = notifications.filter(n => !n.read).length;

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
            {notRead > 0 && (
              <span style={{
                backgroundColor: '#ef4444',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px'
              }}>
                {notRead}
              </span>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="#666" />
          </button>
        </div>

        {/* Actions */}
        {notRead > 0 && (
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={handleMarkAll}
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
          ) : notifications.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Bell size={48} color="#d1d5db" style={{ marginBottom: '12px' }} />
              <p style={{ color: '#6b7280', margin: 0 }}>No notifications</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                style={{
                  padding: '16px',
                  borderBottom: '1px solid #f3f4f6',
                  backgroundColor: notif.read ? '#fff' : '#f0f9ff',
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
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <h4 style={{ 
                        fontSize: '14px', 
                        fontWeight: notif.read ? 500 : 700, 
                        color: '#1b1c1b', 
                        margin: 0 
                      }}>
                        {notif.title}
                      </h4>
                      <span style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                        {formatDate(notif.createdAt)}
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
                      {notif.message}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      {!notif.read && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.id); }}
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
                        onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
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