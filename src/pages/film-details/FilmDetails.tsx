import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./FilmDetails.module.scss";
import {useWatched} from "../../hooks/useWatched";
import liked from './../../../public/liked.svg'
import unliked from './../../../public/unliked.svg'

interface MovieDetails {
  id: number;
  title: string;
  release_date: string;
  genres: { id: number; name: string }[];
  vote_average: number;
  vote_count: number;
  overview: string;
  poster_path: string | null;
}

export default function FilmDetails() {
  const uid = localStorage.getItem('uid');
  const { filmId } = useParams<{ filmId: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {watchedSet, toggleWatched} = useWatched(uid);

  useEffect(() => {
    async function fetchMovieDetails() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/movie/${filmId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch movie details: ${response.status}`);
        }

        const data: MovieDetails = await response.json();
        setMovie(data);
      } catch (err) {
        setError("Could not load movie details. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (filmId) {
      fetchMovieDetails();
    }
  }, [filmId]);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!movie) {
    return <div className={styles.noMovie}>No movie found.</div>;
  }

  return (
      <div className={styles.container}>
        {movie.poster_path && (
            <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={`${movie.title} poster`}
                className={styles.poster}
            />
        )}
        <div className={styles.details}>
          <h1 className={styles.title}>{movie.title}</h1>
          <p className={styles.info}>
            <strong>Release Year:</strong>{" "}
            {movie.release_date ? movie.release_date.slice(0, 4) : "N/A"}
          </p>
          <p className={styles.info}>
            <strong>Genres:</strong>{" "}
            {movie.genres.map((genre) => genre.name).join(", ") || "N/A"}
          </p>
          <p className={styles.info}>
            <strong>Rating:</strong> {movie.vote_average.toFixed(1)} (
            {movie.vote_count} votes)
          </p>
          <p className={styles.overview}>
            <strong>Overview:</strong>{" "}
            {movie.overview || "No description available."}
          </p>
        </div>
        <button
            onClick={() => toggleWatched({id: movie.id, title: movie.title})}
            className={styles.watchedButton}
        >
          {watchedSet.has(movie.id)
              ? <img className={styles.img} src={liked} alt="Unwatch"/>
              : <img className={styles.img} src={unliked} alt="Watch"/>}
        </button>
      </div>
  );
}