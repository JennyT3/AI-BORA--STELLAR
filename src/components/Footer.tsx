import { Link } from 'wouter';
import { Mail, Phone, Bot, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{ backgroundColor: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      
      {/* Banner */}
      <div style={{ 
        backgroundColor: 'linear-gradient(135deg, #F25C05 0%, #F22283 100%)',
        background: 'linear-gradient(135deg, #F25C05 0%, #F22283 100%)',
        padding: '24px 16px',
        textAlign: 'center'
      }}>
        <a 
          href="https://aibora.pt/" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
            <Bot size={24} color="#fff" />
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 20, color: '#fff' }}>
              AI BORA
            </span>
          </div>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
            B2B Sales Platform with AI Agents and Stellar Payments
          </p>
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 6, 
            marginTop: 12,
            padding: '8px 16px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 100,
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 12,
            fontWeight: 600,
            color: '#fff'
          }}>
            Visit aibora.pt <ExternalLink size={12} />
          </span>
        </a>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 16px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
          
          {/* Logo + description */}
          <div>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
              <img src="/logo.png" alt="" style={{ height: 24, width: 'auto' }} />
              <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 12, color: '#F25C05', letterSpacing: '0.1em' }}>
                AI BORA
              </span>
            </Link>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>
              Autonomous B2B payments with AI agents and Stellar blockchain.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 11, color: '#F25C05', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
              Platform
            </h4>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
              <li style={{ marginBottom: 8 }}>
                <Link href="/agent-x402-demo" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                  AI Demo
                </Link>
              </li>
              <li style={{ marginBottom: 8 }}>
                <Link href="/onboarding" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                  Agent Onboarding
                </Link>
              </li>
              <li style={{ marginBottom: 8 }}>
                <Link href="/admin" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 11, color: '#F25C05', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
              Resources
            </h4>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
              <li style={{ marginBottom: 8 }}>
                <a href="https://github.com/JennyT3/AI-BORA--STELLAR" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                  GitHub / Docs
                </a>
              </li>
              <li style={{ marginBottom: 8 }}>
                <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                  Stellar Explorer
                </a>
              </li>
              <li style={{ marginBottom: 8 }}>
                <a href="https://aibora.pt/" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                  AI BORA Website
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 11, color: '#F25C05', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
              Contact
            </h4>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Mail size={14} color="#F25C05" />
                <a href="mailto:geral@aibora.pt" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                  geral@aibora.pt
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={14} color="#F25C05" />
                <a href="tel:+351936021747" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                  +351 936 021 747
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            &copy; {new Date().getFullYear()} AI BORA. All rights reserved.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bot size={16} color="#F25C05" />
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              Powered by AI Agents on Stellar
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}