import React, { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { Redirect, useLocation } from 'wouter';
import { useAcademiaAuth } from '../../hooks/useAcademiaAuth';

const colors = {
  orange: '#ff6f2e',
  dark: '#1c1b1b',
  light: '#fcf9f8'
};

export default function AcademiaLogin() {
  const { signIn } = useSignIn();
  const { isSignedIn, isLoaded } = useAcademiaAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isLoaded) return <div style={{ minHeight: '100vh', background: colors.dark }} />;
  if (isSignedIn) return <Redirect to="/academia/dashboard" />;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;
    
    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        setLocation('/academia/dashboard');
      } else {
        setError('Verifica o teu email ou tenta novamente.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Credenciais inválidas. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.dark,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Montserrat, sans-serif',
      padding: 24,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 48,
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
      }}>
        {/* Logo */}
        <h1 style={{ 
          fontSize: 28, 
          fontWeight: 700, 
          color: colors.dark, 
          marginBottom: 8,
          textAlign: 'center',
        }}>
          Academia Bora Lá
        </h1>
        
        {/* Subtítulo */}
        <p style={{ 
          color: '#666', 
          marginBottom: 32, 
          fontSize: 14,
          textAlign: 'center',
        }}>
          A tua jornada começa aqui
        </p>

        <form onSubmit={handleEmailLogin}>
          {error && (
            <div style={{ 
              background: '#fee', 
              color: '#c00', 
              padding: '12px 16px', 
              borderRadius: 8, 
              fontSize: 13,
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 8 }}>Email</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                height: 48,
                padding: '0 16px',
                borderRadius: 8,
                border: '1px solid #ddd',
                fontSize: 14,
                fontFamily: 'Montserrat, sans-serif',
                boxSizing: 'border-box',
              }}
            />
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 8 }}>Palavra-passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                height: 48,
                padding: '0 16px',
                borderRadius: 8,
                border: '1px solid #ddd',
                fontSize: 14,
                fontFamily: 'Montserrat, sans-serif',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: 48,
              background: colors.dark,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'A entrar...' : 'Entrar na Academia'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#999' }}>
            Usa as tuas credenciais de colaborador para aceder.
          </p>
        </div>
      </div>
    </div>
  );
}
