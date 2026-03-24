import express, {Request, Response, Application} from 'express';
import mongoose, {Schema} from "mongoose";
import {COLLECTION_NAME, DATABASE_NAME, MONGO_URI} from "./config.js";

interface IWatchedMovie extends Document {
  uid: string;
  movieId: number;
  title: string;
  addedAt: Date;
}

const WatchedMovieSchema: Schema = new Schema({
  uid: {type: String, required: true, index: true},
  movieId: {type: Number, required: true},
  title: {type: String, required: true},
  addedAt: {type: Date, default: Date.now},
  poster_path: {type: String, required: false},
  release_date: {type: String, required: false},
  vote_average: {type: Number, required: false},
});

WatchedMovieSchema.index({uid: 1, movieId: 1}, {unique: true});

const WatchedMovie = mongoose.model<IWatchedMovie>('WatchedMovie', WatchedMovieSchema);

interface TMDBMovie {
  id: number;
  title: string;
  release_date?: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
}

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

interface TMDBResponse {
  results: TMDBMovie[];
  page: number;
  total_pages: number;
  total_results: number;
  vote_average: number;
  vote_count: number;
}

interface TMDBMovieDetails {
  id: number;
  title: string;
  genres: { id: number; name: string }[];
  credits: {
    crew: { name: string; job: string }[];
    cast: { name: string }[];
  };
}

interface Recommendation {
  id: number;
  title: string;
  release_date?: string;
  popularity: number;
}

const app: Application = express();

const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZTNiOGU1ZTE2MTg4YjFkNjJiM2NkMDg4NjI3M2E2MiIsIm5iZiI6MTc0Mzg4NDU2NC42ODUsInN1YiI6IjY3ZjE5MTE0ZjVhODBhYTU0NTk5YjBjMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ZPl3GcuQO2EfGQVPvj_--JZNN_gzeZVn_zmkL3tfOUA";

app.use(express.urlencoded({extended: true}));
app.use(express.json());

mongoose.connect(MONGO_URI, {dbName: DATABASE_NAME}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

const movieCollection = mongoose.connection.collection(COLLECTION_NAME);

app.get("/api/search", async (req: Request, res: Response) => {
  const query = req.query.query as string;
  if (query) {
    try {
      const movies: TMDBMovie[] = [];
      const pagesToFetch = 5;

      for (let page = 1; page <= pagesToFetch; page++) {
        const response = await fetch(
            `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
                query
            )}&language=en-US&page=${page}&sort_by=popularity.desc`,
            {
              headers: {
                Authorization: `Bearer ${TMDB_TOKEN}`,
                Accept: "application/json",
              },
            }
        );

        if (!response.ok) {
          throw new Error(`TMDB API error: ${response.statusText}`);
        }

        const data: TMDBResponse = await response.json();
        movies.push(...data.results);
      }

      // Сортуємо за популярністю (хоча API вже сортує, але для впевненості)
      movies.sort((a, b) => b.popularity - a.popularity);

      // Обмежуємо до 100 результатів і повертаємо лише потрібні поля
      const formattedMovies = movies.slice(0, 100).map((movie) => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        popularity: movie.popularity,
      }));

      res.json(formattedMovies);
    } catch (error) {
      console.error("Error fetching TMDB suggestions:", error);
      res.status(500).json({error: "Failed to fetch movie suggestions"});
    }
  } else {
    res.json([]);
  }
});

const GENRE_MAP: Record<string, number> = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  'Science Fiction': 878,
  'TV Movie': 10770,
  Thriller: 53,
  War: 10752,
  Western: 37,
};

