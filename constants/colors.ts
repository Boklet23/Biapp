export const Colors = {
  honey: '#F5A623',
  honeyDark: '#D4890A',
  amber: '#FFF3DC',
  dark: '#1A1A2E',
  mid: '#4A4A6A',
  light: '#F8F4EF',
  white: '#FFFFFF',
  success: '#2ECC71',
  error: '#E74C3C',
  warning: '#E67E22',
  info: '#3498DB',
  notifiable: '#C0392B',
} as const;

// Standardised shadow presets — use these instead of inline shadow values
export const Shadows = {
  card: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
} as const;
