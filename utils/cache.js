// Simple in-memory cache for flight results
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCacheKey = (departure, arrival, date, page = 1) => {
  return `${departure}-${arrival}-${date}-${page}`;
};

export const getCached = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
};

export const setCached = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

export const clearCache = () => {
  cache.clear();
};


