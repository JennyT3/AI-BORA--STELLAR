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
  const [step, setStep] = useState<'name' | 'role_selection' | 'company_details' | 'client_preference' | 'skills' | 'complete' | 'loading'>('loading');
  const [userData, setUserData] = useState({
    name: '',
    role: '',
    companyName: '',
    hasCompany: false,
    skills: ''
  });
  
  const initialized = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check authentication on mount
  useEffect(() => {
    const hasPasskey = localStorage.getItem('aibora_passkey_user');
    const isAuthenticated = localStorage.getItem('aibora_authenticated');
    
    if (!hasPasskey) {
      // No passkey, redirect to register
      setLocation('/register');
      return;
    }
    
    if (isAuthenticated) {
      // Already completed onboarding, go to admin
      setLocation('/admin');
      return;
    }
    
    setStep('name');
  }, [setLocation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (initialized.current || step === 'loading') return;
    initialized.current = true;

    const startConversation = async () => {
      await addAgentMessage("👋 Hi! I'm your AIBORA onboarding assistant.");
      await addAgentMessage("Let's get you set up. First, what's your name?", [], true, "Your full name...");
      setStep('name');
    };

    startConversation();
  }, []);

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
      id: Date.now(),
      text,
      sender: 'user'
    }]);
  };

  const handleNameSubmit = async () => {
    if (!inputValue.trim()) return;
    
    const name = inputValue.trim();
    setUserData(prev => ({ ...prev, name }));
    addUserMessage(name);
    setInputValue('');
    
    await addAgentMessage(`Nice to meet you, ${name}! 😊`);
    await addAgentMessage("What brings you to AIBORA today?", [
      { label: "🏢 I want to sell services (I'm a Company)", value: 'company', icon: 'building' },
      { label: "💼 I want to work on projects (Collaborator)", value: 'worker', icon: 'briefcase' },
      { label: "🛒 I need services done (Client)", value: 'client', icon: 'shopping' }
    ]);
    setStep('role_selection');
  };

  const handleRoleSelect = async (role: string, label: string) => {
    setUserData(prev => ({ ...prev, role }));
    addUserMessage(label);
    
    if (role === 'company') {
      await addAgentMessage("Great! Let's set up your company profile.");
      await addAgentMessage("What's your company or business name?", [], true, "Company name...");
      setStep('company_details');
    } else if (role === 'worker') {
      await addAgentMessage("Perfect! You're looking to join as a collaborator.");
      await addAgentMessage("Do you already work with a specific company, or would you like us to match you with available projects?", [
        { label: "I work with a specific company", value: 'has_company' },
        { label: "Match me with available projects", value: 'freelancer' }
      ]);
      setStep('company_details');
    } else if (role === 'client') {
      await addAgentMessage("Awesome! Let's find the right services for you.");
      await addAgentMessage("Do you already have a preferred company to work with, or would you like us to recommend the best match?", [
        { label: "I have a specific company in mind", value: 'has_company' },
        { label: "Help me find the best service provider", value: 'need_recommendation' }
      ]);
      setStep('client_preference');
    }
  };

  const handleCompanyPreference = async (preference: string) => {
    if (userData.role === 'worker') {
      if (preference === 'has_company') {
        setUserData(prev => ({ ...prev, hasCompany: true }));
        addUserMessage("I work with a specific company");
        await addAgentMessage("Which company do you work with?", [], true, "Company name...");
      } else {
        setUserData(prev => ({ ...prev, hasCompany: false }));
        addUserMessage("Match me with projects");
        await addAgentMessage("Great! You'll be able to browse available projects.");
        await addAgentMessage("What are your main skills or expertise?", [], true, "e.g., Design, Development, Marketing...");
        setStep('skills');
        return;
      }
    } else if (userData.role === 'client') {
      if (preference === 'has_company') {
        setUserData(prev => ({ ...prev, hasCompany: true }));
        addUserMessage("I have a specific company");
        await addAgentMessage("What's the company name?", [], true, "Company name...");
      } else {
        setUserData(prev => ({ ...prev, hasCompany: false }));
        addUserMessage("Help me find a provider");
        await addAgentMessage("Perfect! I'll take you to our services catalog where you can browse and compare providers.");
        setTimeout(() => completeOnboarding('client'), 1500);
        return;
      }
    }
    setStep('company_details');
  };

  const handleCompanySubmit = async () => {
    if (!inputValue.trim()) return;
    
    const companyName = inputValue.trim();
    setUserData(prev => ({ ...prev, companyName }));
    addUserMessage(companyName);
    setInputValue('');
    
    if (userData.role === 'company') {
      await addAgentMessage(`Excellent! ${companyName} is now registered.`);
      await addAgentMessage("You can now create proposals and manage clients.");
      setTimeout(() => completeOnboarding('company'), 1000);
    } else if (userData.role === 'worker') {
      await addAgentMessage(`Got it! You're associated with ${companyName}.`);
      await addAgentMessage("What are your main skills?", [], true, "e.g., React, UI Design, Copywriting...");
      setStep('skills');
    } else if (userData.role === 'client') {
      await addAgentMessage(`Perfect! We'll connect you with ${companyName}.`);
      setTimeout(() => completeOnboarding('client'), 1000);
    }
  };

  const handleSkillsSubmit = async () => {
    if (!inputValue.trim()) return;
    
    const skills = inputValue.trim();
    setUserData(prev => ({ ...prev, skills }));
    addUserMessage(skills);
    setInputValue('');
    
    await addAgentMessage("Great! Your profile is complete.");
    await addAgentMessage("You'll receive notifications when projects matching your skills are available.");
    setTimeout(() => completeOnboarding('worker'), 1000);
  };

  const completeOnboarding = (role: string) => {
    setStep('complete');
    
    localStorage.setItem('aibora_authenticated', 'true');
    localStorage.setItem('aibora_role', role);
    localStorage.setItem('aibora_user_name', userData.name);
    if (userData.companyName) localStorage.setItem('aibora_company_name', userData.companyName);
    if (userData.skills) localStorage.setItem('aibora_skills', userData.skills);
    
    setTimeout(() => {
      switch (role) {
        case 'company':
          setLocation('/admin');
          break;
        case 'client':
          setLocation('/servicos');
          break;
        case 'worker':
          setLocation('/colaborador/demo');
          break;
      }
    }, 800);
  };

  // Loading state while checking authentication
  if (step === 'loading') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#fcf9f8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #ff6f2e',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#666', fontFamily: 'Montserrat, sans-serif' }}>Loading...</p>
        </div>
      </div>
    );
  }

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

      {/* Chat Area */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
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
                flexDirection: message.sender === 'agent' ? 'row' : 'row-reverse'
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
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (step === 'role_selection') handleRoleSelect(option.value, option.label);
                          else if (step === 'company_details' || step === 'client_preference') handleCompanyPreference(option.value);
                        }}
                        style={{
                          padding: '14px 18px',
                          background: 'rgba(255,111,46,0.08)',
                          border: '2px solid rgba(255,111,46,0.2)',
                          borderRadius: 12,
                          color: colors.orange,
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.orange;
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.borderColor = colors.orange;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255,111,46,0.08)';
                          e.currentTarget.style.color = colors.orange;
                          e.currentTarget.style.borderColor = 'rgba(255,111,46,0.2)';
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{option.label.split(' ')[0]}</span>
                        <span>{option.label.split(' ').slice(1).join(' ')}</span>
                        <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
                      </motion.button>
                    ))}
                  </div>
                )}

                {message.input && step !== 'complete' && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          if (step === 'name') handleNameSubmit();
                          else if (step === 'company_details') handleCompanySubmit();
                          else if (step === 'skills') handleSkillsSubmit();
                        }
                      }}
                      placeholder={message.inputPlaceholder || "Type here..."}
                      autoFocus
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '2px solid rgba(255,111,46,0.3)',
                        borderRadius: 12,
                        fontSize: 14,
                        fontFamily: 'Montserrat, sans-serif',
                        outline: 'none',
                        background: 'rgba(255,255,255,0.5)'
                      }}
                    />
                    <button
                      onClick={() => {
                        if (step === 'name') handleNameSubmit();
                        else if (step === 'company_details') handleCompanySubmit();
                        else if (step === 'skills') handleSkillsSubmit();
                      }}
                      disabled={!inputValue.trim()}
                      style={{
                        padding: '12px',
                        background: colors.orange,
                        color: 'white',
                        border: 'none',
                        borderRadius: 12,
                        cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                        opacity: inputValue.trim() ? 1 : 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              alignSelf: 'flex-start',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginLeft: 48
            }}
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
              padding: '16px 20px',
              background: 'white',
              borderRadius: '20px 20px 20px 4px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              display: 'flex',
              gap: 4,
              alignItems: 'center'
            }}>
              <span style={{ animation: 'bounce 1s infinite', color: colors.orange, fontSize: 20 }}>.</span>
              <span style={{ animation: 'bounce 1s infinite 0.2s', color: colors.orange, fontSize: 20 }}>.</span>
              <span style={{ animation: 'bounce 1s infinite 0.4s', color: colors.orange, fontSize: 20 }}>.</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
        `}</style>
      </div>

      {/* Loading overlay */}
      {step === 'complete' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(255,255,255,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 20,
            zIndex: 50
          }}
        >
          <div style={{
            width: 60,
            height: 60,
            border: `4px solid ${colors.orange}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: colors.dark, fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
              Setting up your account...
            </p>
            <p style={{ color: colors.gray, fontSize: 14 }}>
              {userData.name} {userData.companyName && `@ ${userData.companyName}`}
            </p>
          </div>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </motion.div>
      )}
    </div>
  );
}
