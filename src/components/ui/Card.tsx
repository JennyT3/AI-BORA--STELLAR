import React, { ReactNode } from 'react';
import { theme } from '../../styles/theme';

interface CardProps {
  children: ReactNode;
  style?: React.CSSProperties;
  padding?: string;
}

export function Card({ children, style, padding = theme.spacing.xl }: CardProps) {
  return (
    <div style={{ backgroundColor: theme.colors.bg.secondary, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.lg, padding, boxShadow: theme.shadows.sm, transition: 'all 0.2s ease', ...style }}>
      {children}
    </div>
  );
}