// Yr.no Locationforecast 2.0 — gratis, ingen API-nøkkel nødvendig
// Docs: https://api.met.no/weatherapi/locationforecast/2.0/documentation

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 time
const CACHE_MAX_SIZE = 100;

const SYMBOL_TO_NORWEGIAN: Record<string, string> = {
  clearsky_day: 'Klarvær',
  clearsky_night: 'Klarvær',
  clearsky_polartwilight: 'Klarvær',
  fair_day: 'Lettskyet',
  fair_night: 'Lettskyet',
  partlycloudy_day: 'Delvis skyet',
  partlycloudy_night: 'Delvis skyet',
  cloudy: 'Overskyet',
  fog: 'Tåke',
  lightrain: 'Lett regn',
  rain: 'Regn',
  heavyrain: 'Kraftig regn',
  lightrainshowers_day: 'Regnbyger',
  lightrainshowers_night: 'Regnbyger',
  rainshowers_day: 'Regnbyger',
  rainshowers_night: 'Regnbyger',
  heavyrainshowers_day: 'Kraftige regnbyger',
  heavyrainshowers_night: 'Kraftige regnbyger',
  lightsnow: 'Lett snø',
  snow: 'Snø',
  heavysnow: 'Kraftig snø',
  lightsleet: 'Lett sludd',
  sleet: 'Sludd',
  thunder: 'Torden',
  rainandthunder: 'Regn og torden',
  lightrainandthunder: 'Lett regn og torden',
  snowandthunder: 'Snø og torden',
};

function symbolToNorwegian(symbol: string): string {
  return SYMBOL_TO_NORWEGIAN[symbol] ?? SYMBOL_TO_NORWEGIAN[symbol.replace(/_day$|_night$|_polartwilight$/, '')] ?? 'Ukjent';
}

export interface WeatherData {
  temp: number;
  condition: string;
  symbol: string;
  fetchedAt: number;
}

const cache = new Map<string, WeatherData>();

function cacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

export async function fetchWeather(lat: number, lng: number): Promise<WeatherData | null> {
  const key = cacheKey(lat, lng);
  const cached = cache.get(key);

  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached;
  }

  try {
    const res = await fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lng}`,
      {
        headers: {
          'User-Agent': 'BiVokter/1.0 (kontakt@bivokter.no)',
        },
      }
    );

    if (!res.ok) return null;

    const json = await res.json();
    const timeseries = json?.properties?.timeseries?.[0];
    const instant = timeseries?.data?.instant?.details;
    const next1h = timeseries?.data?.next_1_hours?.summary;

    if (!instant) return null;

    const symbol = next1h?.symbol_code ?? 'clearsky_day';
    const data: WeatherData = {
      temp: Math.round(instant.air_temperature),
      condition: symbolToNorwegian(symbol),
      symbol,
      fetchedAt: Date.now(),
    };

    if (cache.size >= CACHE_MAX_SIZE) {
      const oldestKey = cache.keys().next().value as string;
      cache.delete(oldestKey);
    }
    cache.set(key, data);
    return data;
  } catch {
    return null;
  }
}
