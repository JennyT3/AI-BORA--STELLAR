import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Loader2, Bot, ExternalLink } from 'lucide-react';
import { useSectionInView } from '../hooks/useSectionInView';
import { createContacto } from '../services/firebase';
import { sendMensagemConfirmacao } from '../services/emailService';

export function CTAFooterSection() {
  const { ref, isInView } = useSectionInView();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    nome: '',
    nomeNegocio: '',
    telefone: '',
    email: '',
    mensagem: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await createContacto({
        nome: formData.nome,
        negocio: formData.nomeNegocio,
        telemovel: formData.telefone,
        email: formData.email,
        mensagem: formData.mensagem,
        origem: 'Home',
        tipo: 'contacto',
        status: 'pendente',
      });

      if (formData.email) {
        try {
          await sendMensagemConfirmacao(formData.email, formData.nome);
        } catch (emailErr) {
          console.error('Failed to send confirmation email:', emailErr);
        }
      }

      setSubmitStatus('success');
      setFormData({ nome: '', nomeNegocio: '', telefone: '', email: '', mensagem: '' });
      setTimeout(() => setSubmitStatus('idle'), 3000);
      
    } catch (error) {
      console.error('Failed to submit:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  return (
    <section id="contacto" style={{ backgroundColor: '#F8F7F4', padding: '80px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }} ref={ref}>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            padding: '48px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48 }}>
            
            <div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ width: 36, height: 3, backgroundColor: '#F25C05', marginBottom: 16, borderRadius: 2 }} />
                <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 'clamp(24px, 3vw, 32px)', color: '#1A1A1A', margin: '0 0 8px' }}>
                  Ready to get started?
                </h2>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, color: '#666', margin: 0 }}>
                  We reply within 24 hours.
                </p>
              </div>

              <a 
                href="/agent-x402-demo"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: '#F25C05',
                  borderRadius: 12,
                  padding: '16px 20px',
                  marginBottom: 16,
                  textDecoration: 'none',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={20} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14, color: '#FFFFFF' }}>
                    Watch AI Pay AI Demo
                  </div>
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                    See autonomous payments in action
                  </div>
                </div>
              </a>

              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: '#1A1A1A',
                  borderRadius: 12,
                  padding: '16px 20px',
                  textDecoration: 'none'
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ExternalLink size={18} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14, color: '#FFFFFF' }}>
                    Documentation
                  </div>
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                    GitHub repository
                  </div>
                </div>
              </a>

              <ul style={{ marginTop: 24, padding: 0, listStyle: 'none' }}>
                {[
                  "No commitment — free demo",
                  "Response within 24 hours",
                  "On-chain payments via Stellar",
                  "70/30 automatic distribution"
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#F25C0515', border: '1px solid #F25C0530', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={10} color="#F25C05" />
                    </div>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: '#555' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ backgroundColor: '#F8F7F4', borderRadius: 16, padding: 24 }}>
              <form style={{ display: 'flex', flexDirection: 'column', gap: 12 }} onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>Name *</label>
                    <input 
                      type="text" 
                      id="nome" 
                      required
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Your name"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', backgroundColor: '#FFFFFF', fontSize: 13, fontFamily: 'Montserrat', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>Business *</label>
                    <input 
                      type="text" 
                      id="nomeNegocio" 
                      required
                      value={formData.nomeNegocio}
                      onChange={handleChange}
                      placeholder="Company name"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', backgroundColor: '#FFFFFF', fontSize: 13, fontFamily: 'Montserrat', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>Mobile *</label>
                    <input 
                      type="tel" 
                      id="telefone" 
                      required
                      value={formData.telefone}
                      onChange={handleChange}
                      placeholder="+1 555 123 4567"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', backgroundColor: '#FFFFFF', fontSize: 13, fontFamily: 'Montserrat', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', backgroundColor: '#FFFFFF', fontSize: 13, fontFamily: 'Montserrat', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>Message</label>
                  <textarea 
                    id="mensagem" 
                    rows={3}
                    value={formData.mensagem}
                    onChange={handleChange}
                    placeholder="Tell us about your needs..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', backgroundColor: '#FFFFFF', fontSize: 13, fontFamily: 'Montserrat', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                {submitStatus === 'success' && (
                  <div style={{ backgroundColor: '#dcfce7', border: '1px solid #22c55e', color: '#166534', padding: '10px 12px', borderRadius: 8, fontSize: 13, fontFamily: 'Montserrat' }}>
                    Sent successfully!
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', padding: '10px 12px', borderRadius: 8, fontSize: 13, fontFamily: 'Montserrat' }}>
                    Something went wrong. Try again.
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #F25C05, #F22283)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 14,
                    padding: '12px',
                    borderRadius: 50,
                    border: 'none',
                    cursor: isSubmitting ? 'wait' : 'pointer',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  {isSubmitting ? 'Sending...' : 'Send message'}
                </motion.button>
              </form>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}