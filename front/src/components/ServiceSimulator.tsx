import { useState, type Dispatch, type SetStateAction } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuoteModal } from './QuoteModal';

const ICONS: Record<string, string> = {
  "Social media management": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/></svg>`,
  "Content creation": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  "Post design": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/></svg>`,
  "Community Management": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  "Logo design": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  "Corporate identity": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
  "Video production": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
  "Reels creation": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  "Website / landing page": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  "Online store": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  "Local SEO": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,

  "Facebook/Instagram Ads": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
  "Email Marketing": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  "WhatsApp chatbot": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  "AI & automation": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  "Professional photography": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  "Strategic consulting": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
};

/** UI labels only; `categoria` on services stays as stored for filtering. */
const CATEGORY_LABEL: Record<string, string> = {
  All: "All",
  Marketing: "Marketing",
  Design: "Design",
  Web: "Web",
  Multimedia: "Multimedia",
  Advertising: "Advertising",
  Automation: "Automation",
  Consulting: "Consulting",
};

const SERVICES = [
  { id: "redes-sociais", name: "Social media management", category: "Marketing", color: "#E1306C", description: "Full management of your social channels with strategy and growth.", detalhamento: ["Monthly content planning", "Publishing schedule", "Performance reports", "Growth strategy", "Daily support and engagement"] },
  { id: "content", name: "Content creation", category: "Marketing", color: "#E1306C", description: "Persuasive, creative copy that drives engagement.", detalhamento: ["Post copy", "Creative captions", "Persuasive copywriting", "Blog content", "Newsletters"] },
{ id: "design-posts", name: "Post design", category: "Design", color: "#F25C05", description: "Professional visual design for your social feeds.", detalhamento: ["Custom graphic posts", "Informative carousels", "Stories and Reels", "Banners and covers", "Brand templates"] },
  { id: "logo", name: "Logo design", category: "Design", color: "#F25C05", description: "Distinctive, professional logo concepts.", detalhamento: ["3 initial concepts", "Unlimited revisions", "Multiple file formats", "Basic brand guidelines", "Commercial use"] },
  { id: "identity", name: "Corporate identity", category: "Design", color: "#F25C05", description: "Complete visual identity for your brand.", detalhamento: ["Logo + variations", "Colour palette", "Typography", "Business card", "Corporate folder"] },
  { id: "videos", name: "Video production", category: "Multimedia", color: "#E74C3C", description: "Professional video for marketing and ads.", detalhamento: ["Script and storyboard", "Professional filming", "Editing and post-production", "Motion graphics", "4K delivery"] },
  { id: "reels", name: "Reels creation", category: "Multimedia", color: "#E74C3C", description: "High-impact Reels for Instagram and TikTok.", detalhamento: ["Creative concept", "Short script", "Dynamic editing", "Trending audio", "Reach-focused optimisation"] },
  { id: "website", name: "Website / landing page", category: "Web", color: "#3498DB", description: "Modern, responsive websites.", detalhamento: ["Responsive design", "SEO-friendly structure", "Contact forms", "Analytics integration", "SSL included"] },
  { id: "ecommerce", name: "Online store", category: "Web", color: "#3498DB", description: "Full e-commerce setup.", detalhamento: ["Product management", "Secure payments", "Integrated shipping", "Admin dashboard", "Professional template"] },
  { id: "seo", name: "Local SEO", category: "Web", color: "#3498DB", description: "Optimisation for local search visibility.", detalhamento: ["Optimised business profile", "Local keywords", "Local backlinks", "Review management", "Monthly reports"] },
  { id: "meta-ads", name: "Facebook/Instagram Ads", category: "Advertising", color: "#F39C12", description: "Meta Ads campaigns.", detalhamento: ["Advanced targeting", "Creative production", "A/B testing", "Pixel setup", "Results reporting"] },
  { id: "email", name: "Email Marketing", category: "Marketing", color: "#E1306C", description: "Email programmes built to convert.", detalhamento: ["Template design", "Email automation", "List segmentation", "A/B testing", "Open-rate reporting"] },
  { id: "chatbot", name: "WhatsApp chatbot", category: "Automation", color: "#2ECC71", description: "Automated WhatsApp assistant, 24/7.", detalhamento: ["Auto-replies", "Interactive menu", "Meeting booking", "CRM integration", "AI-powered flows"] },
  { id: "ia-automacao", name: "AI & automation", category: "Automation", color: "#2ECC71", description: "Smart workflows across your stack.", detalhamento: ["Task automation", "App integrations", "Custom workflows", "Automated reporting", "Virtual assistant"] },
  { id: "photography", name: "Professional photography", category: "Multimedia", color: "#E74C3C", description: "Professional photo sessions.", detalhamento: ["2h session", "20 edited photos", "Commercial use", "Multiple setups", "High resolution"] },
  { id: "consulting", name: "Strategic consulting", category: "Consulting", color: "#1ABC9C", description: "Consulting focused on growth.", detalhamento: ["Business analysis", "Digital strategy", "Action plan", "Monthly sessions", "Priority support"] },
];

