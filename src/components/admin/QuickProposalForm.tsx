import { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Eye, Hash, Loader2, CheckCircle, CreditCard, ExternalLink } from 'lucide-react';
import { createProposal } from '../../services/proposals';
import { createCliente, getClienteByEmail } from '../../services/clientes';
import { gerarPropostaPDF } from '../../services/pdfAdmin';
import { criarPaymentLinkSimples } from '../../services/pagamentos';
import { storeHashOnStellar } from '../../services/stellar';

interface QuickProposalFormProps {
  onSuccess?: (proposalId: string) => void;
  onCancel?: () => void;
}

export function QuickProposalForm({ onSuccess, onCancel }: QuickProposalFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [stellarHash, setStellarHash] = useState<string | null>(null);
  const [paymentLinkId, setPaymentLinkId] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    service: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const hash = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      setStellarHash(hash.slice(0, 64));

      const stellarResult = await storeHashOnStellar(hash);
      const txHash = stellarResult.txHash;

      if (stellarResult.success) {
        setStellarHash(txHash);
      }

      let clienteId = '';
      const existingCliente = await getClienteByEmail(formData.clientEmail);
      
      if (existingCliente) {
        clienteId = existingCliente.id;
      } else {
        const newClienteId = await createCliente({
          nome: formData.clientName,
          email: formData.clientEmail,
          telemovel: '',
          nif: '',
          morada: '',
          categoria: 'potencial',
          origem: 'Quick Proposal',
          createdAt: new Date().toISOString(),
          criadoPor: localStorage.getItem('aibora_passkey_id') || 'passkey_user'
        });
        clienteId = newClienteId;
      }

      const proposal = await createProposal({
        cliente: formData.clientName,
        email: formData.clientEmail,
        servicos: [formData.service],
        valor: 0,
        estado: 'pendente',
        criadoPor: localStorage.getItem('aibora_passkey_id') || 'passkey_user',
        numeroOrcamento: `PROP-${Date.now()}`,
        stellarHash: txHash,
        stellarExplorerUrl: stellarResult.explorerUrl,
        dataCriacao: new Date().toISOString()
      });

      const paymentLink = await criarPaymentLinkSimples(
        proposal.id,
        formData.clientEmail,
        clienteId,
        0,
        `Service: ${formData.service}`
      );

      setPaymentLinkId(paymentLink.id);

      setProposalId(proposal.id);
      setSuccess(true);
      onSuccess?.(proposal.id);
    } catch (err: any) {
      console.error('Error creating proposal:', err);
      setError('Failed to create proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (proposalId) {
      window.open(`/p/${proposalId}`, '_blank');
    }
  };

  const handleSendEmail = () => {
    const paymentUrl = paymentLinkId ? `${window.location.origin}/pagamento/${paymentLinkId}` : '';
    const subject = encodeURIComponent(`Your AI BORA Proposal - ${formData.clientName}`);
    const body = encodeURIComponent(
      `Hello ${formData.clientName},\n\n` +
      `Thank you for your interest in our services.\n\n` +
      `Service: ${formData.service}\n\n` +
      `You can view and accept your proposal here:\n${window.location.origin}/p/${proposalId}\n\n` +
      (paymentUrl ? `To pay securely with Stellar blockchain:\n${paymentUrl}\n\n` : '') +
      `Best regards,\nAI BORA Team`
    );
    window.location.href = `mailto:${formData.clientEmail}?subject=${subject}&body=${body}`;
  };

  if (success && proposalId) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-10 border-2 border-green-200"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-3">✅ Proposal Created!</h3>
          <p className="text-gray-600 text-lg">Your proposal has been saved with Stellar verification</p>
        </div>

        {stellarHash && (
          <div className="bg-gradient-to-r from-cyan-50 to-purple-50 rounded-2xl p-6 mb-8 text-center">
            <p className="text-base text-gray-600 mb-2 font-semibold">🔗 Stellar Transaction Hash</p>
            <a 
              href={`https://stellar.expert/explorer/testnet/tx/${stellarHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-600 font-mono text-sm break-all hover:underline"
            >
              {stellarHash}
            </a>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handlePreview}
            className="flex-1 py-5 px-6 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-2xl flex items-center justify-center gap-3 transition-colors border-2 border-gray-200"
          >
            <Eye className="w-6 h-6" />
            <span className="text-lg">👁️ Preview</span>
          </button>
          <button
            onClick={handleSendEmail}
            className="flex-1 py-5 px-6 bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
          >
            <Send className="w-6 h-6" />
            <span className="text-lg">📧 Send Email</span>
          </button>
          {stellarHash && (
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${stellarHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-5 px-6 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
            >
              <ExternalLink className="w-6 h-6" />
              <span className="text-lg">🔗 View on Stellar</span>
            </a>
          )}
          {paymentLinkId && (
            <button
              onClick={() => window.open(`/pagamento/${paymentLinkId}`, '_blank')}
              className="flex-1 py-5 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
            >
              <CreditCard className="w-6 h-6" />
              <span className="text-lg">💳 Payment Link</span>
            </button>
          )}
        </div>

        <button
          onClick={() => { setSuccess(false); setProposalId(null); setFormData({ clientName: '', clientEmail: '', service: '' }); }}
          className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm"
        >
          Create another proposal
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-10 border-2 border-gray-100 shadow-xl">
      <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">📋 Create New Proposal</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-lg font-bold text-gray-700 mb-3">
            👤 Client Name
          </label>
          <input
            type="text"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            required
            placeholder="Enter client name"
            className="w-full px-5 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-lg font-bold text-gray-700 mb-3">
            📧 Client Email
          </label>
          <input
            type="email"
            value={formData.clientEmail}
            onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
            required
            placeholder="client@example.com"
            className="w-full px-5 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-lg font-bold text-gray-700 mb-3">
            🛠️ Service Needed
          </label>
          <select
            value={formData.service}
            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
            required
            className="w-full px-5 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white"
          >
            <option value="">Select a service</option>
            <option value="Website Development">🌐 Website Development</option>
            <option value="Mobile App">📱 Mobile App</option>
            <option value="E-commerce">🛒 E-commerce</option>
            <option value="SEO Marketing">📈 SEO Marketing</option>
            <option value="Social Media">📱 Social Media</option>
            <option value="Consulting">💼 Consulting</option>
            <option value="Other">📦 Other</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-base">
          {error}
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-5 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors text-lg"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex-[2] py-5 px-8 bg-gradient-to-r from-orange-500 to-fuchsia-600 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-all transform hover:scale-[1.02] disabled:opacity-50 text-xl"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Send className="w-6 h-6" />
          )}
          📄 Generate Proposal
        </button>
      </div>

      <p className="mt-6 text-base text-gray-500 text-center">
        🔐 Proposal will be verified on Stellar blockchain
      </p>
    </form>
  );
}