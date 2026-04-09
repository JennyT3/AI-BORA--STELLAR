import { useState, useEffect } from 'react';
import { Search, Bell, HelpCircle, Grid, Menu, X } from 'lucide-react';

interface VendasHeaderProps {
  userName: string;
  userRole?: string;
  onLogout: () => void;
  onToggleSidebar?: () => void;
  isMobile?: boolean;
}

export function VendasHeader({ userName, userRole = "VENDEDOR", onLogout, onToggleSidebar, isMobile }: VendasHeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 30,
      height: isMobile ? 56 : 64,
      backgroundColor: "rgba(252, 249, 247, 0.8)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(227, 191, 178, 0.2)",
      boxShadow: "0px 20px 40px rgba(90, 65, 55, 0.06)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: isMobile ? "0 16px" : "0 40px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 16 : 32 }}>
        {isMobile && onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            style={{
              background: "none",
              border: "none",
              padding: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Menu size={24} color="#1b1c1b" />
          </button>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #F25C05 0%, #e10977 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 14, fontFamily: "Montserrat, sans-serif" }}>AI</span>
          </div>
          <span style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#1b1c1b",
            fontFamily: "Montserrat, sans-serif",
            display: isMobile ? "none" : "block",
          }}>
            AI BORA Sales
          </span>
        </div>

        {!isMobile && (
          <div style={{ position: "relative", width: "100%", maxWidth: 400 }}>
            <Search 
              size={18} 
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(90, 65, 55, 0.5)",
                zIndex: 1,
              }} 
            />
            <input
              type="text"
              placeholder="Global search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 48px",
                borderRadius: 12,
                border: searchFocused ? "2px solid #F25C05" : "2px solid transparent",
                backgroundColor: searchFocused ? "#ffffff" : "rgba(229, 226, 224, 0.3)",
                fontSize: 14,
                fontFamily: "Montserrat, sans-serif",
                color: "#1b1c1b",
                outline: "none",
                transition: "all 0.2s ease",
              }}
            />
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 16 }}>
          {[
            { icon: Bell, label: "Notifications" },
            { icon: HelpCircle, label: "Help" },
            { icon: Grid, label: "Apps" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              title={label}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Icon size={20} color="#1b1c1b" />
            </button>
          ))}
        </div>

        <div style={{
          width: 1,
          height: 32,
          backgroundColor: "rgba(227, 191, 178, 0.3)",
          display: isMobile ? "none" : "block",
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: isMobile ? "none" : "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1b1c1b", fontFamily: "Montserrat, sans-serif" }}>
              {userName}
            </span>
            <span style={{ 
              fontSize: 10, 
              fontWeight: 800, 
              color: "#F25C05", 
              textTransform: "uppercase", 
              letterSpacing: "1.5px",
              fontFamily: "Montserrat, sans-serif",
            }}>
              {userRole}
            </span>
          </div>

          <div style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #F25C05 0%, #e10977 100%)",
            border: "2px solid #ffffff",
            boxShadow: "0 4px 15px rgba(242, 92, 5, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16, fontFamily: "Montserrat, sans-serif" }}>
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}