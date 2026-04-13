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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
} as const;
