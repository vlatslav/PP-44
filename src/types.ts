export interface Recommendation {
  [key: string]: {
    id: number;
    title: string;
    release_date?: string;
    popularity: number;
    vote_average?: number;
    vote_count?: number;
    weighted_rating?: number;
    poster_path?: string;
  }[];
}

export interface RecommendationsData {
  recommendations_by_genre: Recommendation;
  recommendations_by_director: Recommendation;
  recommendations_by_actor: Recommendation;
}

export interface TMDBMovie {
  id: number;
  title: string;
  release_date?: string;
  popularity: number;
}