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
  const [filtro, setFiltro] = useState("sem_interesse");
  
  // Excluímos os "curiosos" por default, e permitimos filtrar
  const targetClients = clientes.filter(c => {
    if (filtro === "todos") return c.email;
    return c.email && c.categoria === filtro;
  });

  const handleSend = async () => {
    if (!assunto.trim() || !mensagemHtml.trim()) {
      alert("Por favor, preencha o assunto e a mensagem.");
      return;
    }
    if (targetClients.length === 0) {
      alert("Nenhum cliente selecionado com e-mail válido para este filtro.");
      return;
    }

    const confirmar = window.confirm(`Atenção: Você está prestes a enviar este e-mail para ${targetClients.length} contatos. Continuar?`);
    if (!confirmar) return;

    setEnviando(true);
    let sucessos = 0;
    let erros = 0;

    for (const cliente of targetClients) {
      try {
        await sendMarketingCampaignEmail({
          nome: cliente.nome,
          email: cliente.email!,
          assunto: assunto,
          mensagemHtml: mensagemHtml
        });
        sucessos++;
      } catch (e) {
        erros++;
      }
      
      // Delay pequeno para não bater rate limit excessivamente
      await new Promise(r => setTimeout(r, 500));
    }

    setEnviando(false);
    alert(`Campanha finalizada!\nSucesso: ${sucessos}\nErros: ${erros}`);
    setAssunto("");
    setMensagemHtml("");
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Marketing & Campanhas</h1>
        <p style={{ color: theme.colors.text.secondary }}>Envie mensagens em massa para seus leads e clientes diretamente pelo AIBORA.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 32, alignItems: "start" }}>
        
        {/* Composer */}
        <div style={{ background: "#fff", padding: 32, borderRadius: 24, boxShadow: "0 10px 30px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#333" }}>De (App AI BORA)</label>
            <input 
              type="text" 
              value="Será enviado usando a configuração do seu EmailJS"
              disabled
              style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #e0e0e0", fontSize: 14, background: "#f5f5f5", color: "#888" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#1b1c1b" }}>Assunto do E-mail</label>
            <input 
              type="text" 
              value={assunto}
              onChange={e => setAssunto(e.target.value)}
              placeholder="Ex: Oferta exclusiva para o seu negócio..."
              style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "2px solid #e0e0e0", fontSize: 14, fontFamily: "Montserrat, sans-serif" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#1b1c1b" }}>Corpo da Mensagem</label>
            <textarea 
              rows={12}
              value={mensagemHtml}
              onChange={e => setMensagemHtml(e.target.value)}
              placeholder="Escreva sua mensagem aqui..."
              style={{ width: "100%", padding: "16px", borderRadius: 12, border: "2px solid #e0e0e0", fontSize: 14, fontFamily: "inherit", resize: "vertical" }}
            />
            <p style={{ fontSize: 11, color: "#888", marginTop: 8 }}> Dica: O EmailJS enviará isso formatado em texto/html plano. Evite HTML complexo, pois dependerá do template configurado no painel.</p>
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
              {enviando ? "A enviar..." : `Enviar para ${targetClients.length} contatos`}
            </button>
          </div>
        </div>

        {/* Sidebar targets */}
        <div style={{ background: "#fff", padding: 24, borderRadius: 24, boxShadow: "0 10px 30px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, background: "#F25C0515", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#F25C05" }}>
              <Users size={20} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800 }}>Público-Alvo</h3>
          </div>

          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#1b1c1b" }}>Filtrar para envio:</label>
          <select 
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "2px solid #e0e0e0", fontSize: 14, fontFamily: "Montserrat, sans-serif", marginBottom: 24 }}
          >
            <option value="sem_interesse">No Interesados / Sem interesse</option>
            <option value="lead">Leads (Orçamento Solicitado)</option>
            <option value="cliente">Clientes Ativos</option>
            <option value="todos">Todos (exceto curiosos)</option>
          </select>

          <div style={{ background: "#f8FAF4", padding: 16, borderRadius: 16, border: "1px dashed #ccc" }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: theme.colors.accent.primary, marginBottom: 4 }}>
              {targetClients.length}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#666" }}>
              Destinatários selecionados validamente com email.
            </div>
          </div>
          
          <div style={{ marginTop: 24, padding: "16px", background: "#fdf2f8", borderRadius: 12, border: "1px solid #fce7f3" }}>
            <h4 style={{ fontSize: 12, fontWeight: 800, color: "#be185d", marginBottom: 8 }}>IMPORTANTE:</h4>
            <p style={{ fontSize: 11, color: "#9d174d", lineHeight: 1.5 }}>
              Certifique-se de ter configurado o "Marketing Template" no seu EmailJS. As variáveis esperadas pelo template são: <code>{`{{to_name}}`}</code>, <code>{`{{subject}}`}</code> e <code>{`{{message_html}}`}</code>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
