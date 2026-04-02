import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { CTAFooterSection } from "../components/CTAFooterSection";
import { FloatingWhatsApp } from "../components/FloatingWhatsApp";
import { Footer } from "../components/Footer";
import { Download, Mail, User, Building, Phone, FileText, Check, X, Calculator, Edit3 } from "lucide-react";

const IVA_TAXA = 0.23; // 23% IVA Portugal

const categorias = [
  {
    nome: "Marketing", icon: "📱",
    desc: "Gestao de redes sociais, criacao de conteudo e estrategia digital.",
    servicos: ["Gestao de Redes Sociais", "Criacao de Conteudo", "Community Management", "Email Marketing"]
  },
  {
    nome: "Design", icon: "🎨",
    desc: "Identidade visual profissional que diferencia o teu negocio.",
    servicos: ["Design de Posts", "Logotipo", "Identidade Corporativa", "Banners e Posters"]
  },
  {
    nome: "Web", icon: "💻",
    desc: "Paginas web rapidas, modernas e otimizadas para converter.",
    servicos: ["Landing Page", "Site Catalogo", "Loja Online", "SEO Local"]
  },
  {
    nome: "Multimedia", icon: "🎬",
    desc: "Fotografia e video profissional para destacar o teu negocio.",
    servicos: ["Fotografia Profissional", "Producao de Videos", "Criacao de Reels", "Edicao de Conteudo"]
  },
  {
    nome: "Publicidade", icon: "📢",
    desc: "Campanhas pagas no Google e Meta para atrair clientes.",
    servicos: ["Google Ads", "Facebook Ads", "Instagram Ads", "Gestao de Budget"]
  },
  {
    nome: "Automacao", icon: "⚡",
    desc: "Automatiza processos repetitivos com inteligencia artificial.",
    servicos: ["Chatbot WhatsApp", "IA e Automacao", "Respostas Automaticas", "Fluxos de CRM"]
  },
  {
    nome: "Consultoria", icon: "📊",
    desc: "Estrategia digital personalizada baseada em dados reais.",
    servicos: ["Consultoria Estrategica", "Analise de Concorrentes", "Dashboard Excel", "Plano de Marketing"]
  },
];

interface ClienteData {
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  nif: string;
  morada: string;
}

