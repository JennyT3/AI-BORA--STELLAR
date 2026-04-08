import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, LogOut, User, Award, MessageSquare, Zap, BookOpen } from 'lucide-react';
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
  const [, setLocation] = useLocation();

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
    { label: 'Dashboard', href: '/academia/dashboard', icon: BookOpen },
    { label: 'Trilhas', href: '/academia/trilhas', icon: Zap },
    { label: 'Certificados', href: '/academia/certificados', icon: Award },
    { label: 'Consultoria', href: '/academia/consultoria', icon: MessageSquare },
  ];

  const userInitials = user?.firstName?.charAt(0).toUpperCase() || 'U';
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || '';

  return (
    <>
      {/* Header Sticky */}
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
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: colors.dark,
                  letterSpacing: '-0.02em'
                }}>
                  Bora Lá
                </div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: colors.orange,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  Academia
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav style={{
            display: 'none',
            gap: 8,
            '@media (min-width: 1024px)': {
              display: 'flex'
            }
          }} className="hidden lg:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div style={{
                  padding: '10px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: colors.dark,
                  cursor: 'pointer',
                  borderRadius: 8,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${colors.orange}10`;
                  e.currentTarget.style.color = colors.orange;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = colors.dark;
                }}
                >
                  <item.icon size={16} />
                  {item.label}
                </div>
              </Link>
            ))}
          </nav>

          {/* Right Section: Profile + Mobile Menu */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}>
            {/* Profile Dropdown (Desktop) */}
            <div style={{ position: 'relative', display: 'none' }} className="hidden lg:block">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`,
                  border: 'none',
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {userInitials}
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: 8,
                      background: colors.surface,
                      borderRadius: 12,
                      border: `1px solid ${colors.border}`,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                      minWidth: 200,
                      zIndex: 200
                    }}
                  >
                    <div style={{
                      padding: 12,
                      borderBottom: `1px solid ${colors.border}`
                    }}>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: colors.dark,
                        marginBottom: 2
                      }}>
                        {user?.firstName || 'Utilizador'}
                      </div>
                      <div style={{
                        fontSize: 12,
                        color: '#999',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {userEmail}
                      </div>
                    </div>

                    <Link href="/academia/perfil">
                      <div
                        onClick={() => setIsProfileOpen(false)}
                        style={{
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          fontSize: 14,
                          fontWeight: 600,
                          color: colors.dark,
                          cursor: 'pointer',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = `${colors.orange}10`}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <User size={16} />
                        Meu Perfil
                      </div>
                    </Link>

                    <div
                      onClick={handleLogout}
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#e74c3c',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                        borderTop: `1px solid ${colors.border}`
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(231, 76, 60, 0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={16} />
                      Sair
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: colors.dark,
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = `${colors.border}`}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              className="lg:hidden"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 70,
              left: 0,
              right: 0,
              bottom: 0,
              background: colors.surface,
              zIndex: 99,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto'
            }}
            className="lg:hidden"
          >
            {/* Mobile Nav Items */}
            <nav style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '16px 0'
            }}>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      padding: '16px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 16,
                      fontWeight: 600,
                      color: colors.dark,
                      cursor: 'pointer',
                      borderBottom: `1px solid ${colors.border}`,
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = `${colors.orange}10`}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </div>
                </Link>
              ))}
            </nav>

            {/* Mobile Profile Section */}
            <div style={{
              padding: '16px 24px',
              borderTop: `1px solid ${colors.border}`,
              marginTop: 'auto'
            }}>
              <Link href="/academia/perfil">
                <div
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: 14,
                    fontWeight: 600,
                    color: colors.dark,
                    cursor: 'pointer',
                    borderRadius: 8,
                    background: `${colors.orange}10`,
                    marginBottom: 12
                  }}
                >
                  <User size={18} />
                  Meu Perfil
                </div>
              </Link>

              <div
                onClick={handleLogout}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#e74c3c',
                  cursor: 'pointer',
                  borderRadius: 8,
                  background: 'rgba(231, 76, 60, 0.08)'
                }}
              >
                <LogOut size={18} />
                Sair
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay para cerrar menú */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.3)',
              zIndex: 98,
              top: 70
            }}
            className="lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}
