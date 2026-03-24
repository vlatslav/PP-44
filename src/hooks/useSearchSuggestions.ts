// src/hooks/useSearchSuggestions.ts
import { useState, useEffect } from 'react';
import { TMDBMovie } from '../types.js';

export function useSearchSuggestions(query: string, delay = 300) {
  const [suggestions, setSuggestions] = useState<TMDBMovie[]>([]);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const handler = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error(res.statusText);
        const data: TMDBMovie[] = await res.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      }
    }, delay);

    return () => clearTimeout(handler);
  }, [query, delay]);

  return suggestions;
}
