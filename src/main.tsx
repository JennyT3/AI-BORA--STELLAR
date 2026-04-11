import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Check if Clerk is properly configured
const clerkConfigured = PUBLISHABLE_KEY && 
  PUBLISHABLE_KEY !== 'pk_test_your_clerk_key' && 
  PUBLISHABLE_KEY.startsWith('pk_');

async function bootstrap() {
  if (clerkConfigured) {
    // Clerk is configured - use it
    const { ClerkProvider } = await import('@clerk/clerk-react');
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
          <App />
        </ClerkProvider>
      </StrictMode>,
    );
  } else {
    // Clerk not configured - run without auth (for demo)
    console.log(' Clerk not configured - running in demo mode');
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
}

bootstrap();