import { ReactNode } from 'react';
import { theme } from '../../styles/theme';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  children: ReactNode;
}

const variants = {
  success: { bg: theme.colors.status.successBg, color: theme.colors.status.success },
  warning: { bg: theme.colors.status.warningBg, color: theme.colors.status.warning },
  error: { bg: theme.colors.status.errorBg, color: theme.colors.status.error },
  info: { bg: theme.colors.status.infoBg, color: theme.colors.status.info },
  default: { bg: theme.colors.bg.tertiary, color: theme.colors.text.secondary },
};

export function Badge({ variant = 'default', children }: BadgeProps) {
  const style = variants[variant];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: theme.borderRadius.full, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold, backgroundColor: style.bg, color: style.color }}>
      {children}
    </span>
  );
}