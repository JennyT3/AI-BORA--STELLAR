import React, { useState } from 'react';
import { Redirect, useLocation } from 'wouter';
import { useAcademiaAuth } from '../../hooks/useAcademiaAuth';
import { completeOnboarding, updateUsuario } from '../../services/academiaUserService';

const colors = {
  orange: '#ff6f2e',
  magenta: '#cb1a74',
  dark: '#1c1b1b',
  light: '#fcf9f8'
};

const TIPOS_NEGOCIO = [
  { value: 'ecommerce', label: 'E-commerce / Loja Online' },
  { value: 'servicos', label: 'Prestação de Serviços' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'restaurante', label: 'Restaurante / Bar' },
  { value: 'salute', label: 'Saúde / Bem-estar' },
  { value: 'educacao', label: 'Educação' },
  { value: 'outro', label: 'Outro' },
];

const TAMANHO_EMPRESAS = [
  { value: 'solo', label: 'Sou o único(a) responsable' },
  { value: 'pequeno', label: '2 a 10 funcionários' },
  { value: 'medio', label: '11 a 50 funcionários' },
  { value: 'grande', label: 'Mais de 50 funcionários' },
];

const OBJETIVOS = [
  { value: 'aumentar_vendas', label: 'Aumentar vendas e faturamento' },
  { value: 'reduzir_custos', label: 'Reduzir custos e automatizar tarefas' },
  { value: 'melhorar_marketing', label: 'Melhorar marketing e attracting clientes' },
  { value: 'criar_conteudo', label: 'Criar conteúdo más rápido con IA' },
  { value: 'gerir_redes', label: 'Gerir redes sociais de forma eficiente' },
  { value: 'outro', label: 'Outro objetivo' },
];

export default function AcademiaOnboarding() {
  const { user, isLoaded, isSignedIn, academiaUser, isLoading } = useAcademiaAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: '',
    tipo_negocio: '',
    tamanho_empresa: '',
    objetivos: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  if (!isLoaded || isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: colors.light, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 48, height: 48, borderRadius: '50%', 
            border: `3px solid ${colors.orange}`, borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite', margin: '0 auto 16px'
          }} />
          <p style={{ color: '#666', fontFamily: 'Montserrat, sans-serif' }}>A carregar...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!isSignedIn) return <Redirect to="/academia/login" />;
  
  if (academiaUser?.onboarding_completo) {
    return <Redirect to="/academia/dashboard" />;
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setSaving(true);
    console.log('Bypass: Finalizando onboarding...');
    
    // Intentar guardar sin bloquear
    updateUsuario(user.id, {
      nome: formData.nome,
      tipo_negocio: formData.tipo_negocio,
      onboarding_completo: true,
    }).catch(() => {});
    
    completeOnboarding(user.id).catch(() => {});
    
    // Redirigir inmediatamente
    setTimeout(() => {
      setLocation('/academia/dashboard');
    }, 100);
  };

  const toggleObjetivo = (value: string) => {
    setFormData(prev => ({
      ...prev,
      objetivos: prev.objetivos.includes(value)
        ? prev.objetivos.filter(o => o !== value)
        : [...prev.objetivos, value]
    }));
  };

  const canContinue = () => {
    if (step === 1) return formData.nome.trim().length > 0;
    if (step === 2) return formData.tipo_negocio && formData.tamanho_empresa;
    if (step === 3) return formData.objetivos.length > 0;
    return false;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.light,
      fontFamily: 'Montserrat, sans-serif',
      padding: '40px 24px',
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.dark, marginBottom: 8 }}>
            Complete o seu perfil
          </h1>
          <p style={{ color: '#666', fontSize: 14 }}>
            Isto vai nos ajudar a personalizar a sua experiência
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40, gap: 8 }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: step >= s ? colors.orange : '#ddd',
                color: step >= s ? '#fff' : '#999',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14,
                transition: 'all 0.3s ease'
              }}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && (
                <div style={{
                  width: 40, height: 3, background: step > s ? colors.orange : '#ddd',
                  marginLeft: 8, transition: 'all 0.3s ease'
                }} />
              )}
            </div>
          ))}
        </div>

        <div style={{
          background: '#fff', borderRadius: 20, padding: 32,
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
        }}>
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.dark, marginBottom: 24 }}>
                Como te chamas?
              </h2>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="O teu nome completo"
                autoFocus
                style={{
                  width: '100%', padding: '16px 20px', borderRadius: 12,
                  border: '2px solid #eee', fontSize: 16, fontFamily: 'Montserrat, sans-serif',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.dark, marginBottom: 24 }}>
                Qual é o teu negócio?
              </h2>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#666', marginBottom: 8 }}>
                  Tipo de negócio
                </label>
                <select
                  value={formData.tipo_negocio}
                  onChange={(e) => setFormData({ ...formData, tipo_negocio: e.target.value })}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: 12,
                    border: '2px solid #eee', fontSize: 15, fontFamily: 'Montserrat, sans-serif',
                    background: '#fff', cursor: 'pointer', outline: 'none',
                  }}
                >
                  <option value="">Seleciona uma opção</option>
                  {TIPOS_NEGOCIO.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#666', marginBottom: 8 }}>
                  Tamanho da empresa
                </label>
                <select
                  value={formData.tamanho_empresa}
                  onChange={(e) => setFormData({ ...formData, tamanho_empresa: e.target.value })}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: 12,
                    border: '2px solid #eee', fontSize: 15, fontFamily: 'Montserrat, sans-serif',
                    background: '#fff', cursor: 'pointer', outline: 'none',
                  }}
                >
                  <option value="">Seleciona uma opção</option>
                  {TAMANHO_EMPRESAS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.dark, marginBottom: 8 }}>
                Quais são os teus objetivos?
              </h2>
              <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
                Seleciona até 3 opções que mais te definem
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {OBJETIVOS.map((obj) => {
                  const isSelected = formData.objetivos.includes(obj.value);
                  return (
                    <button
                      key={obj.value}
                      onClick={() => formData.objetivos.length < 3 || isSelected ? toggleObjetivo(obj.value) : null}
                      disabled={formData.objetivos.length >= 3 && !isSelected}
                      style={{
                        padding: '16px 20px', borderRadius: 12, border: `2px solid ${isSelected ? colors.orange : '#eee'}`,
                        background: isSelected ? `${colors.orange}10` : '#fff', textAlign: 'left',
                        cursor: formData.objetivos.length >= 3 && !isSelected ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 12,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{
                        width: 24, height: 24, borderRadius: 6, border: `2px solid ${isSelected ? colors.orange : '#ddd'}`,
                        background: isSelected ? colors.orange : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isSelected && <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 600, color: isSelected ? colors.orange : colors.dark }}>
                        {obj.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
            {step > 1 ? (
              <button
                onClick={handleBack}
                style={{
                  padding: '12px 24px', borderRadius: 12, border: 'none',
                  background: '#f5f5f5', color: '#666', fontWeight: 700,
                  cursor: 'pointer', fontSize: 14,
                }}
              >
                Voltar
              </button>
            ) : <div />}

            <button
              onClick={step === 3 ? handleSubmit : handleNext}
              disabled={!canContinue() || saving}
              style={{
                padding: '12px 32px', borderRadius: 12, border: 'none',
                background: canContinue() ? colors.orange : '#ddd',
                color: '#fff', fontWeight: 700, cursor: canContinue() ? 'pointer' : 'not-allowed',
                fontSize: 14, transition: 'all 0.2s ease',
              }}
            >
              {saving ? 'A carregar...' : step === 3 ? 'Finalizar' : 'Continuar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
