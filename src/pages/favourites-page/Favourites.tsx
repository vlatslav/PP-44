import styles from './Favourites.module.scss';
import {useEffect, useState} from "react";
import {useWatched} from "../../hooks/useWatched";
import {Link} from "react-router-dom";

interface MovieDetails {
  movieId: number;
  title: string;
  release_date: string;
  genres: { id: number; name: string }[];
  vote_average: number;
  vote_count: number;
  overview: string;
  poster_path: string | null;
}

const Favourites = () => {
  const [movies, setMovies] = useState<MovieDetails[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const uid = localStorage.getItem('uid');

  useEffect(() => {
    async function fetchMovieDetails() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/watched?uid=${encodeURIComponent(uid)}`);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data: MovieDetails[] = await response.json();
        setMovies(data);
      } catch (err) {
        setError("Could not load movie details. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (uid) fetchMovieDetails();
  }, [uid]);

  const {watchedSet, toggleWatched} = useWatched(uid);

  if (loading) return <div className={styles.movieList}>Loading...</div>;
  if (error) return <div className={styles.movieList}>{error}</div>;
  if (!movies || movies.length === 0) return <div className={styles.movieList}>No movies found.</div>;

  return (
      <div className={styles.movieList}>
        {movies.map((item) => (
            <div key={item.movieId} className={styles.movieItem}>
              <Link target="_blank"
                    to={`/movie/${item.movieId}`}
                    rel="noopener noreferrer" className={styles.leftSide}>
                {item.poster_path && (
                    <img
                        src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                        alt={`${item.title} poster`}
                        className={styles.poster}
                    />
                )}
                <div className={styles.movieInfo}>
                  <h1 className={styles.title}>{item.title}</h1>
                  <p className={styles.releaseYear}>
                    <strong>Release Year:</strong> {item.release_date && item.release_date.slice(0, 4) || "N/A"}
                  </p>
                  <p className={styles.releaseYear}>
                    <strong>Average vote:</strong> {item.vote_average && item.vote_average}
                  </p>
                </div>
              </Link>
              <button
                  onClick={() => toggleWatched({id: item.movieId, title: item.title})}
                  className={styles.watchedButton}
              >
                {watchedSet.has(item.movieId)
                    ? <img className={styles.img} src="liked.svg" alt="Unwatch"/>
                    : <img className={styles.img} src="unliked.svg" alt="Watch"/>}
              </button>
            </div>
        ))}
      </div>
  );
};

export default Favourites;
