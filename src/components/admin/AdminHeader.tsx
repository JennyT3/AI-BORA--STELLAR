import { useState } from 'react';
import { Search, HelpCircle, Grid, Menu } from 'lucide-react';
import { NotificacoesBadge } from './NotificacoesBadge';

interface AdminHeaderProps {
  userName: string;
  userRole?: string;
  onLogout: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  isMobile?: boolean;
  notificationCount?: number;
  onNavigate?: (tab: string) => void;
}

export function AdminHeader({ 
  userName, 
  userRole = "ADMINISTRADOR", 
  onToggleSidebar, 
  isMobile,
  onNavigate
}: AdminHeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 30,
      height: 80,
      backgroundColor: "rgba(252, 249, 247, 0.85)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(142, 113, 101, 0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: isMobile ? "0 20px" : "0 40px",
      fontFamily: 'Montserrat, sans-serif',
    }}>
      {/* Left: Search & Mobile Menu */}
      <div style={{ display: "flex", alignItems: "center", gap: 24, flex: 1 }}>
        {isMobile && onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            style={{ 
              background: "rgba(242, 92, 5, 0.05)", 
              border: "none", 
              padding: 10, 
              borderRadius: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#F25C05"
            }}
          >
            <Menu size={24} />
          </button>
        )}

        {!isMobile && (
          <div style={{ position: "relative", width: "100%", maxWidth: 450 }}>
            <Search 
              size={18} 
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(90, 65, 55, 0.4)",
                zIndex: 1,
              }} 
            />
            <input
              type="text"
              placeholder="Pesquisa global no ecossistema..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: "100%",
                padding: "14px 16px 14px 48px",
                borderRadius: 16,
                border: "2px solid transparent",
                backgroundColor: searchFocused ? "#ffffff" : "rgba(229, 226, 224, 0.3)",
                fontSize: 14,
                fontWeight: 700,
                color: "#1b1c1b",
                outline: "none",
                transition: "all 0.3s ease",
                boxShadow: searchFocused ? "0 8px 20px rgba(0,0,0,0.04)" : "none",
                borderColor: searchFocused ? "rgba(242, 92, 5, 0.2)" : "transparent",
              }}
            />
          </div>
        )}
      </div>

      {/* Right: Icons + User */}
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <NotificacoesBadge onNavigate={onNavigate} />
          
          <button
            title="Ajuda"
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#5a4137",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.6)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <HelpCircle size={20} />
          </button>

          <button
            title="Aplicações"
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#5a4137",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.6)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <Grid size={20} />
          </button>
        </div>

        <div style={{ width: 1, height: 32, backgroundColor: "rgba(142, 113, 101, 0.15)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: isMobile ? "none" : "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ fontSize: 14, fontWeight: 900, color: "#1b1c1b" }}>{userName}</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#F25C05", textTransform: "uppercase", letterSpacing: "1.5px" }}>{userRole}</span>
          </div>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #F25C05 0%, #F22283 100%)',
            border: "2px solid #ffffff",
            boxShadow: "0 8px 20px rgba(242, 92, 5, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 900,
            fontSize: 18,
          }}>
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
