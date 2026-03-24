import styles from './SearchInput.module.scss';
import activeImg from "../../../../public/view active.png";
import passiveImg from "../../../../public/view passive.png";
import close from "../../../../public/close.png";
import { TMDBMovie } from "../../../types";
import {useState} from "react";

interface SearchInputProps {
  query: string;
  setQuery: (value: string) => void;
  selected: TMDBMovie[];
  removeMovie: (id: number) => void;
}

export default function SearchInput({ query, setQuery, selected, removeMovie }: SearchInputProps) {
  const [active, setActive] = useState<boolean>(false);

  return (
      <div className={styles.form}>
        <input
            type="text"
            value={query}
            onChange={({ target: { value } }) => setQuery(value)}
            placeholder="Enter movie title"
            autoComplete="off"
        />
        <button
            className={styles.watchedButton}
            onClick={() => setActive(!active)}
        >
          {active
              ? <img className={styles.img} src={activeImg} alt="Unwatch" />
              : <img className={styles.img} src={passiveImg} alt="Watch" />
          }
        </button>
        {active && (
            <div className={styles.dropdown}>
              {selected.length === 0 ? (
                  <p className={styles.noMovies}>No movies selected.</p>
              ) : (
                  selected.map((movie) => (
                      <div key={movie.id} className={styles.movieItem}>
                        <div className={styles.movieInfo}>
                          <h3 className={styles.movieTitle}>{movie.title}</h3>
                          <p className={styles.movieDetail}>
                            <strong>Release Year:</strong>{" "}
                            {movie.release_date?.slice(0, 4) ?? "N/A"}
                          </p>
                        </div>
                        <button
                            className={styles.closeButton}
                            onClick={() => removeMovie(movie.id)}
                        >
                          <img src={close} alt="Remove" className={styles.closeImg} />
                        </button>
                      </div>
                  ))
              )}
            </div>
        )}
      </div>
  );
}
