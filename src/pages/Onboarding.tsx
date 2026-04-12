import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ShoppingCart, Briefcase, ArrowRight, Bot, Sparkles, Send, User, Building, Search, Star } from 'lucide-react';

const colors = {
  orange: '#ff6f2e',
  magenta: '#cb1a74',
  dark: '#1c1b1b',
  light: '#fcf9f8',
  gray: '#666',
};

type Message = {
  id: number;
  text: string | React.ReactNode;
  sender: 'agent' | 'user';
  input?: boolean;
  inputPlaceholder?: string;
  options?: { label: string; value: string; icon?: string }[];
};

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [step, setStep] = useState<'has_account' | 'name' | 'role_selection' | 'company_details' | 'client_preference' | 'skills' | 'complete'>('has_account');
  const [userData, setUserData] = useState({
    name: '',
    role: '',
    companyName: '',
    hasCompany: false,
    skills: ''
  });
  
  const initialized = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const startConversation = async () => {
      await addAgentMessage("👋 Welcome to AI BORA!");
      await addAgentMessage("Do you already have an account?", [
        { label: '✅ Yes, I have an account', value: 'has_account' },
        { label: '❌ No, I\'m new here', value: 'new_user' }
      ]);
      setStep('has_account');
    };

    startConversation();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addAgentMessage = (text: string | React.ReactNode, options?: { label: string; value: string; icon?: string }[], showInput?: boolean, placeholder?: string): Promise<void> => {
    return new Promise((resolve) => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          text,
          sender: 'agent',
          options,
          input: showInput,
          inputPlaceholder: placeholder
        }]);
        resolve();
      }, 800 + Math.random() * 600);
    });
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      text,
      sender: 'user'
    }]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    processInput(inputValue.trim());
    setInputValue('');
  };

  const handleOptionClick = (value: string, label: string) => {
    addUserMessage(label);
    processInput(value);
  };

  const processInput = async (value: string) => {
    switch (step) {
      case 'has_account':
        if (value === 'has_account') {
          addUserMessage('Yes, I have an account');
          await addAgentMessage("Great! Let's verify your identity with your passkey.");
          // Redirect to register (passkey verification)
          setTimeout(() => {
            localStorage.setItem('aibora_onboarding_complete', 'true');
            setLocation('/register');
          }, 1000);
        } else {
          addUserMessage("No, I'm new here");
          await addAgentMessage("Welcome! Let's get you set up.");
          await addAgentMessage("First, what's your name?", [], true, "Your full name...");
          setStep('name');
        }
        break;

      case 'name':
        setUserData(prev => ({ ...prev, name: value }));
        addUserMessage(value);
        await addAgentMessage(`Nice to meet you, ${value}! 👋`);
        await addAgentMessage(`What type of user are you?`, [
          { label: '🏢 Company / Business', value: 'company', icon: '🏢' },
          { label: '👤 Looking for Services', value: 'client', icon: '👤' },
          { label: '💼 Collaborator / Freelancer', value: 'worker', icon: '💼' }
        ]);
        setStep('role_selection');
        break;

      case 'role_selection':
        setUserData(prev => ({ ...prev, role: value }));
        if (value === 'company') {
          await addAgentMessage("Great! A business account.");
          await addAgentMessage("What's your company name?", [], true, "Company name...");
          setStep('company_details');
        } else if (value === 'client') {
          await addAgentMessage("Perfect! You're looking for services.");
          await addAgentMessage("What services are you interested in?", [
            { label: '📊 Marketing', value: 'marketing', icon: '📊' },
            { label: '📝 Copywriting', value: 'copywriting', icon: '📝' },
            { label: '🔧 Development', value: 'development', icon: '🔧' },
            { label: '📈 All Services', value: 'all', icon: '📈' }
          ]);
          setStep('client_preference');
        } else {
          await addAgentMessage("Great! You want to collaborate with us.");
          await addAgentMessage("What are your main skills?", [], true, "e.g., Marketing, Design, Development...");
          setStep('skills');
        }
        break;

      case 'company_details':
        setUserData(prev => ({ ...prev, companyName: value, hasCompany: true }));
        addUserMessage(value);
        await addAgentMessage(`Excellent, ${userData.name}! ${value} sounds like a great company.`);
        setTimeout(() => completeOnboarding('company'), 1500);
        break;

      case 'client_preference':
        addUserMessage(value);
        await addAgentMessage("Great choice!");
        setTimeout(() => completeOnboarding('client'), 1000);
        break;

      case 'skills':
        setUserData(prev => ({ ...prev, skills: value }));
        addUserMessage(value);
        await addAgentMessage("Great! Your profile is complete.");
        setTimeout(() => completeOnboarding('worker'), 1000);
        break;

      case 'complete':
        break;
    }
  };

  const completeOnboarding = (role: string) => {
    setStep('complete');
    
    // Save onboarding data
    localStorage.setItem('aibora_onboarding_complete', 'true');
    localStorage.setItem('aibora_role', role);
    localStorage.setItem('aibora_user_name', userData.name);
    if (userData.companyName) localStorage.setItem('aibora_company_name', userData.companyName);
    if (userData.skills) localStorage.setItem('aibora_skills', userData.skills);
    
    // Redirect to register to create passkey
    setTimeout(() => {
      setLocation('/register');
    }, 2000);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#fcf9f8',
      background: '#fcf9f8',
      fontFamily: 'Montserrat, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          borderBottom: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 4px 30px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '16px',
          background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 20px ${colors.orange}60`,
          fontSize: 28
        }}>
          🤖
        </div>
        <div>
          <div style={{ fontWeight: 900, color: 'white', fontSize: 20, letterSpacing: '-0.5px' }}>
            AI BORA
          </div>
          <div style={{ fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }}></span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>AI Assistant</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>Exit</a>
          <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, color: 'white', fontWeight: 600 }}>
            Stellar Powered
          </div>
        </div>
      </motion.div>

      {/* Chat container */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto', 
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 800,
        width: '100%',
        margin: '0 auto'
      }}>
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              style={{
                alignSelf: message.sender === 'agent' ? 'flex-start' : 'flex-end',
                maxWidth: '85%',
                display: 'flex',
                gap: 12,
                flexDirection: message.sender === 'agent' ? 'row' : 'row-reverse',
                marginBottom: 16
              }}
            >
              {message.sender === 'agent' && (
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 4
                }}>
                  <Bot size={18} color="white" />
                </div>
              )}
              
              <div style={{
                background: message.sender === 'agent' ? 'white' : colors.orange,
                color: message.sender === 'agent' ? colors.dark : 'white',
                padding: '16px 20px',
                borderRadius: message.sender === 'agent' ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                border: message.sender === 'agent' ? '1px solid rgba(0,0,0,0.04)' : 'none',
                fontSize: 15,
                lineHeight: 1.5,
                fontWeight: 500
              }}>
                {message.text}
                
                {message.options && (
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {message.options.map((option, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => handleOptionClick(option.value, option.label)}
                        style={{
                          background: 'linear-gradient(135deg, rgba(242, 92, 5, 0.1) 0%, rgba(242, 34, 131, 0.1) 100%)',
                          border: '2px solid rgba(242, 92, 5, 0.3)',
                          borderRadius: 12,
                          padding: '12px 16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          fontSize: 14,
                          fontWeight: 600,
                          color: colors.dark,
                          transition: 'all 0.2s',
                          width: '100%',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.border = '2px solid rgba(242, 92, 5, 0.6)';
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(242, 92, 5, 0.2) 0%, rgba(242, 34, 131, 0.2) 100%)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.border = '2px solid rgba(242, 92, 5, 0.3)';
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(242, 92, 5, 0.1) 0%, rgba(242, 34, 131, 0.1) 100%)';
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{option.icon}</span>
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                )}
                
                {message.input && step !== 'complete' && (
                  <form onSubmit={handleInputSubmit} style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder={message.inputPlaceholder || 'Type your answer...'}
                        autoFocus
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          borderRadius: 12,
                          border: '2px solid rgba(0,0,0,0.1)',
                          fontSize: 15,
                          outline: 'none',
                          fontFamily: 'Montserrat, sans-serif'
                        }}
                      />
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`,
                          border: 'none',
                          borderRadius: 12,
                          padding: '12px 20px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 15px rgba(242, 92, 5, 0.3)'
                        }}
                      >
                        <Send size={18} color="white" />
                      </motion.button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', gap: 12, alignSelf: 'flex-start' }}
          >
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={18} color="white" />
            </div>
            <div style={{
              background: 'white',
              padding: '14px 20px',
              borderRadius: '20px 20px 20px 4px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.04)'
            }}>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ fontSize: 14, color: '#666' }}
              >
                Typing...
              </motion.div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Complete state */}
      {step === 'complete' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: 'white',
              borderRadius: 24,
              padding: '48px',
              textAlign: 'center',
              maxWidth: 400,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: colors.dark, margin: '0 0 12px', fontFamily: 'Montserrat, sans-serif' }}>
              You're all set!
            </h2>
            <p style={{ fontSize: 16, color: '#666', marginBottom: 24, fontFamily: 'Montserrat, sans-serif' }}>
              Now let's create your secure passkey
            </p>
            <div style={{
              background: 'linear-gradient(135deg, rgba(242, 92, 5, 0.1) 0%, rgba(242, 34, 131, 0.1) 100%)',
              borderRadius: 12,
              padding: '16px',
              marginBottom: 24
            }}>
              <p style={{ fontSize: 14, color: '#333', margin: 0, fontFamily: 'Montserrat, sans-serif' }}>
                <strong>Redirecting to passkey setup...</strong>
              </p>
            </div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ color: colors.orange }}
            >
              ⏳ Please wait...
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}