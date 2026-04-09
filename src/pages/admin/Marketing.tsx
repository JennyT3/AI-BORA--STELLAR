import React, { useState } from "react";
import { Cliente } from "../../types";
import { sendMarketingCampaignEmail } from "../../services/emailService";
import { theme } from "../../styles/theme";
import { Send, Users } from "lucide-react";

interface MarketingProps {
  clientes: Cliente[];
}

export function Marketing({ clientes }: MarketingProps) {
  const [assunto, setAssunto] = useState("");
  const [mensagemHtml, setMensagemHtml] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [filtro, setFiltro] = useState("todos");
  
  const targetClients = clientes.filter(c => {
    if (!c.email) return false;
    if (filtro === "todos") return true;
    if (filtro === "leads") return ["potencial", "proposta_enviada", "curioso"].includes(c.categoria);
    return c.email && c.categoria === filtro;
  });

  const handleSend = async () => {
    if (!assunto.trim() || !mensagemHtml.trim()) {
      alert("Please enter a subject and message.");
      return;
    }
    if (targetClients.length === 0) {
      alert("No contacts with a valid email match this filter.");
      return;
    }

    const confirmar = window.confirm(`You are about to send this email to ${targetClients.length} contacts. Continue?`);
    if (!confirmar) return;

    setEnviando(true);
    let sucessos = 0;
    let erros = 0;

    for (const cliente of targetClients) {
      try {
        // Service expects (email, subject, message, link?, name?)
        await sendMarketingCampaignEmail(
          cliente.email!,
          assunto,
          mensagemHtml,
          undefined,
          cliente.nome
        );
        sucessos++;
      } catch (e) {
        erros++;
      }
      
      // Short delay to reduce rate limiting
      await new Promise(r => setTimeout(r, 500));
    }

    setEnviando(false);
    alert(`Campaign finished.\nSent: ${sucessos}\nErrors: ${erros}`);
    setAssunto("");
    setMensagemHtml("");
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Marketing & campaigns</h1>
        <p style={{ color: theme.colors.text.secondary }}>Send bulk messages to your leads and clients from AIBORA.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 32, alignItems: "start" }}>
        
        {/* Composer */}
        <div style={{ background: "#fff", padding: 32, borderRadius: 24, boxShadow: "0 10px 30px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#333" }}>From (AI BORA app)</label>
            <input 
              type="text" 
              value="Sent using your EmailJS configuration"
              disabled
              style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #e0e0e0", fontSize: 14, background: "#f5f5f5", color: "#888" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#1b1c1b" }}>Email subject</label>
            <input 
              type="text" 
              value={assunto}
              onChange={e => setAssunto(e.target.value)}
              placeholder="e.g. Exclusive offer for your business..."
              style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "2px solid #e0e0e0", fontSize: 14, fontFamily: "Montserrat, sans-serif" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#1b1c1b" }}>Message body</label>
            <textarea 
              rows={12}
              value={mensagemHtml}
              onChange={e => setMensagemHtml(e.target.value)}
              placeholder="Write your message here..."
              style={{ width: "100%", padding: "16px", borderRadius: 12, border: "2px solid #e0e0e0", fontSize: 14, fontFamily: "inherit", resize: "vertical" }}
            />
            <p style={{ fontSize: 11, color: "#888", marginTop: 8 }}>Tip: EmailJS sends this as plain HTML. Avoid complex markup; behaviour depends on your dashboard template.</p>
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: 20, display: "flex", justifyContent: "flex-end" }}>
            <button 
              onClick={handleSend}
              disabled={enviando || targetClients.length === 0}
              style={{ 
                background: enviando ? "#ccc" : "linear-gradient(135deg, #F25C05 0%, #F22283 100%)", 
                color: "#fff", 
                border: "none", 
                padding: "14px 28px", 
                borderRadius: 50, 
                fontWeight: 800, 
                fontSize: 14, 
                display: "flex", 
                alignItems: "center", 
                gap: 8,
                cursor: enviando || targetClients.length === 0 ? "not-allowed" : "pointer"
              }}
            >
              <Send size={18} />
              {enviando ? "Sending..." : `Send to ${targetClients.length} contacts`}
            </button>
          </div>
        </div>

        {/* Sidebar targets */}
        <div style={{ background: "#fff", padding: 24, borderRadius: 24, boxShadow: "0 10px 30px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, background: "#F25C0515", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#F25C05" }}>
              <Users size={20} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800 }}>Audience</h3>
          </div>

          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#1b1c1b" }}>Filter recipients:</label>
          <select 
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "2px solid #e0e0e0", fontSize: 14, fontFamily: "Montserrat, sans-serif", marginBottom: 24 }}
          >
            <option value="todos">All contacts</option>
            <option value="cliente">Active clients</option>
            <option value="leads">Leads (potential / proposals)</option>
            <option value="sem_interesse">Not interested</option>
            <option value="curioso">Browsing</option>
          </select>

          <div style={{ background: "#f8FAF4", padding: 16, borderRadius: 16, border: "1px dashed #ccc" }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: theme.colors.accent.primary, marginBottom: 4 }}>
              {targetClients.length}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#666" }}>
              Recipients with a valid email for this filter.
            </div>
          </div>
          
          <div style={{ marginTop: 24, padding: "16px", background: "#fdf2f8", borderRadius: 12, border: "1px solid #fce7f3" }}>
            <h4 style={{ fontSize: 12, fontWeight: 800, color: "#be185d", marginBottom: 8 }}>Important</h4>
            <p style={{ fontSize: 11, color: "#9d174d", lineHeight: 1.5 }}>
              Configure the &quot;Marketing Template&quot; in EmailJS. Expected variables: <code>{`{{to_name}}`}</code>, <code>{`{{subject}}`}</code>, and <code>{`{{message_html}}`}</code>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
