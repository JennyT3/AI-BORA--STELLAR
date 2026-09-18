import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle, ShoppingCart } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedServices: { id: string; name: string }[];
}

const SIMPLE_SERVICES = [
  { id: 'social', name: '🌐 Social Media', desc: 'Social media management' },
  { id: 'design', name: '🎨 Design', desc: 'Posts, logos, visual identity' },
  { id: 'web', name: '💻 Website', desc: 'Websites and landing pages' },
  { id: 'seo', name: '📈 SEO', desc: 'Search engine optimisation' },
  { id: 'video', name: '🎬 Videos', desc: 'Video and reels production' },
  { id: 'ads', name: '📢 Advertising', desc: 'Facebook/Instagram ads' },
  { id: 'consulting', name: '💼 Consulting', desc: 'Strategic consulting' },
  { id: 'other', name: '📦 Other', desc: 'Other service' },
];

export function SimpleRequestModal({ isOpen, onClose, selectedServices }: Props) {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: ''
  });

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.service) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const serviceNames = selectedServices.length > 0 
        ? selectedServices.map(s => s.name)
        : [SIMPLE_SERVICES.find(s => s.id === formData.service)?.name || 'Other'];

      localStorage.setItem('aibora_client_email', formData.email);

      await addDoc(collection(db, 'requests'), {
        name: formData.name,
        email: formData.email,
        phone: '',
        company: '',
        services: serviceNames,
        source: 'Website - Simple Request',
        status: 'pending',
        createdAt: new Date().toISOString(),
        category: 'potential'
      });

      setStep('success');
    } catch (err: any) {
      console.error('Error:', err);
      setError('Error sending request. Please try again.');
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
                  <p className="text-white/80 mt-2">Fill in the details below</p>
                </div>

                <div className="p-8 space-y-6">
                  <div>
                    <label className="block text-lg font-bold text-gray-700 mb-3">
                      👤 Your Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-5 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-orange-500 outline-none bg-white"
                    >
                      <option value="">Select a service</option>
                      {SIMPLE_SERVICES.map(s => (
                        <option key={s.id} value={s.id}>{s.name} - {s.desc}</option>
                      ))}
                    </select>
                  </div>

                  {selectedServices.length > 0 && (
                    <div className="bg-orange-50 rounded-xl p-4">
                      <p className="text-sm font-semibold text-orange-700 mb-2">Selected services:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedServices.map(s => (
                          <span key={s.id} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                            {s.name}
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
                    onClick={() => { onClose(); setLocation('/client'); }}
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