// src/hooks/useSelectedMovies.ts
import { useState, useEffect, useCallback } from 'react';
import { TMDBMovie } from '../types.js';

export function useSelectedMovies(storageKey = 'selectedMovies') {
  const [selected, setSelected] = useState<TMDBMovie[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(selected));
  }, [selected, storageKey]);

  const addMovie = useCallback((movie: TMDBMovie) => {
    setSelected((prev) => {
      if (prev.some((m) => m.id === movie.id)) {
        alert('Movie already added!');
        return prev;
      }
      return [...prev, movie];
    });
  }, []);

  const removeMovie = useCallback((movieId: number) => {
    setSelected((prev) => prev.filter((m) => m.id !== movieId));
  }, []);

  const clearAll = useCallback(() => {
    setSelected([]);
  }, []);

  return {
    selected,
    addMovie,
    removeMovie,
    clearAll,
  };
}
