import React, { useState } from 'react';
import { Share2, Copy, X, Check, Mail, MessageCircle, Gift, Users } from 'lucide-react';
import { Vendedor } from '../../types';

interface ConviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendedor: Vendedor;
}

export function ConviteModal({ isOpen, onClose, vendedor }: ConviteModalProps) {
  const [copied, setCopied] = useState(false);
  const inviteLink = `https://aibora.pt/ref/${vendedor.id}`;

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleWhatsApp = () => {
    const text = `Junta-te a mim na AI BORA e descobre o CRM do futuro! Usa o meu convite exclusivo: ${inviteLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleEmail = () => {
    const subject = 'Convite VIP - AI BORA';
    const body = `Junta-te a mim na AI BORA e descobre o CRM do futuro! Usa o meu convite exclusivo: ${inviteLink}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const convitesEnviados = vendedor.referidosInvitados?.length || 0;
  const convitesConvertidos = vendedor.referidosConvertidos || 0;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 24,
      fontFamily: 'Montserrat, sans-serif'
    }}>
      <div style={{
        background: '#0F0F0F',
        borderRadius: 24,
        width: '100%',
        maxWidth: 480,
        position: 'relative',
        border: '1px solid rgba(242, 92, 5, 0.2)',
        boxShadow: '0 25px 50px -12px rgba(242, 92, 5, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Header Decorator */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: 'linear-gradient(90deg, #F25C05, #F22283)' }}></div>
        
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          <X size={16} />
        </button>

        <div style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, background: 'rgba(242, 92, 5, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(242, 92, 5, 0.2)' }}>
            <Gift size={40} color="#F25C05" />
          </div>
          
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
            Convida & <span style={{ color: '#F25C05' }}>Ganha</span>
          </h2>
          <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.6, marginBottom: 32 }}>
            Convida um colega para a AI BORA com o teu link exclusivo. Quando ele fechar o seu primeiro cliente, ganhas automaticamente <strong style={{ color: '#F25C05' }}>+5% de bónus</strong> na tua próxima comissão!
          </p>

          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ flex: 1, fontSize: 13, color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
              {inviteLink}
            </div>
            <button 
              onClick={handleCopy}
              style={{ padding: '8px 16px', background: copied ? 'rgba(16, 185, 129, 0.1)' : '#F25C05', color: copied ? '#10B981' : '#fff', borderRadius: 10, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, transition: 'all 0.2s', flexShrink: 0 }}
            >
              {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
            <button onClick={handleWhatsApp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <MessageCircle size={18} color="#25D366" /> WhatsApp
            </button>
            <button onClick={handleEmail} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <Mail size={18} /> E-mail
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#888', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                <Users size={14} /> Convidados
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>{convitesEnviados}</div>
            </div>
            <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#888', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                <Check size={14} color="#10B981" /> Sucesso!
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#10B981' }}>{convitesConvertidos}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
