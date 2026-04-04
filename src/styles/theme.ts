export const theme = {
  colors: {
    bg: {
      primary: '#FAFAFA',
      secondary: '#FFFFFF',
      tertiary: '#F5F5F5',
      sidebar: '#1F2937',
      sidebarHover: '#374151',
      sidebarBorder: '#374151',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      sidebar: '#9CA3AF',
      sidebarActive: '#F9FAFB',
    },
    accent: {
      primary: '#F25C05',
      secondary: '#0EA5E9',
    },
    border: '#E5E7EB',
    status: {
      success: '#10B981',
      successBg: '#D1FAE5',
      warning: '#F59E0B',
      warningBg: '#FEF3C7',
      error: '#EF4444',
      errorBg: '#FEE2E2',
      info: '#0EA5E9',
      infoBg: '#E0F2FE',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    full: '999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  fontFamily: {
    sans: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  fontSize: {
    xs: '11px',
    sm: '12px',
    md: '14px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    xxxl: '30px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 900,
  },
} as const;

export type Theme = typeof theme;

export const cssVariables = `
  :root {
    --bg-primary: ${theme.colors.bg.primary};
    --bg-secondary: ${theme.colors.bg.secondary};
    --bg-tertiary: ${theme.colors.bg.tertiary};
    --bg-sidebar: ${theme.colors.bg.sidebar};
    --bg-sidebar-hover: ${theme.colors.bg.sidebarHover};
    --bg-sidebar-border: ${theme.colors.bg.sidebarBorder};
    
    --text-primary: ${theme.colors.text.primary};
    --text-secondary: ${theme.colors.text.secondary};
    --text-tertiary: ${theme.colors.text.tertiary};
    --text-sidebar: ${theme.colors.text.sidebar};
    --text-sidebar-active: ${theme.colors.text.sidebarActive};
    
    --accent-primary: ${theme.colors.accent.primary};
    --accent-secondary: ${theme.colors.accent.secondary};
    
    --border: ${theme.colors.border};
    
    --status-success: ${theme.colors.status.success};
    --status-success-bg: ${theme.colors.status.successBg};
    --status-warning: ${theme.colors.status.warning};
    --status-warning-bg: ${theme.colors.status.warningBg};
    --status-error: ${theme.colors.status.error};
    --status-error-bg: ${theme.colors.status.errorBg};
    --status-info: ${theme.colors.status.info};
    --status-info-bg: ${theme.colors.status.infoBg};
    
    --spacing-xs: ${theme.spacing.xs};
    --spacing-sm: ${theme.spacing.sm};
    --spacing-md: ${theme.spacing.md};
    --spacing-lg: ${theme.spacing.lg};
    --spacing-xl: ${theme.spacing.xl};
    --spacing-xxl: ${theme.spacing.xxl};
    
    --radius-sm: ${theme.borderRadius.sm};
    --radius-md: ${theme.borderRadius.md};
    --radius-lg: ${theme.borderRadius.lg};
    --radius-full: ${theme.borderRadius.full};
    
    --shadow-sm: ${theme.shadows.sm};
    --shadow-md: ${theme.shadows.md};
    --shadow-lg: ${theme.shadows.lg};
    
    --font-family: ${theme.fontFamily.sans};
    
    --font-xs: ${theme.fontSize.xs};
    --font-sm: ${theme.fontSize.sm};
    --font-md: ${theme.fontSize.md};
    --font-lg: ${theme.fontSize.lg};
    --font-xl: ${theme.fontSize.xl};
    --font-xxl: ${theme.fontSize.xxl};
    --font-xxxl: ${theme.fontSize.xxxl};
    
    --font-normal: ${theme.fontWeight.normal};
    --font-medium: ${theme.fontWeight.medium};
    --font-semibold: ${theme.fontWeight.semibold};
    --font-bold: ${theme.fontWeight.bold};
    --font-extrabold: ${theme.fontWeight.extrabold};
  }
`;