const CATEGORIES = [
  { name: "All", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`, color: "#1A1A1A" },
  { name: "Marketing", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>`, color: "#E1306C" },
  { name: "Design", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/></svg>`, color: "#F25C05" },
  { name: "Web", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`, color: "#3498DB" },
  { name: "Multimedia", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`, color: "#E74C3C" },
  { name: "Advertising", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`, color: "#F39C12" },
  { name: "Automation", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`, color: "#2ECC71" },
  { name: "Consulting", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`, color: "#1ABC9C" },
];

// Detail modal component
function DetailModal({ service, isOpen, onClose, selected, setSelected, setDetailModalService }: { service: typeof SERVICES[0] | null; isOpen: boolean; onClose: () => void; selected: string[]; setSelected: Dispatch<SetStateAction<string[]>>; setDetailModalService: (s: typeof SERVICES[0] | null) => void }) {
  if (!service) return null;
  
  const isSelected = selected.includes(service.id);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16, backdropFilter: "blur(4px)"
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#ffffff", borderRadius: 20,
              width: "100%", maxWidth: 420, maxHeight: "85vh", overflowY: "auto",
              boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
            }}
          >
            {/* Header */}
            <div style={{ padding: 24, borderBottom: "1px solid #f0f0f0", position: "relative" }}>
              <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", padding: 4, color: "#888" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: service.color + "15", display: "flex", alignItems: "center", justifyContent: "center", color: service.color }}>
                  <span dangerouslySetInnerHTML={{ __html: ICONS[service.name] }} style={{ width: 28, height: 28 }} />
                </div>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: service.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{CATEGORY_LABEL[service.category] ?? service.category}</span>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#1A1A1A", marginTop: 2 }}>{service.name}</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: 24 }}>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, marginBottom: 20 }}>{service.description}</p>
              
              <div style={{ backgroundColor: "#F8F7F4", borderRadius: 14, padding: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A", margin: "0 0 14px" }}>What is included:</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {service.detalhamento.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: service.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "#333", lineHeight: 1.4 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "16px 24px 24px", display: "flex", gap: 10 }}>
              <button 
                onClick={() => {
                  if (service && !selected.includes(service.id)) {
                    setSelected(prev => [...prev, service.id]);
                  }
                  setDetailModalService(null);
                }}
                style={{ 
                  flex: 1, padding: "14px", borderRadius: 12, border: "none", 
                  backgroundColor: isSelected ? service.color : "#F22283", 
                  color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                }}
              >
                {isSelected ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    Already selected
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add this
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ServiceSimulator() {
  const [selected, setSelected] = useState<string[]>([]);
  const [categoryAtiva, setCategoryAtiva] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalService, setDetailModalService] = useState<typeof SERVICES[0] | null>(null);

  const toggleService = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const filteredServices = categoryAtiva === "All" ? SERVICES : SERVICES.filter(s => s.category === categoryAtiva);
  const selectedServices = SERVICES.filter(s => selected.includes(s.id));

  return (
    <>
      <section id="simulator" style={{ backgroundColor: "#F8F7F4", padding: "60px 16px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 50, height: 3, backgroundColor: "#F25C05", margin: "0 auto 16px", borderRadius: 2 }} />
            <h2 style={{ fontWeight: 900, fontSize: "clamp(24px, 5vw, 36px)", color: "#1A1A1A", margin: "0 0 10px" }}>
              Choose your <span style={{ color: "#F22283" }}>services</span>
            </h2>
            <p style={{ fontSize: 14, color: "#666", maxWidth: 450, margin: "0 auto" }}>
              Select one or more services. Click &quot;See more&quot; for details.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "nowrap", gap: 8, marginBottom: 28, justifyContent: "flex-start", overflowX: "auto", paddingBottom: 8, WebkitOverflowScrolling: "touch" }}>
            {CATEGORIES.map(cat => (
              <button key={cat.name} onClick={() => setCategoryAtiva(cat.name)} style={{
                padding: "10px 16px", borderRadius: 20, border: "none", fontSize: 12, fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
                backgroundColor: categoryAtiva === cat.name ? cat.color : "#ffffff",
                color: categoryAtiva === cat.name ? "#ffffff" : "#4A4A4A",
                boxShadow: categoryAtiva === cat.name ? `0 4px 16px ${cat.color}40` : "0 2px 8px rgba(0,0,0,0.05)",
                transition: "all 0.2s ease"
              }}>
                <span dangerouslySetInnerHTML={{ __html: cat.icon }} style={{ display: "flex" }} />
                <span>{CATEGORY_LABEL[cat.name] ?? cat.name}</span>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
            
            {/* Services grid */}
            <div style={{ flex: "1 1 650px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                {filteredServices.map(service => {
                  const isSelected = selected.includes(service.id);
                  
                  return (
                    <motion.div key={service.id} layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                      <motion.button
                        layout
                        onClick={() => toggleService(service.id)}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          width: "100%", padding: "16px", borderRadius: 14,
                          border: isSelected ? `2px solid ${service.color}` : "2px solid transparent",
                          backgroundColor: "#ffffff",
                          boxShadow: isSelected ? `0 6px 20px ${service.color}20` : "0 3px 12px rgba(0,0,0,0.04)",
                          cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "stretch",
                          gap: 10, textAlign: "left", transition: "all 0.2s ease"
                        }}
                      >
                        {isSelected && (
                          <div style={{ position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: "50%", backgroundColor: service.color, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                          </div>
                        )}

                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: service.color + "15", display: "flex", alignItems: "center", justifyContent: "center", color: service.color, flexShrink: 0 }}>
                            <span dangerouslySetInnerHTML={{ __html: ICONS[service.name] }} style={{ width: 20, height: 20 }} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, color: service.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{CATEGORY_LABEL[service.category] ?? service.category}</span>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A1A", marginTop: 1 }}>{service.name}</div>
                          </div>
                        </div>

                        <p style={{ fontSize: 11, color: "#666", lineHeight: 1.4, margin: 0 }}>{service.description}</p>

                        <div 
                          onClick={(e) => { e.stopPropagation(); setDetailModalService(service); }}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: "auto",
                            padding: "6px 10px", borderRadius: 12, 
                            backgroundColor: "#F5F5F5",
                            fontSize: 10, fontWeight: 600, color: "#888",
                            cursor: "pointer", alignSelf: "flex-start"
                          }}
                        >
                          See more
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                        </div>
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar — right */}
            <div style={{ flex: "0 1 340px" }}>
              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 20, boxShadow: "0 6px 24px rgba(0,0,0,0.07)", position: "sticky", top: 80 }}>
                <h3 style={{ fontWeight: 800, fontSize: 16, color: "#1A1A1A", margin: "0 0 14px" }}>
                  <span dangerouslySetInnerHTML={{ __html: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>` }} />
                  Your package
                </h3>
                
                {selected.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "#F5F2F0", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </div>
                    <p style={{ fontSize: 12, color: "#888" }}>Select services</p>
                  </div>
                ) : (
                  <>
                    <div style={{ maxHeight: 160, overflowY: "auto", marginBottom: 12 }}>
                      {selectedServices.map(service => (
                        <div key={service.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: service.color + "15", display: "flex", alignItems: "center", justifyContent: "center", color: service.color }}>
                            <span dangerouslySetInnerHTML={{ __html: ICONS[service.name] }} style={{ width: 14, height: 14 }} />
                          </div>
                          <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: "#1A1A1A" }}>{service.name}</span>
                          <button onClick={() => toggleService(service.id)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 14, padding: 2 }}>×</button>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: "10px", backgroundColor: "#F5F2F0", borderRadius: 10, marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, fontWeight: 600 }}>Total:</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "#F22283" }}>{selected.length}</span>
                      </div>
                    </div>
                  </>
                )}

                <button
                  onClick={() => selected.length > 0 && setModalOpen(true)}
                  disabled={selected.length === 0}
                  style={{
                    width: "100%", padding: "14px", borderRadius: 10,
                    fontWeight: 700, fontSize: 13, textAlign: "center", border: "none",
                    backgroundColor: selected.length > 0 ? "#F22283" : "#e5e5e5",
                    color: selected.length > 0 ? "#fff" : "#999", 
                    cursor: selected.length > 0 ? "pointer" : "not-allowed",
                    boxShadow: selected.length > 0 ? "0 4px 16px rgba(242,34,131,0.3)" : "none",
                  }}
                >
                  <span style={{ marginRight: 6 }} dangerouslySetInnerHTML={{ __html: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.25-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>` }} />
                  Request quote {selected.length > 0 && `(${selected.length})`}
                </button>

                {selected.length > 0 && (
                  <button onClick={() => setSelected([])} style={{ width: "100%", marginTop: 8, padding: "8px", borderRadius: 8, fontSize: 10, border: "1px solid #e0e0e0", backgroundColor: "transparent", color: "#666", cursor: "pointer" }}>
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <DetailModal service={detailModalService} isOpen={!!detailModalService} onClose={() => setDetailModalService(null)} selected={selected} setSelected={setSelected} setDetailModalService={setDetailModalService} />
      <QuoteModal isOpen={modalOpen} onClose={() => setModalOpen(false)} selectedServices={selectedServices} />
    </>
  );
}