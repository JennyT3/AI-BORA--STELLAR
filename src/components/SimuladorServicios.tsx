import { useState } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { WHATSAPP_LINK } from "../lib/constants";

const servicosDisponiveis = [
  { id: "redes-sociais", nome: "Gestão de Redes Sociais", categoria: "Marketing", icon: "📱" },
  { id: "conteudo", nome: "Criação de Conteúdo", categoria: "Marketing", icon: "✍️" },
  { id: "design-posts", nome: "Design de Posts", categoria: "Design", icon: "🎨" },
  { id: "community", nome: "Community Management", categoria: "Marketing", icon: "💬" },
  { id: "logotipo", nome: "Design de Logotipo", categoria: "Design", icon: "🎯" },
  { id: "identidade", nome: "Identidade Corporativa", categoria: "Design", icon: "🏷️" },
  { id: "videos", nome: "Produção de Vídeos", categoria: "Multimedia", icon: "🎬" },
  { id: "reels", nome: "Criação de Reels", categoria: "Multimedia", icon: "🎞️" },
  { id: "website", nome: "Página Web/Landing", categoria: "Web", icon: "💻" },
  { id: "ecommerce", nome: "Loja Online", categoria: "Web", icon: "🛒" },
  { id: "seo", nome: "SEO Local", categoria: "Web", icon: "🔍" },
  { id: "google-ads", nome: "Google Ads", categoria: "Publicidade", icon: "🎯" },
  { id: "meta-ads", nome: "Facebook/Instagram Ads", categoria: "Publicidade", icon: "📢" },
  { id: "email", nome: "Email Marketing", categoria: "Marketing", icon: "📧" },
  { id: "chatbot", nome: "Chatbot WhatsApp", categoria: "Automação", icon: "🤖" },
  { id: "ia-automacao", nome: "IA & Automação", categoria: "Automação", icon: "⚡" },
  { id: "fotografia", nome: "Fotografia Profissional", categoria: "Multimedia", icon: "📸" },
  { id: "consultoria", nome: "Consultoria Estratégica", categoria: "Consultoria", icon: "📊" },
];

const categorias = ["Todos", "Marketing", "Design", "Web", "Multimedia", "Publicidade", "Automação", "Consultoria"];

