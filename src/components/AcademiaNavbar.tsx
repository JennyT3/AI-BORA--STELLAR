import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, LogOut, User, Award, MessageSquare, Zap, Home, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAcademiaAuth } from '../hooks/useAcademiaAuth';

const colors = {
  orange: '#ff6f2e',
  magenta: '#cb1a74',
  dark: '#1c1b1b',
  light: '#fcf9f8',
  surface: '#ffffff',
  border: 'rgba(0,0,0,0.06)'
};

export function AcademiaNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAcademiaAuth();
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    setIsProfileOpen(false);
    signOut();
  };

  const navItems = [
    { label: 'Dashboard', href: '/academia/dashboard', icon: Home },
    { label: 'Trilhas', href: '/academia/trilhas', icon: Zap },
    { label: 'Certificados', href: '/academia/certificados', icon: Award },
    { label: 'Comunidade', href: '/academia/comunidade', icon: Users },
    { label: 'Consultoria', href: '/academia/consultoria', icon: MessageSquare },
  ];

  const userInitials = user?.firstName?.charAt(0).toUpperCase() || 'U';
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || '';

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: colors.surface,
          borderBottom: isScrolled ? `1px solid ${colors.border}` : 'none',
          boxShadow: isScrolled ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
          transition: 'box-shadow 0.3s ease, border-color 0.3s ease'
        }}
      >
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 70
        }}>
          {/* Logo */}
          <Link href="/academia/dashboard">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer'
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: colors.dark,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1
                }}>
                  Bora Lá
                </div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: colors.orange,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  Estudar
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav style={{
            display: 'flex',
            gap: 4,
          }} className="hidden md:flex">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div style={{
                    padding: '8px 16px',
                    fontSize: 14,
                    fontWeight: 700,
                    color: isActive ? colors.orange : colors.dark,
                    cursor: 'pointer',
                    borderRadius: 10,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: isActive ? `${colors.orange}10` : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = `${colors.orange}05`;
                      e.currentTarget.style.color = colors.orange;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = colors.dark;
                    }
                  }}
                  >
                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            {/* App Switcher */}
            <Link href="/">
              <div style={{
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 700,
                color: '#666',
                cursor: 'pointer',
                borderRadius: 8,
                border: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }} className="hidden sm:flex">
                <Home size={14} /> Site Principal
              </div>
            </Link>

            {/* Profile */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`,
                  border: 'none',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(255, 111, 46, 0.2)'
                }}
              >
                {userInitials}
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: 12,
                      background: '#fff',
                      borderRadius: 16,
                      border: '1px solid #eee',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      minWidth: 240,
                      padding: 8,
                      zIndex: 200
                    }}
                  >
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f5f5f5', marginBottom: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: colors.dark }}>{user?.firstName || 'Utilizador'}</div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{userEmail}</div>
                    </div>
                    
                    <Link href="/academia/perfil">
                      <div style={{ padding: '10px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, color: colors.dark, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <User size={16} /> Meu Perfil
                      </div>
                    </Link>

                    <div onClick={handleLogout} style={{ padding: '10px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#ff4d4d', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fff5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={16} /> Sair
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.dark }}
              className="md:hidden"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ background: '#fff', borderTop: '1px solid #eee', overflow: 'hidden' }}
              className="md:hidden"
            >
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div 
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{ padding: '12px 16px', borderRadius: 10, fontSize: 15, fontWeight: 700, color: location === item.href ? colors.orange : colors.dark, background: location === item.href ? `${colors.orange}10` : 'transparent', display: 'flex', alignItems: 'center', gap: 12 }}
                    >
                      <item.icon size={20} /> {item.label}
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
