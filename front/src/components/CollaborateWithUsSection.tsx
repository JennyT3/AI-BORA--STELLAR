import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { createRequest } from '../services/requests';
import { sendCollaboratorConfirmation } from '../services/emailService';

const COLLABORATION_TYPES = [
  { id: 'salesRep', name: 'Sales partner / Reseller', description: 'Sell our services and earn commission', icon: '💼' },
  { id: 'collaborator', name: 'Collaborator / Freelancer', description: 'Deliver work and earn commission', icon: '🎯' },
  { id: 'affiliate', name: 'Affiliate', description: 'Refer clients and earn rewards', icon: '🤝' },
  { id: 'partner', name: 'Strategic partner', description: 'B2B collaboration between companies', icon: '⚡' },
];

const ESPECIALIDADES = [
  'SEO', 'Google Ads', 'Facebook/Instagram Ads', 'Web Design', 'Copywriting',
  'Social media', 'Email marketing', 'CRM', 'Analytics', 'Video editing',
  'Photography', 'Marketing consulting', 'Other'
];

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
}

export function WorkWithUsSection({ isOpen = true }: Props) {
  const [step, setStep] = useState<'selection' | 'form' | 'success'>('selection');
  const [typeSelected, setTypeSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    experiencia: '',
    linkedin: '',
    especialidades: [] as string[],
  });

  const toggleEspecialidade = (esp: string) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.includes(esp)
        ? prev.especialidades.filter(e => e !== esp)
        : [...prev.especialidades, esp]
    }));
  };

  const handleSelect = (id: string) => {
    setTypeSelected(id);
    setStep('form');
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim()) return;
    setLoading(true);
    try {
      const type = COLLABORATION_TYPES.find(t => t.id === typeSelected);
      await createRequest({
        name: formData.name,
        phone: formData.phone,
        company: formData.company,
        email: formData.email,
        notes: `Type: ${type?.name}\nExperience: ${formData.experiencia}\nLinkedIn: ${formData.linkedin}\nSkills: ${formData.especialidades.join(', ')}`,
        services: [`Collaboration: ${type?.name}`],
        source: 'Colabora Connosco',
        marcas: [],
      });

      // Google Script fallback removed as per user request

      if (formData.email) {
        sendCollaboratorConfirmation(formData.email, formData.name).catch(() => {});
      }

      setStep('success');
    } catch (err: any) {
      alert('Failed to send: ' + err.message);
    }
    setLoading(false);
  };

  const canSubmit = formData.name.trim() && formData.email.trim();

  if (!isOpen) return null;

  return (
    <section id="collaborate" style={{ backgroundColor: '#1A1A1A', padding: '80px 16px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ width: 36, height: 3, backgroundColor: '#F25C05', margin: '0 auto 20px', borderRadius: 2 }} />
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 42px)', color: '#FFFFFF', margin: '0 0 16px' }}>
          Want to grow with us?
        </h2>
        <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(14px, 2vw, 16px)', color: '#A0A0A0', margin: '0 0 48px', lineHeight: 1.6, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          Of you have a network, sales skills, or digital expertise? Join our partner network and earn with us.
        </p>

        {step === 'selection' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, maxWidth: 800, margin: '0 auto' }}>
            {COLLABORATION_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => handleSelect(type.id)}
                style={{
                  backgroundColor: '#2A2A2A',
                  border: '2px solid #333',
                  borderRadius: 16,
                  padding: '24px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                }}
                onMouseOver={e => (e.currentTarget.style.borderColor = '#F25C05')}
                onMouseOut={e => (e.currentTarget.style.borderColor = '#333')}
              >
                <span style={{ fontSize: 32 }}>{type.icon}</span>
                <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 15, color: '#FFFFFF', margin: 0 }}>{type.name}</h3>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: '#888', margin: 0 }}>{type.description}</p>
              </button>
            ))}
          </div>
        )}

        {step === 'form' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ backgroundColor: '#2A2A2A', borderRadius: 16, padding: '32px 24px', maxWidth: 480, margin: '0 auto', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 18, color: '#FFFFFF', margin: 0 }}>
                {COLLABORATION_TYPES.find(t => t.id === typeSelected)?.name}
              </h3>
              <button onClick={() => setStep('selection')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>← Back</button>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#FFFFFF', display: 'block', marginBottom: 6 }}>Name *</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your full name"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '2px solid #444', backgroundColor: '#1A1A1A', color: '#FFFFFF', fontSize: 14, fontFamily: 'Montserrat, sans-serif', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#FFFFFF', display: 'block', marginBottom: 6 }}>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="you@example.com"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '2px solid #444', backgroundColor: '#1A1A1A', color: '#FFFFFF', fontSize: 14, fontFamily: 'Montserrat, sans-serif', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#FFFFFF', display: 'block', marginBottom: 6 }}>Phone</label>
                <input
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+351 9XX XXX XXX"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '2px solid #444', backgroundColor: '#1A1A1A', color: '#FFFFFF', fontSize: 14, fontFamily: 'Montserrat, sans-serif', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#FFFFFF', display: 'block', marginBottom: 6 }}>Company (optional)</label>
                <input
                  value={formData.company}
                  onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Your company name"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '2px solid #444', backgroundColor: '#1A1A1A', color: '#FFFFFF', fontSize: 14, fontFamily: 'Montserrat, sans-serif', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#FFFFFF', display: 'block', marginBottom: 6 }}>LinkedIn (optional)</label>
                <input
                  value={formData.linkedin}
                  onChange={e => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/..."
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '2px solid #444', backgroundColor: '#1A1A1A', color: '#FFFFFF', fontSize: 14, fontFamily: 'Montserrat, sans-serif', outline: 'none' }}
                />
              </div>
              {(typeSelected === 'collaborator' || typeSelected === 'freelancer') && (
                <div>
                  <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#FFFFFF', display: 'block', marginBottom: 6 }}>Skills (select all that apply)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {ESPECIALIDADES.map(esp => (
                      <button
                        key={esp}
                        type="button"
                        onClick={() => toggleEspecialidade(esp)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: formData.especialidades.includes(esp) ? '2px solid #F25C05' : '1px solid #444',
                          backgroundColor: formData.especialidades.includes(esp) ? 'rgba(242, 92, 5, 0.2)' : '#1A1A1A',
                          color: formData.especialidades.includes(esp) ? '#F25C05' : '#888',
                          fontSize: '12px',
                          fontFamily: 'Montserrat, sans-serif',
                          cursor: 'pointer'
                        }}
                      >
                        {esp}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#FFFFFF', display: 'block', marginBottom: 6 }}>Tell us about your experience</label>
                <textarea
                  value={formData.experiencia}
                  onChange={e => setFormData(prev => ({ ...prev, experiencia: e.target.value }))}
                  placeholder="Years of experience, types of clients you serve, etc."
                  rows={3}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '2px solid #444', backgroundColor: '#1A1A1A', color: '#FFFFFF', fontSize: 14, fontFamily: 'Montserrat, sans-serif', outline: 'none', resize: 'vertical' }}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                style={{
                  width: '100%', padding: '14px', borderRadius: 8, border: 'none', backgroundColor: canSubmit && !loading ? '#F25C05' : '#444', color: canSubmit && !loading ? '#FFFFFF' : '#888',
                  fontSize: 14, fontWeight: 700, fontFamily: 'Montserrat, sans-serif', cursor: canSubmit && !loading ? 'pointer' : 'not-allowed', marginTop: 8
                }}
              >
                {loading ? 'Sending...' : 'I want to collaborate'}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ backgroundColor: '#2A2A2A', borderRadius: 16, padding: '48px 24px', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}
          >
            <CheckCircle size={64} color="#22C55E" style={{ marginBottom: 16 }} />
            <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 20, color: '#FFFFFF', margin: '0 0 12px' }}>We have received your interest!</h3>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, color: '#A0A0A0', margin: '0 0 24px' }}>
              Our team will review your application and get back to you within 24 hours.
            </p>
            <button
              onClick={() => setStep('selection')}
              style={{
                padding: '12px 24px', borderRadius: 8, border: '2px solid #444', backgroundColor: 'transparent', color: '#FFFFFF',
                fontSize: 14, fontWeight: 600, fontFamily: 'Montserrat, sans-serif', cursor: 'pointer'
              }}
            >
              See other options
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export function CollaborateModal({ isOpen, onClose }: Props) {
  return <WorkWithUsSection isOpen={isOpen} onClose={onClose} />;
}
