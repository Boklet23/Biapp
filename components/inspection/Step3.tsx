import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { analyzeVarroa } from '@/services/inspection';
import { useToastStore } from '@/store/toast';
import type { VarroaAnalysis } from '@/types';
import { sharedStyles } from './inspectionStyles';

const VARROA_METHODS = ['vaskemetode', 'sukkerpuder', 'limbunn'];

const SEVERITY_META: Record<string, { label: string; color: string; bg: string }> = {
  none:   { label: 'Ingen',   color: Colors.success, bg: Colors.successSoft },
  low:    { label: 'Lav',     color: '#D4891A',      bg: '#FEF3E2' },
  medium: { label: 'Middels', color: '#E67E22',      bg: '#FEF3E2' },
  high:   { label: 'Høy',     color: Colors.error,   bg: Colors.errorSoft },
};

export interface Step3Props {
  varroaCount: string;
  setVarroaCount: (v: string) => void;
  varroaMethod: string;
  setVarroaMethod: (v: string) => void;
  treatmentApplied: boolean;
  setTreatmentApplied: (v: boolean) => void;
  treatmentProduct: string;
  setTreatmentProduct: (v: string) => void;
  onAiResult: (r: VarroaAnalysis) => void;
  isAiLocked: boolean;
  onOpenUpgrade: () => void;
}

