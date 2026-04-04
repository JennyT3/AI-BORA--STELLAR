import { Users, FileText, TrendingUp, DollarSign } from 'lucide-react';
import { StatsCard } from '../admin/StatsCard';
import { theme } from '../../styles/theme';

interface DashboardOverviewProps {
  clienteCount: number;
  proposalCount: number;
  proposalEnviadas: number;
  conversionRate: number;
}

export function DashboardOverview({ clienteCount, proposalCount, proposalEnviadas, conversionRate }: DashboardOverviewProps) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.xxl }}>
        <div>
          <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 36, fontWeight: theme.fontWeight.extrabold, color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>
            Dashboard
          </h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: theme.fontSize.lg }}>Resumo da tua atividade</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: theme.spacing.xl, marginBottom: theme.spacing.xxl }}>
        <StatsCard label="Clientes" value={clienteCount} subtitle="0 potenciais" icon={Users} iconColor={theme.colors.accent.secondary} iconBg="rgba(14, 165, 233, 0.1)" />
        <StatsCard label="Propostas" value={proposalCount} subtitle={`${proposalEnviadas} enviadas`} icon={FileText} iconColor={theme.colors.accent.primary} iconBg="rgba(242, 92, 5, 0.1)" trend={{ value: 12, label: 'vs mês anterior' }} />
        <StatsCard label="Taxa de Conversão" value={`${conversionRate}%`} subtitle={`0 aceites de ${proposalCount}`} icon={TrendingUp} iconColor={theme.colors.status.success} iconBg="rgba(16, 185, 129, 0.1)" trend={{ value: 5, label: 'vs mês anterior' }} />
        <StatsCard label="Faturamento Mês" value="€0" subtitle="0 contratos ativos" icon={DollarSign} iconColor={theme.colors.accent.secondary} iconBg="rgba(14, 165, 233, 0.1)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing.lg, marginBottom: theme.spacing.xxl }}>
        <MetricCard value={proposalCount} label="Propostas" color={theme.colors.accent.primary} />
        <MetricCard value={0} label="Respondidas" color={theme.colors.accent.secondary} />
        <MetricCard value={0} label="Aceites" color={theme.colors.status.success} />
        <MetricCard value={clienteCount} label="Clientes" color="#F22283" />
      </div>
    </div>
  );
}

function MetricCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ backgroundColor: theme.colors.bg.secondary, borderRadius: theme.borderRadius.md, padding: theme.spacing.lg, borderLeft: `4px solid ${color}`, borderTop: `1px solid ${theme.colors.border}`, borderRight: `1px solid ${theme.colors.border}`, borderBottom: `1px solid ${theme.colors.border}` }}>
      <div style={{ fontSize: 24, fontWeight: theme.fontWeight.extrabold, color: theme.colors.text.primary, fontFamily: theme.fontFamily.sans }}>{value}</div>
      <div style={{ fontSize: theme.fontSize.xs, color: theme.colors.text.secondary, textTransform: 'uppercase', fontWeight: theme.fontWeight.semibold }}>{label}</div>
    </div>
  );
}