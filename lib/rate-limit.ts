const store = new Map<string, { count: number; expiresAt: number }>();

type LimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

export function enforceRateLimit({ key, limit, windowMs }: LimitOptions) {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.expiresAt <= now) {
    store.set(key, { count: 1, expiresAt: now + windowMs });
    return;
  }

  if (current.count >= limit) {
    throw new Error('Terlalu banyak request. Coba lagi bentar.');
  }

  current.count += 1;
  store.set(key, current);
}
