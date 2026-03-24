import React, { useState } from 'react';
import styles from './HomePage.module.scss';
import SearchInput from './SearchInput/SearchInput.js';
import SuggestionsList from './SuggestionsList/SuggestionsList.js';
import Recommendations from './Recommendations/Recommendations.js';
import AlertMessage from "../../components/AlertMessage/AlertMessage";
import { useSelectedMovies } from '../../hooks/useSelectedMovies';
import { useSearchSuggestions } from '../../hooks/useSearchSuggestions';
import { useRecommendations } from '../../hooks/useRecommendations';

const HomePage = () => {
  const [query, setQuery] = useState('');
  const suggestions = useSearchSuggestions(query);

  const { selected, addMovie, removeMovie } = useSelectedMovies();
  const { recommendations, isLoading, message, code, fetchRecs } = useRecommendations();

  return (
      <div className={styles.app}>
        <h1>Find Your Next Movie</h1>
        <div className={styles.form}>
          <SearchInput
              query={query}
              setQuery={setQuery}
              selected={selected}
              removeMovie={removeMovie}
          />
        </div>

        {suggestions.length > 0 && (
            <SuggestionsList suggestions={suggestions} onSelect={addMovie} />
        )}

        <button
            onClick={() => fetchRecs(selected)}
            disabled={isLoading || selected.length === 0}
        >
          {isLoading ? 'Loading...' : 'Get Recommendations'}
        </button>

        {recommendations && <Recommendations recommendations={recommendations} />}

        {message && (
            <AlertMessage code={code} message={message} setMessage={() => {}} duration={3000} />
        )}
      </div>
  );
};

export default HomePage;
