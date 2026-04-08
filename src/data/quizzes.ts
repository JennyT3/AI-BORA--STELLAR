export interface QuizPergunta {
  id: string;
  trilha_id: string;
  pergunta: string;
  opcoes: { id: string; texto: string }[];
  resposta_correta: string;
  explicacao: string;
}

export interface Quiz {
  trilha_id: string;
  titulo: string;
  perguntas: QuizPergunta[];
}

export const quizzes: Quiz[] = [
  {
    trilha_id: 'ia-negocios',
    titulo: 'IA para Negócios Locais',
    perguntas: [
      {
        id: 'q1-ia',
        trilha_id: 'ia-negocios',
        pergunta: 'Qual é a melhor forma de usar IA para atender clientes no WhatsApp?',
        opcoes: [
          { id: 'a', texto: 'Enviar mensagens automáticas genéricas para todos' },
          { id: 'b', texto: 'Usar chatbots com IA para responder dúvidas frequentes 24/7' },
          { id: 'c', texto: 'Ignorar e responder apenas manualmente' },
          { id: 'd', texto: 'Usar apenas para enviar promoções' }
        ],
        resposta_correta: 'b',
        explicacao: 'Chatbots com IA podem atender 24/7, responder dúvidas frequentes e qualificar leads enquanto você dorme!'
      },
      {
        id: 'q2-ia',
        trilha_id: 'ia-negocios',
        pergunta: 'Qual ferramenta de IA é indicada para criar imagens para publicaciones nas redes sociais?',
        opcoes: [
          { id: 'a', texto: 'Microsoft Word' },
          { id: 'b', texto: 'DALL-E, Midjourney ou Canva AI' },
          { id: 'c', texto: 'Excel' },
          { id: 'd', texto: 'PowerPoint básico' }
        ],
        resposta_correta: 'b',
        explicacao: 'DALL-E, Midjourney e as ferramentas de IA do Canva permitem criar imagens personalizadas para suas campanhas.'
      },
      {
        id: 'q3-ia',
        trilha_id: 'ia-negocios',
        pergunta: 'Como a IA pode ajudar na criação de contenido para redes sociais?',
        opcoes: [
          { id: 'a', texto: 'Escrevendo posts inteiros sem supervisão humana' },
          { id: 'b', texto: 'Gerando ideias, títulos e copys iniciais que você refine' },
          { id: 'c', texto: 'Substituindo completamente o copywriter' },
          { id: 'd', texto: 'Postando automaticamente sem revisão' }
        ],
        resposta_correta: 'b',
        explicacao: 'A IA é uma ferramenta de apoio que acelera a criação de contenido, mas a supervisão humana é essential para manter a autenticidade.'
      },
      {
        id: 'q4-ia',
        trilha_id: 'ia-negocios',
        pergunta: 'O que é um prompt efficace para usar com IA generativa?',
        opcoes: [
          { id: 'a', texto: 'Qualquer palavra aleatória' },
          { id: 'b', texto: 'Instruções vagas e curtas' },
          { id: 'c', texto: 'Instruções detalhadas com contexto, tom e formato desejado' },
          { id: 'd', texto: 'Prompts em linguagem formal only' }
        ],
        resposta_correta: 'c',
        explicacao: 'Prompts detalhados com contexto, tom e formato producen resultados muito melhores. Quanto mais específico, melhor!'
      },
      {
        id: 'q5-ia',
        trilha_id: 'ia-negocios',
        pergunta: 'Qual é um uso prático de IA para análise de datos do negócio?',
        opcoes: [
          { id: 'a', texto: 'Ignorar os dados e seguir ofeeling' },
          { id: 'b', texto: 'Usar IA para identificar padrões em vendas e comportamento de clientes' },
          { id: 'c', texto: 'Apenas criar planilhas manuais' },
          { id: 'd', texto: 'Guardar os datos em uma pasta' }
        ],
        resposta_correta: 'b',
        explicacao: 'IA pode analisar grandes volúmenes de datos para identificar padrões que você perderia manualmente, como horários de maior vendas ou produtos mais vendidos juntos.'
      },
      {
        id: 'q6-ia',
        trilha_id: 'ia-negocios',
        pergunta: 'Como proteger dados de clientes ao usar IA?',
        opcoes: [
          { id: 'a', texto: 'Compartilhar todos os dados sem cuidado' },
          { id: 'b', texto: 'Usar apenas ferramentas confiáveis e nunca compartilhar dados sensíveis em prompts' },
          { id: 'c', texto: 'Desativar todas as ferramentas de IA' },
          { id: 'd', texto: 'Ignorar a questão' }
        ],
        resposta_correta: 'b',
        explicacao: 'Sempre use ferramentas confiáveis e nunca inclua dados pessoais sensíveis (CPF, endereços, senhas) em prompts públicos de IA.'
      }
    ]
  },
  {
    trilha_id: 'automacao',
    titulo: 'Automação sem Código',
    perguntas: [
      {
        id: 'q1-auto',
        trilha_id: 'automacao',
        pergunta: 'O que é Zapier?',
        opcoes: [
          { id: 'a', texto: 'Uma linguagem de programação' },
          { id: 'b', texto: 'Uma plataforma de automação que conecta apps' },
          { id: 'c', texto: 'Um tipo de banco de dados' },
          { id: 'd', texto: 'Um antivírus' }
        ],
        resposta_correta: 'b',
        explicacao: 'Zapier é uma plataforma de automação que conecta diferentes aplicativos e automatiza tarefas sem precisa escrever código.'
      },
      {
        id: 'q2-auto',
        trilha_id: 'automacao',
        pergunta: 'O que é um "Zap" no Zapier?',
        opcoes: [
          { id: 'a', texto: 'Um erro de sistema' },
          { id: 'b', texto: 'Uma automação completa (gatilho + ação)' },
          { id: 'c', texto: 'Um tipo de aplicativo' },
          { id: 'd', texto: 'Uma ferramenta de diseño' }
        ],
        resposta_correta: 'b',
        executacao: 'Um Zap é uma automação que tem um gatilho (quando algo acontece) e uma ação (o que fazer automaticamente).'
      },
      {
        id: 'q3-auto',
        trilha_id: 'automacao',
        pergunta: 'Qual a diferença entre Zapier e Make (Integromat)?',
        opcoes: [
          { id: 'a', texto: 'São a mesma coisa' },
          { id: 'b', texto: 'Make permite automações mais complexas com cenários visuais' },
          { id: 'c', texto: 'Zapier é mais difícil de usar' },
          { id: 'd', texto: 'Make não tem integrações' }
        ],
        resposta_correta: 'b',
        explicacao: 'Make (antes chamado Integromat) oferece uma interface visual mais poderosa para automações complexas, mentre Zapier é mais simples.'
      },
      {
        id: 'q4-auto',
        trilha_id: 'automacao',
        pergunta: 'O que é um gatilho (trigger) em automação?',
        opcoes: [
          { id: 'a', texto: 'O resultado final da automação' },
          { id: 'b', texto: 'O evento que inicia a automação' },
          { id: 'c', texto: 'Um tipo de email' },
          { id: 'd', texto: 'Um erro que para o proceso' }
        ],
        resposta_correta: 'b',
        explicacao: 'O gatilho é o evento que inicia a automação. Por exemplo: "Quando um novo lead entra no formulário" ou "Quando um novo email chega".'
      },
      {
        id: 'q5-auto',
        trilha_id: 'automacao',
        pergunta: 'Para que serve o Google Sheets em automações?',
        opcoes: [
          { id: 'a', texto: 'Apenas para editar documentos' },
          { id: 'b', texto: 'Como banco de dados simples para armazenar e organizar información' },
          { id: 'c', texto: 'Para enviar emails apenas' },
          { id: 'd', texto: 'Não serve para automação' }
        ],
        resposta_correta: 'b',
        explicacao: 'Google Sheets pode ser usado como banco de dados simples para armazenar leads, tareas, ou qualquer información estruturada.'
      }
    ]
  },
  {
    trilha_id: 'comunicacao',
    titulo: 'Comunicação Digital',
    perguntas: [
      {
        id: 'q1-com',
        trilha_id: 'comunicacao',
        pergunta: 'O que é copy em marketing digital?',
        opcoes: [
          { id: 'a', texto: 'Um tipo de fonte textual' },
          { id: 'b', texto: 'Texto persuasivo criado para vender ou engajar' },
          { id: 'c', texto: 'Um软件 de diseño' },
          { id: 'd', texto: 'Uma rede social' }
        ],
        resposta_correta: 'b',
        explicacao: 'Copy é o texto persuasivo usado em publicidades, emails, posts e landing pages para convencer o leitor a tomar uma ação.'
      },
      {
        id: 'q2-com',
        trilha_id: 'comunicacao',
        pergunta: 'Qual estrutura é eficaz para textos de vendas?',
        opcoes: [
          { id: 'a', texto: 'Escrever qualquer coisa aleatoriamente' },
          { id: 'b', texto: 'Problema → Agitação → Solução → Oferta' },
          { id: 'c', texto: 'Apenas listar características' },
          { id: 'd', texto: 'Escrever texto longo sem estrutura' }
        ],
        resposta_correta: 'b',
        explicacao: 'A estrutura Problema → Agitação (mostrar dor) → Solução → Oferta cria tensão emocional que leva à ação.'
      },
      {
        id: 'q3-com',
        trilha_id: 'comunicacao',
        pergunta: 'O que são "hooks" em criação de contenido?',
        opcoes: [
          { id: 'a', texto: 'Um tipo de anzol para pescar' },
          { id: 'b', texto: 'As primeiras linhas que prendem a atenção do leitor' },
          { id: 'c', texto: 'Um formato de video' },
          { id: 'd', texto: 'Uma ferramenta de email' }
        ],
        resposta_correta: 'b',
        explicacao: 'Hooks são as primeiras palavras ou frases que prendem a atenção do leitor. Um bom hook pode ser uma pergunta, uma afirmação surpreendente, ou um números impactante.'
      },
      {
        id: 'q4-com',
        trilha_id: 'comunicacao',
        pergunta: 'Por que é importante conhecer a persona do cliente?',
        opcoes: [
          { id: 'a', texto: 'Não é importante' },
          { id: 'b', texto: 'Para criar mensajes que ressoam com suas necessidades e linguagem' },
          { id: 'c', texto: 'Apenas por curiosidade' },
          { id: 'd', texto: 'Para copiar dos concorrentes' }
        ],
        resposta_correta: 'b',
        explicacao: 'Conhecer a persona permite criar mensajes personalizados que realmente importam para seu público, aumentando conversões.'
      }
    ]
  },
  {
    trilha_id: 'produtividade',
    titulo: 'Produtividade com IA',
    perguntas: [
      {
        id: 'q1-prod',
        trilha_id: 'produtividade',
        pergunta: 'Como assistentes como ChatGPT podem ajudar na produtividade diária?',
        opcoes: [
          { id: 'a', texto: 'Não ajudam em nada' },
          { id: 'b', texto: 'Respondendo emails, criando listas de tarefas e organizando ideias' },
          { id: 'c', texto: 'Apenas para entretenimento' },
          { id: 'd', texto: 'Para substituir completamente o trabalho humano' }
        ],
        resposta_correta: 'b',
        explicacao: 'Assistentes de IA podem ajudar a redigir emails, criar listas de tareas, resumir reuniones e organizar pensamentos rapidamente.'
      },
      {
        id: 'q2-prod',
        trilha_id: 'produtividade',
        pergunta: 'O que são ferramentas de IA para gerenciamento de proyectos?',
        opcoes: [
          { id: 'a', texto: 'Softwares que usam IA para priorizar tareas e otimizar cronogramas' },
          { id: 'b', texto: 'Apenas calendários simples' },
          { id: 'c', texto: 'Programas que não fazem nada' },
          { id: 'd', texto: 'Ferramentas de diseño gráfico' }
        ],
        resposta_correta: 'a',
        explicacao: 'Ferramentas como Todoist, Notion AI ou ClickUp usam IA para ajudar a priorizar tareas, sugerir prazos e otimizar fluxos de trabajo.'
      },
      {
        id: 'q3-prod',
        trilha_id: 'produtividade',
        pergunta: 'Como usar IA para resumir informações longas?',
        opcoes: [
          { id: 'a', texto: 'Ler tudo manualmente' },
          { id: 'b', texto: 'Usar ferramentas de IA para extrair os pontos principais de documentos ou reuniões' },
          { id: 'c', texto: 'Ignorar informações longas' },
          { id: 'd', texto: 'Apenas arquivar sem ler' }
        ],
        resposta_correta: 'b',
        explicacao: 'Ferramentas como ChatGPT, Claude ou recursos no Notion podem resumir PDFs, artigos longos ou transcrições de reuniões em minutos.'
      }
    ]
  }
];

export function getQuizPorTrilha(trilhaId: string): Quiz | undefined {
  return quizzes.find(q => q.trilha_id === trilhaId);
}