export function Step3({
  varroaCount, setVarroaCount,
  varroaMethod, setVarroaMethod,
  treatmentApplied, setTreatmentApplied,
  treatmentProduct, setTreatmentProduct,
  onAiResult, isAiLocked, onOpenUpgrade,
}: Step3Props) {
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult]   = useState<VarroaAnalysis | null>(null);
  const [imageUri, setImageUri]   = useState<string | null>(null);
  const showToast = useToastStore((s) => s.show);

  const handleAiAnalyze = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Tillatelse nektet', 'Gi BiVokter tilgang til bilder i innstillingene.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
        base64: true,
        exif: false,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets[0]?.base64) return;

      const asset = result.assets[0];
      setImageUri(asset.uri);
      setAnalyzing(true);

      const mimeType = asset.mimeType === 'image/png' ? 'image/png'
                     : asset.mimeType === 'image/webp' ? 'image/webp'
                     : 'image/jpeg';

      const analysis = await analyzeVarroa(asset.base64!, mimeType);
      setAiResult(analysis);
      onAiResult(analysis);
    } catch (err: unknown) {
      showToast((err as Error).message ?? 'Analyse feilet', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const severity = aiResult ? (SEVERITY_META[aiResult.severity] ?? SEVERITY_META.low) : null;

  return (
    <View style={sharedStyles.stepContent}>
      <Text style={sharedStyles.stepHeading}>Helse</Text>

      <View style={sharedStyles.field}>
        <Text style={sharedStyles.label}>Varroa-telling</Text>
        <TextInput
          style={sharedStyles.input}
          value={varroaCount}
          onChangeText={setVarroaCount}
          keyboardType="numeric"
          placeholder="Antall midd"
          placeholderTextColor={Colors.mid + '80'}
        />
      </View>

      <View style={styles.aiSection}>
        {isAiLocked ? (
          <Pressable
            style={styles.aiBtnLocked}
            onPress={onOpenUpgrade}
            accessibilityLabel="AI-analyse krever Hobbyist-abonnement"
          >
            <Text style={styles.aiBtnText}>🔒  Analyser klisterplate med AI</Text>
            <Text style={styles.aiBtnLockedSub}>Krever Hobbyist eller høyere</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.aiBtn, pressed && { opacity: 0.75 }]}
            onPress={handleAiAnalyze}
            disabled={analyzing}
            accessibilityLabel="Analyser varroabilde med AI"
          >
            {analyzing ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.aiBtnText}>🔬  Analyser klisterplate med AI</Text>
            )}
          </Pressable>
        )}

        {aiResult && severity && (
          <View style={[styles.aiCard, { borderLeftColor: severity.color }]}>
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.aiThumb} resizeMode="cover" />
            )}
            <View style={styles.aiCardBody}>
              <View style={styles.aiCardHeader}>
                <Text style={styles.aiCount}>
                  {aiResult.count >= 0 ? `${aiResult.count} mitter` : 'Uklar telling'}
                </Text>
                <View style={[styles.severityBadge, { backgroundColor: severity.bg }]}>
                  <Text style={[styles.severityText, { color: severity.color }]}>
                    {severity.label}
                  </Text>
                </View>
              </View>
              <Text style={styles.aiRec}>{aiResult.recommendation}</Text>
              {aiResult.count >= 0 && (
                <Pressable
                  style={styles.useResultBtn}
                  onPress={() => setVarroaCount(String(aiResult.count))}
                >
                  <Text style={styles.useResultText}>Bruk {aiResult.count} som telleresultat</Text>
                </Pressable>
              )}
              <Text style={styles.aiUsage}>
                {aiResult.usageThisMonth} / {aiResult.monthlyLimit} analyser denne måneden
              </Text>
            </View>
          </View>
        )}
      </View>

      <Text style={sharedStyles.label}>Metode</Text>
      <View style={styles.methodRow}>
        {VARROA_METHODS.map((m) => (
          <Pressable
            key={m}
            style={[styles.methodChip, varroaMethod === m && styles.methodChipSelected]}
            onPress={() => setVarroaMethod(varroaMethod === m ? '' : m)}
          >
            <Text style={[styles.methodChipText, varroaMethod === m && styles.methodChipTextSelected]}>
              {m}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={sharedStyles.toggleRow}>
        <Text style={sharedStyles.toggleLabel}>Behandling utført</Text>
        <Switch
          value={treatmentApplied}
          onValueChange={setTreatmentApplied}
          trackColor={{ true: Colors.honey }}
          thumbColor={Colors.white}
        />
      </View>

      {treatmentApplied && (
        <View style={sharedStyles.field}>
          <Text style={sharedStyles.label}>Produkt brukt</Text>
          <TextInput
            style={sharedStyles.input}
            value={treatmentProduct}
            onChangeText={setTreatmentProduct}
            placeholder="f.eks. Oxalsyre, ApiLife Var"
            placeholderTextColor={Colors.mid + '80'}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  methodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  methodChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.mid + '30',
  },
  methodChipSelected: { backgroundColor: Colors.honey, borderColor: Colors.honey },
  methodChipText: { fontSize: 13, fontFamily: FontFamily.regular, color: Colors.dark },
  methodChipTextSelected: { fontFamily: FontFamily.semibold, color: Colors.white, fontWeight: '600' },

  aiSection: { marginBottom: 16 },
  aiBtn: {
    backgroundColor: Colors.info,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  aiBtnLocked: {
    backgroundColor: Colors.mid + '44',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    gap: 2,
  },
  aiBtnLockedSub: { fontSize: 11, color: Colors.dark + 'AA' },
  aiBtnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FontFamily.bold,
    color: Colors.white,
    letterSpacing: 0.2,
  },
  aiCard: {
    marginTop: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.mid + '20',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  aiThumb: { width: 80, height: 80, alignSelf: 'stretch' },
  aiCardBody: { flex: 1, padding: 12, gap: 6 },
  aiCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  aiCount: { fontSize: 15, fontWeight: '700', fontFamily: FontFamily.bold, color: Colors.dark },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  severityText: { fontSize: 11, fontWeight: '800', fontFamily: FontFamily.extrabold, letterSpacing: 0.5 },
  aiRec: { fontSize: 12, fontFamily: FontFamily.regular, color: Colors.mid, lineHeight: 17 },
  useResultBtn: {
    backgroundColor: Colors.honey,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  useResultText: { fontSize: 12, fontWeight: '700', fontFamily: FontFamily.bold, color: Colors.dark },
  aiUsage: { fontSize: 10, fontFamily: FontFamily.regular, color: Colors.mid + 'AA' },
});
