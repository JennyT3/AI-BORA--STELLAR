import { FileText, Users, Check, Plus, DollarSign, TrendingUp, Target } from "lucide-react";
import { getStatusColorDashboard, getStatusLabelDashboard, getProposalStatusBadge } from "../../utils/labels";
import { NewStatsCard } from "../../components/admin/NewStatsCard";
import { WelcomeHero } from "../../components/admin/WelcomeHero";

interface DashboardProps {
  stats: { total: number; enviadas: number; respondidas: number; aceitas: number; reagendadas: number };
  proposals: any[];
  solicitudes: any[];
  clientes: any[];
  onExport: () => void;
  onNovoOrcamento: () => void;
  onNovoCliente: () => void;
  onNovaFatura: () => void;
  onNavigate: (tab: string) => void;
  isMobile?: boolean;
}

export function Dashboard({ stats, proposals, solicitudes, clientes, onNovoOrcamento, onNovoCliente, onNovaFatura, onNavigate, isMobile = false }: DashboardProps) {
  const clientesAtivos = clientes.filter(c => c.categoria === "cliente").length;

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Welcome Hero */}
      <WelcomeHero isMobile={isMobile} />

      {/* Stats Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", 
        gap: isMobile ? 16 : 24, 
        marginBottom: 40 
      }}>
        <NewStatsCard 
          label="Propostas" 
          value={stats.total.toLocaleString()} 
          percentage={12.5}
          percentageColor="green"
          icon={<FileText size={20} />}
          iconColor="#F25C05"
          iconBg="rgba(242, 92, 5, 0.05)"
        />
        <NewStatsCard 
          label="Respondidas" 
          value={stats.respondidas.toLocaleString()} 
          percentage={8.2}
          percentageColor="green"
          icon={<TrendingUp size={20} />}
          iconColor="#3498DB"
          iconBg="rgba(52, 152, 219, 0.05)"
        />
        <NewStatsCard 
          label="Aceites" 
          value={stats.aceitas.toLocaleString()} 
          percentage={-2.1}
          percentageColor="orange"
          icon={<Check size={20} />}
          iconColor="#10B981"
          iconBg="rgba(16, 185, 129, 0.05)"
        />
        <NewStatsCard 
          label="Clientes" 
          value={clientesAtivos.toLocaleString()} 
          percentage={14.2}
          percentageColor="green"
          icon={<Users size={20} />}
          iconColor="#F22283"
          iconBg="rgba(242, 34, 131, 0.05)"
        />
      </div>

      {/* Quick Actions - Conectados y Funcionales */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", 
        gap: 16, 
        marginBottom: 48 
      }}>
        <button 
          onClick={onNovoOrcamento} 
          style={{ padding: "14px 20px", borderRadius: 16, backgroundColor: "#fff", color: "#1b1c1b", border: "1px solid rgba(0,0,0,0.05)", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, fontSize: 13, fontWeight: 800, boxShadow: "0 4px 12px rgba(0,0,0,0.02)", transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#F25C05", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Plus size={16} strokeWidth={3} /></div>
          Novo Orçamento
        </button>
        <button 
          onClick={onNovoCliente} 
          style={{ padding: "14px 20px", borderRadius: 16, backgroundColor: "#fff", color: "#1b1c1b", border: "1px solid rgba(0,0,0,0.05)", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, fontSize: 13, fontWeight: 800, boxShadow: "0 4px 12px rgba(0,0,0,0.02)", transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#F25C05", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Users size={16} /></div>
          Novo Cliente
        </button>
        <button 
          onClick={onNovaFatura} 
          style={{ padding: "14px 20px", borderRadius: 16, backgroundColor: "#fff", color: "#1b1c1b", border: "1px solid rgba(0,0,0,0.05)", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, fontSize: 13, fontWeight: 800, boxShadow: "0 4px 12px rgba(0,0,0,0.02)", transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#1b1c1b", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><DollarSign size={16} /></div>
          Nova Fatura
        </button>
        <button 
          onClick={() => onNavigate("faturacao")} 
          style={{ padding: "14px 20px", borderRadius: 16, backgroundColor: "#fff", color: "#1b1c1b", border: "1px solid rgba(0,0,0,0.05)", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, fontSize: 13, fontWeight: 800, boxShadow: "0 4px 12px rgba(0,0,0,0.02)", transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#1b1c1b" }}><Target size={16} /></div>
          Faturação
        </button>
      </div>

      {/* Conversion Trend Chart */}
      <div style={{ 
        backgroundColor: "#ffffff", 
        borderRadius: 24, 
        padding: 32, 
        marginBottom: 48, 
        boxShadow: "0px 20px 40px rgba(90, 65, 55, 0.04)",
        border: "1px solid rgba(0,0,0,0.02)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#1b1c1b", marginBottom: 4 }}>Conversion Trend</h3>
            <p style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>Performance evolution over the last 7 days</p>
          </div>
          <span style={{ fontSize: 10, fontWeight: 900, color: "#F22283", background: "rgba(242, 34, 131, 0.1)", padding: "4px 10px", borderRadius: 100, letterSpacing: 1 }}>LIVE TRACKING</span>
        </div>
        
        <div style={{ width: "100%", height: 200, position: "relative", marginTop: 40 }}>
          <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F25C05" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#F25C05" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path 
              d="M0,150 Q150,160 250,120 T500,130 T750,110 T1000,80" 
              fill="none" 
              stroke="#F25C05" 
              strokeWidth="3" 
            />
            <path 
              d="M0,150 Q150,160 250,120 T500,130 T750,110 T1000,80 L1000,200 L0,200 Z" 
              fill="url(#chartGradient)" 
            />
            {[0, 250, 500, 750, 1000].map((x, i) => {
              const y = [150, 120, 130, 110, 80][i];
              return <circle key={i} cx={x} cy={y} r="5" fill="#fff" stroke="#F25C05" strokeWidth="2" />;
            })}
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, color: "#94a3b8", fontSize: 11, fontWeight: 800 }}>
            <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
          </div>
        </div>
      </div>

      {/* Lists Grid */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 32 }}>
        {/* Recent Requests - Conectado a Solicitacoes */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 32, boxShadow: "0px 20px 40px rgba(90, 65, 55, 0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: "#1b1c1b" }}>Solicitações Recentes</h3>
            <button onClick={() => onNavigate("solicitacoes")} style={{ fontSize: 12, color: "#F25C05", background: "none", border: "none", cursor: "pointer", fontWeight: 800 }}>Ver tudo</button>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {solicitudes.slice(0, 3).map(s => (
              <div 
                key={s.id} 
                onClick={() => onNavigate("solicitacoes")}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", backgroundColor: "#fcf9f7", borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0edeb'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fcf9f7'}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Users size={18} color="#64748b" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: "#1b1c1b", fontSize: 14 }}>{s.nome}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{s.empresa || "E-commerce Integration"}</div>
                  </div>
                </div>
                <span style={{ fontSize: 9, padding: "4px 10px", borderRadius: 100, backgroundColor: getStatusColorDashboard(s.status) + "15", color: getStatusColorDashboard(s.status), fontWeight: 900, textTransform: 'uppercase' }}>
                  {getStatusLabelDashboard(s.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Proposals - Conectado a Propostas */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 32, boxShadow: "0px 20px 40px rgba(90, 65, 55, 0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: "#1b1c1b" }}>Propostas Recentes</h3>
            <button onClick={() => onNavigate("propostas")} style={{ fontSize: 12, color: "#F25C05", background: "none", border: "none", cursor: "pointer", fontWeight: 800 }}>Ver tudo</button>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {proposals.slice(0, 3).map(p => {
              const badge = getProposalStatusBadge(p);
              return (
                <div 
                  key={p.id} 
                  onClick={() => onNavigate("propostas")}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", backgroundColor: "#fcf9f7", borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0edeb'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fcf9f7'}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(242, 92, 5, 0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FileText size={18} color="#F25C05" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: "#1b1c1b", fontSize: 14 }}>{p.numeroOrcamento}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{p.cliente}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 900, color: "#1b1c1b", fontSize: 14 }}>{p.valor?.toLocaleString()} €</div>
                    <div style={{ fontSize: 9, fontWeight: 900, color: badge.textColor, textTransform: 'uppercase' }}>{badge.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
