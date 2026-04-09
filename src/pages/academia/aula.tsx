import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoute, Link, useLocation } from 'wouter';
import { 
  Play, 
  Check, 
  Lock, 
  ArrowLeft, 
  ArrowRight, 
  Download,
  Clock,
  FileText,
  Settings,
  Maximize,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAcademiaAuth } from '../../hooks/useAcademiaAuth';
import { saveProgresso, getProgressoTrilha, AcademiaProgresso } from '../../services/academiaUserService';

const colors = {
  orange: '#ff6f2e',
  magenta: '#cb1a74', 
  coral: '#fb4a50',
  yellow: '#ede72e',
  dark: '#1c1b1b',
  light: '#fcf9f8'
};

// Path and lesson copy (in production this may come from Firebase)
const trilhasData: Record<string, {
  nome: string;
  descricao: string;
  aulas: { id: string; titulo: string; duracao: string; descricao: string; video_url?: string; recursos?: { nome: string; tipo: string; tamanho: string }[] }[];
}> = {
  'ia-negocios': {
    nome: 'AI for local business',
    descricao: 'Use artificial intelligence to grow sales and reach more customers.',
    aulas: [
      { id: 'aula-1', titulo: 'Introduction to AI for business', duracao: '12:30', descricao: 'Learn AI basics and how it can help your business.', recursos: [{ nome: 'Intro guide', tipo: 'PDF', tamanho: '2.4 MB' }] },
      { id: 'aula-2', titulo: 'ChatGPT for customer support', duracao: '18:45', descricao: 'Use ChatGPT to respond to customers automatically.', recursos: [{ nome: 'Support prompts', tipo: 'PDF', tamanho: '1.1 MB' }] },
      { id: 'aula-3', titulo: 'Content creation with AI', duracao: '22:10', descricao: 'Generate copy, captions and posts in seconds.', recursos: [] },
      { id: 'aula-4', titulo: 'Simple data analysis', duracao: '15:20', descricao: 'Use AI to read metrics from your business.', recursos: [{ nome: 'Analysis template', tipo: 'XLSX', tamanho: '0.5 MB' }] },
      { id: 'aula-5', titulo: 'Social media automation', duracao: '25:00', descricao: 'Schedule posts automatically with AI.', recursos: [] },
      { id: 'aula-6', titulo: 'Smart email marketing', duracao: '20:15', descricao: 'Build email campaigns that convert.', recursos: [{ nome: 'Email checklist', tipo: 'PDF', tamanho: '0.8 MB' }] },
    ]
  },
  'automacao': {
    nome: 'No-code automation',
    descricao: 'Automate repetitive work with Zapier and Make.',
    aulas: [
      { id: 'aula-1', titulo: 'Introduction to automation', duracao: '10:00', descricao: 'What automation is and why it matters.', recursos: [{ nome: 'Automation guide', tipo: 'PDF', tamanho: '1.5 MB' }] },
      { id: 'aula-2', titulo: 'First Zap: Gmail + spreadsheet', duracao: '28:30', descricao: 'Build your first automated workflow.', recursos: [] },
      { id: 'aula-3', titulo: 'Webhooks and integrations', duracao: '24:00', descricao: 'Connect different apps together.', recursos: [{ nome: 'Webhook list', tipo: 'PDF', tamanho: '0.9 MB' }] },
      { id: 'aula-4', titulo: 'CRM automation', duracao: '18:20', descricao: 'Keep your CRM updated automatically.', recursos: [] },
    ]
  },
  'comunicacao': {
    nome: 'Digital communication',
    descricao: 'Create content that sells and engages.',
    aulas: [
      { id: 'aula-1', titulo: 'AI copywriting', duracao: '15:00', descricao: 'Write copy that converts using AI.', recursos: [{ nome: 'Prompt library', tipo: 'PDF', tamanho: '2.1 MB' }] },
      { id: 'aula-2', titulo: 'Instagram content', duracao: '20:45', descricao: 'Create posts and stories that perform.', recursos: [] },
      { id: 'aula-3', titulo: 'Short video with AI', duracao: '25:30', descricao: 'Produce quick videos for social.', recursos: [] },
    ]
  },
  'produtividade': {
    nome: 'Productivity with AI',
    descricao: 'Organise your day with virtual assistants.',
    aulas: [
      { id: 'aula-1', titulo: 'Personal AI assistants', duracao: '12:00', descricao: 'Use AI as your daily assistant.', recursos: [] },
      { id: 'aula-2', titulo: 'Smart time management', duracao: '16:30', descricao: 'Plan your calendar with AI suggestions.', recursos: [{ nome: 'Planning template', tipo: 'PDF', tamanho: '1.2 MB' }] },
    ]
  }
};

