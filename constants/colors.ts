export const Colors = {
  // Core brand
  honey: '#F5A623',
  honeyDark: '#D4890A',
  honeyDeep: '#D98B0E',
  honeyLight: '#FFD77A',
  honeyWash: '#FFF3D6',
  amber: '#FFF3DC',

  // Surfaces
  dark: '#1A1A2E',
  navyInk: '#0F0F1E',
  navySoft: '#2A2A42',
  cream: '#FAF6EF',
  creamDeep: '#F2ECDE',
  light: '#F8F4EF',
  white: '#FFFFFF',

  // Text
  ink: '#1A1A2E',
  inkSoft: '#3A3A52',
  mid: '#4A4A6A',
  muted: '#8A8A9A',
  mutedLight: '#B8B8C4',

  // Semantic
  success: '#4CAF50',
  successSoft: '#E8F5E9',
  error: '#E53935',
  errorSoft: '#FFEBEE',
  warning: '#F5A623',
  info: '#3498DB',
  notifiable: '#C0392B',

  // Varroa / severity
  sevLow: '#9CCC65',
  sevMod: '#FFC107',
  sevHigh: '#FF7043',
  sevCrit: '#C62828',

  // Utility
  hair: 'rgba(26,26,46,0.08)',
  hairStrong: 'rgba(26,26,46,0.14)',
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
