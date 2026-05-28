import * as Location from 'expo-location';

export interface DeviceLocation {
  lat: number;
  lng: number;
  placeName: string | null;
}

export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) && lat >= -90 && lat <= 90 &&
    Number.isFinite(lng) && lng >= -180 && lng <= 180
  );
}

export async function getDeviceLocation(): Promise<DeviceLocation> {
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) throw new Error('SERVICES_DISABLED');

  // Pre-check before requesting — lets us distinguish "denied" from "not yet asked"
  const { status: existing } = await Location.getForegroundPermissionsAsync();
  if (existing === 'denied') throw new Error('PERMISSION_DENIED');

  if (existing !== 'granted') {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') throw new Error('PERMISSION_DENIED');
  }

  // Fast path: use recent cached position (2 min, ≤100 m accuracy)
  let pos = await Location.getLastKnownPositionAsync({
    maxAge: 2 * 60 * 1000,
    requiredAccuracy: 100,
  });

  if (!pos) {
    pos = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 15000)
      ),
    ]);
  }

  const { latitude: lat, longitude: lng } = pos.coords;

  let placeName: string | null = null;
  try {
    const [place] = await Location.reverseGeocodeAsync(pos.coords);
    if (place) {
      placeName =
        [place.city ?? place.subregion, place.region].filter(Boolean).join(', ') || null;
    }
  } catch {
    // Coordinates were obtained — place name is non-critical
  }

  return { lat, lng, placeName };
}

export function locationErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : '';
  if (msg === 'SERVICES_DISABLED') return 'Slå på stedstjenester i telefoninnstillingene og prøv igjen.';
  if (msg === 'PERMISSION_DENIED') return 'GPS-tillatelse nektet. Åpne innstillinger og gi BiVokter posisjonstilgang.';
  if (msg === 'TIMEOUT') return 'GPS brukte for lang tid. Gå utendørs og prøv igjen.';
  return 'Kunne ikke hente posisjon. Prøv igjen.';
}
