import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "motion/react";
import { KeyRound, Loader2, ArrowLeft } from "lucide-react";

interface VendasLoginProps {
  onLogin: (vendedor: any) => void;
}

export function VendasLogin({ onLogin }: VendasLoginProps) {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const isAuth = localStorage.getItem('aibora_authenticated');
    const role = localStorage.getItem('aibora_role');
    if (isAuth === 'true' && role === 'vendedor') {
      const passkeyId = localStorage.getItem('aibora_passkey_id') || 'passkey_user';
      onLogin({ id: passkeyId, nome: 'Collaborator', role: 'vendedor' });
    }
  }, []);

  const handlePasskey = async () => {
    if (!window.PublicKeyCredential) {
      setError('WebAuthn not supported. Please use a modern browser like Chrome or Safari.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: 'preferred'
        }
      });

      if (credential) {
        localStorage.setItem('aibora_passkey_user', 'true');
        
        const passkeyId = localStorage.getItem('aibora_passkey_id') || 'passkey_user';
        
        const token = {
          id: passkeyId,
          nome: 'Collaborator',
          email: '',
          role: 'vendedor' as const,
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('aibora_vendedor_session', JSON.stringify(token));
        onLogin(token);
      }
    } catch (err: any) {
      console.error('Passkey error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Authentication cancelled. Please try again.');
      } else if (err.name === 'InvalidStateError') {
        setError('No account found. Please create one first.');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <span style={{ 
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: 14,
            color: '#F25C05',
            letterSpacing: '0.3em',
            textTransform: 'uppercase'
          }}>
            AI BORA
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            color: '#FFFFFF',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            lineHeight: 1.1,
            marginBottom: 8
          }}
        >
          Collaborator Login
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '1rem',
            marginBottom: 40
          }}
        >
          Sign in with your device biometric
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={handlePasskey}
            disabled={loading}
            className="w-full py-6 px-8 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold rounded-2xl flex items-center justify-center gap-4 hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg shadow-cyan-500/30 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <KeyRound className="w-7 h-7" />
            )}
            <span className="text-xl">🔐 Sign in with Passkey</span>
          </button>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-red-500/20 border-2 border-red-500 rounded-xl text-red-400 text-base"
          >
            {error}
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-gray-500 text-base"
        >
          🔐 Uses fingerprint or Face ID - no password needed
        </motion.p>

        <motion.a
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          href="/selection"
          className="mt-6 inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Selection
        </motion.a>
      </motion.div>
    </div>
  );
}