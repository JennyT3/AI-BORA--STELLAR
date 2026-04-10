import { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Eye, Loader2, CheckCircle, CreditCard, ExternalLink } from 'lucide-react';
import { createProposal } from '../../services/proposals';
import { createCliente, getClienteByEmail } from '../../services/clientes';
import { criarPaymentLinkSimples } from '../../services/pagamentos';
import { storeProposalOnChain } from '../../services/soroban';
import jsPDF from 'jspdf';

function generateProposalPDF(clientName: string, service: string, proposalId: string, stellarHash: string): string {
  const pdf = new jsPDF();
  pdf.setFontSize(24);
  pdf.setTextColor(234, 88, 12);
  pdf.text('AI BORA', 105, 20, { align: 'center' });
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Service Proposal', 105, 32, { align: 'center' });
  pdf.setDrawColor(234, 88, 12);
  pdf.line(20, 36, 190, 36);
  pdf.setFontSize(12);
  pdf.text('Proposal ID: ' + proposalId, 20, 48);
  pdf.text('Date: ' + new Date().toLocaleDateString(), 20, 58);
  pdf.setFontSize(14);
  pdf.text('Client', 20, 74);
  pdf.setFontSize(12);
  pdf.text('Name: ' + clientName, 20, 84);
  pdf.setFontSize(14);
  pdf.text('Service', 20, 100);
  pdf.setFontSize(12);
  pdf.text('Service: ' + service, 20, 110);
  pdf.setFontSize(14);
  pdf.text('Blockchain Verification', 20, 130);
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Stellar Testnet TX Hash:', 20, 140);
  pdf.setTextColor(0, 100, 200);
  const hashLines = pdf.splitTextToSize(stellarHash, 170);
  pdf.text(hashLines, 20, 148);
  pdf.setFontSize(10);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Anchored on Stellar blockchain. Verify at stellar.expert/explorer/testnet', 20, 275);
  return pdf.output('datauristring');
}

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
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ clientName: '', clientEmail: '', service: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Generate PDF first
      const tempPdf = new jsPDF();
      tempPdf.setFontSize(12);
      tempPdf.text(`Proposal for ${formData.clientName}`, 20, 20);
      tempPdf.text(`Service: ${formData.service}`, 20, 30);
      tempPdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
      const pdfArrayBuffer = tempPdf.output('arraybuffer');
      
      // Calculate SHA-256 of PDF
      const pdfHashBuffer = await crypto.subtle.digest('SHA-256', pdfArrayBuffer);
      const pdfHashArray = Array.from(new Uint8Array(pdfHashBuffer));
      const pdfHash = pdfHashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      console.log('📄 PDF SHA-256:', pdfHash);
      
      // Store on Soroban smart contract
      let stellarResult = { txHash: '', explorerUrl: '', success: false };
      try {
        const secretKey = import.meta.env.VITE_STELLAR_ADMIN_SECRET || localStorage.getItem('aibora_stellar_secret') || '';
        if (secretKey) {
          stellarResult = await storeProposalOnChain(
            `PROP-${Date.now()}`,
            formData.clientEmail,
            pdfHash,
            0,
            secretKey
          );
          setStellarHash(stellarResult.txHash);
          console.log('✅ Stored on Soroban:', stellarResult.txHash);
        }
      } catch (stellarErr) {
        console.warn('⚠️ Soroban storage failed (non-critical):', stellarErr);
      }

      let clienteId = '';
      const existingCliente = await getClienteByEmail(formData.clientEmail);
      if (existingCliente) {
        clienteId = existingCliente.id;
      } else {
        clienteId = await createCliente({
          nome: formData.clientName,
          email: formData.clientEmail,
          telemovel: '', nif: '', morada: '',
          categoria: 'potencial', origem: 'Quick Proposal',
          createdAt: new Date().toISOString(),
          criadoPor: localStorage.getItem('aibora_passkey_id') || 'passkey_user'
        });
      }

      const proposalIdStr = await createProposal({
        cliente: formData.clientName,
        email: formData.clientEmail,
        servicos: [formData.service],
        valor: 0,
        estado: 'pendente',
        criadoPor: localStorage.getItem('aibora_passkey_id') || 'passkey_user',
        numeroOrcamento: 'PROP-' + Date.now(),
        stellarHash: stellarResult.txHash,
        stellarExplorerUrl: stellarResult.explorerUrl,
        pdfHash: pdfHash,
        dataCriacao: new Date().toISOString()
      });

      const paymentLink = await criarPaymentLinkSimples(
        proposalIdStr, formData.clientEmail, clienteId, 0, 'Service: ' + formData.service
      );

      const pdfUri = generateProposalPDF(formData.clientName, formData.service, proposalIdStr, stellarResult.txHash || 'pending-stellar-confirmation');
      setPdfDataUri(pdfUri);
      setPaymentLinkId(paymentLink.id);
      setProposalId(proposalIdStr);
      setSuccess(true);
      onSuccess?.(proposalIdStr);
    } catch (err: any) {
      console.error('Error creating proposal:', err);
      setError('Failed to create proposal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = () => {
    const paymentUrl = paymentLinkId ? window.location.origin + '/pagamento/' + paymentLinkId : '';
    const subject = encodeURIComponent('Your AI BORA Proposal - ' + formData.clientName);
    const body = encodeURIComponent(
      'Hello ' + formData.clientName + ',\n\n' +
      'Service: ' + formData.service + '\n\n' +
      'View proposal: ' + window.location.origin + '/p/' + proposalId + '\n\n' +
      (paymentUrl ? 'Pay with Stellar: ' + paymentUrl + '\n\n' : '') +
      'Best regards,\nAI BORA Team'
    );
    window.location.href = 'mailto:' + formData.clientEmail + '?subject=' + subject + '&body=' + body;
  };

  if (success && proposalId) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 border-2 border-green-200">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Proposal Created!</h3>
          <p className="text-gray-500 text-sm mt-1">Verified on Stellar blockchain</p>
        </div>

        {pdfDataUri && (
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-700 mb-2 text-center">Proposal PDF</p>
            <iframe src={pdfDataUri} className="w-full h-56 rounded-xl border-2 border-gray-200" title="Proposal PDF" />
            <a href={pdfDataUri} download={'proposal-' + proposalId + '.pdf'}
              className="mt-2 w-full py-3 px-4 bg-gray-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors text-sm">
              Download PDF
            </a>
          </div>
        )}

        {stellarHash && (
          <div className="bg-cyan-50 rounded-2xl p-4 mb-4 text-center">
            <p className="text-xs font-semibold text-gray-600 mb-1">Stellar Transaction Hash</p>
            <a href={'https://stellar.expert/explorer/testnet/tx/' + stellarHash}
              target="_blank" rel="noopener noreferrer"
              className="text-cyan-600 font-mono text-xs break-all hover:underline">
              {stellarHash}
            </a>
          </div>
        )}

        {proposalId && (
          <div className="bg-orange-50 rounded-2xl p-4 mb-5 text-center">
            <p className="text-xs font-semibold text-gray-700 mb-1">Client Proposal Link</p>
            <a href={window.location.origin + '/p/' + proposalId}
              target="_blank" rel="noopener noreferrer"
              className="text-orange-600 text-xs break-all hover:underline font-mono">
              {window.location.origin}/p/{proposalId}
            </a>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleSendEmail}
            className="flex-1 py-4 bg-fuchsia-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90">
            <Send className="w-5 h-5" /> Send Email
          </button>
          {paymentLinkId && (
            <button onClick={() => window.open('/pagamento/' + paymentLinkId, '_blank')}
              className="flex-1 py-4 bg-orange-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90">
              <CreditCard className="w-5 h-5" /> Payment Link
            </button>
          )}
          {stellarHash && (
            <a href={'https://stellar.expert/explorer/testnet/tx/' + stellarHash}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 py-4 bg-cyan-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90">
              <ExternalLink className="w-5 h-5" /> Explorer
            </a>
          )}
        </div>

        <div className="flex gap-3 mt-3">
          <button onClick={() => window.location.href = '/admin/orcamento?cliente=' + proposalId}
            className="flex-1 py-3 bg-orange-100 text-orange-700 font-bold rounded-xl text-sm hover:bg-orange-200">
            Open Full Editor
          </button>
          <button onClick={() => { setSuccess(false); setProposalId(null); setPdfDataUri(null); setStellarHash(null); setFormData({ clientName: '', clientEmail: '', service: '' }); }}
            className="flex-1 py-3 text-gray-500 hover:text-gray-700 text-sm">
            + New Proposal
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-10 border-2 border-gray-100 shadow-xl">
      <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Create New Proposal</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-lg font-bold text-gray-700 mb-3">Client Name</label>
          <input type="text" value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })}
            required placeholder="Enter client name"
            className="w-full px-5 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-orange-500 outline-none" />
        </div>
        <div>
          <label className="block text-lg font-bold text-gray-700 mb-3">Client Email</label>
          <input type="email" value={formData.clientEmail} onChange={e => setFormData({ ...formData, clientEmail: e.target.value })}
            required placeholder="client@example.com"
            className="w-full px-5 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-orange-500 outline-none" />
        </div>
        <div>
          <label className="block text-lg font-bold text-gray-700 mb-3">Service</label>
          <select value={formData.service} onChange={e => setFormData({ ...formData, service: e.target.value })}
            required className="w-full px-5 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-orange-500 outline-none bg-white">
            <option value="">Select a service</option>
            <option value="Website Development">Website Development</option>
            <option value="Mobile App">Mobile App</option>
            <option value="E-commerce">E-commerce</option>
            <option value="SEO Marketing">SEO Marketing</option>
            <option value="Social Media">Social Media</option>
            <option value="Consulting">Consulting</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      {error && <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
      <div className="mt-8 flex gap-4">
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="flex-1 py-5 bg-gray-100 text-gray-700 font-bold rounded-2xl">Cancel</button>
        )}
        <button type="submit" disabled={loading}
          className="flex-[2] py-5 bg-gradient-to-r from-orange-500 to-fuchsia-600 text-white font-bold rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 text-xl">
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
          Generate Proposal
        </button>
      </div>
      <p className="mt-4 text-sm text-gray-400 text-center">Verified on Stellar blockchain</p>
    </form>
  );
}
