import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Recommendations.module.scss';
import { Recommendation, RecommendationsData, TMDBMovie } from '../../../types.js';
import { useWatched } from '../../../hooks/useWatched';

interface RecommendationsProps {
  recommendations: RecommendationsData;
}

export default function Recommendations({ recommendations }: RecommendationsProps) {
  const uid = localStorage.getItem('uid');
  const { watchedSet, toggleWatched } = useWatched(uid);

  const renderCategory = (heading: string, data: Recommendation) => (
      <div className={styles.category}>
        <h2>{heading}</h2>
        {Object.entries(data).map(([key, movies]) => (
            <div key={key} className={styles.subCategory}>
              <h3>{key}</h3>
              <ul className={styles.movieList}>
                {movies.map((movie) => (
                    <li key={movie.id} className={styles.movieItem}>
                      <div className={styles.movieWrapper}>
                        <Link
                            target="_blank"
                            to={`/movie/${movie.id}`}
                            rel="noopener noreferrer"
                            data-year={`(${movie.release_date?.slice(0, 4) || 'N/A'})`}
                            className={styles.movieLink}
                        >
                          {movie.title}
                        </Link>
                        <button
                            onClick={() => toggleWatched(movie as TMDBMovie)}
                            className={styles.watchedButton}
                        >
                          {watchedSet.has(movie.id)
                              ? <img className={styles.img} src="liked.svg" />
                              : <img className={styles.img} src="unliked.svg" />}
                        </button>
                      </div>
                    </li>
                ))}
              </ul>
            </div>
        ))}
      </div>
  );

  return (
      <div className={styles.recommendationsContainer}>
        {Object.keys(recommendations.recommendations_by_genre).length > 0 &&
            renderCategory('Recommendations by Genre', recommendations.recommendations_by_genre)}
        {Object.keys(recommendations.recommendations_by_director).length > 0 &&
            renderCategory('Recommendations by Director', recommendations.recommendations_by_director)}
        {Object.keys(recommendations.recommendations_by_actor).length > 0 &&
            renderCategory('Recommendations by Actor', recommendations.recommendations_by_actor)}
      </div>
  );
}
