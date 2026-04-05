import { theme } from "../styles/theme";

export const getStatusColor = (p: { resposta?: string; dataEnvio?: string }): string => {
  if (p.resposta === "sim") return "#10B981";
  if (p.resposta === "nao") return "#DC2626";
  if (p.resposta === "reagendar" || p.resposta === "reagendado") return "#F59E0B";
  if (p.dataEnvio) return "#3498DB";
  return "#9CA3AF";
};

export const getStatusLabel = (p: { resposta?: string; dataEnvio?: string }): string => {
  if (p.resposta === "sim") return "✓ Aceite";
  if (p.resposta === "nao") return "✕ Recusado";
  if (p.resposta === "reagendar" || p.resposta === "reagendado") return "↻ Reagendado";
  if (p.dataEnvio) return "Enviada";
  return "Pendente";
};

export const getStatusColorDashboard = (status: string): string => {
  if (status === "pendente") return theme.colors.accent.primary;
  if (status === "em-analise") return "#3498DB";
  return theme.colors.status.success;
};

export const getStatusLabelDashboard = (status: string): string => {
  if (status === "pendente") return "Pendente";
  if (status === "em-analise") return "Em Análise";
  return "Concluída";
};

export const getProposalStatusBadge = (p: { resposta?: string; dataEnvio?: string }) => {
  if (p.resposta === "sim") return { color: "#dcfce7", text: "✓ Aceito", textColor: "#16a34a" };
  if (p.resposta === "nao") return { color: "#fee2e2", text: "✕ Recusado", textColor: "#dc2626" };
  if (p.resposta === "reagendar") return { color: "#fef3c7", text: "↻ Reagendado", textColor: "#d97706" };
  if (p.dataEnvio) return { color: "#E8F4FD", text: "Enviada", textColor: "#3498DB" };
  return { color: "#f3f4f6", text: "Pendente", textColor: "#9ca3af" };
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
  if (cat === "cliente") return "Cliente";
  if (cat === "proposta_enviada") return "Proposta Enviada";
  if (cat === "potencial") return "Potencial";
  if (cat === "curioso") return "Curioso";
  if (cat === "sem_interesse") return "Sem Interesse";
  return cat;
};