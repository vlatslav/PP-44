// server/user.ts
interface Movie {
  Title?: string;
  Genre?: string;
  Director?: string;
  Actors?: string;
  Rating?: number;
  [key: string]: any;
}

export class User {
  username: string;
  watchedMovies: Movie[];
  genreCounts: { [key: string]: number };
  directorCounts: { [key: string]: number };
  actorCounts: { [key: string]: number };

  constructor(username: string = "Guest") {
    this.username = username;
    this.watchedMovies = [];
    this.genreCounts = {};
    this.directorCounts = {};
    this.actorCounts = {};
  }

  addWatchedMovie(movie: Movie): void {
    this.watchedMovies.push(movie);
    const genres = movie.Genre?.split(",") || [];
    genres.forEach((genre) => {
      const trimmedGenre = genre.trim();
      this.genreCounts[trimmedGenre] = (this.genreCounts[trimmedGenre] || 0) + 1;
    });

    const director = movie.Director?.trim() || "";
    this.directorCounts[director] = (this.directorCounts[director] || 0) + 1;

    const actors = movie.Actors?.split(",") || [];
    actors.forEach((actor) => {
      const trimmedActor = actor.trim();
      this.actorCounts[trimmedActor] = (this.actorCounts[trimmedActor] || 0) + 1;
    });
  }
}