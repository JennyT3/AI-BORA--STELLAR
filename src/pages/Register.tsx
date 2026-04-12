import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'motion/react';
import { KeyRound, Loader2, ArrowLeft } from 'lucide-react';

export default function Register() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);

  const handlePasskey = async (isSignup: boolean) => {
    if (!window.PublicKeyCredential) {
      setError('WebAuthn not supported in this browser. Please use a modern browser like Chrome, Safari, or Edge.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      if (isSignup) {
        const userId = new Uint8Array(16);
        crypto.getRandomValues(userId);
        const userIdHex = Array.from(userId).map(b => b.toString(16).padStart(2, '0')).join('');

        const credential = await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: {
              name: 'AI BORA',
              id: window.location.hostname
            },
            user: {
              id: userId,
              name: 'aibora_user',
              displayName: 'AI BORA User'
            },
            pubKeyCredParams: [
              { alg: -7, type: 'public-key' },
              { alg: -257, type: 'public-key' }
            ],
            timeout: 60000,
            authenticatorSelection: {
              residentKey: 'preferred',
              userVerification: 'preferred'
            }
          }
        });

        if (credential) {
          localStorage.setItem('aibora_passkey_user', 'true');
          localStorage.setItem('aibora_passkey_id', userIdHex);
          setCreated(true);
          setTimeout(() => setLocation('/onboarding'), 1500);
        }
      } else {
        const credential = await navigator.credentials.get({
          publicKey: {
            challenge,
            timeout: 60000,
            userVerification: 'preferred',
            rpId: window.location.hostname
          }
        });

        if (credential) {
          localStorage.setItem('aibora_passkey_user', 'true');
          setCreated(true);
          setTimeout(() => setLocation('/onboarding'), 1500);
        }
      }
    } catch (err: any) {
      console.error('Passkey error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Authentication cancelled. Please try again.');
      } else if (err.name === 'InvalidStateError') {
        setError('No passkey found. Please create an account first.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (created) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="text-7xl mb-6"
          >
            ✅
          </motion.div>
          <h2 className="text-4xl font-black text-white mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Welcome to <span style={{ color: '#F25C05' }}>AI BORA</span>!
          </h2>
          <p className="text-gray-400 text-lg">Redirecting...</p>
        </motion.div>
      </div>
    );
  }

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
          className="mb-10"
        >
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #F25C05 0%, #F22283 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 40px rgba(242, 92, 5, 0.4)'
          }}>
            <span style={{ fontSize: 36 }}>🤖</span>
          </div>
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
            marginBottom: 12
          }}
        >
          Create Account
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            color: '#A0A0A0',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '1.1rem',
            marginBottom: 40,
            fontWeight: 500
          }}
        >
          Use your device's biometric - one click, no password
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-5"
        >
          <button
            onClick={() => handlePasskey(true)}
            disabled={loading}
            className="w-full py-6 px-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl flex items-center justify-center gap-4 hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg shadow-orange-500/30 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <KeyRound className="w-7 h-7" />
            )}
            <span className="text-xl">🔐 Create Account with Passkey</span>
          </button>

          <button
            onClick={() => handlePasskey(false)}
            disabled={loading}
            className="w-full py-6 px-8 bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 text-white font-bold rounded-2xl flex items-center justify-center gap-4 hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg shadow-fuchsia-500/30 disabled:opacity-50"
          >
            <KeyRound className="w-7 h-7" />
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
          style={{
            marginTop: 32,
            color: '#6B6B6B',
            fontSize: 14,
            fontFamily: 'Montserrat, sans-serif'
          }}
        >
          Uses fingerprint or Face ID • No password needed
        </motion.p>

        <motion.a
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </motion.a>
      </motion.div>
    </div>
  );
}