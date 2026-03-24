import mongoose, { Schema, Document } from 'mongoose';

interface IWatchedMovie extends Document {
  uid: string;
  movieId: number;
  title: string;
  addedAt: Date;
}

const WatchedMovieSchema: Schema = new Schema({
  uid: { type: String, required: true, index: true },
  movieId: { type: Number, required: true },
  title: { type: String, required: true },
  addedAt: { type: Date, default: Date.now },
});

WatchedMovieSchema.index({ uid: 1, movieId: 1 }, { unique: true });

export default mongoose.model<IWatchedMovie>('WatchedMovie', WatchedMovieSchema);