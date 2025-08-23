export const theme = {
  colors: {
    primary: '#1e3a8a', // Navy blue
    primaryLight: '#3b82f6', // Lighter blue
    primaryDark: '#1e40af', // Darker navy
    secondary: '#ffffff', // White
    background: '#ffffff', // White background
    surface: '#f8fafc', // Very light gray
    text: '#1e293b', // Dark text
    textLight: '#64748b', // Light gray text
    border: '#e2e8f0', // Light border
    error: '#ef4444', // Red for errors
    success: '#22c55e', // Green for success
    warning: '#f59e0b', // Orange for warnings
    accent: '#0ea5e9', // Sky blue accent
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
    },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export type Theme = typeof theme;