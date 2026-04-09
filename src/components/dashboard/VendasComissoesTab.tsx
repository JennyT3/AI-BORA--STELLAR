import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Clock, CheckCircle, DollarSign, Calendar, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { getComissoes, Comissao, calcularComissoes } from '../../services/comissoes';

interface VendasComissoesTabProps {
  vendedorId: string;
  tipo: 'vendedor' | 'colaborador';
}

export function VendasComissoesTab({ vendedorId, tipo }: VendasComissoesTabProps) {
  const [comissoes, setComissoes] = useState<Comissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pendente' | 'pago'>('all');
  const [expandedMes, setExpandedMes] = useState<string | null>(null);

  useEffect(() => {
    loadComissoes();
  }, [vendedorId, tipo]);

  const loadComissoes = async () => {
    setLoading(true);
    try {
      const data = await getComissoes(vendedorId, tipo);
      setComissoes(data);
    } catch (error) {
      console.error('Erro ao carregar comissões:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredComissoes = comissoes.filter(c => 
    filterStatus === 'all' || c.status === filterStatus
  );

  const comissoesAgrupadasPorMes = filteredComissoes.reduce((acc, comissao) => {
    const mes = new Date(comissao.dataCriacao).toLocaleDateString('pt-PT', { 
      year: 'numeric', 
      month: 'long' 
    });
    if (!acc[mes]) acc[mes] = [];
    acc[mes].push(comissao);
    return acc;
  }, {} as Record<string, Comissao[]>);

  const totalPendente = comissoes
    .filter(c => c.status === 'pendente')
    .reduce((sum, c) => sum + (tipo === 'vendedor' ? c.valorVendedor : c.valorColaborador), 0);

  const totalPago = comissoes
    .filter(c => c.status === 'pago')
    .reduce((sum, c) => sum + (tipo === 'vendedor' ? c.valorVendedor : c.valorColaborador), 0);

  const totalGeral = tipo === 'vendedor' 
    ? comissoes.reduce((sum, c) => sum + c.valorVendedor, 0)
    : comissoes.reduce((sum, c) => sum + c.valorColaborador, 0);

  const getProximoMes = () => {
    const now = new Date();
    const proximo = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return proximo.toLocaleDateString('pt-PT', { year: 'numeric', month: 'long' });
  };

  const getProjecaoMensal = () => {
    const ultimos3Meses = comissoes.filter(c => {
      const diff = Date.now() - new Date(c.dataCriacao).getTime();
      return diff < 90 * 24 * 60 * 60 * 1000;
    });
    
    const valorMedio = ultimos3Meses.length > 0 
      ? ultimos3Meses.reduce((sum, c) => sum + (tipo === 'vendedor' ? c.valorVendedor : c.valorColaborador), 0) / 3
      : 0;
    
    return valorMedio;
  };

  const projecao = getProjecaoMensal();

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        A carregar comissões...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#1b1c1b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Wallet size={24} color="#F25C05" />
          Minhas Comissões
        </h2>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Histórico de comissões e projeções de ganhos
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Clock size={16} color="#f59e0b" />
            <span style={{ fontSize: '12px', color: '#666' }}>Pendente</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#f59e0b' }}>
            {totalPendente.toFixed(2)}€
          </div>
        </div>
        
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CheckCircle size={16} color="#10b981" />
            <span style={{ fontSize: '12px', color: '#666' }}>Pago</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#10b981' }}>
            {totalPago.toFixed(2)}€
          </div>
        </div>
        
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <TrendingUp size={16} color="#2563eb" />
            <span style={{ fontSize: '12px', color: '#666' }}>Projeção {getProximoMes()}</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#2563eb' }}>
            ~{projecao.toFixed(2)}€
          </div>
        </div>
        
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <DollarSign size={16} color="#F25C05" />
            <span style={{ fontSize: '12px', color: '#666' }}>Total</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#F25C05' }}>
            {totalGeral.toFixed(2)}€
          </div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {(['all', 'pendente', 'pago'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: filterStatus === status ? '#F25C05' : '#f3f4f6',
              color: filterStatus === status ? '#fff' : '#4b5563'
            }}
          >
            {status === 'all' ? 'Todas' : status === 'pendente' ? 'Pendentes' : 'Pagas'}
          </button>
        ))}
      </div>

      {/* Lista por mês */}
      {Object.keys(comissoesAgrupadasPorMes).length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px'
        }}>
          <DollarSign size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
          <p style={{ color: '#6b7280' }}>Nenhuma comissão encontrada</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Object.entries(comissoesAgrupadasPorMes).map(([mes, lista]) => {
            const totalMes = lista.reduce((sum, c) => sum + (tipo === 'vendedor' ? c.valorVendedor : c.valorColaborador), 0);
            const isExpanded = expandedMes === mes;
            
            return (
              <div 
                key={mes}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setExpandedMes(isExpanded ? null : mes)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Calendar size={18} color="#6b7280" />
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#1b1c1b' }}>{mes}</span>
                    <span style={{ 
                      fontSize: '12px', 
                      padding: '4px 8px', 
                      borderRadius: '6px',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280'
                    }}>
                      {lista.length} {lista.length === 1 ? 'comissão' : 'comissões'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#F25C05' }}>
                      {totalMes.toFixed(2)}€
                    </span>
                    {isExpanded ? <ChevronUp size={20} color="#6b7280" /> : <ChevronDown size={20} color="#6b7280" />}
                  </div>
                </button>
                
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #e5e7eb' }}>
                    {lista.map(comissao => (
                      <div 
                        key={comissao.id}
                        style={{
                          padding: '12px 20px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: '1px solid #f3f4f6'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1b1c1b' }}>
                            Fatura: {comissao.faturaId}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            Venda: {comissao.valorVenda.toFixed(2)}€ • {tipo === 'vendedor' ? comissao.percentualVendedor : comissao.percentualColaborador}% = {(tipo === 'vendedor' ? comissao.valorVendedor : comissao.valorColaborador).toFixed(2)}€
                          </div>
                        </div>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '20px',
                          backgroundColor: comissao.status === 'pago' ? '#d1fae5' : '#fef3c7',
                          color: comissao.status === 'pago' ? '#059669' : '#d97706'
                        }}>
                          {comissao.status === 'pago' ? 'Pago' : 'Pendente'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info adicional */}
      <div style={{ 
        marginTop: '24px', 
        padding: '16px', 
        backgroundColor: '#f0f9ff', 
        borderRadius: '12px',
        border: '1px solid #bae6fd'
      }}>
        <p style={{ fontSize: '13px', color: '#0369a1', margin: 0 }}>
          <strong>Como funciona:</strong> As comissões são calculadas automaticamente quando o cliente paga a fatura. 
          O vendedor recebe {tipo === 'vendedor' ? '10%' : ''} do valor total e o colaborador {tipo === 'colaborador' ? '60%' : ''} do valor do seu trabalho. 
          As comissões ficam disponíveis para saque após confirmação do pagamento.
        </p>
      </div>
    </div>
  );
}