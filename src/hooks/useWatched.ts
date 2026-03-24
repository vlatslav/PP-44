import { useState, useEffect, useCallback } from 'react';

interface WatchedMovie {
  movieId: number;
  title: string;
  addedAt: string;
}

export function useWatched(uid: string | null) {
  const [watchedSet, setWatchedSet] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!uid) {
      setWatchedSet(new Set());
      return;
    }
    const fetchWatched = async () => {
      try {
        const res = await fetch(`/api/watched?uid=${uid}`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const movies: WatchedMovie[] = await res.json();
        setWatchedSet(new Set(movies.map((m) => m.movieId)));
      } catch (err) {
        console.error(err);
      }
    };
    fetchWatched();
  }, [uid]);

  const toggleWatched = useCallback(
      async (movie: { id: number } & Record<string, any>) => {
        if (!uid) return;
        const isWatched = watchedSet.has(movie.id);
        try {
          if (isWatched) {
            const res = await fetch(`/api/watched?uid=${uid}&movieId=${movie.id}`, {
              method: 'DELETE',
            });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            setWatchedSet((prev) => {
              const next = new Set(prev);
              next.delete(movie.id);
              return next;
            });
          } else {
            const res = await fetch(`/api/watched`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...movie, uid }),
            });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            setWatchedSet((prev) => new Set(prev).add(movie.id));
          }
        } catch (err) {
          console.error(err);
        }
      },
      [uid, watchedSet]
  );

  return { watchedSet, toggleWatched };
}
