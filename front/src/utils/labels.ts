import { theme } from "../styles/theme";

/** Display helpers: comparison values match persisted Firestore fields. */
export const getStatusColor = (p: { response?: string; sentAt?: string }): string => {
  if (p.response === "yes") return "#10B981";
  if (p.response === "not") return "#DC2626";
  if (p.response === "reschedule" || p.response === "rescheduled") return "#F59E0B";
  if (p.sentAt) return "#3498DB";
  return "#9CA3AF";
};

export const getStatusLabel = (p: { response?: string; sentAt?: string }): string => {
  if (p.response === "yes") return "✓ Accepted";
  if (p.response === "not") return "✕ Declined";
  if (p.response === "reschedule" || p.response === "rescheduled") return "↻ Rescheduled";
  if (p.sentAt) return "Sent";
  return "Pending";
};

export const getStatusColorDashboard = (status: string): string => {
  if (status === "pending") return theme.colors.accent.primary;
  if (status === "em-analise") return "#3498DB";
  return theme.colors.status.success;
};

export const getStatusLabelDashboard = (status: string): string => {
  if (status === "pending") return "Pending";
  if (status === "em-analise") return "Under review";
  return "Completed";
};

export const getProposalStatusBadge = (p: { response?: string; sentAt?: string }) => {
  if (p.response === "yes") return { color: "#dcfce7", text: "✓ Accepted", textColor: "#16a34a" };
  if (p.response === "not") return { color: "#fee2e2", text: "✕ Declined", textColor: "#dc2626" };
  if (p.response === "reschedule") return { color: "#fef3c7", text: "↻ Rescheduled", textColor: "#d97706" };
  if (p.sentAt) return { color: "#E8F4FD", text: "Sent", textColor: "#3498DB" };
  return { color: "#f3f4f6", text: "Pending", textColor: "#9ca3af" };
};

export const getCategoryClasses = (cat: string): string => {
  if (cat === "client") return "bg-emerald-50 text-emerald-600";
  if (cat === "proposal_sent") return "bg-amber-50 text-amber-600";
  if (cat === "potential") return "bg-orange-50 text-orange-600";
  if (cat === "curious") return "bg-violet-50 text-violet-600";
  if (cat === "not_interested") return "bg-red-50 text-red-600";
  return "bg-gray-100 text-gray-500";
};

export const getCategoryLabel = (cat: string): string => {
  if (cat === "client") return "Client";
  if (cat === "proposal_sent") return "Proposal sent";
  if (cat === "potential") return "Potential";
  if (cat === "curious") return "Curious";
  if (cat === "not_interested") return "Not interested";
  return cat;
};
