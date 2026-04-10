import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, CheckCircle, ShoppingCart } from 'lucide-react';
import { createSolicitude } from '../services/solicitudes';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  servicosSelecionados: { id: string; nome: string }[];
}

const SERVICOS_SIMPLES = [
  { id: 'redes', nome: '🌐 Social Media', desc: 'Gestão de redes sociais' },
  { id: 'design', nome: '🎨 Design', desc: 'Posts, logos, identidade visual' },
  { id: 'web', nome: '💻 Website', desc: 'Sites e landing pages' },
  { id: 'seo', nome: '📈 SEO', desc: 'Otimização para motores de busca' },
  { id: 'video', nome: '🎬 Vídeos', desc: 'Produção de vídeo e reels' },
  { id: 'ads', nome: '📢 Publicidade', desc: 'Anúncios Facebook/Instagram' },
  { id: 'consulting', nome: '💼 Consultoria', desc: 'Consultoria estratégica' },
  { id: 'other', nome: '📦 Outro', desc: 'Outro serviço' },
];

export function SimpleRequestModal({ isOpen, onClose, servicosSelecionados }: Props) {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    servico: ''
  });

  const handleSubmit = async () => {
    if (!formData.nome.trim() || !formData.email.trim() || !formData.servico) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const servicosNomes = servicosSelecionados.length > 0 
        ? servicosSelecionados.map(s => s.nome)
        : [SERVICOS_SIMPLES.find(s => s.id === formData.servico)?.nome || 'Outro'];

      localStorage.setItem('aibora_client_email', formData.email);

      await addDoc(collection(db, 'solicitudes'), {
        nome: formData.nome,
        email: formData.email,
        telefone: '',
        empresa: '',
        servicos: servicosNomes,
        origem: 'Website - Simple Request',
        estado: 'pendente',
        createdAt: new Date().toISOString(),
        categoria: 'potencial'
      });

      setStep('success');
    } catch (err: any) {
      console.error('Error:', err);
      setError('Erro ao enviar pedido. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {step === 'form' ? (
              <>
                <div className="bg-gradient-to-r from-orange-500 to-fuchsia-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">🛒 Request Service</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <p className="text-white/80 mt-2">Preencha os dados abaixo</p>
                </div>

                <div className="p-8 space-y-6">
                  <div>
                    <label className="block text-lg font-bold text-gray-700 mb-3">
                      👤 Your Name
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full px-5 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-bold text-gray-700 mb-3">
                      📧 Your Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full px-5 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-bold text-gray-700 mb-3">
                      🛠️ Service Needed
                    </label>
                    <select
                      value={formData.servico}
                      onChange={(e) => setFormData({ ...formData, servico: e.target.value })}
                      className="w-full px-5 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-orange-500 outline-none bg-white"
                    >
                      <option value="">Select a service</option>
                      {SERVICOS_SIMPLES.map(s => (
                        <option key={s.id} value={s.id}>{s.nome} - {s.desc}</option>
                      ))}
                    </select>
                  </div>

                  {servicosSelecionados.length > 0 && (
                    <div className="bg-orange-50 rounded-xl p-4">
                      <p className="text-sm font-semibold text-orange-700 mb-2">Selected services:</p>
                      <div className="flex flex-wrap gap-2">
                        {servicosSelecionados.map(s => (
                          <span key={s.id} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                            {s.nome}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-600">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-5 bg-gradient-to-r from-orange-500 to-fuchsia-600 text-white font-bold text-xl rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <ShoppingCart className="w-6 h-6" />
                    )}
                    🛒 Request Service
                  </button>
                </div>
              </>
            ) : (
              <div className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">✅ Request Sent!</h2>
                <p className="text-gray-600 text-lg mb-6">
                  You can track your requests and payments here.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => { onClose(); setLocation('/cliente'); }}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-fuchsia-600 text-white font-bold rounded-xl"
                  >
                    View My Dashboard
                  </button>
                  <button
                    onClick={onClose}
                    className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}