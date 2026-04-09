import { useParams } from "wouter";
import { useEffect, useState } from "react";
import { verificarCertificado } from "../../services/academiaUserService";
import type { AcademiaCertificado } from "../../services/academiaUserService";

const colors = {
  primary: "#FF6B35",
  secondary: "#2E2E2E",
  light: "#F7F7F7",
  dark: "#1A1A1A",
  success: "#4CAF50",
  gold: "#FFB800",
};

export default function AcademiaVerificar() {
  const { codigo } = useParams();
  const [certificado, setCertificado] = useState<AcademiaCertificado | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!codigo) {
      setErro(true);
      setLoading(false);
      return;
    }

    verificarCertificado(codigo)
      .then((cert) => {
        setCertificado(cert);
        setErro(!cert);
      })
      .catch(() => {
        setErro(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [codigo]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Verifying certificate…</div>
      </div>
    );
  }

  if (erro || !certificado) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ ...styles.icon, background: "#ffebee" }}>✕</div>
          <h2 style={styles.title}>Certificate not found</h2>
          <p style={styles.text}>
            This verification code does not match any valid certificate in our system.
          </p>
          <a href="/academia" style={styles.button}>Back to Academy</a>
        </div>
      </div>
    );
  }

  const dataEmissao = certificado.data_emissao?.toDate?.() 
    ? certificado.data_emissao.toDate().toLocaleDateString("en-GB")
    : new Date(certificado.data_emissao).toLocaleDateString("en-GB");

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ ...styles.icon, background: "#e8f5e9" }}>✓</div>
        <h2 style={styles.title}>Valid certificate</h2>
        
        <div style={styles.certInfo}>
          <div style={styles.field}>
            <span style={styles.label}>Learner name</span>
            <span style={styles.value}>{certificado.nome}</span>
          </div>
          
          <div style={styles.field}>
            <span style={styles.label}>Course</span>
            <span style={styles.value}>{certificado.trilha_nome}</span>
          </div>
          
          <div style={styles.field}>
            <span style={styles.label}>Issue date</span>
            <span style={styles.value}>{dataEmissao}</span>
          </div>
          
          <div style={styles.field}>
            <span style={styles.label}>Verification code</span>
            <span style={styles.code}>{certificado.codigo_verificacao}</span>
          </div>
        </div>

        <a href="/academia" style={styles.button}>Explore Bora Lá Academy</a>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: colors.light,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    fontFamily: "Montserrat, sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 40,
    maxWidth: 500,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  loading: {
    fontSize: 18,
    color: colors.secondary,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    margin: "0 auto 20px",
    color: "#2e7d32",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: colors.dark,
    marginBottom: 16,
  },
  text: {
    fontSize: 15,
    color: colors.secondary,
    marginBottom: 24,
    lineHeight: 1.6,
  },
  certInfo: {
    background: "#fafafa",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    textAlign: "left",
  },
  field: {
    marginBottom: 16,
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "#888",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.dark,
  },
  code: {
    fontSize: 14,
    fontFamily: "monospace",
    color: colors.primary,
    background: "#fff",
    padding: "4px 8px",
    borderRadius: 4,
  },
  button: {
    display: "inline-block",
    padding: "14px 28px",
    background: colors.primary,
    color: "#fff",
    textDecoration: "none",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 14,
  },
};