app.post('/api/recommendations', async (req: Request, res: Response) => {
  const selectedMovies: { id: number; title: string }[] = req.body.movies || [];


  if (!selectedMovies.length) {
    console.log('No movies selected for recommendations');
    return res.json({
      recommendations_by_genre: {},
      recommendations_by_director: {},
      recommendations_by_actor: {},
    });
  }

  const MIN_COUNT = 3;
  const MIN_VOTE_COUNT = 1000;
  const PAGES_TO_FETCH = 3;

  try {
    const recommendationsByGenre: Record<string, Recommendation[]> = {};
    const recommendationsByDirector: Record<string, Recommendation[]> = {};
    const recommendationsByActor: Record<string, Recommendation[]> = {};

    const genreCounts: Record<string, number> = {};
    const directorCounts: Record<string, number> = {};
    const actorCounts: Record<string, number> = {};

    for (const movie of selectedMovies) {
      const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}?language=en-US&append_to_response=credits`,
          {
            headers: {
              Authorization: `Bearer ${TMDB_TOKEN}`,
              Accept: 'application/json',
            },
          }
      );

      if (!response.ok) {
        console.log(`Failed to fetch details for movie ID ${movie.id}: ${response.status}`);
        continue;
      }
      const movieDetails: TMDBMovieDetails = await response.json();

      movieDetails.genres.forEach((genre) => {
        genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
      });

      const director = movieDetails.credits.crew.find((person) => person.job === 'Director');
      if (director) {
        directorCounts[director.name] = (directorCounts[director.name] || 0) + 1;
      }

      movieDetails.credits.cast.slice(0, 5).forEach((actor) => {
        actorCounts[actor.name] = (actorCounts[actor.name] || 0) + 1;
      });
    }

    const allMovies: { vote_average: number; vote_count: number }[] = [];
    for (const movie of selectedMovies) {
      const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}?language=en-US`,
          {
            headers: {
              Authorization: `Bearer ${TMDB_TOKEN}`,
              Accept: 'application/json',
            },
          }
      );
      if (response.ok) {
        const data = await response.json();
        allMovies.push({vote_average: data.vote_average, vote_count: data.vote_count});
      } else {
        console.log(`Failed to fetch movie details for ID ${movie.id}: ${response.status}`);
      }
    }
    const C =
        allMovies.length > 0
            ? allMovies.reduce((sum, m) => sum + m.vote_average, 0) / allMovies.length
            : 7.0;

    const calculateWeightedRating = (movie: {
      vote_average: number;
      vote_count: number;
    }): number => {
      const R = movie.vote_average;
      const v = movie.vote_count;
      const m = MIN_VOTE_COUNT;
      return (v / (v + m)) * R + (m / (v + m)) * C;
    };

    const selectedMovieIds = new Set(selectedMovies.map((movie) => movie.id));

    for (const [genre, count] of Object.entries(genreCounts)) {
      if (count < MIN_COUNT) {
        continue;
      }

      const genreId = GENRE_MAP[genre];
      if (!genreId) {
        console.log(`No genre ID found for "${genre}"`);
        continue;
      }

      const genreMovies: any[] = [];
      for (let page = 1; page <= PAGES_TO_FETCH; page++) {
        const response = await fetch(
            `https://api.themoviedb.org/3/discover/movie?with_genres=${genreId}&language=en-US&sort_by=vote_count.desc&page=${page}`,
            {
              headers: {
                Authorization: `Bearer ${TMDB_TOKEN}`,
                Accept: 'application/json',
              },
            }
        );

        if (!response.ok) {
          console.log(`Failed to fetch movies for genre "${genre}" on page ${page}: ${response.status}`);
          continue;
        } else {
          console.log(`Fetched movies for genre "${genre}" on page ${page}: ${response.status}`);
        }

        const data: TMDBResponse = await response.json();
        genreMovies.push(...data.results);
      }

      console.log(genreMovies)

      recommendationsByGenre[genre] = genreMovies
          .filter((movie) => {
            const isValid = movie.vote_count >= MIN_VOTE_COUNT && !selectedMovieIds.has(movie.id);
            return isValid;
          })
          .map((movie) => ({
            ...movie,
            weighted_rating: calculateWeightedRating({
              vote_average: movie.vote_average,
              vote_count: movie.vote_count,
            }),
          }))
          .sort((a, b) => b.weighted_rating - a.weighted_rating)
          .slice(0, 5)
          .map((movie) => ({
            id: movie.id,
            title: movie.title,
            release_date: movie.release_date,
            popularity: movie.popularity,
            vote_average: movie.vote_average,
            vote_count: movie.vote_count,
            weighted_rating: movie.weighted_rating,
            poster_path: movie.poster_path,
          }));

    }

    for (const [director, count] of Object.entries(directorCounts)) {
      if (count < MIN_COUNT) {
        continue;
      }

      const response = await fetch(
          `https://api.themoviedb.org/3/search/person?query=${encodeURIComponent(director)}&language=en-US`,
          {
            headers: {
              Authorization: `Bearer ${TMDB_TOKEN}`,
              Accept: 'application/json',
            },
          }
      );

      if (!response.ok) {
        console.log(`Failed to fetch person "${director}": ${response.status}`);
        continue;
      }

      const data = await response.json();
      const person = data.results[0];
      if (!person) {
        continue;
      }

      const directorMovies: any[] = [];
      for (let page = 1; page <= PAGES_TO_FETCH; page++) {
        const moviesResponse = await fetch(
            `https://api.themoviedb.org/3/discover/movie?with_crew=${person.id}&language=en-US&sort_by=vote_count.desc&page=${page}`,
            {
              headers: {
                Authorization: `Bearer ${TMDB_TOKEN}`,
                Accept: 'application/json',
              },
            }
        );

        if (moviesResponse.ok) {
          const moviesData: TMDBResponse = await moviesResponse.json();
          directorMovies.push(...moviesData.results);
        } else {
          console.log(
              `Failed to fetch movies for director "${director}" on page ${page}: ${moviesResponse.status}`
          );
        }
      }

      recommendationsByDirector[director] = directorMovies
          .filter((movie) => {
            const isValid = movie.vote_count >= MIN_VOTE_COUNT && !selectedMovieIds.has(movie.id);
            return isValid;
          })
          .map((movie) => ({
            ...movie,
            weighted_rating: calculateWeightedRating({
              vote_average: movie.vote_average,
              vote_count: movie.vote_count,
            }),
          }))
          .sort((a, b) => b.weighted_rating - a.weighted_rating)
          .slice(0, 5)
          .map((movie) => ({
            id: movie.id,
            title: movie.title,
            release_date: movie.release_date,
            popularity: movie.popularity,
            vote_average: movie.vote_average,
            vote_count: movie.vote_count,
            weighted_rating: movie.weighted_rating,
            poster_path: movie.poster_path
          }));

    }

    // Рекомендації за акторами
    for (const [actor, count] of Object.entries(actorCounts)) {
      if (count < MIN_COUNT) {
        continue;
      }

      const response = await fetch(
          `https://api.themoviedb.org/3/search/person?query=${encodeURIComponent(actor)}&language=en-US`,
          {
            headers: {
              Authorization: `Bearer ${TMDB_TOKEN}`,
              Accept: 'application/json',
            },
          }
      );

      if (!response.ok) {
        console.log(`Failed to fetch person "${actor}": ${response.status}`);
        continue;
      }

      const data = await response.json();
      const person = data.results[0];
      if (!person) {
        continue;
      }

      const actorMovies: any[] = [];
      for (let page = 1; page <= PAGES_TO_FETCH; page++) {
        const moviesResponse = await fetch(
            `https://api.themoviedb.org/3/discover/movie?with_cast=${person.id}&language=en-US&sort_by=vote_count.desc&page=${page}`,
            {
              headers: {
                Authorization: `Bearer ${TMDB_TOKEN}`,
                Accept: 'application/json',
              },
            }
        );

        if (moviesResponse.ok) {
          const moviesData: TMDBResponse = await moviesResponse.json();
          actorMovies.push(...moviesData.results);
        } else {
          console.log(
              `Failed to fetch movies for actor "${actor}" on page ${page}: ${moviesResponse.status}`
          );
        }
      }

      recommendationsByActor[actor] = actorMovies
          .filter((movie) => {
            const isValid = movie.vote_count >= MIN_VOTE_COUNT && !selectedMovieIds.has(movie.id);
            return isValid;
          })
          .map((movie) => ({
            ...movie,
            weighted_rating: calculateWeightedRating({
              vote_average: movie.vote_average,
              vote_count: movie.vote_count,
            }),
          }))
          .sort((a, b) => b.weighted_rating - a.weighted_rating)
          .slice(0, 5)
          .map((movie) => ({
            id: movie.id,
            title: movie.title,
            release_date: movie.release_date,
            popularity: movie.popularity,
            vote_average: movie.vote_average,
            vote_count: movie.vote_count,
            weighted_rating: movie.weighted_rating,
            poster_path: movie.poster_path
          }));

    }

    res.json({
      recommendations_by_genre: recommendationsByGenre,
      recommendations_by_director: recommendationsByDirector,
      recommendations_by_actor: recommendationsByActor,
    });
  } catch (error) {
    console.log('Error generating recommendations:', error);
    console.error('Error generating recommendations:', error);
    res.status(500).json({error: 'Failed to generate recommendations'});
  }
});

