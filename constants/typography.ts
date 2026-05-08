import { TextStyle } from 'react-native';

export const FontFamily = {
  regular:   'Manrope_400Regular',
  medium:    'Manrope_500Medium',
  semibold:  'Manrope_600SemiBold',
  bold:      'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
} as const;

export const Typography = {
  h1:         { fontSize: 28, fontWeight: '800', fontFamily: FontFamily.extrabold },
  h2:         { fontSize: 24, fontWeight: '700', fontFamily: FontFamily.bold },
  h3:         { fontSize: 18, fontWeight: '700', fontFamily: FontFamily.bold },
  body:       { fontSize: 16, fontWeight: '400', fontFamily: FontFamily.regular },
  bodyStrong: { fontSize: 16, fontWeight: '600', fontFamily: FontFamily.semibold },
  label: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FontFamily.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  caption:    { fontSize: 11, fontWeight: '500', fontFamily: FontFamily.medium },
  small:      { fontSize: 10, fontWeight: '400', fontFamily: FontFamily.regular },
} as const satisfies Record<string, TextStyle>;
