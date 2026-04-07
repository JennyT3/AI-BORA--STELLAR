import React, { useState, useEffect } from 'react';
import { Tarea } from '../../types';
import { listTareasDisponiveis, solicitarTarea } from '../../services/firebase';
import { Check, Clock, Package, Briefcase, PlusCircle, CheckCircle } from 'lucide-react';

interface VendasTarefasTabProps {
  vendedorId: string;
  isMobile?: boolean;
}

export function VendasTarefasTab({ vendedorId, isMobile }: VendasTarefasTabProps) {
  const [tarefasDisponiveis, setTarefasDisponiveis] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const carregarTarefas = async () => {
    try {
      const data = await listTareasDisponiveis();
      setTarefasDisponiveis(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTarefas();
  }, []);

  const handleAceitar = async (id: string) => {
    setProcessingId(id);
    try {
      await solicitarTarea(id, vendedorId);
      // Removed from available immediately visually
      setTarefasDisponiveis(prev => prev.filter(t => t.id !== id));
      alert('Tarefa aceite com sucesso! Já podes geri-la nos teus clientes.');
    } catch (e) {
      console.error(e);
      alert('Erro ao aceitar a tarefa.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>A procurar tarefas...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1b1c1b', marginBottom: 8 }}>Trabalhos Delegados</h2>
          <p style={{ fontSize: 14, color: '#8e7165', fontWeight: 600 }}>Aceita projetos delegados pela equipa e expande a tua carteira.</p>
        </div>
      </div>

      {tarefasDisponiveis.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(242, 92, 5, 0.02)', borderRadius: 24, border: '1px dashed rgba(242, 92, 5, 0.2)' }}>
          <Briefcase size={48} color="#F25C05" style={{ opacity: 0.5, marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1b1c1b', marginBottom: 8 }}>Sem Tarefas Disponíveis</h3>
          <p style={{ color: '#8e7165', fontSize: 13, maxWidth: 400, margin: '0 auto' }}>Neste momento não há tarefas delegadas pendentes. Fica atento, as novas oportunidades aparecerão aqui.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
          {tarefasDisponiveis.map(tarefa => (
            <div key={tarefa.id} style={{
              background: '#fff',
              borderRadius: 20,
              padding: 24,
              boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #F25C05, #F22283)' }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#F25C05', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Projeto Delegado</div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1b1c1b' }}>{tarefa.titulo}</h3>
                </div>
                <div style={{ background: '#fcf9f7', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={20} color="#F25C05" />
                </div>
              </div>

              {tarefa.descricao && (
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 20, flex: 1 }}>
                  {tarefa.descricao}
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, padding: 16, background: '#f8fafc', borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Cliente</span>
                  <span style={{ fontSize: 13, color: '#1b1c1b', fontWeight: 800 }}>{tarefa.clienteNome || 'Desconhecido'}</span>
                </div>
                {tarefa.prazo && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14}/> Prazo</span>
                    <span style={{ fontSize: 13, color: '#1b1c1b', fontWeight: 800 }}>{new Date(tarefa.prazo).toLocaleDateString()}</span>
                  </div>
                )}
                {tarefa.comissaoVendedorValor && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 12, marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Comissão Estimada</span>
                    <span style={{ fontSize: 15, color: '#10B981', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 4 }}>
                      + {tarefa.comissaoVendedorValor}€
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleAceitar(tarefa.id)}
                disabled={processingId === tarefa.id}
                style={{
                  width: '100%',
                  padding: 16,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: processingId === tarefa.id ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
                  opacity: processingId === tarefa.id ? 0.7 : 1,
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={e => { if(processingId !== tarefa.id) e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {processingId === tarefa.id ? (
                  "A processar..."
                ) : (
                  <>
                    <PlusCircle size={18} /> Reivindicar & Aceitar
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
