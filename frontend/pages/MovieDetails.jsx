import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router';
import {
  Play,
  Plus,
  Check,
  ThumbsUp,
  ThumbsDown,
  Star,
  Clock,
  Trash2,
  Send,
  MessageSquare,
} from 'lucide-react';
import { MainLayout } from '@/layouts/MainLayout';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { MovieRow } from '@/components/MovieRow';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useWatchlist } from '@/context/WatchlistContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import movieService from '@/services/movieService';
import userService from '@/services/userService';
import reviewService from '@/services/reviewService';
import authService from '@/services/authService';


export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const { toggle: toggleWatchlistRaw, isInWatchlist } = useWatchlist();
  const toast = useToast();


  const [movie, setMovie] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(8);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);


  // Load movie details and its related movies
  const loadMovieData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await movieService.getById(id);
      if (res.success && res.data) {
        setMovie(res.data);
        setReviews(res.data.reviews || []);

        // Find similar movies from the backend endpoint
        const similarRes = await movieService.getSimilar(id);
        if (similarRes.success && similarRes.data) {
          setRelatedMovies(similarRes.data);
        }
      }
    } catch (err) {
      setLoadError(err.message || 'Failed to load movie details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMovieData();
    setIsPlayingTrailer(false);
  }, [loadMovieData]);

  // Play trailer and log watch progress to the database
  const handlePlayTrailer = async () => {
    if (isPending) return;
    if (!movie?.youtubeId) {
      toast.warning('Trailer is currently unavailable.');
      return;
    }
    setIsPlayingTrailer(true);
    if (user && movie) {
      setIsPending(true);
      try {
        // Record watch history at 45% progress to demonstrate "Continue Watching" feature
        await userService.addToWatchHistory({ movieId: movie._id, progress: 45 });
        const meRes = await authService.getMe();
        if (meRes.success) updateUserProfile(meRes.user);
      } catch {
        // Watch history update failure is non-critical — trailer still plays
      } finally {
        setIsPending(false);
      }
    }
  };

  // Toggle like — optimistic UI update backed by API call
  const handleLike = async () => {
    if (!user) {
      toast.warning('Please sign in to rate this film.');
      return;
    }
    if (isPending) return;
    setIsPending(true);

    try {
      const res = await userService.toggleLike(movie._id);
      if (res.success) {
        const wasDisliked = user.dislikedMovies?.some(
          (dm) => String(dm._id || dm) === String(movie._id)
        );

        setMovie((prev) => ({
          ...prev,
          likes: res.action === 'liked' ? prev.likes + 1 : prev.likes - 1,
          dislikes: wasDisliked ? prev.dislikes - 1 : prev.dislikes,
        }));

        const updatedLikedMovies = user.likedMovies ? [...user.likedMovies] : [];
        const updatedDislikedMovies = user.dislikedMovies ? [...user.dislikedMovies] : [];

        if (res.action === 'liked') {
          updatedLikedMovies.push(movie);
          const dislikeIndex = updatedDislikedMovies.findIndex(
            (dm) => String(dm._id || dm) === String(movie._id)
          );
          if (dislikeIndex > -1) updatedDislikedMovies.splice(dislikeIndex, 1);
        } else {
          const likeIndex = updatedLikedMovies.findIndex(
            (lm) => String(lm._id || lm) === String(movie._id)
          );
          if (likeIndex > -1) updatedLikedMovies.splice(likeIndex, 1);
        }

        updateUserProfile({
          ...user,
          likedMovies: updatedLikedMovies,
          dislikedMovies: updatedDislikedMovies,
        });
      }
    } catch {
      // Like toggle failure — UI will revert on next data fetch
    } finally {
      setIsPending(false);
    }
  };

  // Toggle dislike — optimistic UI update backed by API call
  const handleDislike = async () => {
    if (!user) {
      toast.warning('Please sign in to rate this film.');
      return;
    }
    if (isPending) return;
    setIsPending(true);

    try {
      const res = await userService.toggleDislike(movie._id);
      if (res.success) {
        const wasLiked = user.likedMovies?.some(
          (lm) => String(lm._id || lm) === String(movie._id)
        );

        setMovie((prev) => ({
          ...prev,
          dislikes: res.action === 'disliked' ? prev.dislikes + 1 : prev.dislikes - 1,
          likes: wasLiked ? prev.likes - 1 : prev.likes,
        }));

        const updatedLikedMovies = user.likedMovies ? [...user.likedMovies] : [];
        const updatedDislikedMovies = user.dislikedMovies ? [...user.dislikedMovies] : [];

        if (res.action === 'disliked') {
          updatedDislikedMovies.push(movie);
          const likeIndex = updatedLikedMovies.findIndex(
            (lm) => String(lm._id || lm) === String(movie._id)
          );
          if (likeIndex > -1) updatedLikedMovies.splice(likeIndex, 1);
        } else {
          const dislikeIndex = updatedDislikedMovies.findIndex(
            (dm) => String(dm._id || dm) === String(movie._id)
          );
          if (dislikeIndex > -1) updatedDislikedMovies.splice(dislikeIndex, 1);
        }

        updateUserProfile({
          ...user,
          likedMovies: updatedLikedMovies,
          dislikedMovies: updatedDislikedMovies,
        });
      }
    } catch {
      // Dislike toggle failure — non-critical
    } finally {
      setIsPending(false);
    }
  };

  // Toggle watchlist — disable clicks during request to prevent spam
  const handleToggleWatchlist = async () => {
    if (!user) {
      toast.warning('Please sign in to manage your watchlist.');
      return;
    }
    if (isPending) return;
    setIsPending(true);
    try {
      await toggleWatchlistRaw(movie._id, movie.title);
    } catch {
      // Toggle failure already toasted by WatchlistContext
    } finally {
      setIsPending(false);
    }
  };

  // Submit a new review or update existing one
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    setReviewError(null);

    try {
      const res = await reviewService.create({
        movieId: movie._id,
        rating: Number(newRating),
        comment: newComment,
      });

      if (res.success) {
        setNewComment('');
        toast.success('Review submitted successfully!');
        loadMovieData(); // Reload to show updated review list and recalculated rating
      }
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review. Please try again.');
      toast.error(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Delete a review (only own reviews, or admin can delete any)
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete your review? This will recalculate the movie average rating.')) return;
    try {
      const res = await reviewService.delete(reviewId);
      if (res.success) {
        toast.success('Review deleted successfully.');
        loadMovieData();
      }
    } catch (err) {
      toast.error(err.message || 'Error deleting review.');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-6 py-20 text-center animate-pulse" style={{ color: 'var(--cw-text2)' }}>
          Retrieving film details and critic logs...
        </div>
      </MainLayout>
    );
  }

  if (loadError || !movie) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-6 py-20 text-center space-y-4" style={{ color: 'var(--cw-text2)' }}>
          <p>{loadError || 'Cinematic title not found.'}</p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </MainLayout>
    );
  }

  const isInUserWatchlist = isInWatchlist(movie._id);
  const isLiked = user?.likedMovies?.some(
    (lm) => String(lm._id || lm) === String(movie._id)
  );
  const isDisliked = user?.dislikedMovies?.some(
    (dm) => String(dm._id || dm) === String(movie._id)
  );

  return (
    <MainLayout>
      <div className="relative">
        {/* Hero backdrop */}
        <div className="relative h-[80vh] min-h-[560px] overflow-hidden">
          <ImageWithFallback
            src={movie.backdrop?.url || movie.backdrop}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, var(--cw-bg) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, color-mix(in srgb, var(--cw-bg) 85%, transparent), transparent 60%)' }} />

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute bottom-0 left-0 right-0 px-6 md:px-10 lg:px-16 pb-16 max-w-4xl"
          >
            <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--cw-button)' }}>
              <span className="text-xs tracking-widest font-semibold uppercase">
                {movie.smartLabel || "CURATOR'S SELECTION"}
              </span>
            </div>
            <h1
              className="font-bold leading-none"
              style={{ color: 'var(--cw-text)', fontSize: 'clamp(40px, 7vw, 72px)' }}
            >
              {movie.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-4" style={{ color: 'var(--cw-text2)' }}>
              <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--cw-accent)' }}>
                <Star size={14} fill="currentColor" /> {movie.rating}/10
              </span>
              <span>{movie.year}</span>
              <span className="flex items-center gap-1">
                <Clock size={14} /> {movie.duration}
              </span>
              <div className="flex gap-2">
                {(movie.genres || []).map((genre) => (
                  <Badge key={genre} variant="primary">{genre}</Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-7">
              <Button size="lg" onClick={handlePlayTrailer} icon={<Play size={18} fill="white" />} disabled={isPending}>
                Play Trailer
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon={isInUserWatchlist ? <Check size={18} /> : <Plus size={18} />}
                onClick={handleToggleWatchlist}
                disabled={isPending}
              >
                {isInUserWatchlist ? 'In Watchlist' : 'Watchlist'}
              </Button>
              <button
                onClick={handleLike}
                disabled={isPending}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: isLiked ? 'var(--cw-button)' : 'var(--cw-card)',
                  color: isLiked ? 'white' : 'var(--cw-text)',
                  border: isLiked ? 'none' : '1px solid color-mix(in srgb, var(--cw-text) 10%, transparent)',
                }}
                title="Like film"
              >
                <ThumbsUp size={18} />
              </button>
              <button
                onClick={handleDislike}
                disabled={isPending}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: isDisliked ? 'var(--cw-button)' : 'var(--cw-card)',
                  color: isDisliked ? 'white' : 'var(--cw-text)',
                  border: isDisliked ? 'none' : '1px solid color-mix(in srgb, var(--cw-text) 10%, transparent)',
                }}
                title="Dislike film"
              >
                <ThumbsDown size={18} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Main content grid */}
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-3 gap-8 -mt-10 relative z-10">
          {/* Left column: synopsis, cast, trailer, reviews */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="rounded-2xl p-8 glass-strong border"
              style={{ borderColor: 'color-mix(in srgb, var(--cw-text) 8%, transparent)' }}
            >
              <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--cw-text)' }}>Synopsis</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--cw-text2)' }}>
                {movie.synopsis}
              </p>

              <h3 className="mt-8 text-md font-semibold" style={{ color: 'var(--cw-text)' }}>Cast</h3>
              <div className="flex flex-wrap gap-3 mt-3">
                {(movie.cast || []).map((actor) => (
                  <div key={actor} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/10 border border-white/5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-tr from-[var(--cw-button)] to-[var(--cw-accent)]">
                      {(actor || '').split(' ').map((namePart) => namePart[0]).join('')}
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--cw-text)' }}>{actor}</span>
                  </div>
                ))}
              </div>

              {/* YouTube Trailer Embed */}
              <div
                className="mt-8 rounded-2xl overflow-hidden aspect-video relative border"
                style={{ background: 'black', borderColor: 'color-mix(in srgb, var(--cw-text) 10%, transparent)' }}
              >
                {isPlayingTrailer && movie.youtubeId ? (
                  <>
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${movie.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                      title={`${movie.title} — Official Trailer`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-0 z-0"
                    />
                    <div className="absolute bottom-3 right-3 z-10">
                      <a
                        href={`https://www.youtube.com/watch?v=${movie.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-black/85 hover:bg-black text-white border border-white/15 transition-all flex items-center gap-1.5 hover:scale-105"
                      >
                        Watch on YouTube
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <ImageWithFallback
                      src={movie.backdrop?.url || movie.backdrop}
                      alt="trailer thumbnail"
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <motion.button
                        whileHover={{ scale: isPending ? 1 : 1.08 }}
                        whileTap={{ scale: isPending ? 1 : 0.95 }}
                        onClick={handlePlayTrailer}
                        disabled={isPending}
                        className="w-20 h-20 rounded-full flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ background: 'var(--cw-button)', boxShadow: '0 0 40px var(--cw-button)' }}
                        aria-label="Play trailer"
                      >
                        <Play size={28} color="white" fill="white" className="ml-1" />
                      </motion.button>
                    </div>
                    {!movie.youtubeId ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6 text-center select-none z-10 space-y-2">
                        <span className="text-2xl">📽️</span>
                        <h4 className="font-semibold text-sm text-white">Trailer Unavailable</h4>
                        <p className="text-xs" style={{ color: 'var(--cw-text2)' }}>
                          We couldn't fetch an official embed for this title.
                        </p>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </motion.div>

            {/* Reviews section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="rounded-2xl p-8 glass-strong border"
              style={{ borderColor: 'color-mix(in srgb, var(--cw-text) 8%, transparent)' }}
            >
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6" style={{ color: 'var(--cw-text)' }}>
                <MessageSquare size={20} style={{ color: 'var(--cw-button)' }} />
                Critic Reviews ({reviews.length})
              </h2>

              {/* Submit review form */}
              {user ? (
                <form onSubmit={handleSubmitReview} className="p-5 rounded-2xl bg-black/10 border border-white/5 mb-8 space-y-4">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--cw-text)' }}>Publish your perspective</h3>

                  {reviewError && (
                    <p className="text-xs text-red-400 font-medium">{reviewError}</p>
                  )}

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold" style={{ color: 'var(--cw-text2)' }}>Your Rating:</label>
                    <select
                      value={newRating}
                      onChange={(e) => setNewRating(Number(e.target.value))}
                      className="px-2 py-1 rounded bg-neutral-800 text-white border border-white/10 outline-none text-xs"
                    >
                      {Array.from({ length: 10 }, (_, i) => 10 - i).map((num) => (
                        <option key={num} value={num}>{num} / 10</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <textarea
                      placeholder="Share your review on this cinematic piece..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full min-h-[80px] p-3 rounded-xl bg-neutral-900/60 text-white placeholder-neutral-500 text-sm outline-none border border-white/10 focus:border-[var(--cw-button)] transition-all resize-y"
                      required
                    />
                    <div className="flex justify-end mt-2">
                      <Button type="submit" size="sm" loading={submittingReview} icon={<Send size={12} />}>
                        Publish Review
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-xl text-center bg-black/10 text-xs border border-dashed mb-8" style={{ borderColor: 'color-mix(in srgb, var(--cw-text) 10%, transparent)', color: 'var(--cw-text2)' }}>
                  Please log in to add a review.
                </div>
              )}

              {/* Reviews list */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review._id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 relative">
                      {user && (user._id === review.user?._id || user._id === review.user) && (
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-red-400 bg-black/20 hover:bg-black/40 transition-all"
                          title="Delete review"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-neutral-700 overflow-hidden">
                          {review.user?.avatar?.url ? (
                            <img src={review.user.avatar.url} alt={review.user?.name} className="w-full h-full object-cover" />
                          ) : (
                            review.user?.name ? review.user.name[0].toUpperCase() : 'U'
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: 'var(--cw-text)' }}>
                            {review.user?.name || 'Anonymous'}
                          </p>
                          <p className="text-[10px]" style={{ color: 'var(--cw-text2)' }}>
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-auto mr-8 flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                          <Star size={11} fill="currentColor" /> {review.rating}/10
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--cw-text2)' }}>
                        {review.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-center py-4" style={{ color: 'var(--cw-text2)' }}>
                    No reviews yet. Be the first to share your thoughts!
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right column: movie details sidebar */}
          <motion.aside
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="rounded-2xl p-6 h-fit border"
            style={{ background: 'var(--cw-card)', borderColor: 'color-mix(in srgb, var(--cw-text) 8%, transparent)' }}
          >
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--cw-text2)' }}>DETAILS</div>
            <dl className="mt-4 space-y-4" style={{ color: 'var(--cw-text)' }}>
              {[
                { label: 'Director', value: movie.director },
                { label: 'Released', value: movie.year },
                { label: 'Duration', value: movie.duration },
                { label: 'Views Logged', value: `${movie.views || 0} plays` },
                { label: 'Avg User Rating', value: movie.avgUserRating > 0 ? `${movie.avgUserRating}/10` : 'Not yet rated' },
              ].map((detailItem) => (
                <div
                  key={detailItem.label}
                  className="flex justify-between items-center text-xs py-2 border-b"
                  style={{ borderColor: 'color-mix(in srgb, var(--cw-text) 5%, transparent)' }}
                >
                  <dt style={{ color: 'var(--cw-text2)' }}>{detailItem.label}</dt>
                  <dd className="font-semibold">{detailItem.value}</dd>
                </div>
              ))}
              <div className="pt-2">
                <dt className="text-xs mb-2" style={{ color: 'var(--cw-text2)' }}>Genres</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {(movie.genres || []).map((genre) => (
                    <Badge key={genre}>{genre}</Badge>
                  ))}
                </dd>
              </div>
            </dl>
          </motion.aside>
        </div>

        {/* Related movies row */}
        <div className="mt-16">
          <MovieRow
            title="More Like This"
            movies={relatedMovies}
            hint="Selected because you opened this title"
          />
        </div>
      </div>
    </MainLayout>
  );
}