export function SimuladorServicios() {
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");

  const toggleServico = (id: string) => {
    setSelecionados(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const servicosFiltrados = categoriaAtiva === "Todos" 
    ? servicosDisponiveis 
    : servicosDisponiveis.filter(s => s.categoria === categoriaAtiva);

  const servicosSelecionados = servicosDisponiveis.filter(s => selecionados.includes(s.id));

  const mensagemWhatsApp = servicosSelecionados.length > 0
    ? `Olá! Tenho interesse nos seguintes serviços: ${servicosSelecionados.map(s => s.nome).join(", ")}. Podem enviar um orçamento?`
    : "Olá! Gostava de receber informações sobre os vossos serviços.";

  return (
    <section id="simulador" style={{ backgroundColor: "#F5F2F0", padding: "64px 16px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 36, height: 3, backgroundColor: "#F25C05", margin: "0 auto 16px", borderRadius: 2 }} />
          <h2 style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(22px, 4vw, 32px)",
            color: "#1A1A1A",
            margin: "0 0 12px"
          }}>
            Simulador de Serviços
          </h2>
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 14,
            color: "#4A4A4A",
            margin: 0
          }}>
            Clica nos serviços para adicionares ao teu pacote personalizado
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
          
          {/* Coluna da Esquerda - Serviços */}
          <div style={{ flex: "1 1 500px" }}>
            
            {/* Filtros */}
            <div style={{ 
              display: "flex", 
              flexWrap: "wrap", 
              gap: 8, 
              marginBottom: 24,
              justifyContent: "center"
            }}>
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaAtiva(cat)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    border: "none",
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    backgroundColor: categoriaAtiva === cat ? "#F22283" : "#ffffff",
                    color: categoriaAtiva === cat ? "#ffffff" : "#4A4A4A",
                    boxShadow: categoriaAtiva === cat ? "0 4px 12px rgba(242,34,131,0.3)" : "0 2px 8px rgba(0,0,0,0.06)"
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid de Serviços */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 12
            }}>
              <AnimatePresence mode="popLayout">
                {servicosFiltrados.map((servico) => {
                  const isSelected = selecionados.includes(servico.id);
                  return (
                    <motion.button
                      key={servico.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => toggleServico(servico.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: "16px 12px",
                        borderRadius: 12,
                        border: isSelected ? "2px solid #F22283" : "2px solid transparent",
                        backgroundColor: isSelected ? "#ffffff" : "#ffffff",
                        boxShadow: isSelected 
                          ? "0 4px 16px rgba(242,34,131,0.2)" 
                          : "0 2px 8px rgba(0,0,0,0.06)",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        position: "relative",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {isSelected && (
                        <div style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          width: 18,
                          height: 18,
                          backgroundColor: "#F22283",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          color: "#fff"
                        }}>
                          ✓
                        </div>
                      )}
                      <span style={{ fontSize: 28 }}>{servico.icon}</span>
                      <span style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 11,
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? "#F22283" : "#1A1A1A",
                        textAlign: "center",
                        lineHeight: 1.3
                      }}>
                        {servico.nome}
                      </span>
                      <span style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 9,
                        color: "#888",
                        textTransform: "uppercase",
                        letterSpacing: 0.5
                      }}>
                        {servico.categoria}
                      </span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Coluna da Direita - Resumo */}
          <div style={{ flex: "0 1 300px" }}>
            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              position: "sticky",
              top: 100
            }}>
              <h3 style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: "#1A1A1A",
                margin: "0 0 16px"
              }}>
                📋 O teu pacote
              </h3>

              {selecionados.length === 0 ? (
                <p style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 13,
                  color: "#888",
                  textAlign: "center",
                  padding: "24px 0"
                }}>
                  Seleciona serviços para criares o teu pacote personalizado
                </p>
              ) : (
                <>
                  <div style={{ marginBottom: 20 }}>
                    {servicosSelecionados.map(servico => (
                      <div 
                        key={servico.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 0",
                          borderBottom: "1px solid #f0f0f0"
                        }}
                      >
                        <span style={{ fontSize: 16 }}>{servico.icon}</span>
                        <span style={{
                          fontFamily: "Montserrat, sans-serif",
                          fontSize: 12,
                          color: "#1A1A1A",
                          flex: 1
                        }}>
                          {servico.nome}
                        </span>
                        <button
                          onClick={() => toggleServico(servico.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#F22283",
                            cursor: "pointer",
                            fontSize: 14,
                            padding: 4
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    padding: "12px",
                    backgroundColor: "#F5F2F0",
                    borderRadius: 8,
                    marginBottom: 16
                  }}>
                    <span style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#1A1A1A"
                    }}>
                      {selecionados.length} serviço{selecionados.length !== 1 ? 's' : ''} selecionado{selecionados.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </>
              )}

              <a
                href={`${WHATSAPP_LINK}?text=${encodeURIComponent(mensagemWhatsApp)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  width: "100%",
                  padding: "14px",
                  borderRadius: 10,
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "none",
                  textAlign: "center",
                  backgroundColor: selecionados.length > 0 ? "#25D366" : "#cccccc",
                  color: "#ffffff",
                  cursor: selecionados.length > 0 ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease"
                }}
              >
                📱 Pedir Orçamento {selecionados.length > 0 && `(${selecionados.length})`}
              </a>

              {selecionados.length > 0 && (
                <button
                  onClick={() => setSelecionados([])}
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: 12,
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

              <p style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 11,
                color: "#888",
                textAlign: "center",
                margin: "16px 0 0",
                lineHeight: 1.4
              }}>
                Resposta em menos de 24h • Sem compromisso
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
