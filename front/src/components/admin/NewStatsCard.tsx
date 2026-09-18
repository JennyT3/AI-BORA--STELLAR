import React from "react";

interface NewStatsCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: number;
    isPositive?: boolean;
    label?: string;
  };
  percentage?: number;
  percentageColor?: "green" | "orange";
  onClick?: () => void;
}

export function NewStatsCard({ 
  label, 
  value, 
  subtitle, 
  icon, 
  iconColor = "#F25C05", 
  iconBg = "rgba(242, 92, 5, 0.1)",
  trend,
  percentage,
  percentageColor = "orange",
  onClick,
}: NewStatsCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "#ffffff",
        borderRadius: 24,
        padding: 28,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0px 20px 40px rgba(90, 65, 55, 0.06)",
        transform: isHovered ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: onClick ? "pointer" : "default",
        fontFamily: 'Montserrat, sans-serif',
        border: '1px solid rgba(0,0,0,0.02)',
      }}
    >
      {/* Decorative Circle */}
      <div 
        style={{
          position: "absolute",
          right: -20,
          bottom: -20,
          width: 100,
          height: 100,
          background: `${iconColor}08`,
          borderRadius: "50%",
          transform: isHovered ? "scale(1.8)" : "scale(1)",
          transition: "transform 0.6s ease",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          {icon && (
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: iconColor,
              boxShadow: isHovered ? `0 8px 16px ${iconColor}15` : 'none',
              transition: 'all 0.3s ease',
            }}>
              {icon}
            </div>
          )}
          {percentage !== undefined && (
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              padding: "6px 12px",
              borderRadius: 100,
              backgroundColor: percentageColor === "green" ? "rgba(16, 185, 129, 0.1)" : "rgba(242, 92, 5, 0.1)",
              color: percentageColor === "green" ? "#10B981" : "#F25C05",
            }}>
              {percentage > 0 ? "+" : ""}{percentage}%
            </span>
          )}
        </div>

        <div style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#64748b",
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {label}
        </div>

        <div style={{
          fontSize: 38,
          fontWeight: 900,
          color: "#1b1c1b",
          letterSpacing: "-1.5px",
          lineHeight: 1,
        }}>
          {value}
        </div>

        {subtitle && (
          <div style={{
            fontSize: 12,
            color: "#94a3b8",
            marginTop: 8,
            fontWeight: 500,
          }}>
            {subtitle}
          </div>
        )}

        {trend && (
          <div style={{
            marginTop: 16,
            fontSize: 11,
            fontWeight: 700,
            color: trend.isPositive ? "#10B981" : "#F25C05",
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <span style={{ fontSize: 14 }}>{trend.isPositive ? "↑" : "↓"}</span>
            <span>{trend.value}% {trend.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
