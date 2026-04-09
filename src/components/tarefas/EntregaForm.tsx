import { useState, useRef } from 'react';
import { Upload, X, Link as LinkIcon, FileText, Image, Video, File, Loader, CheckCircle } from 'lucide-react';
import { entregarTarea } from '../../services/tareas';

interface EntregaFormProps {
  tareaId: string;
  tarefaTitulo: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EntregaForm({ tareaId, tarefaTitulo, onSuccess, onCancel }: EntregaFormProps) {
  const [arquivos, setArquivos] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [novoLink, setNovoLink] = useState('');
  const [nota, setNota] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files).map(f => {
      return f.name;
    });
    
    setArquivos(prev => [...prev, ...newFiles]);
  };

  const addLink = () => {
    if (novoLink.trim()) {
      setLinks(prev => [...prev, novoLink.trim()]);
      setNovoLink('');
    }
  };

  const removeArquivo = (index: number) => {
    setArquivos(prev => prev.filter((_, i) => i !== index));
  };

  const removeLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await entregarTarea(tareaId, arquivos, links, nota || undefined);
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit delivery:', error);
      alert('Failed to submit delivery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return Image;
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext || '')) return Video;
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) return FileText;
    return File;
  };

  if (success) {
    return (
      <div style={{
        backgroundColor: '#ecfdf5',
        border: '1px solid #6ee7b7',
        borderRadius: '12px',
        padding: '32px',
        textAlign: 'center'
      }}>
        <CheckCircle size={48} color="#059669" style={{ marginBottom: '12px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#065f46', marginBottom: '8px' }}>
          Delivery submitted!
        </h3>
        <p style={{ fontSize: '14px', color: '#047857' }}>
          The admin has been notified. Awaiting review.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      padding: '24px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1b1c1b', margin: 0 }}>
          Submit delivery
        </h3>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} color="#666" />
        </button>
      </div>

      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
        <strong>{tarefaTitulo}</strong>
      </p>

      {/* Files */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '8px' }}>
          Files (optional)
        </label>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            padding: '16px',
            border: '2px dashed #d1d5db',
            borderRadius: '10px',
            backgroundColor: '#f9fafb',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#6b7280',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          <Upload size={20} />
          Click to select files
        </button>

        {arquivos.length > 0 && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {arquivos.map((arquivo, idx) => {
              const Icon = getFileIcon(arquivo);
              return (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={16} color="#6b7280" />
                    <span style={{ fontSize: '13px', color: '#374151' }}>{arquivo}</span>
                  </div>
                  <button onClick={() => removeArquivo(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={16} color="#9ca3af" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Links */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '8px' }}>
          External links (optional)
        </label>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="url"
            value={novoLink}
            onChange={(e) => setNovoLink(e.target.value)}
            placeholder="https://..."
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <button
            onClick={addLink}
            disabled={!novoLink.trim()}
            style={{
              padding: '10px 16px',
              backgroundColor: novoLink.trim() ? '#374151' : '#d1d5db',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: novoLink.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            Add
          </button>
        </div>

        {links.length > 0 && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {links.map((link, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LinkIcon size={16} color="#6b7280" />
                  <a href={link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#2563eb' }}>
                    {link.length > 40 ? link.substring(0, 40) + '...' : link}
                  </a>
                </div>
                <button onClick={() => removeLink(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={16} color="#9ca3af" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '8px' }}>
          Additional note (optional)
        </label>
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Describe what was done, important notes..."
          rows={4}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#f3f4f6',
            color: '#4b5563',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || (arquivos.length === 0 && links.length === 0 && !nota)}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: (arquivos.length > 0 || links.length > 0 || nota) ? '#10b981' : '#d1d5db',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: (arquivos.length > 0 || links.length > 0 || nota) ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {loading ? <Loader size={18} className="spin" /> : <CheckCircle size={18} />}
          {loading ? 'Sending...' : 'Submit'}
        </button>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}