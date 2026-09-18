import { ButtonHTMLAttributes, ReactNode, CSSProperties } from 'react';
import { theme } from '../../styles/theme';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  style?: CSSProperties;
}

export function Button({ variant = 'primary', size = 'md', children, style, ...props }: ButtonProps) {
  const variants = {
    primary: { backgroundColor: theme.colors.accent.primary, color: '#FFFFFF', border: 'none' },
    secondary: { backgroundColor: theme.colors.bg.secondary, color: theme.colors.text.primary, border: `1px solid ${theme.colors.border}` },
    ghost: { backgroundColor: 'transparent', color: theme.colors.text.secondary, border: 'none' },
    danger: { backgroundColor: theme.colors.status.error, color: '#FFFFFF', border: 'none' },
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: theme.fontSize.sm },
    md: { padding: '10px 16px', fontSize: theme.fontSize.md },
    lg: { padding: '14px 24px', fontSize: theme.fontSize.lg },
  };

  return (
    <button style={{ ...variants[variant], ...sizes[size], borderRadius: theme.borderRadius.md, fontWeight: theme.fontWeight.semibold, fontFamily: theme.fontFamily.sans, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: theme.spacing.sm, transition: 'all 0.2s ease', ...style }} {...props}>
      {children}
    </button>
  );
}