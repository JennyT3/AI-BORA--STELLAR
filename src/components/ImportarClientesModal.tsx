import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle, Loader, Users } from 'lucide-react';
import { importarClientesParaVendedor } from '../services/vendedores';
import { criarSolicitacaoDelegacao } from '../services/delegacao';
import * as XLSX from 'xlsx';

interface ImportarClientesModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendedorId: string;
  vendedorNome?: string;
  onSuccess?: () => void;
}

export function ImportarClientesModal({ isOpen, onClose, vendedorId, vendedorNome, onSuccess }: ImportarClientesModalProps) {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [solicitandoDelegacao, setSolicitandoDelegacao] = useState(false);
  const [delegacaoEnviada, setDelegacaoEnviada] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setResultado(null);
    setDelegacaoEnviada(false);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = event.target?.result as ArrayBuffer;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const clientesParseados = jsonData.map((row: any) => ({
            nome: row.nome || row.Nome || row.name || '',
            email: row.email || row.Email || row.email_address || '',
            telemovel: row.telemovel || row.telefone || row.Telefone || row.phone || '',
            nif: row.nif || row.NIF || row.nif_number || '',
            empresa: row.empresa || row.Empresa || row.company || '',
            website: row.website || row.Website || row.site || '',
            morada: row.morada || row.Morada || row.address || '',
            codigoPostal: row.codigoPostal || row.codigo_postal || row.postal_code || '',
            cidade: row.cidade || row.Cidade || row.city || '',
            categoria: row.categoria || row.Categoria || 'potencial',
            origem: row.origem || row.Origem || 'Importado',
            processo: row.processo || row.Processo || 'sem_processo',
            notasVendedor: row.notasVendedor || row.notas || row.Notas || '',
            dataUltimoContacto: row.dataUltimoContacto || row.data_ultimo_contacto || '',
            servicos: row.servicos || ''
          }));

          if (clientesParseados.length === 0) {
            throw new Error('No clients found in the file');
          }

          const result = await importarClientesParaVendedor(vendedorId, clientesParseados, 'vendedor');
          
          setResultado(result);
          if (onSuccess && (result.criados > 0 || result.atualizados > 0)) {
            setTimeout(onSuccess, 2000);
          }
        } catch (err: any) {
          setError(err.message || 'Failed to process file');
        } finally {
          setLoading(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      setError(err.message || 'Failed to import file');
      setLoading(false);
    }
  };

  const solicitarDelegacao = async () => {
    if (!resultado?.duplicados?.length) return;
    
    setSolicitandoDelegacao(true);
    try {
      await criarSolicitacaoDelegacao(
        vendedorId,
        vendedorNome || 'Vendedor',
        resultado.duplicados.map((d: any) => ({
          clienteId: d.clienteExistenteId,
          clienteNome: d.clienteExistenteNome,
          vendedorAtualId: d.vendedorAtualId,
          nif: d.clienteImportadoNif,
          email: d.clienteImportadoEmail
        }))
      );
      setDelegacaoEnviada(true);
    } catch (err: any) {
      setError(err.message || 'Failed to request delegation');
    } finally {
      setSolicitandoDelegacao(false);
    }
  };

  const resetModal = () => {
    setResultado(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#1b1c1b', margin: 0 }}>
            Import clients
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} color="#666" />
          </button>
        </div>

        {/* Success result */}
        {resultado && !error && (
          <div style={{ marginBottom: '24px' }}>
            {/* Summary counts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center', background: '#ecfdf5', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#10b981' }}>{resultado.criados || 0}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#047857', marginTop: '4px' }}>CREATED</div>
              </div>
              <div style={{ textAlign: 'center', background: '#fef3c7', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#d97706' }}>{resultado.atualizados || 0}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', marginTop: '4px' }}>UPDATED</div>
              </div>
              <div style={{ textAlign: 'center', background: resultado.erros?.length > 0 ? '#fef2f2' : '#f3f4f6', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: resultado.erros?.length > 0 ? '#dc2626' : '#6b7280' }}>{resultado.erros?.length || 0}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: resultado.erros?.length > 0 ? '#b91c1c' : '#4b5563', marginTop: '4px' }}>ERRORS</div>
              </div>
            </div>

            {/* Error list */}
            {resultado.erros?.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1b1c1b', marginBottom: '8px' }}>
                  Errors found ({resultado.erros.length}):
                </h4>
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '12px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {resultado.erros.map((erro: string, idx: number) => (
                    <div key={idx} style={{ fontSize: '12px', color: '#dc2626', marginBottom: idx < resultado.erros.length - 1 ? '8px' : 0, lineHeight: '1.5' }}>
                      • {erro}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Duplicates — bulk delegation */}
            {resultado.duplicados?.length > 0 && !delegacaoEnviada && (
              <div style={{ marginBottom: '20px', backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Users size={18} color="#d97706" />
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#92400e', margin: 0 }}>
                    {resultado.duplicados.length} clients already exist
                  </h4>
                </div>
                <p style={{ fontSize: '12px', color: '#92400e', margin: '0 0 12px 0' }}>
                  These clients belong to other sellers. Request bulk delegation.
                </p>
                <ul style={{ fontSize: '11px', color: '#78350f', margin: '0 0 12px 0', paddingLeft: '20px', maxHeight: '100px', overflowY: 'auto' }}>
                  {resultado.duplicados.slice(0, 5).map((d: any, idx: number) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>
                      {d.clienteExistenteNome || d.clienteImportadoNome} (NIF: {d.clienteImportadoNif || '—'})
                    </li>
                  ))}
                  {resultado.duplicados.length > 5 && (
                    <li>... and {resultado.duplicados.length - 5} more</li>
                  )}
                </ul>
                <button
                  onClick={solicitarDelegacao}
                  disabled={solicitandoDelegacao}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    backgroundColor: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: solicitandoDelegacao ? 'not-allowed' : 'pointer',
                    opacity: solicitandoDelegacao ? 0.7 : 1
                  }}
                >
                  {solicitandoDelegacao ? 'Sending...' : `Request delegation for all (${resultado.duplicados.length})`}
                </button>
              </div>
            )}

            {/* Delegation request sent */}
            {delegacaoEnviada && (
              <div style={{ marginBottom: '20px', backgroundColor: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <CheckCircle size={18} color="#059669" />
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#065f46', margin: 0 }}>
                    Request sent!
                  </h4>
                </div>
                <p style={{ fontSize: '12px', color: '#065f46', margin: 0 }}>
                  Please wait for admin approval. You will be notified when clients are delegated.
                </p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                onClick={resetModal}
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#F25C05',
                  color: '#fff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Import another file
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            marginBottom: '24px'
          }}>
            <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#dc2626', margin: '0 0 4px 0' }}>
                Import error
              </h3>
              <p style={{ fontSize: '13px', color: '#991b1b', margin: 0 }}>
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Upload Area */}
        {!resultado && !loading && (
          <>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #F25C05',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: 'rgba(242, 92, 5, 0.05)',
                transition: 'all 0.2s',
                marginBottom: '24px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(242, 92, 5, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(242, 92, 5, 0.05)';
              }}
            >
              <Upload size={32} color="#F25C05" style={{ marginBottom: '12px', margin: '0 auto 12px' }} />
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#1b1c1b', margin: '0 0 4px 0' }}>
                Click to select a file
              </p>
              <p style={{ fontSize: '12px', color: '#8e7165', margin: 0 }}>
                or drag and drop an Excel/CSV file
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {/* Instructions */}
            <div style={{
              backgroundColor: '#fcf9f7',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#1b1c1b', marginBottom: '8px', margin: '0 0 8px 0' }}>
                Expected format:
              </h4>
              <ul style={{ fontSize: '12px', color: '#8e7165', margin: 0, paddingLeft: '20px' }}>
                <li>Columns: nome, email, telemovel, nif, empresa, website, morada, codigoPostal, cidade, categoria, origem, processo, notasVendedor, dataUltimoContacto, servicos</li>
                <li>At least the &quot;nome&quot; column is required</li>
                <li>Supports .xlsx, .xls, and .csv files</li>
                <li>Automatic deduplication by NIF → email → phone</li>
              </ul>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: '#f5f5f5',
                color: '#666',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Loader size={32} color="#F25C05" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#1b1c1b' }}>
              Processing file...
            </p>
            <p style={{ fontSize: '12px', color: '#8e7165' }}>
              This may take a few seconds
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
