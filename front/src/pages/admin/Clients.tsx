import { useState, useEffect, useMemo } from "react";
import { Play, Clock, Eye, CheckCircle, Phone, Mail, MapPin, Building, Calendar, FileText, Check, Image, Video, Layout, Send, BarChart3, PenTool, Sparkles, User, ExternalLink, Trash2, Edit, AlignJustify, Grid, Search, Filter, Target, Download } from "lucide-react";
import { getCategoryLabel } from "../../utils/labels";
import { listActiveSalesReps } from "../../services/salesReps";
import * as XLSX from "xlsx";

interface ClientsProps {
  clients: any[];
  salesReps: any[];
  search: string;
  onSearchChange: (v: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (v: string) => void;
  filterSource: string;
  onFilterSourceChange: (v: string) => void;
  filterResponse: string;
  onFilterResponseChange: (v: string) => void;
  sortBy: string;
  onSortByChange: (v: any) => void;
  sortOrder: string;
  onSortOrderChange: (v: any) => void;
  selectedClient: any;
  onSelectClient: (c: any) => void;
  onNewClient: () => void;
  onLinkProposal: (c: any) => void;
  onViewProposal: (id: string) => void;
  onVerRecord: (id: string) => void;
  onEditProposal: (id: string) => void;
  onInvoice: (c: any) => void;
  onEdit: (c: any) => void;
  onDelete: (id: string) => void;
  onNavigateInvoicing: () => void;
  onUpdateStage: (clientId: string, stage: string) => void;
  onUpdateTasks: (clientId: string, tasks: any[]) => void;
  onDelegateSalesRep: (clientId: string, salesRepId: string) => void;
}

const PROCESSOS = [
  { id: "started", label: "Started", colorClass: "bg-violet-50 text-violet-600", icon: Play },
  { id: "processing", label: "In progress", colorClass: "bg-amber-50 text-amber-600", icon: Clock },
  { id: "in_revision", label: "In review", colorClass: "bg-sky-50 text-sky-600", icon: Eye },
  { id: "published", label: "Published", colorClass: "bg-emerald-50 text-emerald-600", icon: CheckCircle },
];

const getStageInfo = (stage: string) => {
  return PROCESSOS.find(p => p.id === stage) || PROCESSOS[0];
};

const SERVICE_TASKS: Record<string, { name: string; description: string; icon: any }[]> = {
  "Social media management": [
    { name: "Analysis", description: "Brand and competitor analysis", icon: BarChart3 },
    { name: "Planning", description: "Build content calendar", icon: Calendar },
    { name: "Post creation", description: "Weekly post design", icon: Image },
    { name: "Story creation", description: "Daily story design", icon: Layout },
    { name: "Copywriting", description: "Copy for posts", icon: PenTool },
    { name: "Publishing", description: "Publish and schedule content", icon: Send },
  ],
  "Content creation": [
    { name: "Briefing", description: "Briefing session", icon: FileText },
    { name: "Concept", description: "Develop creative concept", icon: Sparkles },
    { name: "Production", description: "Produce agreed content", icon: Image },
    { name: "Review", description: "Present and refine", icon: Eye },
  ],
  "Community Management": [
    { name: "Monitoring", description: "Monitor mentions and messages", icon: Send },
    { name: "Replies", description: "Reply to comments and DMs", icon: PenTool },
    { name: "Report", description: "Weekly metrics report", icon: BarChart3 },
  ],
  "Post design": [
    { name: "Design brief", description: "Clarify goals", icon: FileText },
    { name: "Visual concept", description: "Define visual direction", icon: Sparkles },
    { name: "Creation", description: "Produce final asset", icon: Image },
    { name: "Delivery", description: "Deliver final files", icon: Check },
  ],
  "Video production": [
    { name: "Script", description: "Write script", icon: PenTool },
    { name: "Filming", description: "Record footage", icon: Video },
    { name: "Editing", description: "Edit and finish video", icon: Video },
    { name: "Delivery", description: "Deliver final video", icon: Check },
  ],
  "Reels creation": [
    { name: "Idea", description: "Brainstorm ideas", icon: Sparkles },
    { name: "Script", description: "Write script", icon: PenTool },
    { name: "Production", description: "Shoot and edit", icon: Video },
    { name: "Publishing", description: "Publish on Instagram", icon: Send },
  ],

  "WhatsApp chatbot": [
    { name: "Mapping", description: "Map flows", icon: Layout },
    { name: "Configuration", description: "Configure chatbot", icon: Send },
    { name: "Testing", description: "Test flows", icon: Check },
    { name: "Delivery", description: "Deliver and train", icon: FileText },
  ],
};

export function Clients({ clients, salesReps, search, onSearchChange, filterCategory, onFilterCategoryChange, filterSource, filterResponse, sortBy, onSortByChange, sortOrder, onSortOrderChange, selectedClient, onSelectClient, onNewClient, onLinkProposal, onEdit, onInvoice, onDelete, onUpdateStage, onUpdateTasks }: ClientsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">(() => {
    return (localStorage.getItem("clientesViewMode") as "cards" | "table") || "cards";
  });

  const toggleViewMode = () => {
    const newMode = viewMode === "cards" ? "table" : "cards";
    setViewMode(newMode);
    localStorage.setItem("clientesViewMode", newMode);
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Local state for extra filters
  const [filterSalesRep, setFilterSalesRep] = useState<string>("all");
  const [filterDataDesde, setFilterDataDesde] = useState<string>("");
  const [filterDataHasta, setFilterDataHasta] = useState<string>("");
  const [salesRepsList, setSalesRepsList] = useState<any[]>([]);

  // Load sales reps for filter dropdown
  useEffect(() => { listActiveSalesReps().then(setSalesRepsList).catch(console.error); }, []);

  // Chain all filters with useMemo
  const clientsFiltered = useMemo(() => {
    return clients.filter(c => {
      const searchLower = search.toLowerCase();
      const matchesSearch = !search || c.name?.toLowerCase().includes(searchLower) || c.email?.toLowerCase().includes(searchLower) || c.taxId?.includes(search) || c.mobile?.includes(search) || c.company?.toLowerCase().includes(searchLower);
      const matchesCategory = filterCategory === "all" || c.category === filterCategory;
      const matchesSource = filterSource === "all" || c.source === filterSource;
      const matchesResponse = filterResponse === "all" || (filterResponse === "pending" ? !c.response : c.response === filterResponse);
      const matchesSalesRep = filterSalesRep === "all" || c.salesRepId === filterSalesRep;
      
      let matchesFecha = true;
      if (c.lastContactDate) {
        const fecha = c.lastContactDate.split('T')[0];
        if (filterDataDesde && fecha < filterDataDesde) matchesFecha = false;
        if (filterDataHasta && fecha > filterDataHasta) matchesFecha = false;
      }
      
      return matchesSearch && matchesCategory && matchesSource && matchesResponse && matchesSalesRep && matchesFecha;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") comparison = (a.name || "").localeCompare(b.name || "");
      else if (sortBy === "createdAt") comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      else if (sortBy === "propostaValor") comparison = (a.proposalAmount || 0) - (b.proposalAmount || 0);
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [clients, search, filterCategory, filterSource, filterResponse, filterSalesRep, filterDataDesde, filterDataHasta, sortBy, sortOrder]);

  // Export helpers
  const exportarExcelFiltered = () => {
    const data = clientsFiltered.map(c => ({
      name: c.name || '', email: c.email || '', mobile: c.mobile || '', taxId: c.taxId || '',
      company: c.company || '', website: c.website || '', address: c.address || '',
      postalCode: c.postalCode || '', city: c.city || '', category: c.category || '',
      source: c.source || '', stage: c.stage || '', salesRepNotes: c.salesRepNotes || '',
      lastContactDate: c.lastContactDate || '',
      services: Array.isArray(c.services) ? c.services.join('; ') : (c.services || '')
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients");
    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `clients_filtered_${fecha}.xlsx`);
  };

  const exportarBackupTotal = () => {
    const data = clients.map(c => ({
      name: c.name || '', email: c.email || '', mobile: c.mobile || '', taxId: c.taxId || '',
      company: c.company || '', website: c.website || '', address: c.address || '',
      postalCode: c.postalCode || '', city: c.city || '', category: c.category || '',
      source: c.source || '', stage: c.stage || '', salesRepNotes: c.salesRepNotes || '',
      lastContactDate: c.lastContactDate || '',
      services: Array.isArray(c.services) ? c.services.join('; ') : (c.services || '')
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients");
    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `clients_backup_${fecha}.xlsx`);
  };

  // Alias for backwards compatibility
  const filtered = clientsFiltered;

  // Assigned sales rep display name
  const getSalesRepName = (salesRepId?: string) => {
    if (!salesRepId) return '—';
    const v = salesReps.find(v => v.id === salesRepId);
    return v ? v.name : '—';
  };

  if (selectedClient) {
    const currentStage = getStageInfo(selectedClient.stage || "started");
    const StageIcon = currentStage.icon;
    const salesRepName = getSalesRepName(selectedClient.salesRepId);

    const getTasksFromServices = () => {
      const services = selectedClient.services || [];
      let tasks: any[] = [];
      services.forEach((s: string) => {
        if (SERVICE_TASKS[s]) {
          tasks = [...tasks, ...SERVICE_TASKS[s].map(t => ({
            ...t,
            concluida: false,
            startDate: "",
            deliveryDate: "",
          }))];
        }
      });
      return tasks.length > 0 ? tasks : selectedClient.tasks || [];
    };

    const tasksAtuais = selectedClient.tasks && selectedClient.tasks.length > 0
      ? selectedClient.tasks
      : getTasksFromServices();

    const toggleTask = (index: number) => {
      const newTasks = [...tasksAtuais];
      newTasks[index] = { ...newTasks[index], concluida: !newTasks[index].concluida };
      onUpdateTasks(selectedClient.id, newTasks);
    };

    const updateTaskDate = (index: number, campo: string, amount: string) => {
      const newTasks = [...tasksAtuais];
      newTasks[index] = { ...newTasks[index], [campo]: amount };
      onUpdateTasks(selectedClient.id, newTasks);
    };

    return (
      <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => onSelectClient(null)} style={{ padding: '12px 16px', borderRadius: 12, backgroundColor: '#fff', color: '#1b1c1b', border: '1px solid #e5e7eb', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, minHeight: 44 }}>
            ← Back
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? 16 : 24 }}>
          {/* Perfil Card */}
          <div style={{ backgroundColor: '#fff', borderRadius: 24, padding: isMobile ? 20 : 32, border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #F25C05 0%, #F22283 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 24, flexShrink: 0 }}>
                {selectedClient.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, color: '#1b1c1b', marginBottom: 8 }}>{selectedClient.name}</h2>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, padding: '4px 12px', borderRadius: 100, fontWeight: 800, backgroundColor: '#fcf9f7', color: '#F25C05', border: '1px solid rgba(242, 92, 5, 0.1)' }}>
                    {getCategoryLabel(selectedClient.category)}
                  </span>
                  <button
                    onClick={() => { 
                      const currentIndex = PROCESSOS.findIndex(p => p.id === (selectedClient.stage || "started")); 
                      const nextIndex = (currentIndex + 1) % PROCESSOS.length; 
                      onUpdateStage(selectedClient.id, PROCESSOS[nextIndex].id); 
                    }}
                    style={{ fontSize: 10, padding: '4px 12px', borderRadius: 100, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#f3f4f6', color: '#4b5563', border: 'none' }}
                  >
                    <StageIcon size={12} strokeWidth={3} />
                    {currentStage.label}
                  </button>
                  <button
                    onClick={() => window.open(`/client/${selectedClient.id}`, '_blank')}
                    style={{ fontSize: 10, padding: '4px 12px', borderRadius: 100, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#F25C05', color: '#fff', border: 'none' }}
                  >
                    <ExternalLink size={12} strokeWidth={3} />
                    Full client profile
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 32 }}>
              {selectedClient.category === "client" && (
                <button onClick={() => onInvoice(selectedClient)} style={{ flex: 1, padding: '14px 20px', borderRadius: 16, backgroundColor: '#10B981', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: 13, minHeight: 48, boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)' }}>Generate invoice</button>
              )}
              <button onClick={() => onEdit(selectedClient)} style={{ flex: 1, padding: '14px 20px', borderRadius: 16, backgroundColor: '#fff', color: '#1b1c1b', border: '1px solid #e5e7eb', fontWeight: 800, cursor: 'pointer', fontSize: 13, minHeight: 48 }}>Edit</button>
              <button onClick={() => { if (confirm("Delete this client?")) onDelete(selectedClient.id); }} style={{ flex: 1, padding: '14px 20px', borderRadius: 16, backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: 13, minHeight: 48 }}>Delete</button>
            </div>
          </div>

          {/* Contact Card */}
          <div style={{ backgroundColor: '#fff', borderRadius: 24, padding: isMobile ? 20 : 32, border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: 11, fontWeight: 900, color: '#8e7165', textTransform: 'uppercase', marginBottom: 24, letterSpacing: '1px' }}>Contact details</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#fcf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={16} color="#F25C05" /></div>
                <span style={{ color: '#1b1c1b', fontWeight: 600, fontSize: 14 }}>{selectedClient.mobile || "—"}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#fcf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={16} color="#F25C05" /></div>
                <span style={{ color: '#1b1c1b', fontWeight: 600, fontSize: 14 }}>{selectedClient.email || "—"}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#fcf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={16} color="#F25C05" /></div>
                <span style={{ color: '#1b1c1b', fontWeight: 600, fontSize: 14 }}>{selectedClient.address || "—"}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#fcf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building size={16} color="#F25C05" /></div>
                <span style={{ color: '#1b1c1b', fontWeight: 600, fontSize: 14 }}>{selectedClient.taxId || "—"} (tax ID)</span>
            </div>
          </div>

          {/* Faturas Section */}
          <div style={{ marginTop: 32, backgroundColor: '#fff', borderRadius: 24, padding: isMobile ? 20 : 32, border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1b1c1b', marginBottom: 4 }}>Invoicing</h3>
              <button onClick={() => onInvoice(selectedClient)} style={{ padding: '10px 20px', borderRadius: 12, backgroundColor: '#F25C05', color: '#fff', border: 'none', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>+ New invoice</button>
            </div>
            {selectedClient.invoiceIds && selectedClient.invoiceIds.length > 0 ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {selectedClient.invoiceIds.slice(0, 5).map((invoiceId: string, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#fcf9f7', borderRadius: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1b1c1b' }}>Invoice #{idx + 1}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>ID: {invoiceId.slice(0, 8)}...</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#6366f1' }}>View →</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <FileText size={32} color="#f0edeb" style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 13, color: '#8e7165', fontWeight: 600 }}>No invoices yet</div>
              </div>
            )}
          </div>
        </div>

          {/* Budget Card */}
          <div style={{ backgroundColor: '#fff', borderRadius: 24, padding: isMobile ? 20 : 32, border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: 11, fontWeight: 900, color: '#8e7165', textTransform: 'uppercase', marginBottom: 24, letterSpacing: '1px' }}>Quote</h3>
            {selectedClient.proposalNumber ? (
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8e7165', fontSize: 13, fontWeight: 600 }}>Number</span>
                  <a href={`/admin/quote?edit=${selectedClient.proposalId}`} target="_blank" style={{ color: '#F25C05', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>{selectedClient.proposalNumber}</a>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8e7165', fontSize: 13, fontWeight: 600 }}>Amount</span>
                  <span style={{ color: '#1b1c1b', fontWeight: 900, fontSize: 20 }}>{selectedClient.proposalAmount?.toLocaleString()} €</span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <a href={`/p/${selectedClient.proposalId}`} target="_blank" style={{ width: '100%', padding: '14px', borderRadius: 12, backgroundColor: '#1b1c1b', color: '#fff', fontSize: 12, fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48 }}>
                    <FileText size={16} /> View proposal online
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <FileText size={32} color="#f0edeb" style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 13, color: '#8e7165', fontWeight: 600 }}>No linked quote</div>
                <button onClick={() => onLinkProposal(selectedClient)} style={{ marginTop: 16, width: '100%', padding: '14px', borderRadius: 12, backgroundColor: '#F25C05', color: '#fff', border: 'none', fontSize: 12, fontWeight: 800, cursor: 'pointer', minHeight: 48 }}>Link proposal</button>
              </div>
            )}
          </div>

          {/* History Card */}
          <div style={{ backgroundColor: '#fff', borderRadius: 24, padding: isMobile ? 20 : 32, border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: 11, fontWeight: 900, color: '#8e7165', textTransform: 'uppercase', marginBottom: 24, letterSpacing: '1px' }}>History</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#fcf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={16} color="#F25C05" /></div>
                <span style={{ color: '#8e7165', fontSize: 13, fontWeight: 600 }}>Joined</span>
                <span style={{ color: '#1b1c1b', fontSize: 13, fontWeight: 800, marginLeft: 'auto' }}>
                  {selectedClient.createdAt ? new Date(selectedClient.createdAt).toLocaleDateString("en-GB") : "—"}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#fcf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={16} color="#F25C05" /></div>
                <span style={{ color: '#8e7165', fontSize: 13, fontWeight: 600 }}>Source</span>
                <span style={{ fontSize: 10, padding: '4px 12px', borderRadius: 100, fontWeight: 800, marginLeft: 'auto', backgroundColor: '#fcf9f7', color: '#F25C05', border: '1px solid rgba(242, 92, 5, 0.1)' }}>{selectedClient.source || "Simulator"}</span>
              </div>
              {selectedClient.responseDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#fcf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={16} color="#F25C05" /></div>
                  <span style={{ color: '#8e7165', fontSize: 13, fontWeight: 600 }}>Response date</span>
                  <span style={{ color: '#1b1c1b', fontSize: 13, fontWeight: 800, marginLeft: 'auto' }}>{new Date(selectedClient.responseDate).toLocaleDateString("en-GB")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Vendedor Card */}
          <div style={{ backgroundColor: '#fff', borderRadius: 24, padding: isMobile ? 20 : 32, border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: 11, fontWeight: 900, color: '#8e7165', textTransform: 'uppercase', marginBottom: 24, letterSpacing: '1px' }}>Sales rep / collaborator</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#fcf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} color="#F25C05" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#8e7165' }}>Owner</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1b1c1b' }}>{salesRepName}</div>
              </div>
            </div>
            {selectedClient.lastContactDate && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Clock size={16} color="#F25C05" />
                  <span style={{ fontSize: 12, color: '#8e7165' }}>Last contact:</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1b1c1b' }}>
                    {new Date(selectedClient.lastContactDate).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Work Plan Section */}
        {selectedClient.category === "client" && (
          <div style={{ marginTop: 32, backgroundColor: '#fff', borderRadius: 24, padding: isMobile ? 20 : 32, border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1b1c1b', marginBottom: 4 }}>Work plan</h3>
                <p style={{ fontSize: 13, color: '#8e7165', fontWeight: 600 }}>
                  {selectedClient.services && selectedClient.services.length > 0
                    ? `Services: ${selectedClient.services.join(", ")}`
                    : "Set tasks and delivery deadlines"}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#8e7165', textTransform: 'uppercase', marginBottom: 4 }}>Progress</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#10B981' }}>{tasksAtuais.filter((t: any) => t.concluida).length} / {tasksAtuais.length}</div>
                </div>
                <div style={{ width: 120, height: 10, backgroundColor: '#f3f4f6', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', backgroundColor: '#10B981', borderRadius: 100, width: `${(tasksAtuais.filter((t: any) => t.concluida).length / tasksAtuais.length) * 100 || 0}%`, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {tasksAtuais.map((task: any, index: number) => {
                const Icon = task.icon || FileText;
                return (
                  <div key={index} style={{ borderRadius: 20, padding: 20, border: `2px solid ${task.concluida ? '#10B981' : '#f3f4f6'}`, backgroundColor: task.concluida ? '#f0fdf4' : '#fff', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                      <button
                        onClick={() => toggleTask(index)}
                        style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: task.concluida ? 'none' : '2px solid #e5e7eb', backgroundColor: task.concluida ? '#10B981' : '#fff' }}
                      >
                        {task.concluida && <Check size={16} color="#fff" strokeWidth={4} />}
                      </button>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#1b1c1b', textDecoration: task.concluida ? 'line-through' : 'none', opacity: task.concluida ? 0.5 : 1 }}>{task.name}</div>
                        <div style={{ fontSize: 12, color: '#8e7165', marginTop: 4, fontWeight: 500 }}>{task.description}</div>
                      </div>
                      <Icon size={20} color={task.concluida ? "#10B981" : "#F25C05"} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 800, color: '#8e7165', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Start</label>
                        <input
                          type="date"
                          value={task.startDate || ""}
                          onChange={(e) => updateTaskDate(index, "dataInicio", e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12, fontWeight: 600, fontFamily: 'Montserrat' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 800, color: '#8e7165', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Due</label>
                        <input
                          type="date"
                          value={task.deliveryDate || ""}
                          onChange={(e) => updateTaskDate(index, "deliveryDate", e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12, fontWeight: 600, fontFamily: 'Montserrat' }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 24 }}>
        <div>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#F25C05', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>CRM & Pipeline</span>
          <h1 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 900, color: '#1b1c1b', letterSpacing: '-1.5px', lineHeight: 1 }}>Clients</h1>
          <p style={{ color: '#5a4137', marginTop: 12, fontSize: 15, fontWeight: 500 }}>{clients.length} contacts in the pipeline.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={toggleViewMode} 
            style={{ padding: '16px', borderRadius: 16, backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 10px 25px rgba(0,0,0,0.02)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={viewMode === 'cards' ? "Table view" : "Card view"}
          >
            {viewMode === 'cards' ? <AlignJustify size={20} color="#F25C05" /> : <Grid size={20} color="#F25C05" />}
          </button>
          <button onClick={onNewClient} style={{ padding: '16px 32px', borderRadius: 16, background: 'linear-gradient(135deg, #F25C05 0%, #F22283 100%)', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: 14, boxShadow: '0 10px 25px rgba(242,92,5,0.2)' }}>+ New client</button>
        </div>
      </div>

      {/* Filters Bento Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32, alignItems: 'center' }}>
        <div style={{ flex: '1 1 300px', backgroundColor: '#fff', borderRadius: 20, padding: '4px 16px', display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.02)' }}>
          <Search size={18} color="#8e7165" />
          <input 
            placeholder="Search by name, email, company, tax ID or phone…" 
            value={search} 
            onChange={(e) => onSearchChange(e.target.value)} 
            style={{ width: '100%', border: 'none', padding: '14px', fontSize: 14, fontWeight: 600, outline: 'none', color: '#1b1c1b' }} 
          />
        </div>
        
        {/* Filtro Vendedor */}
        <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '4px 16px', display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.02)', minWidth: 200 }}>
          <User size={18} color="#8e7165" />
          <select value={filterSalesRep} onChange={(e) => setFilterSalesRep(e.target.value)} style={{ width: '100%', border: 'none', padding: '14px', fontSize: 13, fontWeight: 700, outline: 'none', color: '#5a4137', background: 'transparent' }}>
            <option value="all">All sales reps</option>
            {salesRepsList.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        
        {/* Filtro Categoria */}
        <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '4px 16px', display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.02)' }}>
          <Filter size={18} color="#8e7165" />
          <select value={filterCategory} onChange={(e) => onFilterCategoryChange(e.target.value)} style={{ width: '100%', border: 'none', padding: '14px', fontSize: 13, fontWeight: 700, outline: 'none', color: '#5a4137', background: 'transparent' }}>
            <option value="all">Category: All</option>
            <option value="client">Client</option>
            <option value="potential">Lead</option>
            <option value="curious">Curious</option>
          </select>
        </div>
        
        {/* Filtro Ordenar */}
        <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '4px 16px', display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.02)' }}>
          <BarChart3 size={18} color="#8e7165" />
          <select value={sortBy} onChange={(e) => onSortByChange(e.target.value)} style={{ width: '100%', border: 'none', padding: '14px', fontSize: 13, fontWeight: 700, outline: 'none', color: '#5a4137', background: 'transparent' }}>
            <option value="createdAt">Sort: Date</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
        
        <button 
          onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")} 
          style={{ padding: '14px 20px', borderRadius: 20, border: '1px solid rgba(0,0,0,0.02)', backgroundColor: '#fff', cursor: 'pointer', fontWeight: 800, color: '#F25C05', fontSize: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
        >
          {sortOrder === "asc" ? "↑ ASC" : "↓ DESC"}
        </button>
      </div>
      
      {/* Filtros de fecha */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#5a4137' }}>From:</span>
          <input type="date" value={filterDataDesde} onChange={(e) => setFilterDataDesde(e.target.value)} style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#5a4137' }}>To:</span>
          <input type="date" value={filterDataHasta} onChange={(e) => setFilterDataHasta(e.target.value)} style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }} />
        </div>
        <button onClick={() => { setFilterDataDesde(''); setFilterDataHasta(''); }} style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', fontSize: 12, fontWeight: 600, color: '#666', cursor: 'pointer' }}>Clear dates</button>
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={exportarExcelFiltered} style={{ padding: '10px 16px', borderRadius: 12, backgroundColor: '#10b981', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={14} /> Export filtered ({clientsFiltered.length})
          </button>
          <button onClick={exportarBackupTotal} style={{ padding: '10px 16px', borderRadius: 12, backgroundColor: '#6366f1', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={14} /> Full backup ({clients.length})
          </button>
        </div>
      </div>

      {/* List / Table View */}
      {viewMode === 'table' && !isMobile ? (
        <div style={{ backgroundColor: '#fff', borderRadius: 24, overflowX: 'auto', border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <table style={{ width: '100%', minWidth: 1400, borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#fcf9f7', position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Name</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Category</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Company</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Tax ID</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Phone</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Email</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Source</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Process</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Website</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Address</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Postcode</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>City</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Services</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Quotes</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Proposal</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Invoice</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Notes</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Sales rep</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Last contact</th>
                <th style={{ padding: '12px 16px', color: '#8e7165', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', textAlign: 'center', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const salesRep = salesReps.find(v => v.id === c.salesRepId);
                return (
                <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <button 
                      onClick={() => onSelectClient(c)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 700, color: '#1b1c1b', fontSize: 13 }}
                    >
                      {c.name}
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 8, fontWeight: 700, backgroundColor: c.category === 'client' ? '#d1fae5' : '#fef3c7', color: '#374151' }}>
                      {getCategoryLabel(c.category)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1b1c1b', fontSize: 12, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.company || '—'}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#5a4137', fontSize: 12 }}>{c.taxId || '—'}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500, color: '#5a4137', fontSize: 12 }}>{c.mobile || '—'}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500, color: '#8e7165', fontSize: 11, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email || '—'}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#5a4137', fontSize: 11 }}>{c.source || '—'}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 8, fontWeight: 700, backgroundColor: '#f3f4f6', color: '#4b5563' }}>
                      {c.stage || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {c.website ? (
                      <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" style={{ fontSize: 10, color: '#3498DB', textDecoration: 'none', maxWidth: 80, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.website}
                      </a>
                    ) : <span style={{ color: '#ccc', fontSize: 11 }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, color: '#666', maxWidth: 100, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address || '—'}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, color: '#666' }}>{c.postalCode || '—'}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, color: '#666' }}>{c.city || '—'}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 10, color: '#666', maxWidth: 80, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {Array.isArray(c.services) ? c.services.join(', ') : (c.services || '—')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {c.quoteIds?.length > 0 ? (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#F25C05' }}>{c.quoteIds.length}</span>
                    ) : <span style={{ color: '#ccc', fontSize: 11 }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {c.proposalId ? (
                      <a href={`/p/${c.proposalId}`} target="_blank" style={{ fontSize: 10, color: '#3498DB', textDecoration: 'none', fontWeight: 600 }}>View →</a>
                    ) : <span style={{ color: '#ccc', fontSize: 11 }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {c.invoiceIds?.length > 0 ? (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#6366f1' }}>{c.invoiceIds.length}</span>
                    ) : <span style={{ color: '#ccc', fontSize: 11 }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 10, color: '#666', maxWidth: 80, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.salesRepNotes || '—'}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontWeight: 600, color: '#1b1c1b', fontSize: 12 }}>{salesRep ? salesRep.name : '—'}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, color: '#666' }}>{c.lastContactDate ? c.lastContactDate.split('T')[0] : '—'}</span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(c); }} 
                        title="Edit" 
                        style={{ padding: '6px 10px', borderRadius: 6, backgroundColor: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); if (confirm('Delete this client?')) onDelete(c.id); }} 
                        title="Delete" 
                        style={{ padding: '6px 10px', borderRadius: 6, backgroundColor: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      ) : (
      <div style={{ display: 'grid', gap: 16 }}>
        {filtered.map((c, i) => {
          const proceso = getStageInfo(c.stage || "started");
          const StageIcon = proceso.icon;
          return (
            <div 
              key={`${c.id}-${i}`} 
              onClick={() => onSelectClient(c)}
              style={{ position: 'relative', backgroundColor: '#fff', borderRadius: 24, padding: 24, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'all 0.3s ease', overflow: 'hidden' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Status Accent Bar */}
              <div style={{ position: 'absolute', left: 0, top: 16, bottom: 16, width: 6, backgroundColor: c.category === 'client' ? '#10B981' : '#F25C05', borderRadius: '0 4px 4px 0' }}></div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1, width: '100%' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #fcf9f7 0%, #f0edeb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F25C05', fontWeight: 900, fontSize: 20, flexShrink: 0 }}>
                  {c.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1b1c1b', marginBottom: 4 }}>{c.name}</h3>
                  <p style={{ fontSize: 13, color: '#8e7165', fontWeight: 600 }}>{c.email || '—'}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: isMobile ? 16 : 30, width: isMobile ? '100%' : 'auto', minWidth: isMobile ? '100%' : 600 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#8e7165', textTransform: 'uppercase', marginBottom: 4 }}>Category</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#F25C05' }}>{getCategoryLabel(c.category)}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#8e7165', textTransform: 'uppercase', marginBottom: 4 }}>Process</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1b1c1b', fontWeight: 800, fontSize: 14 }}>
                    <StageIcon size={14} strokeWidth={3} />
                    {proceso.label}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#8e7165', textTransform: 'uppercase', marginBottom: 4 }}>Quote</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#1b1c1b' }}>{c.proposalAmount ? `${c.proposalAmount.toLocaleString()} €` : '—'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#8e7165', textTransform: 'uppercase', marginBottom: 4 }}>Sales rep</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#666' }}>{salesReps.find(v => v.id === c.salesRepId)?.name || '—'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#8e7165', textTransform: 'uppercase', marginBottom: 4 }}>Invoices</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#6366f1' }}>{c.invoiceIds?.length || 0}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: isMobile ? '100%' : 'auto' }}>
                {!c.proposalId && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); window.open(`/admin/quote?client=${c.id}`, '_blank'); }}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: 12, backgroundColor: '#F25C05', color: '#fff', border: 'none', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                  >
                    + Proposal
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); onSelectClient(c); }}
                  style={{ flex: 1, padding: '12px 20px', borderRadius: 12, backgroundColor: '#1b1c1b', color: '#fff', border: 'none', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                >
                  Manage
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(c); }}
                  style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#fcf9f7', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Edit size={18} color="#F25C05" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); if(confirm("Delete this client?")) onDelete(c.id); }}
                  style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(220, 38, 38, 0.05)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Trash2 size={18} color="#dc2626" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
