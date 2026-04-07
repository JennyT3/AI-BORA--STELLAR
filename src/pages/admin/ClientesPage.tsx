import { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, User, Mail, Phone, Building, MoreVertical, Edit, Trash2, Eye, UserPlus } from 'lucide-react';
import { theme } from '../../styles/theme';
import { useAdminData } from '../../hooks/useAdminData';
import { Cliente } from '../../types';
import { exportToExcel } from '../../services/exportService';

interface ClientesPageProps {
  currentUserId?: string;
}

export function ClientesPage({ currentUserId }: ClientesPageProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [search, setSearch] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('todas');
  const [filterOrigem, setFilterOrigem] = useState<string>('todas');
  const [sortBy, setSortBy] = useState<'nome' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [showNovoCliente, setShowNovoCliente] = useState(false);
  const [novoCliente, setNovoCliente] = useState({
    nome: '', email: '', telemovel: '', empresa: '', nif: '', morada: '', categoria: 'potencial' as const, observacoes: ''
  });

  const { 
    clientes, 
    loading, 
    loadClientes, 
    handleEliminarCliente, 
    handleSalvarCliente, 
    handleDelegarVendedor,
    vendedores,
    setClienteFormData,
    showClienteForm,
    setShowClienteForm,
    clienteFormData
  } = useAdminData({ currentUserId });

  useEffect(() => {
    loadClientes();
  }, []);

  const filteredClientes = clientes
    .filter(c => {
      if (search && !c.nome?.toLowerCase().includes(search.toLowerCase()) && 
          !c.email?.toLowerCase().includes(search.toLowerCase()) &&
          !c.empresa?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (filterCategoria !== 'todas' && c.categoria !== filterCategoria) return false;
      if (filterOrigem !== 'todas' && c.origem !== filterOrigem) return false;
      return true;
    })
    .sort((a, b) => {
      const cmp = sortBy === 'nome' 
        ? a.nome?.localeCompare(b.nome || '') || 0
        : new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      return sortOrder === 'asc' ? cmp : -cmp;
    });

  const categorias = ['todas', 'cliente', 'potencial', 'curioso'];
  const origens = ['todas', 'Website', 'WhatsApp', 'Instagram', 'Facebook', 'Indicacao', 'Vendedor', 'Campanha'];

  const handleExport = () => {
    exportToExcel(clientes, []);
  };

  const handleNovoCliente = async () => {
    if (!novoCliente.nome?.trim()) return;
    try {
      // populate form state first
      setClienteFormData({
        ...novoCliente,
        nome: novoCliente.nome.trim(),
        email: novoCliente.email?.trim() || undefined,
        telemovel: novoCliente.telemovel?.trim() || undefined,
        empresa: novoCliente.empresa?.trim() || undefined,
        origem: 'Admin',
      });
      await handleSalvarCliente();
      setShowNovoCliente(false);
      setNovoCliente({ nome: '', email: '', telemovel: '', empresa: '', nif: '', morada: '', categoria: 'potencial', observacoes: '' });
      loadClientes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: isMobile ? '16px' : '0 0 40px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: isMobile ? 24 : 32, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>
            Clientes
          </h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>
            {clientes.length} clientes registados
          </p>
        </div>
        <button 
          onClick={() => setShowNovoCliente(true)}
          style={{ 
            padding: '12px 20px', 
            borderRadius: 12, 
            backgroundColor: theme.colors.accent.primary, 
            color: '#fff', 
            border: 'none', 
            fontWeight: 600, 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            fontFamily: theme.fontFamily.sans,
          }}
        >
          <Plus size={18} />
          Novo Cliente
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 400 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Pesquisar clientes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              borderRadius: 12,
              border: '1px solid #E5E7EB',
              fontSize: 14,
              fontFamily: theme.fontFamily.sans,
            }}
          />
        </div>
        <select
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid #E5E7EB',
            fontSize: 14,
            fontFamily: theme.fontFamily.sans,
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
        >
          {categorias.map(c => (
            <option key={c} value={c}>{c === 'todas' ? 'Todas categorias' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <select
          value={filterOrigem}
          onChange={(e) => setFilterOrigem(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid #E5E7EB',
            fontSize: 14,
            fontFamily: theme.fontFamily.sans,
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
        >
          {origens.map(o => (
            <option key={o} value={o}>{o === 'todas' ? 'Todas origens' : o}</option>
          ))}
        </select>
        <button 
          onClick={handleExport}
          style={{ 
            padding: '12px 16px', 
            borderRadius: 12, 
            backgroundColor: '#F3F4F6', 
            border: '1px solid #E5E7EB', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Download size={16} />
          Exportar
        </button>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Cliente</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Contacto</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Categoria</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Origem</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Vendedor</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredClientes.map((cliente) => (
              <tr key={cliente.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.accent.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                      {cliente.nome?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: theme.colors.text.primary, fontSize: 14 }}>{cliente.nome}</div>
                      {cliente.empresa && <div style={{ fontSize: 12, color: theme.colors.text.secondary }}>{cliente.empresa}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontSize: 13, color: theme.colors.text.primary }}>{cliente.email || '—'}</div>
                  <div style={{ fontSize: 12, color: theme.colors.text.secondary }}>{cliente.telemovel || '—'}</div>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    fontSize: 11, 
                    fontWeight: 600, 
                    padding: '4px 10px', 
                    borderRadius: 20,
                    backgroundColor: cliente.categoria === 'cliente' ? '#D1FAE5' : cliente.categoria === 'potencial' ? '#FEF3C7' : '#E0E7FF',
                    color: cliente.categoria === 'cliente' ? '#059669' : cliente.categoria === 'potencial' ? '#D97706' : '#4F46E5',
                    textTransform: 'capitalize',
                  }}>
                    {cliente.categoria}
                  </span>
                </td>
                <td style={{ padding: '16px', fontSize: 13 }}>{cliente.origem || '—'}</td>
                <td style={{ padding: '16px', fontSize: 13 }}>{cliente.vendedorId || '—'}</td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => window.open(`/c/${cliente.id}`, '_blank')}
                      title="Ver ficha"
                      style={{ padding: 8, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280' }}
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelegarVendedor(cliente.id, 'vendedor_id')}
                      title="Delegar"
                      style={{ padding: 8, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280' }}
                    >
                      <UserPlus size={16} />
                    </button>
                    <button 
                      onClick={() => handleEliminarCliente(cliente.id)}
                      title="Eliminar"
                      style={{ padding: 8, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#EF4444' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredClientes.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: theme.colors.text.secondary }}>
            <User size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
            <p>Nenhum cliente encontrado</p>
          </div>
        )}
      </div>

      {/* Novo Cliente Modal */}
      {showNovoCliente && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Novo Cliente</h2>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>Nome *</label>
                <input
                  type="text"
                  value={novoCliente.nome}
                  onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>Email</label>
                <input
                  type="email"
                  value={novoCliente.email}
                  onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>Telemóvel</label>
                <input
                  type="tel"
                  value={novoCliente.telemovel}
                  onChange={(e) => setNovoCliente({...novoCliente, telemovel: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>Empresa</label>
                <input
                  type="text"
                  value={novoCliente.empresa}
                  onChange={(e) => setNovoCliente({...novoCliente, empresa: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>Categoria</label>
                <select
                  value={novoCliente.categoria}
                  onChange={(e) => setNovoCliente({...novoCliente, categoria: e.target.value as any})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 14 }}
                >
                  <option value="potencial">Potencial</option>
                  <option value="cliente">Cliente</option>
                  <option value="curioso">Curioso</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button 
                onClick={() => setShowNovoCliente(false)}
                style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#F3F4F6', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleNovoCliente}
                disabled={!novoCliente.nome?.trim()}
                style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: theme.colors.accent.primary, color: '#fff', border: 'none', fontWeight: 600, cursor: novoCliente.nome?.trim() ? 'pointer' : 'not-allowed', opacity: novoCliente.nome?.trim() ? 1 : 0.5 }}
              >
                Criar Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}