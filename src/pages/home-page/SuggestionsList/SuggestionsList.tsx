import styles from './SuggestionsList.module.scss';

interface TMDBMovie {
  id: number;
  title: string;
  release_date?: string;
}

interface SuggestionsListProps {
  suggestions: TMDBMovie[];
  onSelect: (movie: TMDBMovie) => void;
}

export default function SuggestionsList({suggestions, onSelect}: SuggestionsListProps) {
  return (
      <ul className={styles.list}>
        {suggestions.map((movie) => (
            <li
                key={movie.id}
                onClick={() => onSelect(movie)}
                onKeyDown={(e) => e.key === 'Enter' && onSelect(movie)}
                role="option"
                aria-selected="false"
            >
              {movie.title}
              {movie.release_date && (
                  <span>({new Date(movie.release_date).getFullYear()})</span>
              )}
            </li>
        ))}
      </ul>
  );
}