app.get("/api/movie/:filmId", async (req: Request, res: Response) => {
  const {filmId} = req.params;

  if (!filmId || isNaN(Number(filmId))) {
    return res.status(400).json({error: "Invalid filmId"});
  }

  try {
    const response = await fetch(
        `https://api.themoviedb.org/3/movie/${filmId}?language=en-US`,
        {
          headers: {
            Authorization: `Bearer ${TMDB_TOKEN}`,
            Accept: "application/json",
          },
        }
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Failed to fetch movie details: ${response.status}`,
      });
    }

    const data: MovieDetails = await response.json();
    res.json({
      id: data.id,
      title: data.title,
      release_date: data.release_date,
      genres: data.genres,
      vote_average: data.vote_average,
      vote_count: data.vote_count,
      overview: data.overview,
      poster_path: data.poster_path,
    });
  } catch (err) {
    console.error(`Error fetching movie ${filmId}:`, err);
    res.status(500).json({error: "Could not load movie details"});
  }
});

app.post('/api/watched', async (req: Request, res: Response) => {
  const {uid, id: movieId, title, poster_path, release_date, vote_average} = req.body;

  if (!uid || !movieId || !title) {
    return res.status(400).json({error: 'uid, movieId and title are required'});
  }

  try {
    const watchedMovie = new WatchedMovie({
      uid,
      movieId: Number(movieId),
      title,
      poster_path,
      release_date,
      vote_average
    });
    await watchedMovie.save();
    res.status(201).json({message: 'Movie added to watched list', movie: watchedMovie});
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({error: 'Movie already in watched list'});
    }
    console.log('Error adding watched movie:', error.message);
    console.error('Error adding watched movie:', error);
    res.status(500).json({error: 'Failed to add movie to watched list'});
  }
});

app.get('/api/watched', async (req: Request, res: Response) => {
  const {uid} = req.query;

  if (!uid) {
    return res.status(400).json({error: 'uid is required'});
  }

  try {
    const watchedMovies = await WatchedMovie.find({uid}).sort({addedAt: -1});
    console.log('Fetched watched movies:', watchedMovies);
    res.json(watchedMovies);
  } catch (error) {
    console.error('Error fetching watched movies:', error);
    res.status(500).json({error: 'Failed to fetch watched movies'});
  }
});

app.delete('/api/watched', async (req: Request, res: Response) => {
  const {uid, movieId} = req.query;
  console.log('Received request to remove watched movie:', {uid, movieId});

  if (!uid || !movieId || isNaN(Number(movieId))) {
    return res.status(400).json({error: 'uid and valid movieId are required'});
  }

  try {
    const result = await WatchedMovie.deleteOne({uid, movieId: Number(movieId)});
    if (result.deletedCount === 0) {
      return res.status(404).json({error: 'Movie not found in watched list'});
    }
    res.json({message: 'Movie removed from watched list'});
  } catch (error) {
    console.error('Error removing watched movie:', error);
    res.status(500).json({error: 'Failed to remove movie from watched list'});
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;