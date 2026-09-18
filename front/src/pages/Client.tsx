import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ShoppingCart, CreditCard, ArrowLeft } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface Request {
  id: string;
  name: string;
  email: string;
  services: string[];
  status: string;
  createdAt: string;
}

interface PaymentLink {
  id: string;
  description: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function ClientPage() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);
  const [payments, setPayments] = useState<PaymentLink[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const email = localStorage.getItem('aibora_client_email');
      if (!email) {
        setLoading(false);
        return;
      }

      try {
        const solQuery = query(collection(db, 'requests'), where('email', '==', email));
        const solSnap = await getDocs(solQuery);
        const sols: Request[] = [];
        solSnap.forEach(doc => {
          sols.push({ id: doc.id, ...doc.data() } as Request);
        });
        setRequests(sols);

        const payQuery = query(collection(db, 'payment_links'), where('clientEmail', '==', email));
        const paySnap = await getDocs(payQuery);
        const pays: PaymentLink[] = [];
        paySnap.forEach(doc => {
          pays.push({ id: doc.id, ...doc.data() } as PaymentLink);
        });
        setPayments(pays);
      } catch (e) {
        console.error('Error loading data:', e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('aibora_client_email');
    setLocation('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <span style={{ 
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              fontSize: 14,
              color: '#F25C05',
              letterSpacing: '0.3em',
            }}>
              AI BORA
            </span>
            <h1 className="text-2xl font-bold text-white mt-2">My Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white text-sm"
          >
            Logout
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingCart className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-white">My Requests</h2>
            </div>
            
            {requests.length === 0 ? (
              <p className="text-gray-400">No requests yet. <a href="/servicos" className="text-orange-500 hover:underline">Request a service</a></p>
            ) : (
              <div className="space-y-3">
                {requests.map(sol => (
                  <div key={sol.id} className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{sol.services?.join(', ') || 'Service'}</p>
                        <p className="text-gray-400 text-sm">{new Date(sol.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        sol.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        sol.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {sol.status || 'pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-fuchsia-500" />
              <h2 className="text-xl font-bold text-white">Payment Links</h2>
            </div>
            
            {payments.length === 0 ? (
              <p className="text-gray-400">No pending payments</p>
            ) : (
              <div className="space-y-3">
                {payments.map(pay => (
                  <div key={pay.id} className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{pay.description}</p>
                        <p className="text-gray-400 text-sm">{pay.amount > 0 ? `$${pay.amount}` : 'Contact for price'}</p>
                      </div>
                      <a
                        href={`/payment/${pay.id}`}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-fuchsia-600 text-white font-bold rounded-xl text-sm hover:opacity-90"
                      >
                        💳 Pay
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <a
            href="/servicos"
            className="block w-full py-4 bg-slate-800 text-white font-bold rounded-2xl text-center hover:bg-slate-700 transition-colors"
          >
            + Request New Service
          </a>
        </div>

        <a
          href="/"
          className="mt-8 flex items-center justify-center gap-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </a>
      </motion.div>
    </div>
  );
}