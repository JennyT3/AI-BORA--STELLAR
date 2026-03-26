export interface Servico {
  id: string;
  titulo: string;
  cor: string;
  icon: string;
  pontos: string[];
}

export const servicos: Servico[] = [
  {
    id: "redes-sociais",
    titulo: "Gestão de Redes Sociais",
    cor: "#F22283",
    icon: "Share2",
    pontos: [
      "Gestão Facebook, Instagram, Google Business / Maps",
      "Criação de posts e conteúdo",
      "Gestão de mensagens e reviews",
      "E-mail marketing automatizado"
    ]
  },
  {
    id: "publicidade",
    titulo: "Publicidade Paga",
    cor: "#F25C05",
    icon: "Target",
    pontos: [
      "Meta Ads (Facebook + Instagram)",
      "Google Ads",
      "Setup de campanhas + gestão",
      "Crédito inicial de €100 incluído"
    ]
  },
  {
    id: "presenca-digital",
    titulo: "Presença Digital",
    cor: "#25D366",
    icon: "Globe",
    pontos: [
      "Landing pages e websites",
      "Domínio próprio + email profissional",
      "Google Business otimizado + SEO local",
      "Integração WhatsApp Business"
    ]
  },
  {
    id: "conteudo-visual",
    titulo: "Conteúdo Visual",
    cor: "#F22283",
    icon: "Camera",
    pontos: [
      "Fotografia de produto e serviço",
      "Designs profissionais (banners, posters)",
      "Sessões mensais de foto ou vídeo"
    ]
  },
  {
    id: "ia-automacao",
    titulo: "IA & Automação",
    cor: "#F25C05",
    icon: "Bot",
    pontos: [
      "IA Agents com respostas automáticas inteligentes",
      "Chatbot integrado",
      "Automação de processos"
    ]
  },
  {
    id: "estrategia",
    titulo: "Estratégia & Análise",
    cor: "#25D366",
    icon: "BarChart3",
    pontos: [
      "Diagnóstico de redes sociais",
      "Análise de concorrentes",
      "Dashboard Excel de métricas",
      "Consultoria estratégica"
    ]
  }
];
