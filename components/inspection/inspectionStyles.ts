import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export const sharedStyles = StyleSheet.create({
  stepContent: { paddingTop: 8 },
  stepHeading: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: FontFamily.extrabold,
    color: Colors.dark,
    marginBottom: 20,
  },
  field: { marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FontFamily.semibold,
    color: Colors.dark,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: FontFamily.regular,
    color: Colors.dark,
    borderWidth: 1,
    borderColor: Colors.mid + '20',
  },
  inputText: {
    fontSize: 15,
    fontFamily: FontFamily.regular,
    color: Colors.dark,
  },
  notesInput: {
    height: 100,
    paddingTop: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mid + '15',
  },
  toggleLabel: { fontSize: 15, fontFamily: FontFamily.medium, color: Colors.dark, fontWeight: '500' },
});
