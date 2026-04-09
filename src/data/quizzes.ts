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
    titulo: 'AI for local business',
    perguntas: [
      {
        id: 'q1-ia',
        trilha_id: 'ia-negocios',
        pergunta: 'What is the best way to use AI to serve customers on WhatsApp?',
        opcoes: [
          { id: 'a', texto: 'Send the same generic auto-messages to everyone' },
          { id: 'b', texto: 'Use AI chatbots to answer FAQs 24/7' },
          { id: 'c', texto: 'Ignore automation and reply only manually' },
          { id: 'd', texto: 'Use it only to blast promotions' }
        ],
        resposta_correta: 'b',
        explicacao: 'AI chatbots can serve 24/7, answer frequent questions, and qualify leads while you focus elsewhere.'
      },
      {
        id: 'q2-ia',
        trilha_id: 'ia-negocios',
        pergunta: 'Which AI tools are suited to create images for social posts?',
        opcoes: [
          { id: 'a', texto: 'Microsoft Word' },
          { id: 'b', texto: 'DALL-E, Midjourney, or Canva AI' },
          { id: 'c', texto: 'Excel' },
          { id: 'd', texto: 'Basic PowerPoint only' }
        ],
        resposta_correta: 'b',
        explicacao: 'DALL-E, Midjourney, and Canva AI help you create tailored visuals for campaigns.'
      },
      {
        id: 'q3-ia',
        trilha_id: 'ia-negocios',
        pergunta: 'How can AI help with social media content?',
        opcoes: [
          { id: 'a', texto: 'Writing full posts with zero human review' },
          { id: 'b', texto: 'Generating ideas, headlines, and first drafts you refine' },
          { id: 'c', texto: 'Replacing the copywriter entirely' },
          { id: 'd', texto: 'Posting automatically without review' }
        ],
        resposta_correta: 'b',
        explicacao: 'AI speeds up ideation and drafting; human review keeps voice and accuracy on brand.'
      },
      {
        id: 'q4-ia',
        trilha_id: 'ia-negocios',
        pergunta: 'What makes a strong prompt for generative AI?',
        opcoes: [
          { id: 'a', texto: 'A random word' },
          { id: 'b', texto: 'Vague one-line instructions' },
          { id: 'c', texto: 'Detailed instructions with context, tone, and format' },
          { id: 'd', texto: 'Formal language only' }
        ],
        resposta_correta: 'c',
        explicacao: 'Specific prompts with context, tone, and format produce much better outputs.'
      },
      {
        id: 'q5-ia',
        trilha_id: 'ia-negocios',
        pergunta: 'What is a practical use of AI for business data?',
        opcoes: [
          { id: 'a', texto: 'Ignore data and go by gut feeling' },
          { id: 'b', texto: 'Spot patterns in sales and customer behavior' },
          { id: 'c', texto: 'Only build manual spreadsheets' },
          { id: 'd', texto: 'Store files in a folder and never analyze' }
        ],
        resposta_correta: 'b',
        explicacao: 'AI can scan large datasets for patterns you would miss manually, like peak hours or bundle sales.'
      },
      {
        id: 'q6-ia',
        trilha_id: 'ia-negocios',
        pergunta: 'How do you protect customer data when using AI?',
        opcoes: [
          { id: 'a', texto: 'Share everything carelessly' },
          { id: 'b', texto: 'Use trusted tools and never put sensitive data in prompts' },
          { id: 'c', texto: 'Turn off all AI tools' },
          { id: 'd', texto: 'Ignore the issue' }
        ],
        resposta_correta: 'b',
        explicacao: 'Use reputable tools and avoid pasting personal IDs, addresses, or passwords into public AI prompts.'
      }
    ]
  },
  {
    trilha_id: 'automacao',
    titulo: 'No-code automation',
    perguntas: [
      {
        id: 'q1-auto',
        trilha_id: 'automacao',
        pergunta: 'What is Zapier?',
        opcoes: [
          { id: 'a', texto: 'A programming language' },
          { id: 'b', texto: 'An automation platform that connects apps' },
          { id: 'c', texto: 'A type of database' },
          { id: 'd', texto: 'Antivirus software' }
        ],
        resposta_correta: 'b',
        explicacao: 'Zapier connects apps and runs workflows without writing code.'
      },
      {
        id: 'q2-auto',
        trilha_id: 'automacao',
        pergunta: 'What is a “Zap” in Zapier?',
        opcoes: [
          { id: 'a', texto: 'A system error' },
          { id: 'b', texto: 'A full automation (trigger + action)' },
          { id: 'c', texto: 'A type of app' },
          { id: 'd', texto: 'A design tool' }
        ],
        resposta_correta: 'b',
        explicacao: 'A Zap is a trigger (when something happens) plus one or more actions (what runs automatically).'
      },
      {
        id: 'q3-auto',
        trilha_id: 'automacao',
        pergunta: 'How do Zapier and Make (Integromat) differ?',
        opcoes: [
          { id: 'a', texto: 'They are identical' },
          { id: 'b', texto: 'Make supports more complex visual scenarios' },
          { id: 'c', texto: 'Zapier is always harder to use' },
          { id: 'd', texto: 'Make has no integrations' }
        ],
        resposta_correta: 'b',
        explicacao: 'Make offers a powerful visual builder for complex flows; Zapier is often quicker for simple automations.'
      },
      {
        id: 'q4-auto',
        trilha_id: 'automacao',
        pergunta: 'What is a trigger in automation?',
        opcoes: [
          { id: 'a', texto: 'The final output of the workflow' },
          { id: 'b', texto: 'The event that starts the automation' },
          { id: 'c', texto: 'A kind of email' },
          { id: 'd', texto: 'An error that stops the process' }
        ],
        resposta_correta: 'b',
        explicacao: 'The trigger is what kicks things off, e.g. “new form submission” or “new email received”.'
      },
      {
        id: 'q5-auto',
        trilha_id: 'automacao',
        pergunta: 'Why use Google Sheets in automations?',
        opcoes: [
          { id: 'a', texto: 'Only to edit documents' },
          { id: 'b', texto: 'As a simple database to store structured data' },
          { id: 'c', texto: 'Only to send email' },
          { id: 'd', texto: 'It cannot be used for automation' }
        ],
        resposta_correta: 'b',
        explicacao: 'Sheets often act as a lightweight CRM: leads, tasks, and logs that other apps read and update.'
      }
    ]
  },
  {
    trilha_id: 'comunicacao',
    titulo: 'Digital communication',
    perguntas: [
      {
        id: 'q1-com',
        trilha_id: 'comunicacao',
        pergunta: 'What is “copy” in digital marketing?',
        opcoes: [
          { id: 'a', texto: 'A font family' },
          { id: 'b', texto: 'Persuasive text written to sell or engage' },
          { id: 'c', texto: 'Design software' },
          { id: 'd', texto: 'A social network' }
        ],
        resposta_correta: 'b',
        explicacao: 'Copy is the words in ads, emails, posts, and landing pages that drive action.'
      },
      {
        id: 'q2-com',
        trilha_id: 'comunicacao',
        pergunta: 'Which structure works well for sales copy?',
        opcoes: [
          { id: 'a', texto: 'Random unstructured text' },
          { id: 'b', texto: 'Problem → Agitate → Solution → Offer' },
          { id: 'c', texto: 'Only a bullet list of features' },
          { id: 'd', texto: 'Very long text with no structure' }
        ],
        resposta_correta: 'b',
        explicacao: 'Problem → Agitate → Solution → Offer builds tension and clarity toward the call to action.'
      },
      {
        id: 'q3-com',
        trilha_id: 'comunicacao',
        pergunta: 'What are hooks in content?',
        opcoes: [
          { id: 'a', texto: 'Fishing equipment' },
          { id: 'b', texto: 'Opening lines that grab attention' },
          { id: 'c', texto: 'A video codec' },
          { id: 'd', texto: 'An email tool' }
        ],
        resposta_correta: 'b',
        explicacao: 'Hooks are the first words that stop the scroll—questions, bold claims, or striking numbers.'
      },
      {
        id: 'q4-com',
        trilha_id: 'comunicacao',
        pergunta: 'Why define a customer persona?',
        opcoes: [
          { id: 'a', texto: 'It is not important' },
          { id: 'b', texto: 'To craft messages that match needs and language' },
          { id: 'c', texto: 'Pure curiosity' },
          { id: 'd', texto: 'To copy competitors verbatim' }
        ],
        resposta_correta: 'b',
        explicacao: 'Personas help you speak to real motivations and words your audience uses.'
      }
    ]
  },
  {
    trilha_id: 'produtividade',
    titulo: 'Productivity with AI',
    perguntas: [
      {
        id: 'q1-prod',
        trilha_id: 'produtividade',
        pergunta: 'How can assistants like ChatGPT help daily productivity?',
        opcoes: [
          { id: 'a', texto: 'They do not help' },
          { id: 'b', texto: 'Draft emails, task lists, and organize ideas' },
          { id: 'c', texto: 'Only for entertainment' },
          { id: 'd', texto: 'Replace all human work' }
        ],
        resposta_correta: 'b',
        explicacao: 'They can draft replies, outline tasks, and summarize meetings in minutes.'
      },
      {
        id: 'q2-prod',
        trilha_id: 'produtividade',
        pergunta: 'What are AI project-management tools?',
        opcoes: [
          { id: 'a', texto: 'Software that uses AI to prioritize tasks and schedules' },
          { id: 'b', texto: 'Simple paper calendars only' },
          { id: 'c', texto: 'Apps that do nothing' },
          { id: 'd', texto: 'Graphic design tools' }
        ],
        resposta_correta: 'a',
        explicacao: 'Tools like Todoist AI, Notion AI, or ClickUp AI suggest priorities, deadlines, and workflows.'
      },
      {
        id: 'q3-prod',
        trilha_id: 'produtividade',
        pergunta: 'How can AI summarize long information?',
        opcoes: [
          { id: 'a', texto: 'Read everything manually' },
          { id: 'b', texto: 'Use AI to pull key points from docs or meetings' },
          { id: 'c', texto: 'Ignore long content' },
          { id: 'd', texto: 'Archive without reading' }
        ],
        resposta_correta: 'b',
        explicacao: 'ChatGPT, Claude, or Notion can condense PDFs, articles, or transcripts quickly.'
      }
    ]
  }
];

export function getQuizPorTrilha(trilhaId: string): Quiz | undefined {
  return quizzes.find(q => q.trilha_id === trilhaId);
}
