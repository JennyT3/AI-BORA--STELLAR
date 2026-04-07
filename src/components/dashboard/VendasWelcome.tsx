import React, { useState, useEffect } from 'react';

const quotes = [
  "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
  "Não existe elevador para o sucesso. Vais ter de usar as escadas.",
  "As oportunidades não acontecem, és tu que as crias.",
  "O único lugar onde o sucesso vem antes do trabalho é no dicionário.",
  "A persistência realiza o impossível."
];

interface VendasWelcomeProps {
  nome: string;
}

export function VendasWelcome({ nome }: VendasWelcomeProps) {
  const [greeting, setGreeting] = useState('');
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 20) setGreeting('Boa tarde');
    else setGreeting('Boa noite');

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(242, 92, 5, 0.05) 0%, rgba(242, 34, 131, 0.05) 100%)',
      borderLeft: '4px solid #F25C05',
      borderRadius: '0 16px 16px 0',
      padding: '16px 24px',
      marginBottom: 32,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1b1c1b', margin: 0 }}>
        {greeting}, <span style={{ color: '#F25C05' }}>{nome.split(' ')[0]}</span>.
      </h2>
      <p style={{ fontSize: 13, color: '#5a4137', fontWeight: 600, margin: 0, fontStyle: 'italic' }}>
        "{quote}"
      </p>
    </div>
  );
}
