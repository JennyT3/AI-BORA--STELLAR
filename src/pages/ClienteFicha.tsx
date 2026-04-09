import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { getCliente, listTareas, db, getProposal, listRegistosEmailByCliente } from "../services/firebase";
import { aprobarTareaPorCliente } from "../services/tareas";
import { createFaturaMensalLocal, listFaturasByCliente } from "../services/firebase";
import { Fatura } from "../services/faturas";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import { theme } from "../styles/theme";
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  MessageSquare, 
  Calendar, 
  User, 
  Building, 
  Mail, 
  Phone,
  ExternalLink,
  ArrowLeft,
  Layout,
  Play,
  Eye,
  CreditCard,
  Plus,
  Sparkles,
  Target,
  Globe,
  DollarSign
} from "lucide-react";

export function ClienteFicha() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [cliente, setCliente] = useState<any>(null);
  const [tareas, setTareas] = useState<any[]>([]);
  const [proposta, setProposta] = useState<any>(null);
  const [faturas, setFaturas] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aprovingId, setAprovingId] = useState<string | null>(null);

  const { authenticated, vendedor: authVendedor } = useAuth();
  
  let userRole: 'admin' | 'vendedor' | 'cliente' = 'cliente';
  if (authenticated) {
    userRole = 'admin';
  } else if (authVendedor) {
    userRole = 'vendedor';
  }

  const handleAprobarCliente = async (tareaId: string) => {
    setAprovingId(tareaId);
    try {
      const tarea = tareas.find(t => t.id === tareaId);
      await aprobarTareaPorCliente(params.id!, tareaId);
      setTareas(tareas.map(t => t.id === tareaId ? { ...t, estado: 'aprovada_cliente' } : t));
      
      if (tarea && cliente && proposta) {
        const servicosFatura = [{
          nome: tarea.servicoNome || 'Serviço',
          descricao: tarea.descricao || '',
          preco: tarea.valorCliente || proposta.valor || 0
        }];
        
        await createFaturaMensalLocal({
          clienteId: cliente.id,
          clienteNome: cliente.nome,
          clienteEmail: cliente.email,
          clienteNif: cliente.nif,
          clienteMorada: cliente.morada,
          clienteEmpresa: cliente.empresa,
          servicos: servicosFatura,
          vendedorId: cliente.vendedorId,
          propostaId: proposta.id
        });
        
        const faturasAtualizadas = await listFaturasByCliente(params.id!);
        setFaturas(faturasAtualizadas);
      }
    } catch (err) {
      alert("Erro ao aprobar entrega.");
    }
    setAprovingId(null);
  };

  useEffect(() => {
    async function loadData() {
      try {
        if (!params.id) {
          setError("Cliente não encontrado");
          setLoading(false);
          return;
        }

        const clienteData = await getCliente(params.id);
        if (!clienteData) {
          setError("Cliente não encontrado");
          setLoading(false);
          return;
        }
        setCliente(clienteData);

        // Cargar tareas del cliente
        const q = query(
          collection(db, 'tareas'), 
          where('clienteId', '==', params.id),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        const tareasData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setTareas(tareasData);

        // Cargar propuesta si existe
        if (clienteData.propostaId) {
          const propData = await getProposal(clienteData.propostaId);
          setProposta(propData);
        }

        // Cargar facturas
        const fatData = await listFaturasByCliente(params.id);
        setFaturas(fatData);

        // Cargar emails
        if (userRole === 'admin' || userRole === 'vendedor') {
          const emData = await listRegistosEmailByCliente(params.id);
          setEmails(emData);
        }

      } catch (err: any) {
        console.error("Erro ao carregar dados:", err);
        setError("Erro ao carregar os dados da ficha.");
      }
      setLoading(false);
    }

    loadData();
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #333', borderTop: '3px solid #F25C05', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ fontFamily: 'Montserrat, sans-serif', color: '#888', fontSize: 14 }}>Carregando a tua ficha...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !cliente) {
    return (
      <div style={{ minHeight: '100vh', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>😕</div>
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 24, color: '#ffffff', marginBottom: 12 }}>
            {error || "Acesso não autorizado"}
          </h1>
          <button 
            onClick={() => window.location.href = '/'}
            style={{ fontFamily: 'Montserrat, sans-serif', backgroundColor: '#F25C05', color: '#fff', padding: '14px 32px', borderRadius: 100, border: 'none', fontWeight: 700, cursor: 'pointer' }}
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'paga': return '#10B981';
      case 'aprovada_cliente': return '#10B981';
      case 'aprovada_admin': return '#0EA5E9';
      case 'entregue': return '#F59E0B';
      case 'asignada': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'disponivel': return 'Aguardando Início';
      case 'asignada': return 'Em Produção';
      case 'entregue': return 'Em Revisão';
      case 'aprovada_admin': return 'Aprovado por Admin';
      case 'aprovada_cliente': return 'Concluído';
      case 'paga': return 'Pago';
      default: return estado;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F0F', color: '#ffffff', fontFamily: 'Montserrat, sans-serif', paddingBottom: 80 }}>
      {/* HEADER / NAVBAR */}
      <nav style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(15,15,15,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.png" alt="AI BORA" style={{ width: 40, height: 40, borderRadius: 8 }} />
          <div style={{ fontSize: 18, fontWeight: 900 }}>AI <span style={{ color: '#F25C05' }}>BORA</span></div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>
          Área do Cliente
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        {/* WELCOME SECTION */}
        <header style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#F25C05', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
            <Sparkles size={16} /> Bem-vindo à tua jornada digital
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, marginBottom: 16, lineHeight: 1.1 }}>
            Olá, <span style={{ color: '#F25C05' }}>{cliente.nome}</span>.
          </h1>
          <p style={{ fontSize: 18, color: '#888', maxWidth: 600, lineHeight: 1.6 }}>
            Aqui podes acompanhar o progresso dos teus serviços, ver entregas e gerir a tua parceria com a AI BORA.
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }}>
          {/* MAIN CONTENT: TASKS/PROCESS */}
          <section>
            {/* BLOCK: PROPOSTA / ORÇAMENTO */}
            {proposta && (
              <div style={{ marginBottom: 48 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileText size={20} color="#F25C05" /> Proposta / Orçamento
                  </h2>
                  {userRole !== 'cliente' && !proposta && (
                    <a href={`/admin/orcamento?cliente=${params.id}`} target="_blank" style={{ padding: '10px 16px', borderRadius: 12, background: '#F25C05', color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Plus size={16} /> Criar Proposta
                    </a>
                  )}
                </div>
                <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>Orçamento Nº</div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{proposta.numeroOrcamento || '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>Valor Total</div>
                      <div style={{ fontWeight: 800, fontSize: 18, color: '#F25C05' }}>€{proposta.valor?.toFixed(0) || '0'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>Aprovado em</div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{proposta.dataResposta ? new Date(proposta.dataResposta).toLocaleDateString('pt-PT') : '—'}</div>
                    </div>
                  </div>
                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>Serviços Contratados</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {proposta.servicos && proposta.servicos.map((s: string, idx: number) => (
                              <span key={idx} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.05)', color: '#ccc' }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <a href={`/p/${proposta.id}`} target="_blank" rel="noopener noreferrer" style={{ padding: '10px 16px', borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', textDecoration: 'none', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <Eye size={16} /> Ver Proposta
                          </a>
                          {userRole === 'admin' && (
                            <a href={`/admin/orcamento?edit=${proposta.id}`} target="_blank" rel="noopener noreferrer" style={{ padding: '10px 16px', borderRadius: 12, background: 'rgba(242, 92, 5, 0.1)', color: '#F25C05', textDecoration: 'none', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(242, 92, 5, 0.2)' }}>
                              <FileText size={16} /> Ver PDF / Editor
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Layout size={20} color="#F25C05" /> O Teu Processo de Trabalho
              </h2>
              <span style={{ fontSize: 12, color: '#666' }}>{tareas.length} Tarefas Ativas</span>
            </div>

            {tareas.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 20, padding: 60, textAlign: 'center' }}>
                <Clock size={48} color="#333" style={{ marginBottom: 16 }} />
                <p style={{ color: '#666' }}>Estamos a preparar o teu plano de trabalho. Volta em breve!</p>
              </div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: 24 }}>
                {/* Timeline Line */}
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 2, background: 'rgba(255,255,255,0.1)' }}></div>
                
                {tareas.map((tarea, index) => (
                  <div key={tarea.id} style={{ position: 'relative', marginBottom: index === tareas.length - 1 ? 0 : 32 }}>
                    {/* Timeline Dot */}
                    <div style={{ 
                      position: 'absolute', 
                      left: -33, 
                      top: 4, 
                      width: 20, 
                      height: 20, 
                      borderRadius: '50%', 
                      background: getStatusColor(tarea.estado) !== '#6B7280' ? getStatusColor(tarea.estado) : '#333', 
                      border: '4px solid #0F0F0F',
                      zIndex: 2
                    }}></div>
                    
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: 24, transition: 'transform 0.2s', cursor: 'default' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div>
                          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{tarea.titulo}</h3>
                          <p style={{ fontSize: 13, color: '#888' }}>{tarea.servicoNome}</p>
                        </div>
                        <span style={{ 
                          fontSize: 11, 
                          fontWeight: 700, 
                          padding: '6px 12px', 
                          borderRadius: 100, 
                          backgroundColor: `${getStatusColor(tarea.estado)}20`, 
                          color: getStatusColor(tarea.estado),
                          border: `1px solid ${getStatusColor(tarea.estado)}40`
                        }}>
                          {getStatusLabel(tarea.estado)}
                        </span>
                      </div>

                      {tarea.descricao && (
                        <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.6, marginBottom: 20, whiteSpace: 'pre-wrap' }}>
                          {tarea.descricao}
                        </p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', gap: 24 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666', fontSize: 12 }}>
                            <Calendar size={14} />
                            <span>Início: {tarea.createdAt ? new Date(tarea.createdAt).toLocaleDateString('pt-PT') : '—'}</span>
                          </div>
                          {tarea.prazo && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#F25C05', fontSize: 12, fontWeight: 600 }}>
                              <Clock size={14} />
                              <span>Entrega: {tarea.prazo}</span>
                            </div>
                          )}
                        </div>

                        {tarea.urlEntrega && (
                          <a 
                            href={tarea.urlEntrega} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F25C05', color: '#fff', fontSize: 12, fontWeight: 700, padding: '10px 20px', borderRadius: 12, textDecoration: 'none' }}
                          >
                            Ver Entrega <ExternalLink size={14} />
                          </a>
                        )}
                        
                        {tarea.estado === 'aprovada_admin' && (
                          <button 
                            onClick={() => handleAprobarCliente(tarea.id)}
                            disabled={aprovingId === tarea.id}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#10B981', color: '#fff', fontSize: 12, fontWeight: 700, padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', marginLeft: 8 }}
                          >
                            {aprovingId === tarea.id ? 'Aprovando...' : '✅ Aprovar Entrega'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* BLOCK: INVOICES (VISIBLE TO EVERYONE) */}
            <div style={{ marginTop: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CreditCard size={20} color="#F25C05" /> Faturação e Pagamentos
                </h2>
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#fff' }}>Próxima Fatura</h3>
                {faturas.filter(f => f.status === 'pendente' || f.status === 'pago_notificado').length > 0 ? (
                  faturas.filter(f => f.status === 'pendente' || f.status === 'pago_notificado').map(fat => (
                    <div key={fat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, marginBottom: 16 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>€{fat.valor?.toFixed(0) || '0'}</div>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Vencimento: {new Date(fat.dueDate).toLocaleDateString('pt-PT')}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: fat.status === 'pago_notificado' ? '#F59E0B' : '#F25C05' }}>
                          {fat.status === 'pago_notificado' ? 'Em verificação' : 'Pendente'}
                        </span>
                        {fat.status === 'pendente' && (
                          <button 
                            onClick={async () => {
                              if (!confirm('Confirmas que efetuaste o pagamento?')) return;
                              try {
                                const { updateDoc, doc } = await import('firebase/firestore');
                                await updateDoc(doc(db, 'faturas_recorrentes', fat.id), {
                                  status: 'pago_notificado',
                                  dataConfirmacaoCliente: new Date().toISOString(),
                                  confirmacaoCliente: true
                                });
                                alert('Obrigado! O seu pagamento está em verificação. Receberá confirmação em breve.');
                                const fatData = await listFaturasByCliente(params.id!);
                                setFaturas(fatData);
                              } catch (err) {
                                alert('Erro ao confirmar pagamento. Tente novamente.');
                              }
                            }}
                            style={{ background: '#10B981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                          >
                            Já Paguei
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#888', fontSize: 14 }}>Sem faturas pendentes no momento.</p>
                )}

                <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 32, marginBottom: 16, color: '#fff' }}>Historial de Faturas</h3>
                {faturas.filter(f => f.status === 'pago').length > 0 ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {faturas.filter(f => f.status === 'pago').map(fat => (
                      <div key={fat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 8 }}>
                        <span style={{ fontSize: 14 }}>Pago em {fat.updatedAt ? new Date(fat.updatedAt).toLocaleDateString('pt-PT') : ''}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>€{fat.valor?.toFixed(0) || '0'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#888', fontSize: 14 }}>Não há histórico de pagamentos.</p>
                )}
              </div>
            </div>

            {/* BLOCK: EMAILS (VISIBLE TO ADMIN & VENDEDOR) */}
            {(userRole === 'admin' || userRole === 'vendedor') && (
              <div style={{ marginTop: 48 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Mail size={20} color="#F25C05" /> Historial de Emails Enviados
                  </h2>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: 24 }}>
                  {emails.length === 0 ? (
                    <p style={{ color: '#888', fontSize: 14 }}>Nenhum email foi enviado pelo sistema para este cliente.</p>
                  ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                      {emails.map(email => (
                        <div key={email.id} style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{email.assunto}</span>
                            <span style={{ fontSize: 11, color: '#888' }}>{new Date(email.dataEnvio).toLocaleDateString('pt-PT')} {new Date(email.dataEnvio).toLocaleTimeString('pt-PT')}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'rgba(242,92,5,0.1)', color: '#F25C05', fontWeight: 700, textTransform: 'uppercase' }}>
                              {email.tipo}
                            </span>
                            <span style={{ fontSize: 11, color: '#666' }}>Para: {email.destinatario}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* SIDEBAR: CLIENT INFO & ACTIONS */}
          <aside>
            <div style={{ position: 'sticky', top: 100 }}>
              {/* CLIENT CARD */}
              <div style={{ background: 'linear-gradient(180deg, rgba(242,92,5,0.1) 0%, rgba(15,15,15,0) 100%)', border: '1px solid rgba(242,92,5,0.2)', borderRadius: 24, padding: 24, marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: '#F25C05', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, marginBottom: 20 }}>
                  {cliente.nome?.charAt(0)}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{cliente.nome}</h3>
                <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>{cliente.empresa || 'Negócio Local'}</p>
                
                <div style={{ display: 'grid', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#ccc' }}>
                    <Mail size={16} color="#F25C05" /> {cliente.email || '—'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#ccc' }}>
                    <Phone size={16} color="#F25C05" /> {cliente.telemovel || '—'}
                  </div>
                  {cliente.nif && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#ccc' }}>
                      <FileText size={16} color="#F25C05" /> NIF: {cliente.nif}
                    </div>
                  )}
                </div>
              </div>

              {/* AÇÕES DO CLIENTE */}
              {userRole !== 'cliente' && (
                <div style={{ background: 'rgba(242,92,5,0.1)', border: '1px solid rgba(242,92,5,0.2)', borderRadius: 24, padding: 24, marginBottom: 24 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#F25C05', textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={16} /> Ações do Gestão
                  </h4>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {!proposta ? (
                      <button 
                        onClick={() => window.open(`/admin/orcamento?cliente=${params.id}`, '_blank')}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px', borderRadius: 16, background: '#F25C05', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
                      >
                        <Plus size={18} /> Criar Proposta
                      </button>
                    ) : (
                      <a 
                        href={`/admin/orcamento?edit=${proposta.id}`}
                        target="_blank"
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px', borderRadius: 16, background: '#F25C05', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}
                      >
                        <FileText size={18} /> Editar Proposta
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* QUICK ACTIONS */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Suporte & Contacto</h4>
                <div style={{ display: 'grid', gap: 12 }}>
                  <a 
                    href="https://wa.me/351912345678" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px', borderRadius: 16, background: 'rgba(37, 211, 102, 0.1)', color: '#25D366', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}
                  >
                    <MessageSquare size={18} /> Falar no WhatsApp
                  </a>
                  <button 
                    onClick={() => window.location.href = `mailto:info@aibora.pt?subject=Questão sobre o meu projeto - ${cliente.nome}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px', borderRadius: 16, background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, textAlign: 'left' }}
                  >
                    <Mail size={18} /> Enviar Email
                  </button>
                </div>
              </div>

              {/* BLOCK: ADMIN ONLY (NOTES & COMMISSIONS) */}
              {userRole === 'admin' && (
                <div style={{ marginTop: 24 }}>
                  {/* Observações / Notas Internas */}
                  <div style={{ background: 'rgba(242,92,5,0.05)', border: '1px solid rgba(242,92,5,0.2)', borderRadius: 24, padding: 24, marginBottom: 24 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#F25C05', textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Eye size={16} /> Notas Internas (Privado)
                    </h4>
                    <p style={{ fontSize: 13, color: '#ccc', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {cliente.observacoes || 'Sem notas registadas para este cliente.'}
                    </p>
                    <button style={{ background: 'transparent', border: '1px solid #F25C05', color: '#F25C05', marginTop: 16, padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
                      Editar Notas
                    </button>
                  </div>

                  {/* Comissões Vendedor */}
                  {cliente.vendedorId && proposta && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 24 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Comissões Atribuídas</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, color: '#ccc' }}>Vendedor ID</span>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{cliente.vendedorId.slice(0, 8)}...</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: '#ccc' }}>Comissão Estimada</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#10B981' }}>€{((proposta.valor || 0) * 0.1).toFixed(0)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* FOOTER CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(0deg, #0F0F0F 0%, transparent 100%)', pointerEvents: 'none' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
          <div style={{ background: '#F25C05', padding: '12px 24px', borderRadius: 100, boxShadow: '0 10px 30px rgba(242,92,5,0.3)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', animation: 'pulse 2s infinite' }}></div>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Projeto em curso com AI BORA</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}


