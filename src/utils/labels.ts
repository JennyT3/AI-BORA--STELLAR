import { theme } from "../styles/theme";

/** Display helpers: comparison values match persisted Firestore fields. */
export const getStatusColor = (p: { resposta?: string; dataEnvio?: string }): string => {
  if (p.resposta === "sim") return "#10B981";
  if (p.resposta === "nao") return "#DC2626";
  if (p.resposta === "reagendar" || p.resposta === "reagendado") return "#F59E0B";
  if (p.dataEnvio) return "#3498DB";
  return "#9CA3AF";
};

export const getStatusLabel = (p: { resposta?: string; dataEnvio?: string }): string => {
  if (p.resposta === "sim") return "✓ Accepted";
  if (p.resposta === "nao") return "✕ Declined";
  if (p.resposta === "reagendar" || p.resposta === "reagendado") return "↻ Rescheduled";
  if (p.dataEnvio) return "Sent";
  return "Pending";
};

export const getStatusColorDashboard = (status: string): string => {
  if (status === "pendente") return theme.colors.accent.primary;
  if (status === "em-analise") return "#3498DB";
  return theme.colors.status.success;
};

export const getStatusLabelDashboard = (status: string): string => {
  if (status === "pendente") return "Pending";
  if (status === "em-analise") return "Under review";
  return "Completed";
};

export const getProposalStatusBadge = (p: { resposta?: string; dataEnvio?: string }) => {
  if (p.resposta === "sim") return { color: "#dcfce7", text: "✓ Accepted", textColor: "#16a34a" };
  if (p.resposta === "nao") return { color: "#fee2e2", text: "✕ Declined", textColor: "#dc2626" };
  if (p.resposta === "reagendar") return { color: "#fef3c7", text: "↻ Rescheduled", textColor: "#d97706" };
  if (p.dataEnvio) return { color: "#E8F4FD", text: "Sent", textColor: "#3498DB" };
  return { color: "#f3f4f6", text: "Pending", textColor: "#9ca3af" };
};

export const getCategoriaClasses = (cat: string): string => {
  if (cat === "cliente") return "bg-emerald-50 text-emerald-600";
  if (cat === "proposta_enviada") return "bg-amber-50 text-amber-600";
  if (cat === "potencial") return "bg-orange-50 text-orange-600";
  if (cat === "curioso") return "bg-violet-50 text-violet-600";
  if (cat === "sem_interesse") return "bg-red-50 text-red-600";
  return "bg-gray-100 text-gray-500";
};

export const getCategoriaLabel = (cat: string): string => {
  if (cat === "cliente") return "Client";
  if (cat === "proposta_enviada") return "Proposal sent";
  if (cat === "potencial") return "Potential";
  if (cat === "curioso") return "Curious";
  if (cat === "sem_interesse") return "Not interested";
  return cat;
};
