import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle, Users, Briefcase, Globe } from 'lucide-react';
import { createSolicitude } from '../services/solicitudes';
import { GOOGLE_SCRIPT_URL } from '../lib/constants';
import { sendColaboradorConfirmacao } from '../services/emailService';

const TIPOS_COLABORACAO = [
  { id: 'vendedor', nome: 'Vendedor/Revendedor', descricao: 'Vende os nossos serviços e ganha comissão', icon: '💼' },
  { id: 'afiliado', nome: 'Afiliado', descricao: 'Indica clientes e ganha prémios', icon: '🤝' },
  { id: 'parceiro', nome: 'Parceiro Estratégico', descricao: 'Colaboração B2B entre empresas', icon: '⚡' },
  { id: 'freelancer', nome: 'Freelancer/Agency', descricao: 'Trabalha connosco em projetos', icon: '🎯' },
];

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
}

export function ColaboraConNosotrosSection({ isOpen = true, onClose }: Props) {
  const [step, setStep] = useState<'selection' | 'form' | 'success'>('selection');
  const [tipoSelecionado, setTipoSelecionado] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    experiencia: '',
    linkedin: '',
  });

  const handleSelect = (id: string) => {
    setTipoSelecionado(id);
    setStep('form');
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim() || !formData.email.trim()) return;
    setLoading(true);
    try {
      const tipo = TIPOS_COLABORACAO.find(t => t.id === tipoSelecionado);
      await createSolicitude({
        nome: formData.nome,
        telefone: formData.telefone,
        empresa: formData.empresa,
        email: formData.email,
        observacoes: `Tipo: ${tipo?.nome}\nExperiência: ${formData.experiencia}\nLinkedIn: ${formData.linkedin}`,
        servicos: [`Colaboração: ${tipo?.nome}`],
        origem: 'Colabora Connosco',
        marcas: [],
      });

      // Google Script fallback removed as per user request

      if (formData.email) {
        sendColaboradorConfirmacao(formData.email, formData.nome).catch(() => {});
      }

      setStep('success');
    } catch (err: any) {
      alert('Erro ao enviar: ' + err.message);
    }
    setLoading(false);
  };

  const handleClose = () => {
    onClose?.();
    setTimeout(() => {
      setStep('selection');
      setTipoSelecionado(null);
      setFormData({ nome: '', email: '', telefone: '', empresa: '', experiencia: '', linkedin: '' });
    }, 300);
  };

  const canSubmit = formData.nome.trim() && formData.email.trim();

  if (!isOpen) return null;

  return (
    <section id="colabora" style={{ backgroundColor: '#1A1A1A', padding: '80px 16px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ width: 36, height: 3, backgroundColor: '#F25C05', margin: '0 auto 20px', borderRadius: 2 }} />
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 42px)', color: '#FFFFFF', margin: '0 0 16px' }}>
          Queres crescer connosco?
        </h2>
        <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(14px, 2vw, 16px)', color: '#A0A0A0', margin: '0 0 48px', lineHeight: 1.6, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          Tens uma rede de contactos, capacidades de vendas ouSkills digitais? Queres fazer parte da nossa rede de parceiros e ganhar com isso?
        </p>

        {step === 'selection' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, maxWidth: 800, margin: '0 auto' }}>
            {TIPOS_COLABORACAO.map(tipo => (
              <button
                key={tipo.id}
                onClick={() => handleSelect(tipo.id)}
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
                <span style={{ fontSize: 32 }}>{tipo.icon}</span>
                <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 15, color: '#FFFFFF', margin: 0 }}>{tipo.nome}</h3>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: '#888', margin: 0 }}>{tipo.descricao}</p>
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
                {TIPOS_COLABORACAO.find(t => t.id === tipoSelecionado)?.nome}
              </h3>
              <button onClick={() => setStep('selection')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>← Voltar</button>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#FFFFFF', display: 'block', marginBottom: 6 }}>Nome *</label>
                <input
                  value={formData.nome}
                  onChange={e => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="O teu nome completo"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '2px solid #444', backgroundColor: '#1A1A1A', color: '#FFFFFF', fontSize: 14, fontFamily: 'Montserrat, sans-serif', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#FFFFFF', display: 'block', marginBottom: 6 }}>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.pt"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '2px solid #444', backgroundColor: '#1A1A1A', color: '#FFFFFF', fontSize: 14, fontFamily: 'Montserrat, sans-serif', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#FFFFFF', display: 'block', marginBottom: 6 }}>Telefone</label>
                <input
                  value={formData.telefone}
                  onChange={e => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  placeholder="+351 9XX XXX XXX"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '2px solid #444', backgroundColor: '#1A1A1A', color: '#FFFFFF', fontSize: 14, fontFamily: 'Montserrat, sans-serif', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#FFFFFF', display: 'block', marginBottom: 6 }}>Empresa (opicional)</label>
                <input
                  value={formData.empresa}
                  onChange={e => setFormData(prev => ({ ...prev, empresa: e.target.value }))}
                  placeholder="Nome da tua empresa"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '2px solid #444', backgroundColor: '#1A1A1A', color: '#FFFFFF', fontSize: 14, fontFamily: 'Montserrat, sans-serif', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#FFFFFF', display: 'block', marginBottom: 6 }}>LinkedIn (opicional)</label>
                <input
                  value={formData.linkedin}
                  onChange={e => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/..."
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '2px solid #444', backgroundColor: '#1A1A1A', color: '#FFFFFF', fontSize: 14, fontFamily: 'Montserrat, sans-serif', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#FFFFFF', display: 'block', marginBottom: 6 }}>Conta-nos sobre a tua experiência</label>
                <textarea
                  value={formData.experiencia}
                  onChange={e => setFormData(prev => ({ ...prev, experiencia: e.target.value }))}
                  placeholder="Quantos anos de experiência? Que tipo de clientes atendes? Etc..."
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
                {loading ? 'A enviar...' : 'Quero Colaborar'}
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
            <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 20, color: '#FFFFFF', margin: '0 0 12px' }}>Recebemos o teu interesse!</h3>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, color: '#A0A0A0', margin: '0 0 24px' }}>
              A nossa equipa vai analisar a tua candidatura e entrará em contacto em menos de 24 horas.
            </p>
            <button
              onClick={() => setStep('selection')}
              style={{
                padding: '12px 24px', borderRadius: 8, border: '2px solid #444', backgroundColor: 'transparent', color: '#FFFFFF',
                fontSize: 14, fontWeight: 600, fontFamily: 'Montserrat, sans-serif', cursor: 'pointer'
              }}
            >
              Ver outras opções
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export function ColaboraModal({ isOpen, onClose }: Props) {
  return <ColaboraConNosotrosSection isOpen={isOpen} onClose={onClose} />;
}
