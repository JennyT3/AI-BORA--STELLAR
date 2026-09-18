import { LucideIcon } from 'lucide-react';
import { theme } from '../../styles/theme';

interface StatsCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: number;
    label: string;
  };
}

export function StatsCard({ 
  label, 
  value, 
  subtitle, 
  icon: Icon, 
  iconColor = theme.colors.accent.primary,
  iconBg = 'rgba(242, 92, 5, 0.1)',
  trend 
}: StatsCardProps) {
  return (
    <div style={{
      backgroundColor: theme.colors.bg.secondary,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl,
      boxShadow: theme.shadows.sm,
      transition: 'all 0.2s',
      cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: theme.fontSize.xs,
            fontWeight: theme.fontWeight.semibold,
            color: theme.colors.text.tertiary,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: theme.spacing.sm,
          }}>
            {label}
          </div>
          <div style={{
            fontSize: theme.fontSize.xxxl,
            fontWeight: theme.fontWeight.extrabold,
            color: theme.colors.text.primary,
            fontFamily: theme.fontFamily.sans,
            marginBottom: 4,
          }}>
            {value}
          </div>
          {subtitle && (
            <div style={{ fontSize: theme.fontSize.sm, color: theme.colors.text.secondary }}>{subtitle}</div>
          )}
          {trend && (
            <div style={{ marginTop: theme.spacing.sm, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ 
                fontSize: theme.fontSize.md, 
                fontWeight: theme.fontWeight.semibold, 
                color: trend.value >= 0 ? theme.colors.status.success : theme.colors.status.error 
              }}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span style={{ fontSize: theme.fontSize.sm, color: theme.colors.text.tertiary }}>{trend.label}</span>
            </div>
          )}
        </div>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={24} color={iconColor} />
        </div>
      </div>
    </div>
  );
}