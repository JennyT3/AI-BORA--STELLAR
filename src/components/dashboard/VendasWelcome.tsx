import React, { useState, useEffect } from 'react';

const quotes = [
  "Success is the sum of small efforts repeated day after day.",
  "There is no elevator to success — you have to take the stairs.",
  "Opportunities do not happen; you create them.",
  "The only place success comes before work is in the dictionary.",
  "Persistence accomplishes the impossible."
];

interface VendasWelcomeProps {
  nome: string;
}

export function VendasWelcome({ nome }: VendasWelcomeProps) {
  const [greeting, setGreeting] = useState('');
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 20) setGreeting('Good afternoon');
    else setGreeting('Good evening');

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
