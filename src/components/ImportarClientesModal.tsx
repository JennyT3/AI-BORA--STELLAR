import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { importarClientesParaVendedor } from '../services/vendedores';
import * as XLSX from 'xlsx';

interface ImportarClientesModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendedorId: string;
  onSuccess?: () => void;
}

export function ImportarClientesModal({ isOpen, onClose, vendedorId, onSuccess }: ImportarClientesModalProps) {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setResultado(null);

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
            throw new Error('Nenhum cliente encontrado no arquivo');
          }

          const result = await importarClientesParaVendedor(vendedorId, clientesParseados, 'vendedor');
          
          setResultado(result);
          if (onSuccess) {
            setTimeout(onSuccess, 2000);
          }
        } catch (err: any) {
          setError(err.message || 'Erro ao processar arquivo');
        } finally {
          setLoading(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      setError(err.message || 'Erro ao importar arquivo');
      setLoading(false);
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
            Importar Clientes
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

        {/* Resultado exitoso */}
        {resultado && !error && (
          <div style={{ marginBottom: '24px' }}>
            {/* Resumen de 3 números grandes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center', background: '#ecfdf5', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#10b981' }}>{resultado.criados || 0}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#047857', marginTop: '4px' }}>CRIADOS</div>
              </div>
              <div style={{ textAlign: 'center', background: '#fef3c7', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#d97706' }}>{resultado.atualizados || 0}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', marginTop: '4px' }}>ATUALIZADOS</div>
              </div>
              <div style={{ textAlign: 'center', background: resultado.erros?.length > 0 ? '#fef2f2' : '#f3f4f6', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: resultado.erros?.length > 0 ? '#dc2626' : '#6b7280' }}>{resultado.erros?.length || 0}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: resultado.erros?.length > 0 ? '#b91c1c' : '#4b5563', marginTop: '4px' }}>ERROS</div>
              </div>
            </div>

            {/* Lista de erros */}
            {resultado.erros?.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1b1c1b', marginBottom: '8px' }}>
                  Erros encontrados ({resultado.erros.length}):
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

            {/* Botones */}
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
                Fechar
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
                Importar outro ficheiro
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
                Erro na Importação
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
                Clica aqui para selecionar arquivo
              </p>
              <p style={{ fontSize: '12px', color: '#8e7165', margin: 0 }}>
                ou arrasta um arquivo Excel/CSV
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {/* Instruções */}
            <div style={{
              backgroundColor: '#fcf9f7',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#1b1c1b', marginBottom: '8px', margin: '0 0 8px 0' }}>
                Formato esperado:
              </h4>
              <ul style={{ fontSize: '12px', color: '#8e7165', margin: 0, paddingLeft: '20px' }}>
                <li>Colunas: nome, email, telemovel, nif, empresa, website, morada, codigoPostal, cidade, categoria, origem, processo, notasVendedor, dataUltimoContacto, servicos</li>
                <li>Pelo menos a coluna "nome" é obrigatória</li>
                <li>Suporta arquivos .xlsx, .xls e .csv</li>
                <li>Deduplicação automática por NIF → Email → Telefone</li>
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
              Cancelar
            </button>
          </>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Loader size={32} color="#F25C05" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#1b1c1b' }}>
              A processar arquivo...
            </p>
            <p style={{ fontSize: '12px', color: '#8e7165' }}>
              Isto pode levar alguns segundos
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
