import { useState } from "react";
import { Link } from "wouter";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { getProposal, listProposals, updateProposal, deleteProposal } from "../services/firebase";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "aibora2026";

export function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError("");
      loadProposals();
    } else {
      setError("Password incorreta");
    }
  };

  const loadProposals = async () => {
    setLoading(true);
    try {
      const data = await listProposals(100);
      setProposals(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateProposal(id, editData);
      setEditingId(null);
      loadProposals();
      alert("✅ Proposta atualizada!");
    } catch (err: any) {
      alert("Erro: " + err.message);
    }
  };

  const handleDelete = async (id: string, cliente: string) => {
    if (!confirm(`Eliminar proposta de ${cliente}?`)) return;
    try {
      await deleteProposal(id);
      loadProposals();
      alert("✅ Proposta eliminada");
    } catch (err: any) {
      alert("Erro: " + err.message);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 32, maxWidth: 400, width: "100%", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
          <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: 24, color: "#1A1A1A", marginBottom: 8, textAlign: "center" }}>
            🔐 Admin AI BORA
          </h1>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#666", marginBottom: 24, textAlign: "center" }}>
            Gestão de Propostas
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={{ fontFamily: "Montserrat, sans-serif", width: "100%", padding: "14px 16px", borderRadius: 8, border: "2px solid #ddd", fontSize: 16, marginBottom: 16, textAlign: "center" }}
            />
            {error && <p style={{ color: "red", fontSize: 12, marginBottom: 16, textAlign: "center" }}>{error}</p>}
            <button type="submit" style={{ fontFamily: "Montserrat, sans-serif", width: "100%", padding: "14px", borderRadius: 8, backgroundColor: "#F22283", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <div>
              <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: 32, color: "#1A1A1A" }}>
                📋 Propostas Guardadas
              </h1>
              <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#666" }}>
                {proposals.length} proposta{proposals.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <a href="/admin/orcamento" style={{ fontFamily: "Montserrat, sans-serif", padding: "10px 20px", borderRadius: 8, backgroundColor: "#F25C05", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                ➕ Novo Orçamento
              </a>
              <button onClick={loadProposals} style={{ fontFamily: "Montserrat, sans-serif", padding: "10px 20px", borderRadius: 8, backgroundColor: "#1A1A1A", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>
                🔄 Atualizar
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fuchsia-brand mx-auto"></div>
            </div>
          ) : proposals.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
              Nenhuma proposta guardada ainda.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {proposals.map((p) => (
                <div key={p.id} style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e0ddd9" }}>
                  {editingId === p.id ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 11, color: "#666" }}>Cliente</label>
                        <input value={editData.cliente} onChange={(e) => setEditData({...editData, cliente: e.target.value})} style={{ width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14 }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "#666" }}>Valor</label>
                        <input type="number" value={editData.valor} onChange={(e) => setEditData({...editData, valor: parseFloat(e.target.value)})} style={{ width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14 }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "#666" }}>Desconto</label>
                        <input type="number" value={editData.desconto} onChange={(e) => setEditData({...editData, desconto: parseFloat(e.target.value)})} style={{ width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14 }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "#666" }}>Marcas</label>
                        <input type="number" value={editData.marcas} onChange={(e) => setEditData({...editData, marcas: parseInt(e.target.value)})} style={{ width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14 }} />
                      </div>
                      <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
                        <button onClick={() => handleUpdate(p.id)} style={{ flex: 1, padding: "10px", borderRadius: 6, backgroundColor: "#10B981", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>💾 Guardar</button>
                        <button onClick={() => setEditingId(null)} style={{ flex: 1, padding: "10px", borderRadius: 6, backgroundColor: "#666", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                      <div>
                        <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: "#1A1A1A" }}>{p.cliente}</div>
                        <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#666", marginTop: 4 }}>
                          {p.numeroOrcamento && <span style={{ marginRight: 16 }}>📋 {p.numeroOrcamento}</span>}
                          <span>💰 {p.valor?.toFixed(2)} €</span>
                          {p.desconto > 0 && <span style={{ color: "#F25C05" }}> (-{p.desconto?.toFixed(2)} €)</span>}
                          <span style={{ marginLeft: 16 }}>🏷️ {p.marcas} marca{p.marcas !== 1 ? "s" : ""}</span>
                        </div>
                        {p.servicos && p.servicos.length > 0 && (
                          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {p.servicos.slice(0, 3).map((s: string, i: number) => (
                              <span key={i} style={{ fontSize: 10, backgroundColor: "#F5F2F0", padding: "2px 8px", borderRadius: 10 }}>{s}</span>
                            ))}
                            {p.servicos.length > 3 && <span style={{ fontSize: 10, color: "#666" }}>+{p.servicos.length - 3}</span>}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => { const link = `https://aibora.pt/p/${p.id}`; navigator.clipboard.writeText(link); alert("Link copiado: " + link); }} style={{ padding: "8px 16px", borderRadius: 6, backgroundColor: "#1A1A1A", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>📋 Copy Link</button>
                        <button onClick={() => { setEditingId(p.id); setEditData(p); }} style={{ padding: "8px 16px", borderRadius: 6, backgroundColor: "#F25C05", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>✏️ Edit</button>
                        <button onClick={() => handleDelete(p.id, p.cliente)} style={{ padding: "8px 16px", borderRadius: 6, backgroundColor: "#dc2626", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>🗑️</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}