import React, { useState } from "react";
import { Task, Client, SalesRep } from "../../types";
import { updateTask, assignTask, approveTask, markTaskPaid, requestTask, TaskStatus } from "../../services/tasks";
import { sendDeliveryApprovalEmail } from "../../services/emailService";

const COLUMNAS = [
  { id: "available", label: "Available", color: "#22c55e", bg: "#dcfce7" },
  { id: "pending_assignment", label: "Awaiting approval", color: "#f59e0b", bg: "#fef3c7" },
  { id: "assigned", label: "Assigned", color: "#3b82f6", bg: "#dbeafe" },
  { id: "in_analysis", label: "In analysis", color: "#8b5cf6", bg: "#ede9fe" },
  { id: "in_progress", label: "In progress", color: "#ec4899", bg: "#fce7f3" },
  { id: "in_revision", label: "In review", color: "#14b8a6", bg: "#ccfbf1" },
  { id: "approved", label: "Approved", color: "#10b981", bg: "#d1fae5" },
  { id: "delivered", label: "Delivered", color: "#f97316", bg: "#ffedd5" },
  { id: "paid", label: "Paid", color: "#65a30d", bg: "#ecfccb" },
];

interface Props {
  tasks: Task[];
  clients: Client[];
  salesReps: SalesRep[];
  isAdmin: boolean;
  salesRepId?: string;
  onRefresh: () => void;
  clientIdFilter?: string;
  onVerRecord?: (id: string) => void;
}