export function Orcamento() {
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [precoTotal, setPrecoTotal] = useState<number>(0);
  const [cliente, setCliente] = useState<ClienteData>({
    nome: "",
    empresa: "",
    email: "",
    telefone: "",
    nif: "",
    morada: ""
  });

  const toggleServico = (s: string) => {
    setSelecionados(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  // Calcula Subtotal e IVA a partir do Total (que tu pones)
  const calcularTotais = () => {
    // Subtotal = Total / (1 + IVA)
    const subtotal = precoTotal > 0 ? precoTotal / (1 + IVA_TAXA) : 0;
    const iva = precoTotal > 0 ? precoTotal - subtotal : 0;
    return { subtotal, iva, total: precoTotal };
  };

  const { subtotal, iva, total } = calcularTotais();

  const gerarPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const dataAtual = new Date().toLocaleDateString("pt-PT");
    const dataValidade = new Date();
    dataValidade.setDate(dataValidade.getDate() + 10);
    const dataValidadeStr = dataValidade.toLocaleDateString("pt-PT");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Orçamento ${numeroOrcamento}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap');
          body { font-family: 'Montserrat', sans-serif; margin: 40px; color: #1A1A1A; line-height: 1.6; }
          
          /* HEADER - blanco con línea naranja sutil */
          .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            margin-bottom: 30px; 
            border-bottom: 1px solid #F25C05; 
            padding-bottom: 15px; 
          }
          .logo-area { display: flex; align-items: center; gap: 15px; }
          .logo-img { width: 50px; height: 50px; }
          .logo-text { font-size: 22px; font-weight: 900; color: #1A1A1A; }
          .logo-sub { font-size: 10px; color: #888; }
          .doc-info { text-align: right; }
          .doc-titulo { font-size: 20px; font-weight: 700; color: #1A1A1A; margin-bottom: 5px; }
          .doc-numero { font-size: 12px; color: #666; }
          
          /* CLIENTE - caja gris clara */
          .section { margin-bottom: 25px; }
          .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #F25C05; margin-bottom: 8px; letter-spacing: 1px; }
          .cliente-info { background: #F7F5F3; padding: 20px; border-radius: 8px; }
          .cliente-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .info-label { font-weight: 600; color: #666; font-size: 11px; }
          .info-value { font-size: 12px; color: #1A1A1A; }
          
          /* SERVIÇOS - tabla con precio en encabezado */
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #1A1A1A; color: white; padding: 10px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; }
          th:last-child { text-align: right; }
          td { padding: 10px; border-bottom: 1px solid #e0ddd9; font-size: 11px; }
          td:last-child { text-align: right; color: #F25C05; font-weight: 600; }
          
          /* TOTAL - caixa laranja */
          .total-box { background: #F25C05; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; display: flex; justify-content: space-between; align-items: center; }
          .total-label { font-size: 12px; }
          .total-value { font-size: 28px; font-weight: 900; }
          
          /* Totais detalhados */
          .totais { width: 300px; margin-left: auto; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0ddd9; font-size: 12px; }
          .total-final { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; font-weight: 700; color: #F25C05; border-top: 2px solid #1A1A1A; margin-top: 5px; }
          
          /* CONDIÇÕES - 6 pontos */
          .condicoes { background: #F7F5F3; padding: 20px; border-radius: 8px; margin-top: 30px; }
          .condicoes-title { font-weight: 700; color: #1A1A1A; margin-bottom: 12px; font-size: 12px; border-bottom: 1px solid #F25C05; padding-bottom: 8px; }
          .condicoes ul { padding-left: 18px; font-size: 11px; line-height: 1.8; color: #444; }
          
          /* FOOTER */
          .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #888; border-top: 1px solid #e0ddd9; padding-top: 15px; }
          .footer strong { color: #1A1A1A; }
          
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-area">
            <div class="logo-text">AI BORA</div>
          </div>
          <div class="doc-info">
            <div class="doc-titulo">ORÇAMENTO</div>
            <div class="doc-numero">Nº ${numeroOrcamento}</div>
            <div class="doc-numero">Data: ${dataAtual}</div>
            <div class="doc-numero">Válido até: ${dataValidadeStr}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Dados do Cliente</div>
          <div class="cliente-info">
            <div class="cliente-grid">
              <div><span class="info-label">Nome:</span> <span class="info-value">${cliente.nome || "—"}</span></div>
              <div><span class="info-label">Empresa:</span> <span class="info-value">${cliente.empresa || "—"}</span></div>
              <div><span class="info-label">NIF:</span> <span class="info-value">${cliente.nif || "—"}</span></div>
              <div><span class="info-label">Email:</span> <span class="info-value">${cliente.email || "—"}</span></div>
              <div><span class="info-label">Telefone:</span> <span class="info-value">${cliente.telefone || "—"}</span></div>
              <div><span class="info-label">Morada:</span> <span class="info-value">${cliente.morada || "—"}</span></div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Serviços Incluídos</div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Serviço</th>
                <th>Valor s/IVA</th>
              </tr>
            </thead>
            <tbody>
              ${selecionados.length > 0 ? selecionados.map((s, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${s}</td>
                  <td>${i === 0 ? subtotal.toFixed(2) + ' €' : ''}</td>
                </tr>
              `).join("") : '<tr><td colspan="3">Consultoria e Serviços de Marketing Digital</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="total-box">
          <div class="total-label">TOTAL MENSAL (c/ IVA 23%)</div>
          <div class="total-value">${total.toFixed(2)} €</div>
        </div>

        <div class="totais">
          <div class="total-row">
            <span>Subtotal (sem IVA)</span>
            <span>${subtotal.toFixed(2)} €</span>
          </div>
          <div class="total-row">
            <span>IVA (23%)</span>
            <span>${iva.toFixed(2)} €</span>
          </div>
          <div class="total-final">
            <span>TOTAL A PAGAR</span>
            <span>${total.toFixed(2)} €</span>
          </div>
        </div>

        <div class="condicoes">
          <div class="condicoes-title">Condições Comerciais</div>
          <ul>
            <li>Âmbito: Prestação de serviços conforme detalhado acima.</li>
            <li>Período: 3 meses experimentais + contrato anual renovável automaticamente.</li>
            <li>Pagamento: Mensal, por transferência bancária ou débito direto até ao dia 5 de cada mês.</li>
            <li>Validade: Orçamento válido até ${dataValidadeStr} (10 dias corridos a partir da emissão).</li>
            <li>Rescisão: Aviso prévio de 30 dias após o período experimental, por escrito.</li>
            <li>Propriedade Intelectual: Todo o conteúdo criado é propriedade do cliente após liquidação total.</li>
          </ul>
        </div>

        <div class="footer">
          <strong>AI BORA, Lda</strong> | NIF: 319918645 | helloaibora@proton.me | +351 936 021 747 | www.aibora.pt<br>
          Este orçamento não constitui fatura. Sujeito à aceitação formal por escrito.
        </div>

        <div style="margin-top: 40px; text-align: center;">
          <button onclick="window.print()" style="background: #F25C05; color: white; border: none; padding: 15px 40px; font-size: 14px; font-weight: 700; border-radius: 8px; cursor: pointer; font-family: Montserrat;">
            SALVAR COMO PDF / IMPRIMIR
          </button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const enviarEmail = () => {
    const subject = `Orçamento AI BORA - ${cliente.empresa || cliente.nome}`;
    const body = `
Olá ${cliente.nome},

Segue o resumo do seu orçamento AI BORA:

SERVIÇOS INCLUÍDOS:
${selecionados.length > 0 ? selecionados.map(s => `- ${s}`).join("\n") : "Consultoria e Serviços de Marketing Digital conforme proposta comercial"}

RESUMO FINANCEIRO:
Subtotal (sem IVA): ${subtotal.toFixed(2)} €
IVA (23%): ${iva.toFixed(2)} €
TOTAL MENSAL: ${total.toFixed(2)} €

CONDIÇÕES:
- Período experimental: 3 meses
- Contrato: Anual após período experimental
- Pagamento: Mensal
- Validade: 30 dias

Para prosseguir, responda a este email ou contacte-nos via WhatsApp.

Cumprimentos,
Equipa AI BORA
    `;
    
    window.location.href = `mailto:${cliente.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main>
        {/* Header */}
        <section style={{ backgroundColor: "#1A1A1A", padding: "120px 16px 80px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: "clamp(28px, 5vw, 48px)", color: "#ffffff", lineHeight: 1.1, margin: "0 0 16px" }}>
              Orçamento Personalizado
            </h1>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 16, color: "#aaaaaa", margin: 0, lineHeight: 1.5 }}>
              Define o valor total, seleciona os serviços e gera o orçamento oficial
            </p>
          </div>
        </section>

        <section style={{ backgroundColor: "#ffffff", padding: "64px 16px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
            
            {/* Coluna Esquerda */}
            <div style={{ flex: "1 1 600px" }}>
              
              {/* Input do Preço Total */}
              <div style={{ backgroundColor: "#F25C05", borderRadius: 16, padding: 24, marginBottom: 40, color: "white" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <Edit3 size={24} />
                  <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 20, margin: 0 }}>
                    Define o Valor Total
                  </h2>
                </div>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, margin: "0 0 16px", opacity: 0.9 }}>
                  Insere o valor mensal total (com IVA incluído). O sistema calcula automaticamente o subtotal e o IVA.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input
                    type="number"
                    value={precoTotal || ""}
                    onChange={(e) => setPrecoTotal(Number(e.target.value))}
                    placeholder="0.00"
                    style={{
                      flex: 1,
                      padding: "16px 20px",
                      borderRadius: 10,
                      border: "none",
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: 24,
                      fontWeight: 700,
                      textAlign: "right"
                    }}
                  />
                  <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 24, fontWeight: 700 }}>€</span>
                </div>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, margin: "12px 0 0", opacity: 0.8 }}>
                  Exemplo: 1000€ total = 813.01€ (subtotal) + 186.99€ (IVA 23%)
                </p>
              </div>

              {/* Seleção de Serviços */}
              <div style={{ marginBottom: 40 }}>
                <div style={{ width: 36, height: 3, backgroundColor: "#F25C05", marginBottom: 16, borderRadius: 2 }} />
                <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: "clamp(22px, 4vw, 32px)", color: "#1A1A1A", margin: "0 0 8px" }}>
                  Seleciona os Serviços Incluídos
                </h2>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#4A4A4A", margin: 0 }}>
                  Clica nos serviços que estarão incluídos neste orçamento
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                {categorias.map((cat) => (
                  <div key={cat.nome} style={{ backgroundColor: "#F5F2F0", borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 24 }}>{cat.icon}</span>
                      <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 15, color: "#1A1A1A" }}>{cat.nome}</span>
                    </div>
                    <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#4A4A4A", margin: 0, lineHeight: 1.5 }}>{cat.desc}</p>
                    <div style={{ height: 1, backgroundColor: "#e0ddd9" }} />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {cat.servicos.map((s) => {
                        const sel = selecionados.includes(s);
                        return (
                          <button 
                            key={s} 
                            onClick={() => toggleServico(s)} 
                            style={{ 
                              fontFamily: "Montserrat, sans-serif", 
                              fontSize: 11, 
                              fontWeight: 600, 
                              backgroundColor: sel ? "#F22283" : "#ffffff", 
                              color: sel ? "#ffffff" : "#1A1A1A", 
                              border: sel ? "1px solid #F22283" : "1px solid rgba(0,0,0,0.10)", 
                              borderRadius: 20, 
                              padding: "6px 14px", 
                              cursor: "pointer", 
                              transition: "all 0.15s ease",
                              display: "flex",
                              alignItems: "center",
                              gap: 6
                            }}
                          >
                            {sel ? <Check size={12} /> : null}
                            <span>{s}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Dados do Cliente */}
              <div style={{ marginTop: 40, backgroundColor: "#F5F2F0", borderRadius: 16, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <User size={20} color="#F25C05" />
                  <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 18, color: "#1A1A1A", margin: 0 }}>
                    Dados do Cliente
                  </h3>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, color: "#4A4A4A", marginBottom: 6 }}>
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={cliente.nome}
                      onChange={(e) => setCliente({...cliente, nome: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: 8,
                        border: "1px solid #ddd",
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 14,
                        backgroundColor: "#ffffff"
                      }}
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: "block", fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, color: "#4A4A4A", marginBottom: 6 }}>
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={cliente.empresa}
                      onChange={(e) => setCliente({...cliente, empresa: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: 8,
                        border: "1px solid #ddd",
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 14,
                        backgroundColor: "#ffffff"
                      }}
                      placeholder="Ex: Empresa, Lda"
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, color: "#4A4A4A", marginBottom: 6 }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={cliente.email}
                      onChange={(e) => setCliente({...cliente, email: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: 8,
                        border: "1px solid #ddd",
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 14,
                        backgroundColor: "#ffffff"
                      }}
                      placeholder="joao@empresa.pt"
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, color: "#4A4A4A", marginBottom: 6 }}>
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={cliente.telefone}
                      onChange={(e) => setCliente({...cliente, telefone: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: 8,
                        border: "1px solid #ddd",
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 14,
                        backgroundColor: "#ffffff"
                      }}
                      placeholder="+351 912 345 678"
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, color: "#4A4A4A", marginBottom: 6 }}>
                      NIF
                    </label>
                    <input
                      type="text"
                      value={cliente.nif}
                      onChange={(e) => setCliente({...cliente, nif: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: 8,
                        border: "1px solid #ddd",
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 14,
                        backgroundColor: "#ffffff"
                      }}
                      placeholder="123456789"
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, color: "#4A4A4A", marginBottom: 6 }}>
                      Morada
                    </label>
                    <input
                      type="text"
                      value={cliente.morada}
                      onChange={(e) => setCliente({...cliente, morada: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: 8,
                        border: "1px solid #ddd",
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 14,
                        backgroundColor: "#ffffff"
                      }}
                      placeholder="Rua, Nº, Código Postal, Cidade"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita - Resumo */}
            <div style={{ flex: "0 1 380px", position: "sticky", top: 100 }}>
              <div style={{ backgroundColor: "#F5F2F0", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <Calculator size={20} color="#F25C05" />
                  <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 18, color: "#1A1A1A", margin: 0 }}>
                    Resumo do Orçamento
                  </h3>
                </div>

                {/* Input de Preço Total no Resumo */}
                <div style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <label style={{ display: "block", fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, color: "#4A4A4A", marginBottom: 8 }}>
                    Valor Total Mensal (€)
                  </label>
                  <input
                    type="number"
                    value={precoTotal || ""}
                    onChange={(e) => setPrecoTotal(Number(e.target.value))}
                    placeholder="0.00"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: 8,
                      border: "2px solid #F25C05",
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: 20,
                      fontWeight: 700,
                      textAlign: "right",
                      color: "#F25C05"
                    }}
                  />
                </div>

                {/* Serviços Selecionados */}
                {selecionados.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, color: "#4A4A4A", marginBottom: 10 }}>
                      Serviços incluídos ({selecionados.length})
                    </p>
                    <div style={{ maxHeight: 150, overflowY: "auto" }}>
                      {selecionados.map(s => (
                        <div key={s} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #e0ddd9" }}>
                          <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, color: "#1A1A1A" }}>{s}</span>
                          <button 
                            onClick={() => toggleServico(s)} 
                            style={{ background: "none", border: "none", color: "#F22283", cursor: "pointer", padding: 2 }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cálculos */}
                <div style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#4A4A4A", borderBottom: "1px dashed #e0ddd9" }}>
                    <span>Subtotal (sem IVA)</span>
                    <span style={{ fontWeight: 600 }}>{subtotal.toFixed(2)} €</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#4A4A4A", borderBottom: "1px dashed #e0ddd9" }}>
                    <span>IVA (23%)</span>
                    <span style={{ fontWeight: 600 }}>{iva.toFixed(2)} €</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", marginTop: 8, fontFamily: "Montserrat, sans-serif", fontSize: 20, fontWeight: 800, color: "#F25C05" }}>
                    <span>TOTAL</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                </div>

                <div style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 16, marginBottom: 20, fontSize: 11, lineHeight: 1.6, color: "#666" }}>
                  <strong style={{ color: "#1A1A1A", fontSize: 12 }}>Condições:</strong><br/>
                  • 3 meses período experimental<br/>
                  • Contrato anual após período<br/>
                  • Pagamento mensal<br/>
                  • Validade: 30 dias
                </div>

                <button
                  onClick={gerarPDF}
                  disabled={total <= 0 || !cliente.nome || !cliente.email}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 10,
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    border: "none",
                    backgroundColor: total > 0 && cliente.nome && cliente.email ? "#F25C05" : "#cccccc",
                    color: "#ffffff",
                    cursor: total > 0 && cliente.nome && cliente.email ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginBottom: 10,
                    transition: "all 0.2s ease"
                  }}
                >
                  <FileText size={18} />
                  Gerar PDF do Orçamento
                </button>

                <button
                  onClick={enviarEmail}
                  disabled={total <= 0 || !cliente.nome || !cliente.email}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 10,
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    border: "1px solid #F25C05",
                    backgroundColor: "transparent",
                    color: total > 0 && cliente.nome && cliente.email ? "#F25C05" : "#cccccc",
                    cursor: total > 0 && cliente.nome && cliente.email ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.2s ease"
                  }}
                >
                  <Mail size={18} />
                  Enviar por Email
                </button>

                <button
                  onClick={() => window.open('/proposta.html', '_blank')}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 10,
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    border: "1px solid #1A1A1A",
                    backgroundColor: "#1A1A1A",
                    color: "#ffffff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.2s ease"
                  }}
                >
                  📄 Ver Proposta Comercial
                </button>

                {selecionados.length > 0 && (
                  <button 
                    onClick={() => setSelecionados([])} 
                    style={{ 
                      display: "block", 
                      width: "100%", 
                      marginTop: 10, 
                      padding: "10px", 
                      borderRadius: 8, 
                      fontFamily: "Montserrat, sans-serif", 
                      fontSize: 12, 
                      border: "1px solid #ddd", 
                      backgroundColor: "transparent", 
                      color: "#666", 
                      cursor: "pointer" 
                    }}
                  >
                    Limpar seleção
                  </button>
                )}

                <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 10, color: "#888", textAlign: "center", margin: "16px 0 0", lineHeight: 1.4 }}>
                  Orçamento válido por 30 dias. Sujeito a disponibilidade de agenda.
                </p>
              </div>
            </div>

          </div>
        </section>

        <CTAFooterSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
