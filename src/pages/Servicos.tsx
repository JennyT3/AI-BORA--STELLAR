import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { FloatingWhatsApp } from "../components/FloatingWhatsApp";
import { SimuladorServicios } from "../components/SimuladorServicios";
import { SimpleRequestModal } from "../components/SimpleRequestModal";
import { ArrowLeft, Building2, User } from "lucide-react";

const colors = {
  orange: '#ff6f2e',
  magenta: '#cb1a74',
  dark: '#1c1b1b',
  light: '#fcf9f8',
};

const fotos = [
  { src: "/antes.webp", label: "Before" },
  { src: "/depois.webp", label: "After" },
  { src: "/estudio.webp", label: "Studio" },
  { src: "/foto-criativa.webp", label: "Creative" },
  { src: "/mopack.webp", label: "Packaging" },
  { src: "/branding.webp", label: "Branding" },
];

export function Servicos() {
  const [, setLocation] = useLocation();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedServices, setSelectedServices] = useState<{ id: string; nome: string }[]>([]);
  const [userData, setUserData] = useState({
    name: '',
    companyName: '',
    hasCompany: false
  });

  // Leer datos del onboarding
  useEffect(() => {
    const name = localStorage.getItem('aibora_user_name') || '';
    const company = localStorage.getItem('aibora_company_name') || '';
    setUserData({
      name,
      companyName: company,
      hasCompany: !!company
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.light, fontFamily: 'Montserrat, sans-serif' }}>
      
      {/* Header Minimalista - Sin Navbar */}
      <header style={{
        background: `linear-gradient(135deg, ${colors.dark} 0%, #2a2a2a 100%)`,
        padding: '20px 24px',
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Back button */}
          <button 
            onClick={() => setLocation('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              padding: '10px 16px',
              borderRadius: 12,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <ArrowLeft size={18} />
            Back
          </button>

          {/* User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {userData.name && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>
                  Welcome
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={14} color={colors.orange} />
                  {userData.name}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Company Info Banner (if client has a specific company) */}
      {userData.hasCompany && (
        <div style={{
          background: `linear-gradient(135deg, ${colors.orange}15 0%, ${colors.magenta}15 100%)`,
          borderBottom: `2px solid ${colors.orange}`,
          padding: '16px 24px'
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={20} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: colors.gray, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Your selected company
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: colors.dark }}>
                  {userData.companyName}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setLocation('/cliente')}
              style={{
                background: colors.orange,
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: `0 4px 12px ${colors.orange}40`,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Go to company page →
            </button>
          </div>
        </div>
      )}

      {/* If no company selected, show message */}
      {!userData.hasCompany && (
        <div style={{
          background: '#f0f0f0',
          borderBottom: '1px solid #ddd',
          padding: '12px 24px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: 14, color: colors.gray }}>
            Browsing all available services • 
            <button 
              onClick={() => setLocation('/onboarding')}
              style={{ 
                color: colors.orange, 
                fontWeight: 700, 
                border: 'none', 
                background: 'none', 
                cursor: 'pointer',
                marginLeft: 8
              }}
            >
              Select a specific company
            </button>
          </p>
        </div>
      )}

      <main>
        {/* Hero Section */}
        <section style={{ backgroundColor: colors.dark, padding: "80px 16px 60px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            <h1 style={{ 
              fontWeight: 900, 
              fontSize: "clamp(28px, 5vw, 48px)", 
              color: "#ffffff", 
              lineHeight: 1.1, 
              margin: "0 0 16px" 
            }}>
              Our Services
            </h1>
            <p style={{ 
              fontSize: 16, 
              color: "#aaaaaa", 
              margin: 0, 
              lineHeight: 1.5 
            }}>
              {userData.hasCompany 
                ? `Services available from ${userData.companyName}` 
                : "Select the services you need and request your quote with no obligation"}
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-500 to-fuchsia-600 py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-10 py-5 bg-white text-gray-900 font-bold text-xl rounded-2xl flex items-center gap-4 mx-auto hover:scale-105 transition-transform shadow-lg"
            >
              🛒 Request Service {userData.hasCompany && `from ${userData.companyName}`}
            </button>
          </div>
        </div>

        <SimuladorServicios />

        {/* Portfolio Section */}
        <section style={{ backgroundColor: "#F5F2F0", padding: "64px 16px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ width: 36, height: 3, backgroundColor: colors.orange, margin: "0 auto 16px", borderRadius: 2 }} />
              <h2 style={{ fontWeight: 900, fontSize: "clamp(22px, 4vw, 32px)", color: colors.dark, margin: "0 0 12px" }}>
                Real results. Always.
              </h2>
              <p style={{ fontSize: 14, color: "#4A4A4A", margin: 0 }}>
                Real work with real clients. Every project with measurable impact.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {fotos.map((foto) => (
                <div key={foto.src} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "1", backgroundColor: "#e0ddd9" }}>
                  <img src={foto.src} alt={foto.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 16px", background: "linear-gradient(transparent, rgba(0,0,0,0.55))" }}>
                    <span style={{ fontWeight: 700, fontSize: 12, color: "#ffffff" }}>{foto.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Back to Home */}
        <div style={{ textAlign: 'center', padding: '40px 16px', backgroundColor: colors.dark }}>
          <button 
            onClick={() => setLocation('/')}
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '16px 32px',
              backgroundColor: colors.orange,
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              borderRadius: 50,
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
          >
            ← Back to Home
          </button>
        </div>
      </main>
      
      <FloatingWhatsApp />
      <SimpleRequestModal 
        isOpen={showRequestModal} 
        onClose={() => setShowRequestModal(false)}
        servicosSelecionados={selectedServices}
      />
    </div>
  );
}
