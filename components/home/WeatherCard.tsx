import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { OSLO } from '@/constants/locations';
import { fetchWeather, WeatherData } from '@/services/weather';

const SYMBOL_EMOJI: Record<string, string> = {
  clearsky: '☀️',
  fair: '🌤️',
  partlycloudy: '⛅',
  cloudy: '☁️',
  fog: '🌫️',
  lightrain: '🌦️',
  rain: '🌧️',
  heavyrain: '🌧️',
  lightrainshowers: '🌦️',
  rainshowers: '🌧️',
  lightsnow: '🌨️',
  snow: '❄️',
  heavysnow: '❄️',
  sleet: '🌧️',
  thunder: '⛈️',
  rainandthunder: '⛈️',
};

function symbolToEmoji(symbol: string): string {
  const base = symbol.replace(/_day$|_night$|_polartwilight$/, '');
  return SYMBOL_EMOJI[base] ?? '🌡️';
}

interface WeatherCardProps {
  lat?: number | null;
  lng?: number | null;
  locationName?: string | null;
  onPress?: () => void;
}

export function WeatherCard({ lat, lng, locationName, onPress }: WeatherCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const useLat = lat ?? OSLO.lat;
    const useLng = lng ?? OSLO.lng;
    setLoading(true);
    fetchWeather(useLat, useLng).then((data) => {
      if (!cancelled) {
        setWeather(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [lat, lng]);

  const displayLocation = locationName ?? 'Oslo';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && onPress ? { opacity: 0.85 } : null]}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityLabel="Vær — trykk for å endre sted"
    >
      {loading ? (
        <ActivityIndicator color={Colors.honey} size="small" />
      ) : weather ? (
        <View style={styles.content}>
          <Text style={styles.emoji}>{symbolToEmoji(weather.symbol)}</Text>
          <View style={styles.info}>
            <Text style={styles.temp}>{weather.temp}°C</Text>
            <Text style={styles.condition}>{weather.condition}</Text>
            <Text style={styles.location}>📍 {displayLocation}</Text>
          </View>
          {onPress && <Text style={styles.editHint}>Endre sted ›</Text>}
        </View>
      ) : (
        <Text style={styles.noData}>Vær ikke tilgjengelig</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 72,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  emoji: { fontSize: 44 },
  info: { gap: 2 },
  temp: { fontSize: 26, fontWeight: '800', color: Colors.dark },
  condition: { fontSize: 14, color: Colors.mid },
  location: { fontSize: 12, color: Colors.mid, marginTop: 2 },
  noData: { fontSize: 14, color: Colors.mid },
  editHint: {
    marginLeft: 'auto',
    fontSize: 12,
    color: Colors.honey,
    fontWeight: '600',
    alignSelf: 'flex-end',
  },
});