export function TasksKanban({ tasks, salesReps, isAdmin, salesRepId, onRefresh, clientIdFilter, onVerRecord }: Props) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [asignModal, setAsignModal] = useState<Task | null>(null);
  const [selectedSalesRep, setSelectedSalesRep] = useState("");
  const [prazo, setPrazo] = useState("");
  const [commissionAmount, setCommissionAmount] = useState<number | undefined>(undefined);
  const [commissionType, setCommissionType] = useState<'fixed' | 'percentage'>('fixed');
  const [loading, setLoading] = useState(false);

  const tasksFiltered = clientIdFilter
    ? tasks.filter(t => t.clientId === clientIdFilter)
    : tasks;

  const getCol = (t: Task) => {
    return t.status;
  };

  const handleDragStart = (id: string) => { if (isAdmin) setDraggedId(id); };
  const handleDragOver = (e: React.DragEvent, colId: string) => { e.preventDefault(); if (isAdmin) setOverCol(colId); };
  const handleDrop = async (colId: string) => {
    if (!isAdmin || !draggedId) return;
    setDraggedId(null); setOverCol(null);
    try { 
      await updateTask(draggedId, { status: colId as TaskStatus }); 
      onRefresh(); 
    } catch (err) { 
      console.error('Error moving task:', err); 
      alert('Could not move task. Please try again.');
    }
  };

  const handleAssign = async () => {
    if (!asignModal || !selectedSalesRep || !prazo) return;
    setLoading(true);
    // FIXED: Added error handling
    try {
      const salesRepName = getSalesRepName(selectedSalesRep);
      await assignTask(asignModal.id, selectedSalesRep, salesRepName, prazo, commissionAmount, commissionType);
      setAsignModal(null); setSelectedSalesRep(""); setPrazo(""); setCommissionAmount(undefined); setCommissionType("fixed");
      onRefresh();
    } catch (err) { 
      console.error('Error assigning task:', err); 
      alert('Could not assign task. Please try again.');
    }
    setLoading(false);
  };

  const handleApprove = async (t: Task) => {
    setLoading(true);
    // FIXED: Added error handling
    try { 
      await approveTask(t.id); 
      if (t.clientEmail) {
        await sendDeliveryApprovalEmail(
          t.clientEmail,
          t.clientName || 'Client',
          t.title,
          `${window.location.origin}/c/${t.clientId}`
        );
      }
      onRefresh(); 
    } catch (err) { 
      console.error('Error approving task:', err); 
      alert('Could not approve task. Please try again.');
    }
    setLoading(false);
  };

  const handlePaid = async (t: Task) => {
    setLoading(true);
    // FIXED: Added error handling
    try { 
      await markTaskPaid(t.id); 
      onRefresh(); 
    } catch (err) { 
      console.error('Error marking task as paid:', err); 
      alert('Could not process payment. Please try again.');
    }
    setLoading(false);
  };

  const handleRequest = async (t: Task) => {
    if (!salesRepId) return;
    const salesRepName = getSalesRepName(salesRepId);
    setLoading(true);
    try { 
      await requestTask(t.id, salesRepId, salesRepName); 
      onRefresh(); 
    } catch (err) { 
      console.error('Error requesting task:', err); 
      alert('Could not request task. Please try again.');
    }
    setLoading(false);
  };

  const getSalesRepName = (id?: string) => salesReps.find(v => v.id === id)?.name || id || "—";

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 10px", borderRadius: 8,
    border: "1px solid #ddd", fontSize: 13, marginBottom: 8, fontFamily: "inherit"
  };

  const btnStyle = (color: string): React.CSSProperties => ({
    padding: "7px 14px", borderRadius: 8, border: "none",
    backgroundColor: color, color: "#fff", fontSize: 12,
    fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
  });

  return (
    <div style={{ overflowX: "auto", paddingBottom: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", minWidth: 1200 }}>
        {COLUMNAS.map(col => {
          const cards = tasksFiltered.filter(t => getCol(t) === col.id);
          return (
            <div
              key={col.id}
              onDragOver={e => handleDragOver(e, col.id)}
              onDrop={() => handleDrop(col.id)}
              onDragLeave={() => setOverCol(null)}
              style={{
                flex: "0 0 170px", backgroundColor: "#F8F7F4",
                borderRadius: 12, padding: 10,
                border: overCol === col.id ? `2px solid ${col.color}` : "1.5px solid #E8E6E0",
                minHeight: 300, transition: "border 0.15s"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: col.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{col.label}</span>
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, backgroundColor: col.bg, color: col.color, fontWeight: 700 }}>{cards.length}</span>
              </div>

              {cards.map(t => {
                const alreadyRequested = t.requesters?.includes(salesRepId || "");
                const esMia = t.assignedA === salesRepId;
                const visibleForColab = col.id === "available" || col.id === "application" || esMia;
                if (!isAdmin && !visibleForColab) return null;

                return (
                  <div
                    key={t.id}
                    draggable={isAdmin}
                    onDragStart={() => handleDragStart(t.id)}
                    onClick={() => setModalTask(t)}
                    style={{
                      backgroundColor: "#fff", borderRadius: 10, padding: "10px 12px",
                      marginBottom: 8, border: "1px solid #E8E6E0",
                      cursor: isAdmin ? "grab" : "pointer",
                      opacity: draggedId === t.id ? 0.4 : 1,
                      borderLeft: `3px solid ${col.color}`
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1A1A1A", marginBottom: 3 }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>{t.clientName}</div>
                    {t.assignedName && (
                      <div style={{ fontSize: 10, color: "#888", marginBottom: 4 }}>
                        👤 {t.assignedName}
                      </div>
                    )}
                    {isAdmin && t.requesters && t.requesters.length > 0 && !t.assignedA && (
                      <div style={{ fontSize: 10, color: "#D97706", fontWeight: 700, marginBottom: 4 }}>
                        🙋‍♂️ {t.requesters.length} applicants
                      </div>
                    )}
                    {t.prazo && (
                      <div style={{ fontSize: 10, color: "#F25C05", marginBottom: 4 }}>📅 {t.prazo}</div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, backgroundColor: col.bg, color: col.color, fontWeight: 600 }}>
                        {t.periodicidade === "monthly" ? "🔄 Monthly" : "📌 One-off"}
                      </span>
                      {!isAdmin && col.id === "available" && (
                        <button
                          onClick={e => { e.stopPropagation(); handleRequest(t); }}
                          style={{ ...btnStyle("#F25C05"), padding: "4px 10px", fontSize: 10 }}
                        >
                          {alreadyRequested ? "Requested" : "Request"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Task detail modal */}
      {modalTask && (
        <div onClick={() => setModalTask(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 500, maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A" }}>{modalTask.title}</h3>
              <button onClick={() => setModalTask(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888" }}>×</button>
            </div>

            <div style={{ fontSize: 13, color: "#444", marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              👤 Client: <strong>{modalTask.clientName}</strong>
              <button 
                onClick={() => { setModalTask(null); onVerRecord?.(modalTask.clientId); }} 
                style={{ background: 'none', border: 'none', color: '#F25C05', cursor: 'pointer', fontSize: 11, fontWeight: 700, textDecoration: 'underline' }}
              >
                View profile
              </button>
            </div>
            {modalTask.assignedName && <div style={{ fontSize: 13, color: "#444", marginBottom: 8 }}>🛠 Collaborator: <strong>{modalTask.assignedName}</strong></div>}
            {modalTask.prazo && <div style={{ fontSize: 13, color: "#F25C05", marginBottom: 8 }}>📅 Due: <strong>{modalTask.prazo}</strong></div>}
            {modalTask.periodicidade && <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>🔁 {modalTask.periodicidade === "monthly" ? "Monthly" : "One-off"}</div>}

            {modalTask.description && (
              <div style={{ backgroundColor: "#F8F7F4", borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 12, color: "#444", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                {modalTask.description}
              </div>
            )}

            {modalTask.deliveryLinks && modalTask.deliveryLinks.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A", marginBottom: 4 }}>Delivery:</div>
                <a href={modalTask.deliveryLinks[0]} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#2563EB" }}>{modalTask.deliveryLinks[0]}</a>
              </div>
            )}
            {modalTask.deliveryNote && (
              <div style={{ fontSize: 12, color: "#555", backgroundColor: "#F0F9FF", borderRadius: 8, padding: 10, marginBottom: 12 }}>{modalTask.deliveryNote}</div>
            )}

            {isAdmin && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                {modalTask.status === "available" && (
                  <button onClick={() => { setAsignModal(modalTask); setModalTask(null); }} style={btnStyle("#F25C05")}>Assign collaborator</button>
                )}
                {modalTask.status === "delivered" && (
                  <button onClick={() => { handleApprove(modalTask); setModalTask(null); }} style={btnStyle("#059669")}>Approve delivery</button>
                )}
                {modalTask.status === "approved_client" && (
                  <button onClick={() => { handlePaid(modalTask); setModalTask(null); }} style={btnStyle("#9333EA")}>Mark as paid</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assign collaborator modal */}
      {asignModal && (
        <div onClick={() => setAsignModal(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 380 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Assign — {asignModal.title}</h3>
            <select value={selectedSalesRep} onChange={e => setSelectedSalesRep(e.target.value)} style={inputStyle}>
              <option value="">Select collaborator…</option>
              {salesReps.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            <input type="date" value={prazo} onChange={e => setPrazo(e.target.value)} style={inputStyle} />
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input type="number" placeholder="Commission" value={commissionAmount || ''} onChange={e => setCommissionAmount(Number(e.target.value) || undefined)} style={{ ...inputStyle, marginBottom: 0, flex: 1 }} />
              <select value={commissionType} onChange={e => setCommissionType(e.target.value as any)} style={{ ...inputStyle, marginBottom: 0, width: 110 }}>
                <option value="fixed">Fixed €</option>
                <option value="percentage">% of value</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={handleAssign} disabled={loading || !selectedSalesRep || !prazo} style={btnStyle("#F25C05")}>Confirm</button>
              <button onClick={() => setAsignModal(null)} style={{ ...btnStyle("#888"), backgroundColor: "#eee", color: "#444" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