export default function AcademiaAula() {
  const [match, params] = useRoute('/academia/aula/:id');
  const { user, isLoaded, isSignedIn, academiaUser, isLoading } = useAcademiaAuth();
  const [, setLocation] = useLocation();
  
    const [progressos, setProgressos] = useState<AcademiaProgresso>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Parse IDs from URL
  const aulaId = params?.id || '';
  const [trilhaId, aulaIndexStr] = aulaId.split('-aula-');
  const aulaIndex = aulaIndexStr ? parseInt(aulaIndexStr) - 1 : 0;
  
  // Path and lesson data
  const trilha = trilhasData[trilhaId];
  const aulas = trilha?.aulas || [];
  const aula = aulas[aulaIndex];

  // Load progress
  useEffect(() => {
    async function loadProgresso() {
      if (user && trilhaId) {
        const prog = await getProgressoTrilha(user.id, trilhaId);
        setProgressos(prog);
      }
    }
    if (isLoaded && user) {
      loadProgresso();
    }
  }, [user, trilhaId, isLoaded]);

  // Loading state
  if (!isLoaded || isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${colors.orange}`, borderTopColor: 'transparent', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#666', fontFamily: 'Montserrat, sans-serif' }}>Loading…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Redirects
  if (!isSignedIn) {
    setLocation('/academia/login');
    return null;
  }

  if (!academiaUser?.onboarding_completo) {
    setLocation('/academia/onboarding');
    return null;
  }

  if (!trilha || !aula) {
    return (
      <div style={{ minHeight: '100vh', background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.dark, marginBottom: 16 }}>Lesson not found</h1>
          <Link href="/academia/trilhas" style={{ color: colors.orange, fontWeight: 600 }}>Back to learning paths</Link>
        </div>
      </div>
    );
  }

  // Lesson completion state
  const aulaProgresso = progressos.find(p => p.aula_id === aula.id);
  const concluida = aulaProgresso?.concluida || false;

  // Path progress
  const aulasConcluidas = progressos.filter(p => p.concluida).length;
  const progressoTotal = Math.round((aulasConcluidas / aulas.length) * 100);

  // Mark complete
  const handleMarcarConcluida = async () => {
    if (!user || concluida) return;
    
    setIsSaving(true);
    try {
      await saveProgresso(
        user.id,
        aula.id,
        trilhaId,
        trilha.nome,
        aula.titulo,
        true,
        Math.round(((aulasConcluidas + 1) / aulas.length) * 100)
      );
      
      // Reload progress
      const prog = await getProgressoTrilha(user.id, trilhaId);
      setProgressos(prog);
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Prev / next lesson
  const aulaAnterior = aulaIndex > 0 ? aulas[aulaIndex - 1] : null;
  const aulaProxima = aulaIndex < aulas.length - 1 ? aulas[aulaIndex + 1] : null;

  const recursosAula = aula.recursos || [
    { nome: 'Lesson guide', tipo: 'PDF', tamanho: '1.5 MB' },
    { nome: 'Checklist', tipo: 'PDF', tamanho: '0.8 MB' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: colors.light, fontFamily: 'Montserrat, sans-serif' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '16px 32px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/academia/dashboard">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: colors.dark }}>Bora Lá <span style={{ color: colors.orange }}>Academy</span></span>
            </div>
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Link href={`/academia/trilha/${trilhaId}`} style={{ color: '#666', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>
              ← Back to path
            </Link>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '12px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: colors.orange }}>{trilha.nome}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#666' }}>{progressoTotal}% complete</span>
          </div>
          <div style={{ height: 4, background: '#eee', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressoTotal}%`, background: colors.orange, borderRadius: 2 }} />
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 40 }}>
          
          {/* Main column: video + content */}
          <div>
            {/* Video Player (placeholder) */}
            <div style={{
              position: 'relative',
              aspectRatio: '16/9',
              background: colors.dark,
              borderRadius: 20,
              overflow: 'hidden',
              marginBottom: 24,
              cursor: 'pointer'
            }}>
              <img 
                src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=675&fit=crop"
                alt={aula.titulo}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
              />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.coral} 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(255,111,46,0.4)',
                }}>
                  <Play size={32} fill="white" color="white" />
                </div>
              </div>
              <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: 8, color: '#fff', fontSize: 13 }}>
                  {aula.duracao}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Settings size={20} color="white" style={{ cursor: 'pointer', opacity: 0.8 }} />
                  <Maximize size={20} color="white" style={{ cursor: 'pointer', opacity: 0.8 }} />
                </div>
              </div>
            </div>

            {/* Title and description */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ background: colors.orange, color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                  Lesson {aulaIndex + 1} of {aulas.length}
                </span>
                {concluida && (
                  <span style={{ background: '#10B981', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check size={14} /> Done
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.dark, marginBottom: 12 }}>
                {aula.titulo}
              </h1>
              <p style={{ fontSize: 16, color: '#666', lineHeight: 1.6 }}>
                {aula.descricao}
              </p>
            </div>

            {/* Resources */}
            {recursosAula.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.dark, marginBottom: 16 }}>
                  Downloads
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {recursosAula.map((recurso, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: 16, background: '#fff', borderRadius: 12,
                      border: '1px solid #eee', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.orange}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#eee'}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${colors.orange}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={20} color={colors.orange} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: colors.dark }}>{recurso.nome}</p>
                        <p style={{ fontSize: 11, color: '#999' }}>{recurso.tipo} • {recurso.tamanho}</p>
                      </div>
                      <Download size={18} color="#999" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              {aulaAnterior ? (
                <Link href={`/academia/aula/${trilhaId}-aula-${aulaIndex}`} style={{ textDecoration: 'none', flex: 1 }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px', background: '#fff', border: '1px solid #ddd', borderRadius: 12, color: '#666', fontWeight: 600, fontSize: 14, cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
                    <ChevronLeft size={18} /> Previous lesson
                  </button>
                </Link>
              ) : <div style={{ flex: 1 }} />}
              
              {!concluida ? (
                <button
                  onClick={handleMarcarConcluida}
                  disabled={isSaving}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 24px', background: concluida ? '#10B981' : colors.orange, border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14, cursor: concluida ? 'default' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
                >
                  {isSaving ? 'Saving…' : concluida ? '✓ Done' : 'Mark as complete'}
                </button>
              ) : aulaProxima ? (
                <Link href={`/academia/aula/${trilhaId}-aula-${aulaIndex + 2}`} style={{ textDecoration: 'none', flex: 1 }}>
                  <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 24px', background: colors.orange, border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    Next lesson <ChevronRight size={18} />
                  </button>
                </Link>
              ) : (
                <Link href={`/academia/quiz/${trilhaId}`} style={{ textDecoration: 'none', flex: 1 }}>
                  <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 24px', background: '#10B981', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    Take quiz 🎯
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar: lesson list */}
          <div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #eee', position: 'sticky', top: 100 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.dark, marginBottom: 16 }}>
                Path outline
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {aulas.map((aulaItem, index) => {
                  const isActive = aulaItem.id === aula.id;
                  const isConcluida = progressos.some(p => p.aula_id === aulaItem.id && p.concluida);
                  
                  return (
                    <Link key={aulaItem.id} href={`/academia/aula/${trilhaId}-aula-${index + 1}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: 14, borderRadius: 10,
                        background: isActive ? `${colors.orange}10` : '#f9f9f9',
                        border: isActive ? `2px solid ${colors.orange}` : '2px solid transparent',
                        cursor: 'pointer',
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: isConcluida ? colors.orange : isActive ? colors.orange : '#ddd',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {isConcluida ? <Check size={16} color="white" /> : <span style={{ color: isActive ? '#fff' : '#999', fontSize: 12, fontWeight: 600 }}>{index + 1}</span>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: isActive ? colors.orange : colors.dark, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {aulaItem.titulo}
                          </p>
                          <p style={{ fontSize: 11, color: '#999', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={10} /> {aulaItem.duracao}
                          </p>
                        </div>
                        {isActive && <ChevronRight size={16} color={colors.orange} />}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}