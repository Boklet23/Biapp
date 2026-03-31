import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { InfoSheet, InfoRow, InfoText } from '@/components/ui/InfoSheet';
import { Colors } from '@/constants/colors';
import { HiveTypeChip } from '@/components/hive/HiveTypeChip';
import { createHive } from '@/services/hive';
import { useToastStore } from '@/store/toast';
import { BeeBreed, HiveType } from '@/types';

const BEE_BREEDS: { value: BeeBreed; label: string; kg: number }[] = [
  { value: 'norsk_landbee', label: 'Norsk landbee', kg: 16 },
  { value: 'buckfast',      label: 'Buckfast',       kg: 25 },
  { value: 'carniolan',     label: 'Carniolan',      kg: 22 },
  { value: 'annet',         label: 'Annet/Ukjent',   kg: 20 },
];

const HIVE_TYPES: HiveType[] = ['langstroth', 'warre', 'toppstang', 'annet'];

type InfoTopic = 'name' | 'type' | 'location' | 'notes';

export default function NyKube() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.show);
  const [name, setName] = useState('');
  const [type, setType] = useState<HiveType>('langstroth');
  const [beeBreed, setBeeBreed] = useState<BeeBreed>('annet');
  const [locationName, setLocationName] = useState('');
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [nameError, setNameError] = useState('');
  const [infoTopic, setInfoTopic] = useState<InfoTopic | null>(null);

  const handleGetLocation = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('GPS-tillatelse nektet. Gi tilgang i Innstillinger.', 'error');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocationLat(loc.coords.latitude);
      setLocationLng(loc.coords.longitude);
      if (!locationName.trim()) {
        const [place] = await Location.reverseGeocodeAsync(loc.coords);
        if (place) {
          const parts = [place.city ?? place.subregion, place.region].filter(Boolean);
          setLocationName(parts.join(', '));
        }
      }
    } catch {
      showToast('Kunne ikke hente posisjon. Prøv igjen.', 'error');
    } finally {
      setGpsLoading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: createHive,
    onError: (error: Error) => showToast(error.message ?? 'Kunne ikke lagre kube', 'error'),
    onSuccess: (hive) => {
      queryClient.invalidateQueries({ queryKey: ['hives'] });
      router.replace({ pathname: '/kuber/[id]' as any, params: { id: hive.id } });
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      setNameError('Navn er påkrevd');
      return;
    }
    setNameError('');
    mutation.mutate({
      name: name.trim(),
      type,
      beeBreed,
      locationName: locationName.trim() || undefined,
      locationLat: locationLat ?? undefined,
      locationLng: locationLng ?? undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {mutation.isError && (
          <Text style={styles.serverError}>
            {(mutation.error as Error)?.message ?? 'Kunne ikke lagre kube. Prøv igjen.'}
          </Text>
        )}

        <Input
          label="Navn på kube"
          value={name}
          onChangeText={(t) => { setName(t); setNameError(''); }}
          placeholder="f.eks. Kube 1 eller Epletreet"
          autoFocus
          error={nameError}
          onInfo={() => setInfoTopic('name')}
        />

        {/* Kubetype */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Kubetype</Text>
          <Pressable
            onPress={() => setInfoTopic('type')}
            style={styles.infoBtn}
            accessibilityRole="button"
            accessibilityLabel="Info om kubetype"
            hitSlop={8}
          >
            <Text style={styles.infoBtnText}>ⓘ</Text>
          </Pressable>
        </View>
        <View style={styles.typeRow}>
          {HIVE_TYPES.map((t) => (
            <Pressable
              key={t}
              onPress={() => setType(t)}
              style={[styles.typeOption, type === t && styles.typeSelected]}
              accessibilityRole="radio"
              accessibilityState={{ checked: type === t }}
            >
              <HiveTypeChip type={t} />
            </Pressable>
          ))}
        </View>

        {/* Bierase */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Bierase</Text>
        </View>
        <View style={styles.breedRow}>
          {BEE_BREEDS.map((b) => (
            <Pressable
              key={b.value}
              onPress={() => setBeeBreed(b.value)}
              style={[styles.breedOption, beeBreed === b.value && styles.breedSelected]}
              accessibilityRole="radio"
              accessibilityState={{ checked: beeBreed === b.value }}
            >
              <Text style={[styles.breedLabel, beeBreed === b.value && styles.breedLabelActive]}>
                {b.label}
              </Text>
              <Text style={styles.breedKg}>~{b.kg} kg/år</Text>
            </Pressable>
          ))}
        </View>

        <Input
          label="Sted (valgfritt)"
          value={locationName}
          onChangeText={setLocationName}
          placeholder="f.eks. Hagen, Skogkanten"
          onInfo={() => setInfoTopic('location')}
        />
        <Pressable
          style={({ pressed }) => [styles.gpsBtn, pressed && styles.gpsBtnPressed]}
          onPress={handleGetLocation}
          disabled={gpsLoading}
          accessibilityRole="button"
          accessibilityLabel="Hent GPS-posisjon"
        >
          {gpsLoading ? (
            <ActivityIndicator size="small" color={Colors.honey} />
          ) : (
            <Text style={styles.gpsBtnText}>
              {locationLat ? '📍 Posisjon lagret' : '📍 Bruk min posisjon'}
            </Text>
          )}
        </Pressable>

        <Input
          label="Notater (valgfritt)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Generelle notater om kuba"
          multiline
          numberOfLines={3}
          style={styles.notesInput}
          onInfo={() => setInfoTopic('notes')}
        />

        <Button
          label="Lagre kube"
          onPress={handleSave}
          loading={mutation.isPending}
        />
      </ScrollView>

      {/* Info: Navn */}
      <InfoSheet
        visible={infoTopic === 'name'}
        title="Navn på kube"
        onClose={() => setInfoTopic(null)}
      >
        <InfoText>
          Gi kuben din et unikt navn som gjør den lett å kjenne igjen. Mange birøktere navngir kubene etter plassering, farge eller rekkefølge.
        </InfoText>
        <InfoRow icon="📍" title="Plassering" description="«Hagen», «Ved elva», «Skogkanten» — lett å huske hvor kuben står." />
        <InfoRow icon="🔢" title="Nummer" description="«Kube 1», «Kube 2» — enkelt og oversiktlig hvis du har mange kuber." />
        <InfoRow icon="🌳" title="Kjennemerke" description="«Epletreet», «Den blå» — noe som skiller akkurat denne kuben fra de andre." />
      </InfoSheet>

      {/* Info: Kubetype */}
      <InfoSheet
        visible={infoTopic === 'type'}
        title="Kubetype"
        onClose={() => setInfoTopic(null)}
      >
        <InfoText>
          Det finnes flere typer bikuber. Som nybegynner anbefales Langstroth — den er mest utbredt i Norge og det finnes mye hjelp å få.
        </InfoText>
        <InfoRow
          icon="📦"
          title="Langstroth"
          description="Verdens vanligste kubetype. Rektangulære kasser stables oppå hverandre. Enkel å utvide med honningkropp. Anbefalt for nybegynnere."
        />
        <InfoRow
          icon="🏠"
          title="Warré"
          description="Mindre kasser som stables nedenfra. Etterlikner et naturlig tre-hult. Krever mindre inngrep, men er vanskeligere å hente honning fra."
        />
        <InfoRow
          icon="🪵"
          title="Toppstang (Top Bar)"
          description="Horisontal kube med stenger på toppen. Biene bygger naturlig voks nedover fra stengene. Populær i Afrika og blant naturorienterte birøktere."
        />
        <InfoRow
          icon="❓"
          title="Annet"
          description="Velg dette hvis du bruker en annen kubetype, f.eks. en gammel norsk trekasse eller en spesialkonstruksjon."
        />
      </InfoSheet>

      {/* Info: Sted */}
      <InfoSheet
        visible={infoTopic === 'location'}
        title="Sted"
        onClose={() => setInfoTopic(null)}
      >
        <InfoText>
          Stedsnavnet hjelper deg å huske og finne igjen kubene dine, spesielt hvis du har kuber på flere plasser.
        </InfoText>
        <InfoRow icon="🌻" title="Skriv noe beskrivende" description="«Hagen hjemme», «Onkelens gård» eller «Skogkanten ved Nøklevann»." />
        <InfoRow icon="📌" title="Ikke GPS" description="Dette er bare et fritekst-navn, ikke en GPS-posisjon. Du kan skrive hva som helst." />
      </InfoSheet>

      {/* Info: Notater */}
      <InfoSheet
        visible={infoTopic === 'notes'}
        title="Notater"
        onClose={() => setInfoTopic(null)}
      >
        <InfoText>
          Her kan du skrive ned generell informasjon om kuben som ikke passer andre steder.
        </InfoText>
        <InfoRow icon="📅" title="Anskaffelsesdato" description="Når fikk du kuben? Hvorfra kom den?" />
        <InfoRow icon="👑" title="Dronning" description="Rase, alder eller hvorfra dronningen kom — f.eks. «Buckfast, kjøpt 2024»." />
        <InfoRow icon="💡" title="Spesielle ting å huske" description="Noe unikt med akkurat denne kuben du vil ha notert." />
      </InfoSheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light },
  scroll: { padding: 20, gap: 4, paddingBottom: 40 },
  serverError: {
    backgroundColor: '#FADBD8',
    color: Colors.error,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
  },
  infoBtn: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBtnText: {
    fontSize: 16,
    color: Colors.honey,
    fontWeight: '600',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  typeOption: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 2,
  },
  typeSelected: {
    borderColor: Colors.honey,
  },
  notesInput: {
    height: 88,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  breedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  breedOption: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.mid + '30',
    backgroundColor: Colors.white,
    alignItems: 'center',
    gap: 2,
  },
  breedSelected: {
    borderColor: Colors.honey,
    backgroundColor: Colors.honey + '12',
  },
  breedLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.mid,
  },
  breedLabelActive: {
    color: Colors.honey,
  },
  breedKg: {
    fontSize: 11,
    color: Colors.mid + '90',
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.honey + '40',
    backgroundColor: Colors.honey + '0C',
    marginTop: -8,
    marginBottom: 4,
  },
  gpsBtnPressed: { opacity: 0.7 },
  gpsBtnText: { fontSize: 14, color: Colors.honey, fontWeight: '600' },
});
