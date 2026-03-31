import { TextStyle } from 'react-native';

export const Typography = {
  h1:        { fontSize: 28, fontWeight: '800' },
  h2:        { fontSize: 24, fontWeight: '800' },
  h3:        { fontSize: 18, fontWeight: '700' },
  body:      { fontSize: 16, fontWeight: '400' },
  bodyStrong:{ fontSize: 16, fontWeight: '600' },
  label: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  caption:   { fontSize: 11, fontWeight: '500' },
  small:     { fontSize: 10, fontWeight: '400' },
} as const satisfies Record<string, TextStyle>;
