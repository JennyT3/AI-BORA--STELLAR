import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Send, CheckCircle } from 'lucide-react';
import { createRequest } from '../services/requests';
import { createClient } from '../services/firebase';
import { sendQuoteConfirmation } from '../services/emailService';

const REDES_SOCIAIS = [
  { id: 'instagram', name: 'Instagram', color: '#E1306C', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>` },
  { id: 'facebook', name: 'Facebook', color: '#1877F2', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>` },
  { id: 'tiktok', name: 'TikTok', color: '#000000', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>` },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>` },
  { id: 'youtube', name: 'YouTube', color: '#FF0000', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>` },

  { id: 'whatsapp', name: 'WhatsApp', color: '#25D366', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.162-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.173-.148.297-.297.446-.521.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.524-.05-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>` },
];

interface Marca {
  name: string;
  social: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedServices: { id: string; name: string; icon?: string; category: string }[];
}

export function QuoteModal({ isOpen, onClose, selectedServices }: Props) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [marcas, setMarcas] = useState<Marca[]>([{ name: '', social: [] }]);
  const salesRepIdFromUrl = new URLSearchParams(window.location.search).get('salesRep') || '';
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    email: '',
    website: '',
    notes: '',
    salesRepId: salesRepIdFromUrl,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const addMarca = () => setMarcas(prev => [...prev, { name: '', social: [] }]);
  const removeMarca = (i: number) => setMarcas(prev => prev.filter((_, idx) => idx !== i));
  const updateMarcaName = (i: number, name: string) =>
    setMarcas(prev => prev.map((m, idx) => idx === i ? { ...m, name } : m));
  const toggleRede = (marcaIdx: number, redeId: string) =>
    setMarcas(prev => prev.map((m, idx) => {
      if (idx !== marcaIdx) return m;
      const social = m.social.includes(redeId) ? m.social.filter(r => r !== redeId) : [...m.social, redeId];
      return { ...m, social };
    }));

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) return;
    setLoading(true);
    try {
      // Create client record in Firestore
      const clientId = await createClient({
        name: formData.name,
        ...(formData.email && { email: formData.email }),
        mobile: formData.phone,
        ...(formData.company && { company: formData.company }),
        ...(formData.website && { website: formData.website }),
        ...(formData.salesRepId && { salesRepId: formData.salesRepId }),
        category: 'potential',
        source: 'Simulador',
        createdAt: new Date().toISOString(),
      });

      await createRequest({
        name: formData.name,
        phone: formData.phone,
        company: formData.company,
        email: formData.email,
        website: formData.website,
        notes: formData.notes,
        services: selectedServices.map(s => s.name),
        marcas: marcas.filter(m => m.name.trim()),
        source: 'Simulador',
        clientId: clientId,
        ...(formData.salesRepId && { salesRepId: formData.salesRepId }),
      });

      // Google Script fallback removed as per user request

      setStep('success');

      if (formData.email) {
        sendQuoteConfirmation(
          formData.email,
          formData.name,
          selectedServices.map(s => s.name)
        ).catch(() => {});
      }
    } catch (err: any) {
      alert('Failed to send: ' + err.message);
    }
    setLoading(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('form');
      setFormData({ name: '', phone: '', company: '', email: '', website: '', notes: '', salesRepId: '' });
      setMarcas([{ name: '', social: [] }]);
    }, 300);
  };

  const canSubmit = formData.name.trim() && formData.phone.trim() && formData.email.trim();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, backdropFilter: 'blur(4px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff', borderRadius: 20,
              width: '100%', maxWidth: 560,
              maxHeight: '90vh', overflowY: 'auto',
              boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
            }}
          >
            {step === 'success' ? (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
                  <CheckCircle size={64} color="#10B981" style={{ margin: '0 auto 24px' }} />
                </motion.div>
                <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 24, color: '#1A1A1A', marginBottom: 12 }}>
                  Request sent! 🎉
                </h2>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 32 }}>
                  Thank you, <strong>{formData.name}</strong>!<br />
                  We will get back to you within 24 hours.
                </p>
                <button onClick={handleClose} style={{
                  fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14,
                  backgroundColor: '#F22283', color: '#fff', border: 'none',
                  padding: '14px 32px', borderRadius: 100, cursor: 'pointer',
                }}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <div style={{
                  padding: '24px 24px 16px',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1, borderRadius: '20px 20px 0 0',
                }}>
                  <div>
                    <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 20, color: '#1A1A1A', margin: '0 0 4px' }}>
                      Request a quote
                    </h2>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: '#888', margin: 0 }}>
                      {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                  <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#666' }}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ padding: 24 }}>
                  <div style={{
                    backgroundColor: '#F5F2F0', borderRadius: 12, padding: 16, marginBottom: 24,
                    display: 'flex', flexWrap: 'wrap', gap: 6,
                  }}>
                    {selectedServices.map(s => (
                      <span key={s.id} style={{
                        fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 600,
                        backgroundColor: '#fff', border: '1px solid #F22283', color: '#F22283',
                        borderRadius: 20, padding: '4px 10px',
                      }}>
                        {s.icon} {s.name}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#1A1A1A', display: 'block', marginBottom: 6 }}>
                        Name <span style={{ color: '#F22283' }}>*</span>
                      </label>
                      <input id="name" value={formData.name} onChange={handleChange} placeholder="Your name"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontFamily: 'Montserrat, sans-serif', fontSize: 13, boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#1A1A1A', display: 'block', marginBottom: 6 }}>
                        Mobile <span style={{ color: '#F22283' }}>*</span>
                      </label>
                      <input id="phone" value={formData.phone} onChange={handleChange} placeholder="+351 9XX XXX XXX"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontFamily: 'Montserrat, sans-serif', fontSize: 13, boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#1A1A1A', display: 'block', marginBottom: 6 }}>Company</label>
                      <input id="company" value={formData.company} onChange={handleChange} placeholder="Business name"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontFamily: 'Montserrat, sans-serif', fontSize: 13, boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#1A1A1A', display: 'block', marginBottom: 6 }}>Email</label>
                      <input id="email" value={formData.email} onChange={handleChange} placeholder="you@example.com"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontFamily: 'Montserrat, sans-serif', fontSize: 13, boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#1A1A1A', display: 'block', marginBottom: 6 }}>Notes</label>
                    <textarea id="notes" value={formData.notes} onChange={handleChange}
                      placeholder="Describe your business, specific needs, or services you did not find in the list..."
                      rows={3}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontFamily: 'Montserrat, sans-serif', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#1A1A1A', display: 'block', marginBottom: 6 }}>Website</label>
                    <input id="website" value={formData.website || ''} onChange={handleChange} placeholder="https://www.yourcompany.com"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontFamily: 'Montserrat, sans-serif', fontSize: 13, boxSizing: 'border-box' }} />
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#1A1A1A', display: 'block', marginBottom: 6 }}>
                      Who referred you? <span style={{ fontSize: 10, color: '#999', fontWeight: 400 }}>(optional)</span>
                    </label>
                    <input 
                      id="salesRepId" 
                      value={formData.salesRepId} 
                      onChange={handleChange} 
                      placeholder="Partner name or code"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontFamily: 'Montserrat, sans-serif', fontSize: 13, boxSizing: 'border-box' }} 
                    />
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#1A1A1A' }}>
                        Brands / businesses
                      </label>
                      <button onClick={addMarca} style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 600,
                        color: '#F22283', background: 'none', border: '1px solid #F22283',
                        borderRadius: 20, padding: '4px 10px', cursor: 'pointer',
                      }}>
                        <Plus size={12} /> Add brand
                      </button>
                    </div>

                    {marcas.map((marca, i) => (
                      <div key={i} style={{ backgroundColor: '#F5F2F0', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                          <input
                            value={marca.name}
                            onChange={e => updateMarcaName(i, e.target.value)}
                            placeholder={`Brand name ${i + 1}`}
                            style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontFamily: 'Montserrat, sans-serif', fontSize: 12 }}
                          />
                          {marcas.length > 1 && (
                            <button onClick={() => removeMarca(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>

                        <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: '#888', margin: '0 0 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Active social profiles
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {REDES_SOCIAIS.map(rede => {
                            const sel = marca.social.includes(rede.id);
                            return (
                              <button key={rede.id} onClick={() => toggleRede(i, rede.id)} style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '6px 12px', borderRadius: 20, cursor: 'pointer',
                                fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 600,
                                border: sel ? `2px solid ${rede.color}` : '2px solid #ddd',
                                backgroundColor: sel ? rede.color + '15' : '#fff',
                                color: sel ? rede.color : '#666',
                                transition: 'all 0.15s ease',
                              }}>
                                <span dangerouslySetInnerHTML={{ __html: rede.svg }} style={{ display: 'flex' }} />
                                {rede.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || loading}
                    style={{
                      width: '100%', padding: '16px', borderRadius: 12,
                      fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14,
                      backgroundColor: canSubmit ? '#F22283' : '#ccc',
                      color: '#fff', border: 'none',
                      cursor: canSubmit ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 0.2s ease',
                      boxShadow: canSubmit ? '0 4px 16px rgba(242,34,131,0.3)' : 'none',
                    }}
                  >
                    {loading ? 'Sending...' : <><Send size={16} /> Submit request</>}
                  </button>
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: '#aaa', textAlign: 'center', marginTop: 10 }}>
                    Reply within 24h • No obligation
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
