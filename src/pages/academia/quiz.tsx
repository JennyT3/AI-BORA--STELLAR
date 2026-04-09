import { useParams, Redirect } from "wouter";
import { useState, useEffect } from "react";
import { useAcademiaAuth } from "../../hooks/useAcademiaAuth";
import { getQuizPorTrilha, Quiz, QuizPergunta } from "../../data/quizzes";
import { saveProgresso, criarCertificado } from "../../services/academiaUserService";

const colors = {
  orange: "#ff6f2e",
  magenta: "#cb1a74",
  dark: "#1c1b1b",
  light: "#fcf9f8",
  green: "#10B981",
  red: "#EF4444",
};

export default function AcademiaQuiz() {
  const { trilhaId } = useParams();
  const { user, isLoaded, isSignedIn, academiaUser } = useAcademiaAuth();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostaSelecionada, setRespostaSelecionada] = useState<string | null>(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [quizConcluido, setQuizConcluido] = useState(false);
  const [tentativas, setTentativas] = useState(0);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (trilhaId) {
      const quizData = getQuizPorTrilha(trilhaId);
      if (quizData) {
        setQuiz(quizData);
      }
    }
  }, [trilhaId]);

  if (!isLoaded) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Carregando...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/academia/login" />;
  }

  // FIXED: Añadido guard de onboarding
  if (!academiaUser?.onboarding_completo) {
    return <Redirect href="/academia/onboarding" />;
  }

  if (!quiz) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Quiz Não Encontrado</h2>
          <p style={styles.text}>Este quiz ainda não está disponível.</p>
          <a href="/academia/trilhas" style={styles.button}>
            Voltar às Trilhas
          </a>
        </div>
      </div>
    );
  }

  const perguntas = quiz.perguntas;
  const pergunta = perguntas[perguntaAtual];
  const progresso = ((perguntaAtual + 1) / perguntas.length) * 100;
  const percentual = (acertos / perguntas.length) * 100;
  const aprovado = percentual >= 70;

  const handleSelecionar = (opcaoId: string) => {
    if (mostrarFeedback) return;
    setRespostaSelecionada(opcaoId);
  };

  const handleConfirmar = () => {
    if (!respostaSelecionada) return;
    
    const acertou = respostaSelecionada === pergunta.resposta_correta;
    if (acertou) {
      setAcertos(acertos + 1);
    }
    setMostrarFeedback(true);
  };

  const handleProxima = () => {
    if (perguntaAtual < perguntas.length - 1) {
      setPerguntaAtual(perguntaAtual + 1);
      setRespostaSelecionada(null);
      setMostrarFeedback(false);
    } else {
      setQuizConcluido(true);
      setTentativas(tentativas + 1);
    }
  };

  const handleConcluirQuiz = async () => {
    if (!user || !academiaUser || !trilhaId) return;
    
    setSalvando(true);
    
    try {
      if (aprovado) {
        // 1. Salvar progresso do quiz
        await saveProgresso(
          user.id,
          `quiz-${trilhaId}`,
          trilhaId,
          quiz.titulo,
          'Avaliação Final',
          true,
          100
        );
        
        // 2. Criar certificado automaticamente
        await criarCertificado(user.id, trilhaId, quiz.titulo);
        console.log('Certificado gerado com sucesso!');
      }
    } catch (err) {
      console.error("Erro ao salvar progresso ou gerar certificado:", err);
    }
    
    setSalvando(false);
  };

  const renderResultado = () => (
    <div style={styles.resultado}>
      <div style={aprovado ? styles.iconAprovado : styles.iconReprovado}>
        {aprovado ? "🎉" : "😔"}
      </div>
      
      <h2 style={styles.title}>
        {aprovado ? "Parabéns!" : "Não foi dessa vez"}
      </h2>
      
      <p style={styles.text}>
        {aprovado
          ? `Você acertou ${acertos} de ${perguntas.length} perguntas (${Math.round(percentual)}%)`
          : `Você acertou ${acertos} de ${perguntas.length} perguntas. O mínimo é 70%.`}
      </p>
      
      <div style={styles.stats}>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{Math.round(percentual)}%</span>
          <span style={styles.statLabel}>Aproveitamento</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{acertos}/{perguntas.length}</span>
          <span style={styles.statLabel}>Acertos</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{tentativas}</span>
          <span style={styles.statLabel}>Tentativas</span>
        </div>
      </div>
      
      <div style={styles.actions}>
        {aprovado ? (
          <>
            <a href="/academia/certificados" style={styles.buttonSuccess} onClick={handleConcluirQuiz}>
              Ver Certificado
            </a>
            <button onClick={() => window.location.reload()} style={styles.buttonSecondary}>
              Refazer Quiz
            </button>
          </>
        ) : (
          <>
            <button onClick={() => window.location.reload()} style={styles.button}>
              Tentar Novamente
            </button>
            <a href="/academia/trilhas" style={styles.buttonSecondary}>
              Voltar às Trilhas
            </a>
          </>
        )}
      </div>
      
      {salvando && <p style={styles.salvando}>Salvando progresso...</p>}
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <a href={`/academia/trilha/${trilhaId}`} style={styles.backLink}>
            ← Voltar à Trilha
          </a>
          <h1 style={styles.quizTitle}>{quiz.titulo}</h1>
        </div>

        {!quizConcluido ? (
          <>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progresso}%` }} />
            </div>
            <div style={styles.progressText}>
              Pergunta {perguntaAtual + 1} de {perguntas.length}
            </div>

            <div style={styles.pergunta}>
              <h3 style={styles.perguntaTexto}>{pergunta.pergunta}</h3>
            </div>

            <div style={styles.opcoes}>
              {pergunta.opcoes.map((opcao) => {
                const selecionada = respostaSelecionada === opcao.id;
                const correta = mostrarFeedback && opcao.id === pergunta.resposta_correta;
                const incorreta = mostrarFeedback && selecionada && opcao.id !== pergunta.resposta_correta;

                return (
                  <button
                    key={opcao.id}
                    onClick={() => handleSelecionar(opcao.id)}
                    disabled={mostrarFeedback}
                    style={{
                      ...styles.opcao,
                      ...(selecionada ? styles.opcaoSelecionada : {}),
                      ...(correta ? styles.opcaoCorreta : {}),
                      ...(incorreta ? styles.opcaoIncorreta : {}),
                    }}
                  >
                    <span style={styles.opcaoLetra}>{opcao.id.toUpperCase()}</span>
                    <span style={styles.opcaoTexto}>{opcao.texto}</span>
                  </button>
                );
              })}
            </div>

            {mostrarFeedback && (
              <div style={{
                ...styles.feedback,
                background: respostaSelecionada === pergunta.resposta_correta ? '#e8f5e9' : '#ffebee'
              }}>
                <strong>{respostaSelecionada === pergunta.resposta_correta ? "Correto! ✓" : "Incorreto ✗"}</strong>
                <p style={styles.feedbackTexto}>{pergunta.explicacao}</p>
              </div>
            )}

            <div style={styles.footer}>
              {!mostrarFeedback ? (
                <button
                  onClick={handleConfirmar}
                  disabled={!respostaSelecionada}
                  style={{
                    ...styles.button,
                    opacity: respostaSelecionada ? 1 : 0.5,
                    cursor: respostaSelecionada ? 'pointer' : 'not-allowed'
                  }}
                >
                  Confirmar Resposta
                </button>
              ) : (
                <button onClick={handleProxima} style={styles.button}>
                  {perguntaAtual < perguntas.length - 1 ? "Próxima Pergunta" : "Ver Resultado"}
                </button>
              )}
            </div>
          </>
        ) : (
          renderResultado()
        )}
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
    maxWidth: 700,
    width: "100%",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  loading: {
    fontSize: 18,
    color: colors.dark,
  },
  header: {
    marginBottom: 24,
  },
  backLink: {
    color: colors.orange,
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 600,
    display: "inline-block",
    marginBottom: 12,
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: colors.dark,
    margin: 0,
  },
  progressBar: {
    height: 8,
    background: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    background: `linear-gradient(90deg, ${colors.orange}, ${colors.magenta})`,
    borderRadius: 4,
    transition: "width 0.3s ease",
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  pergunta: {
    marginBottom: 24,
  },
  perguntaTexto: {
    fontSize: 18,
    fontWeight: 600,
    color: colors.dark,
    lineHeight: 1.5,
  },
  opcoes: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: 24,
  },
  opcao: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 16,
    border: "2px solid #e0e0e0",
    borderRadius: 12,
    background: "#fff",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  opcaoSelecionada: {
    borderColor: colors.orange,
    background: "#fff3e0",
  },
  opcaoCorreta: {
    borderColor: colors.green,
    background: "#e8f5e9",
  },
  opcaoIncorreta: {
    borderColor: colors.red,
    background: "#ffebee",
  },
  opcaoLetra: {
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "#f0f0f0",
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  },
  opcaoTexto: {
    fontSize: 15,
    color: colors.dark,
    lineHeight: 1.4,
  },
  feedback: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  feedbackTexto: {
    margin: "8px 0 0",
    fontSize: 14,
    color: "#555",
    lineHeight: 1.5,
  },
  footer: {
    display: "flex",
    justifyContent: "center",
  },
  button: {
    padding: "14px 32px",
    background: `linear-gradient(90deg, ${colors.orange}, ${colors.magenta})`,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  buttonSuccess: {
    padding: "14px 32px",
    background: colors.green,
    color: "#fff",
    textDecoration: "none",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 15,
    display: "inline-block",
  },
  buttonSecondary: {
    padding: "14px 32px",
    background: "#f0f0f0",
    color: colors.dark,
    textDecoration: "none",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 15,
    display: "inline-block",
    marginLeft: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: colors.dark,
    marginBottom: 16,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    color: "#555",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 1.6,
  },
  resultado: {
    textAlign: "center",
  },
  iconAprovado: {
    fontSize: 64,
    marginBottom: 16,
  },
  iconReprovado: {
    fontSize: 64,
    marginBottom: 16,
  },
  stats: {
    display: "flex",
    justifyContent: "center",
    gap: 32,
    marginBottom: 32,
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: 700,
    color: colors.dark,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    marginTop: 4,
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  salvando: {
    marginTop: 16,
    fontSize: 14,
    color: "#666",
  },
};
