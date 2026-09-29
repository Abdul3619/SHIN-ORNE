import { useEffect, useState } from 'react';

// State that survives a page reload. It starts from the default value (so the server-rendered HTML and the first
// client render match) and loads any saved value right after hydration.
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // Storage unavailable (private mode) or corrupt value: keep the default.
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota or privacy-mode errors.
    }
  }, [key, value, hydrated]);

  const clear = () => {
    setValue(initial);
    try { window.localStorage.removeItem(key); } catch { /* ignore */ }
  };

  return [value, setValue, clear, hydrated] as const;
}
