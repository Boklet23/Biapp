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

export interface ForecastDay {
  date: string; // 'YYYY-MM-DD'
  maxTemp: number;
  symbol: string;
  condition: string;
  goodForInspection: boolean; // temp ≥ 14°C, no precipitation
}

const forecastCache = new Map<string, { days: ForecastDay[]; fetchedAt: number }>();

export async function fetchForecast(lat: number, lng: number): Promise<ForecastDay[]> {
  const key = cacheKey(lat, lng) + '_forecast';
  const cached = forecastCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.days;

  try {
    const res = await fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lng}`,
      { headers: { 'User-Agent': 'BiVokter/1.0 (kontakt@bivokter.no)' } }
    );
    if (!res.ok) return [];

    const json = await res.json();
    const timeseries: unknown[] = json?.properties?.timeseries ?? [];

    // Group by date — prefer the entry closest to noon (12:00), fall back to any entry.
    // Yr.no returns hourly for 48h then 6-hourly, so not every day has a 12:00 slot.
    const byDate = new Map<string, { temp: number; symbol: string; hourDist: number }>();
    for (const entry of timeseries) {
      const ts = entry as Record<string, unknown>;
      const time = typeof ts.time === 'string' ? ts.time : '';
      const date = time.split('T')[0];
      if (!date) continue;
      const hour = parseInt(time.split('T')[1]?.split(':')[0] ?? '0', 10);
      const hourDist = Math.abs(hour - 12); // distance from noon
      const existing = byDate.get(date);
      if (existing && existing.hourDist <= hourDist) continue; // keep closer-to-noon entry
      const details = (ts.data as Record<string, unknown>)?.instant as Record<string, unknown> | undefined;
      const temp = (details?.details as Record<string, unknown>)?.air_temperature;
      const next6 = ((ts.data as Record<string, unknown>)?.next_6_hours as Record<string, unknown> | undefined)?.summary as Record<string, unknown> | undefined;
      const next1 = ((ts.data as Record<string, unknown>)?.next_1_hours as Record<string, unknown> | undefined)?.summary as Record<string, unknown> | undefined;
      const symbolCode = next6?.symbol_code ?? next1?.symbol_code;
      byDate.set(date, {
        temp: typeof temp === 'number' ? Math.round(temp) : 0,
        symbol: typeof symbolCode === 'string' ? symbolCode : 'clearsky_day',
        hourDist,
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const days: ForecastDay[] = [];
    for (const [date, v] of byDate) {
      if (date < today) continue;
      if (days.length >= 7) break;
      const hasPrecip = v.symbol.includes('rain') || v.symbol.includes('snow') || v.symbol.includes('sleet') || v.symbol.includes('thunder');
      days.push({
        date,
        maxTemp: v.temp,
        symbol: v.symbol,
        condition: symbolToNorwegian(v.symbol),
        goodForInspection: v.temp >= 14 && !hasPrecip,
      });
    }

    if (forecastCache.size >= CACHE_MAX_SIZE) {
      const oldestKey = forecastCache.keys().next().value as string;
      forecastCache.delete(oldestKey);
    }
    forecastCache.set(key, { days, fetchedAt: Date.now() });
    return days;
  } catch {
    return [];
  }
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
