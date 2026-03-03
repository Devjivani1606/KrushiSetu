import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api.config';
import type { TimeRange } from '../config/mandi.config';

export type MandiHistoryPoint = {
  date: string;
  modal_price: number;
};

export type MandiHistoryPayload = {
  history: MandiHistoryPoint[];
  highest_price: number;
  lowest_price: number;
  trend: string;
};

type FetchParams = {
  crop: string;
  state: string;
  mandi: string;
  range: TimeRange;
};

type FetchOptions = {
  signal?: AbortSignal;
};

type CacheEnvelope = {
  savedAt: number;
  payload: MandiHistoryPayload;
};

type FetchResult =
  | { kind: 'ok'; payload: MandiHistoryPayload; isStale: boolean }
  | { kind: 'empty' };

const cacheKey = (p: FetchParams) =>
  `mandi_history:v1:${encodeURIComponent(p.crop)}:${encodeURIComponent(p.state)}:${encodeURIComponent(p.mandi)}:${p.range}`;

const sanitizePayload = (json: any): MandiHistoryPayload | null => {
  const historyRaw = Array.isArray(json?.history) ? json.history : [];
  const history: MandiHistoryPoint[] = historyRaw
    .map((h: any) => ({
      date: String(h?.date ?? ''),
      modal_price: Number(h?.modal_price ?? 0),
    }))
    .filter((h: MandiHistoryPoint) => h.date && Number.isFinite(h.modal_price));

  return {
    history,
    highest_price: Number(json?.highest_price ?? 0) || 0,
    lowest_price: Number(json?.lowest_price ?? 0) || 0,
    trend: String(json?.trend ?? '+0%'),
  };
};

export async function fetchMandiHistory(params: FetchParams, options: FetchOptions = {}): Promise<FetchResult> {
  const key = cacheKey(params);
  const qs = new URLSearchParams({
    crop: params.crop,
    state: params.state,
    mandi: params.mandi,
    range: params.range,
  });

  const url = `${API_CONFIG.BASE_URL}/mandi/history?${qs.toString()}`;

  try {
    const res = await fetch(url, { signal: options.signal });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(json?.error || `Request failed (${res.status})`);
    }

    if (json?.success === false) {
      if (String(json?.message || '').toLowerCase().includes('no data')) {
        return { kind: 'empty' };
      }
      throw new Error(String(json?.message || json?.error || 'Request failed'));
    }

    const payload = sanitizePayload(json);
    if (!payload || payload.history.length === 0) {
      return { kind: 'empty' };
    }

    const envelope: CacheEnvelope = { savedAt: Date.now(), payload };
    await AsyncStorage.setItem(key, JSON.stringify(envelope));

    return { kind: 'ok', payload, isStale: false };
  } catch (e) {
    if (String((e as any)?.name) === 'AbortError') throw e;

    const cached = await AsyncStorage.getItem(key).catch(() => null);
    if (cached) {
      const parsed: CacheEnvelope | null = JSON.parse(cached);
      if (parsed?.payload?.history?.length) {
        return { kind: 'ok', payload: parsed.payload, isStale: true };
      }
    }
    throw e;
  }
}

