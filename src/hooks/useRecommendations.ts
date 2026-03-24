// src/hooks/useRecommendations.ts
import { useState, useCallback } from 'react';
import { RecommendationsData, TMDBMovie } from '../types.js';

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [code, setCode] = useState<number | null>(null);

  const fetchRecs = useCallback(async (selectedMovies: TMDBMovie[]) => {
    if (selectedMovies.length < 3) {
      setMessage('Please select at least three movies');
      setCode(400);
      return;
    }
    setMessage(null);
    setCode(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movies: selectedMovies }),
      });
      if (!res.ok) throw new Error(res.statusText);
      const data: RecommendationsData = await res.json();
      setRecommendations(data);
    } catch {
      alert('Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { recommendations, isLoading, message, code, fetchRecs };
}
