import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, AreaChart, Area } from 'recharts';
import { Plus, Edit2, Trash2, Users, Film, Star, MessageSquare, Calendar, Activity as ActivityIcon, UserCheck, ShieldAlert, ShieldCheck, Eye, ThumbsUp, Play } from 'lucide-react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import MediaUploader from '@/components/MediaUploader';
import adminService from '@/services/adminService';
import movieService from '@/services/movieService';
import { useToast } from '@/context/ToastContext';

const tabs = ['Overview', 'Content', 'Users', 'Analytics'];


export default function Admin() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const toast = useToast();

  // Movie list states
  const [moviesList, setMoviesList] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [searchMovie, setSearchMovie] = useState('');
  
  // User list states
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userPages, setUserPages] = useState(1);

  // Delete Confirmation Modal States
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Movie Form Modal States
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null); // null means "Create", otherwise "Edit"
  const [submittingMovie, setSubmittingMovie] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
    rating: 7.5,
    duration: '2h 00m',
    genres: '',
    synopsis: '',
    cast: '',
    director: '',
    smartLabel: '',
    youtubeId: '',
    poster: { url: '', publicId: '' },
    backdrop: { url: '', publicId: '' },
  });

  // Load Dashboard Stats
  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await adminService.getDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch {
      // Stats load failure — UI shows empty state
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Load Movies List
  const loadMovies = useCallback(async () => {
    setLoadingMovies(true);
    try {
      const res = await movieService.getAll();
      if (res.success) {
        setMoviesList(res.data || []);
      }
    } catch {
      // Movies load failure — table shows empty state
    } finally {
      setLoadingMovies(false);
    }
  }, []);

  // Load Users List
  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await adminService.getUsers({ page: userPage, limit: 10, q: searchUser });
      if (res.success) {
        setUsersList(res.data || []);
        setUserPages(res.pages || 1);
      }
    } catch {
      // Users load failure — table shows empty state
    } finally {
      setLoadingUsers(false);
    }
  }, [userPage, searchUser]);

  useEffect(() => {
    loadStats();
    loadMovies();
  }, [loadStats, loadMovies]);

  useEffect(() => {
    if (activeTab === 'Users') {
      loadUsers();
    }
  }, [activeTab, loadUsers]);

  // Handle User Search Input
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (activeTab === 'Users') {
        setUserPage(1);
        loadUsers();
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchUser, activeTab]);

  // Open Movie Modal (Create Mode)
  const handleOpenCreateModal = () => {
    setEditingMovie(null);
    setFormError(null);
    setFormData({
      title: '',
      year: new Date().getFullYear(),
      rating: 7.5,
      duration: '2h 00m',
      genres: '',
      synopsis: '',
      cast: '',
      director: '',
      smartLabel: '',
      youtubeId: '',
      poster: { url: '', publicId: '' },
      backdrop: { url: '', publicId: '' },
    });
    setIsMovieModalOpen(true);
  };

  // Open Movie Modal (Edit Mode)
  const handleOpenEditModal = (movie) => {
    setEditingMovie(movie);
    setFormError(null);
    setFormData({
      title: movie.title || '',
      year: movie.year || new Date().getFullYear(),
      rating: movie.rating || 7.5,
      duration: movie.duration || '2h 00m',
      genres: Array.isArray(movie.genres) ? movie.genres.join(', ') : '',
      synopsis: movie.synopsis || '',
      cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : '',
      director: movie.director || '',
      smartLabel: movie.smartLabel || '',
      youtubeId: movie.youtubeId || '',
      poster: movie.poster || { url: '', publicId: '' },
      backdrop: movie.backdrop || { url: '', publicId: '' },
    });
    setIsMovieModalOpen(true);
  };

  // Submit Movie Form
  const handleSubmitMovie = async (e) => {
    e.preventDefault();
    setSubmittingMovie(true);
    setFormError(null);

    if (!formData.title || !formData.director || !formData.synopsis) {
      setFormError('Please fill in all required fields (Title, Director, Synopsis).');
      setSubmittingMovie(false);
      return;
    }

    if (!formData.poster?.url) {
      setFormError('Please upload a poster image.');
      setSubmittingMovie(false);
      return;
    }

    // Process fields
    const processedData = {
      ...formData,
      genres: formData.genres.split(',').map(genre => genre.trim()).filter(Boolean),
      cast: formData.cast.split(',').map(castMember => castMember.trim()).filter(Boolean),
      year: Number(formData.year),
      rating: Number(formData.rating),
    };

    try {
      if (editingMovie) {
        // Edit Mode
        const res = await movieService.update(editingMovie._id, processedData);
        if (res.success) {
          setIsMovieModalOpen(false);
          loadMovies();
          loadStats();
        }
      } else {
        // Create Mode
        const res = await movieService.create(processedData);
        if (res.success) {
          setIsMovieModalOpen(false);
          loadMovies();
          loadStats();
        }
      }
    } catch (err) {
      setFormError(err.message || 'Error processing movie.');
    } finally {
      setSubmittingMovie(false);
    }
  };

  // Delete Movie (triggers custom modal)
  const handleDeleteMovie = (movieId) => {
    const movie = moviesList.find((m) => m._id === movieId);
    const title = movie ? movie.title : 'this film';
    setDeleteTarget({
      type: 'movie',
      id: movieId,
      name: title,
      message: `Are you sure you want to delete "${title}"? This will permanently delete the film, all its user reviews, and all associated media assets.`
    });
    setDeleteConfirmOpen(true);
  };

  // Update User Role
  const handleUpdateUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await adminService.updateUserRole(userId, newRole);
      if (res.success) {
        toast.success(`Role updated successfully to ${newRole}.`);
        loadUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update user role.');
    }
  };

  // Delete User (triggers custom modal)
  const handleDeleteUser = (userId) => {
    const userItem = usersList.find((u) => u._id === userId);
    const userName = userItem ? userItem.name : 'this user';
    setDeleteTarget({
      type: 'user',
      id: userId,
      name: userName,
      message: `Are you sure you want to delete the user "${userName}"? This cascades and deletes their watchlist, reviews, activity, and Cloudinary avatar.`
    });
    setDeleteConfirmOpen(true);
  };

  // Execute delete after custom modal confirmation
  const executeDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'movie') {
        const res = await movieService.delete(deleteTarget.id);
        if (res.success) {
          toast.success('Film deleted successfully.');
          loadMovies();
          loadStats();
        }
      } else if (deleteTarget.type === 'user') {
        const res = await adminService.deleteUser(deleteTarget.id);
        if (res.success) {
          toast.success('User deleted successfully.');
          loadUsers();
          loadStats();
        }
      }
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message || `Error deleting ${deleteTarget.type}.`);
    } finally {
      setDeleting(false);
    }
  };


  // Filter movies for Content Tab
  const filteredMovies = moviesList.filter((m) =>
    m.title.toLowerCase().includes(searchMovie.toLowerCase())
  );

  // Month names list for analytics mapping
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const formattedSignups = stats?.monthlySignups
    ? stats.monthlySignups.map(item => ({
        m: monthNames[item._id - 1] || `Month ${item._id}`,
        v: item.count
      }))
    : [];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-end flex-wrap gap-4">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <div className="text-xs tracking-widest font-semibold" style={{ color: 'var(--cw-button)' }}>CONTROL CENTER</div>
            <h1 className="font-bold" style={{ color: 'var(--cw-text)', fontSize: 'clamp(32px, 5vw, 44px)' }}>
              Studio administration
            </h1>
          </motion.div>
          <div className="flex gap-2">
            <Button onClick={handleOpenCreateModal} icon={<Plus size={16} />}>New title</Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-6 p-1 rounded-xl w-fit" style={{ background: 'var(--cw-card)' }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: activeTab === tab ? 'var(--cw-button)' : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--cw-text2)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* LOADING STATS STATE */}
        {loadingStats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'var(--cw-card)' }} />
            ))}
          </div>
        ) : (
          /* Stat cards */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
            {[
              { label: 'Views', value: stats?.totalViews || 0, icon: <Eye size={18} /> },
              { label: 'Trailer starts', value: stats?.totalTrailerStarts || 0, icon: <Play size={18} /> },
              { label: 'Watchlist adds', value: stats?.watchlistEntries || 0, icon: <Star size={18} /> },
              { label: 'Likes', value: stats?.totalLikes || 0, icon: <ThumbsUp size={18} /> },
              { label: 'Reviews', value: stats?.reviewCount || 0, icon: <MessageSquare size={18} /> },
            ].map((statCard) => (
              <div key={statCard.label} className="rounded-2xl p-5" style={{ background: 'var(--cw-card)' }}>
                <div className="flex justify-between" style={{ color: 'var(--cw-text2)' }}>
                  <span className="text-xs font-medium uppercase tracking-wider">{statCard.label}</span>
                  <span style={{ color: 'var(--cw-button)' }}>{statCard.icon}</span>
                </div>
                <div className="text-3xl font-bold mt-2" style={{ color: 'var(--cw-text)' }}>{statCard.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* TAB CONTENTS */}
        <div className="mt-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'Overview' && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-2 rounded-2xl p-6 flex flex-col" style={{ background: 'var(--cw-card)' }}>
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--cw-text)' }}>
                  <ActivityIcon size={18} style={{ color: 'var(--cw-button)' }} /> Recent platform activity
                </h3>
                <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px]">
                  {loadingStats ? (
                    <p className="text-sm py-4 text-center" style={{ color: 'var(--cw-text2)' }}>Loading activities...</p>
                  ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((activity) => (
                      <div
                        key={activity._id}
                        className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/5"
                        style={{ borderBottom: '1px solid color-mix(in srgb, var(--cw-text) 5%, transparent)' }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs text-white" style={{ background: 'linear-gradient(135deg, var(--cw-button), var(--cw-accent))' }}>
                          {activity.user?.name ? activity.user.name.split(' ').map(n => n[0]).join('') : '?'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm" style={{ color: 'var(--cw-text)' }}>
                            <span className="font-medium">{activity.user?.name || 'Unknown User'}</span>{' '}
                            {activity.action === 'watch' ? 'watched' : activity.action === 'review' ? 'reviewed' : activity.action === 'like' ? 'liked' : 'saved'}{' '}
                            <span className="font-medium" style={{ color: 'var(--cw-button)' }}>{activity.movie?.title || 'a movie'}</span>
                          </p>
                          <span className="text-xs" style={{ color: 'var(--cw-text2)' }}>
                            {new Date(activity.createdAt).toLocaleDateString()} at {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm py-4 text-center" style={{ color: 'var(--cw-text2)' }}>No activities logged yet.</p>
                  )}
                </div>
              </div>

              {/* Top Rated / Popular Titles */}
              <div className="rounded-2xl p-6" style={{ background: 'var(--cw-card)' }}>
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--cw-text)' }}>
                  <Star size={18} style={{ color: 'var(--cw-button)' }} /> Top performing films
                </h3>
                <div className="space-y-4">
                  {loadingStats ? (
                    <p className="text-sm py-4 text-center" style={{ color: 'var(--cw-text2)' }}>Loading analytics...</p>
                  ) : stats?.topMovies && stats.topMovies.length > 0 ? (
                    stats.topMovies.map((movie, index) => (
                      <div key={movie._id} className="flex items-center justify-between p-3 rounded-xl bg-black/10">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-white/10" style={{ color: 'var(--cw-button)' }}>
                            #{index + 1}
                          </span>
                          <span className="text-sm font-medium truncate max-w-[140px]" style={{ color: 'var(--cw-text)' }}>
                            {movie.title}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold" style={{ color: 'var(--cw-text)' }}>
                            {movie.views} views
                          </p>
                          <p className="text-[10px]" style={{ color: 'var(--cw-text2)' }}>
                            {movie.likes} likes • {movie.rating} rating
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm py-4 text-center" style={{ color: 'var(--cw-text2)' }}>No film views recorded.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTENT (FILM LIBRARY) */}
          {activeTab === 'Content' && (
            <div className="rounded-2xl p-6" style={{ background: 'var(--cw-card)' }}>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h3 className="font-semibold" style={{ color: 'var(--cw-text)' }}>Film collection ({filteredMovies.length})</h3>
                <input
                  placeholder="Search titles…"
                  value={searchMovie}
                  onChange={(e) => setSearchMovie(e.target.value)}
                  className="px-4 py-2.5 rounded-xl outline-none text-sm w-full sm:max-w-xs transition-all focus:ring-2 focus:ring-[var(--cw-button)]/20"
                  style={{ background: 'var(--cw-bg)', color: 'var(--cw-text)' }}
                  id="admin-search-movies"
                />
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left" style={{ color: 'var(--cw-text)' }}>
                  <thead>
                    <tr className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cw-text2)', borderBottom: '2px solid color-mix(in srgb, var(--cw-text) 10%, transparent)' }}>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Director</th>
                      <th className="py-3 px-4">Genres</th>
                      <th className="py-3 px-4">Year</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4">Views</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingMovies ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-sm" style={{ color: 'var(--cw-text2)' }}>
                          Retrieving film library from database...
                        </td>
                      </tr>
                    ) : filteredMovies.length > 0 ? (
                      filteredMovies.map((m) => (
                        <tr
                          key={m._id}
                          className="hover:bg-white/5 transition-colors"
                          style={{ borderBottom: '1px solid color-mix(in srgb, var(--cw-text) 8%, transparent)' }}
                        >
                          <td className="py-4 px-4 text-sm font-semibold flex items-center gap-3">
                            {m.poster?.url && (
                              <img src={m.poster.url} alt={m.title} className="w-8 h-12 rounded object-cover" />
                            )}
                            <span>{m.title}</span>
                          </td>
                          <td className="py-4 px-4 text-sm" style={{ color: 'var(--cw-text2)' }}>{m.director}</td>
                          <td className="py-4 px-4 text-xs">
                            <div className="flex flex-wrap gap-1">
                              {m.genres.map(g => (
                                <span key={g} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10" style={{ color: 'var(--cw-text2)' }}>
                                  {g}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm">{m.year}</td>
                          <td className="py-4 px-4 text-sm font-medium" style={{ color: 'var(--cw-button)' }}>{m.rating}/10</td>
                          <td className="py-4 px-4 text-sm">{m.views || 0}</td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleOpenEditModal(m)}
                                className="p-2 rounded-xl transition-transform hover:scale-110"
                                style={{ background: 'var(--cw-bg)', color: 'var(--cw-text)' }}
                                title="Edit Title"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteMovie(m._id)}
                                className="p-2 rounded-xl transition-transform hover:scale-110 hover:text-red-400"
                                style={{ background: 'var(--cw-bg)' }}
                                title="Delete Title"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-sm" style={{ color: 'var(--cw-text2)' }}>
                          No films found matching search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: USER MANAGEMENT */}
          {activeTab === 'Users' && (
            <div className="rounded-2xl p-6" style={{ background: 'var(--cw-card)' }}>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h3 className="font-semibold" style={{ color: 'var(--cw-text)' }}>Registered members</h3>
                <input
                  placeholder="Search name or email…"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="px-4 py-2.5 rounded-xl outline-none text-sm w-full sm:max-w-xs transition-all focus:ring-2 focus:ring-[var(--cw-button)]/20"
                  style={{ background: 'var(--cw-bg)', color: 'var(--cw-text)' }}
                  id="admin-search-users"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left" style={{ color: 'var(--cw-text)' }}>
                  <thead>
                    <tr className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cw-text2)', borderBottom: '2px solid color-mix(in srgb, var(--cw-text) 10%, transparent)' }}>
                      <th className="py-3 px-4">Avatar</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUsers ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-sm" style={{ color: 'var(--cw-text2)' }}>
                          Retrieving users from database...
                        </td>
                      </tr>
                    ) : usersList.length > 0 ? (
                      usersList.map((registeredUser) => (
                        <tr
                          key={registeredUser._id}
                          className="hover:bg-white/5 transition-colors"
                          style={{ borderBottom: '1px solid color-mix(in srgb, var(--cw-text) 8%, transparent)' }}
                        >
                          <td className="py-4 px-4">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--cw-button), var(--cw-accent))' }}>
                              {registeredUser.avatar?.url ? (
                                <img src={registeredUser.avatar.url} alt={registeredUser.name} className="w-full h-full object-cover" />
                              ) : (
                                registeredUser.name.split(' ').map((namePart) => namePart[0]).join('').slice(0, 2).toUpperCase()
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm font-semibold">{registeredUser.name}</td>
                          <td className="py-4 px-4 text-sm" style={{ color: 'var(--cw-text2)' }}>{registeredUser.email}</td>
                          <td className="py-4 px-4 text-sm font-medium">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              registeredUser.role === 'admin'
                                ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                                : 'bg-blue-400/10 text-blue-400 border border-blue-400/20'
                            }`}>
                              {registeredUser.role === 'admin' ? <ShieldCheck size={12} /> : <UserCheck size={12} />}
                              {registeredUser.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-neutral-400">
                            {new Date(registeredUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleUpdateUserRole(registeredUser._id, registeredUser.role)}
                                className="p-2 rounded-xl transition-transform hover:scale-110"
                                style={{ background: 'var(--cw-bg)', color: 'var(--cw-text)' }}
                                title={registeredUser.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                              >
                                {registeredUser.role === 'admin' ? <ShieldAlert size={14} className="text-red-400" /> : <UserCheck size={14} className="text-green-400" />}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(registeredUser._id)}
                                className="p-2 rounded-xl transition-transform hover:scale-110 hover:text-red-400"
                                style={{ background: 'var(--cw-bg)' }}
                                title="Delete User"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-sm" style={{ color: 'var(--cw-text2)' }}>
                          No users found matching search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {userPages > 1 && (
                <div className="flex justify-end items-center gap-2 mt-6">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={userPage === 1}
                    onClick={() => setUserPage(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-xs" style={{ color: 'var(--cw-text2)' }}>
                    Page {userPage} of {userPages}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={userPage === userPages}
                    onClick={() => setUserPage(prev => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DETAILED ANALYTICS */}
          {activeTab === 'Analytics' && (
            <div className="space-y-6">
              {/* Signup Graph */}
              <div className="rounded-2xl p-6" style={{ background: 'var(--cw-card)' }}>
                <h3 className="font-semibold mb-4" style={{ color: 'var(--cw-text)' }}>Monthly user registrations (MERN database statistics)</h3>
                <div className="h-64">
                  {loadingStats ? (
                    <div className="h-full flex items-center justify-center text-sm" style={{ color: 'var(--cw-text2)' }}>Loading user statistics...</div>
                  ) : formattedSignups.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={formattedSignups}>
                        <Tooltip contentStyle={{ background: 'var(--cw-bg)', border: 'none', borderRadius: 12, color: 'var(--cw-text)' }} />
                        <XAxis dataKey="m" stroke="var(--cw-text2)" />
                        <Bar dataKey="v" fill="var(--cw-button)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-neutral-400">No member signups in the past year.</div>
                  )}
                </div>
              </div>

              {/* Genre Metrics (2-column layout) */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Library Volume Chart */}
                <div className="rounded-2xl p-6" style={{ background: 'var(--cw-card)' }}>
                  <h3 className="font-semibold mb-4" style={{ color: 'var(--cw-text)' }}>Genre distribution (Library volume)</h3>
                  <div className="h-64">
                    {loadingStats ? (
                      <div className="h-full flex items-center justify-center text-sm" style={{ color: 'var(--cw-text2)' }}>Loading database statistics...</div>
                    ) : stats?.genreDistribution && stats.genreDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.genreDistribution} layout="vertical">
                          <Tooltip contentStyle={{ background: 'var(--cw-bg)', border: 'none', borderRadius: 12, color: 'var(--cw-text)' }} />
                          <XAxis type="number" stroke="var(--cw-text2)" />
                          <Bar dataKey="count" fill="var(--cw-accent)" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-sm text-neutral-400">No genre data available.</div>
                    )}
                  </div>
                </div>

                {/* Popular Genres Chart (User Demand) */}
                <div className="rounded-2xl p-6" style={{ background: 'var(--cw-card)' }}>
                  <h3 className="font-semibold mb-4" style={{ color: 'var(--cw-text)' }}>Most popular genres (User demand)</h3>
                  <div className="h-64">
                    {loadingStats ? (
                      <div className="h-full flex items-center justify-center text-sm" style={{ color: 'var(--cw-text2)' }}>Loading demand statistics...</div>
                    ) : stats?.popularGenres && stats.popularGenres.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.popularGenres} layout="vertical">
                          <Tooltip contentStyle={{ background: 'var(--cw-bg)', border: 'none', borderRadius: 12, color: 'var(--cw-text)' }} />
                          <XAxis type="number" stroke="var(--cw-text2)" />
                          <Bar dataKey="count" fill="var(--cw-button)" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-sm text-neutral-400">No user interaction data yet.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Film Popularity Statistics (Full width below) */}
              <div className="rounded-2xl p-6" style={{ background: 'var(--cw-card)' }}>
                <h3 className="font-semibold mb-6" style={{ color: 'var(--cw-text)' }}>Film popularity statistics (Total engagement data)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loadingStats ? (
                    <p className="text-sm py-4 text-center col-span-full" style={{ color: 'var(--cw-text2)' }}>Loading statistics...</p>
                  ) : stats?.topMovies && stats.topMovies.length > 0 ? (
                    stats.topMovies.map((movie) => {
                      const score = movie.views ? Math.round((movie.likes / movie.views) * 100) : 0;
                      return (
                        <div key={movie._id} className="p-4 rounded-xl bg-black/15 flex flex-col gap-2 justify-between">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-semibold text-sm line-clamp-1" style={{ color: 'var(--cw-text)' }}>{movie.title}</span>
                            <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--cw-button)' }}>{movie.views} views</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden my-1">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(score, 100)}%`, background: 'var(--cw-accent)' }} />
                          </div>
                          <div className="flex justify-between items-center text-[10px]" style={{ color: 'var(--cw-text2)' }}>
                            <span>Approval rating: {score}%</span>
                            <span>Likes: {movie.likes} • Rating: {movie.rating}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm py-4 text-center col-span-full" style={{ color: 'var(--cw-text2)' }}>No movie engagement data available.</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* CREATE / EDIT TITLE MODAL */}
      <Modal
        open={isMovieModalOpen}
        onClose={() => setIsMovieModalOpen(false)}
        title={editingMovie ? 'Modify cinematic title' : 'Curate new title'}
        size="lg"
      >
        <form onSubmit={handleSubmitMovie} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 pr-3">
          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-xs border border-red-500/20 font-medium">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="movie-title"
              label="Title *"
              placeholder="e.g. Neon Cartographer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Input
              id="movie-director"
              label="Director *"
              placeholder="e.g. Sofia Marin"
              value={formData.director}
              onChange={(e) => setFormData({ ...formData, director: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              id="movie-year"
              label="Release Year *"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 2026 })}
              required
            />
            <Input
              id="movie-rating"
              label="IMDb Rating *"
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 7.5 })}
              required
            />
            <Input
              id="movie-duration"
              label="Duration *"
              placeholder="e.g. 2h 15m"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="movie-genres"
              label="Genres (comma separated) *"
              placeholder="e.g. Sci-Fi, Drama, Action"
              value={formData.genres}
              onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
              required
            />
            <Input
              id="movie-smartLabel"
              label="Custom Smart Label (optional)"
              placeholder="e.g. Late Night Pick"
              value={formData.smartLabel}
              onChange={(e) => setFormData({ ...formData, smartLabel: e.target.value })}
            />
          </div>

          <Input
            id="movie-cast"
            label="Cast (comma separated)"
            placeholder="e.g. Maya Chen, Idris Hawthorne"
            value={formData.cast}
            onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
          />

          <div className="space-y-1">
            <label className="block text-xs font-medium" style={{ color: 'var(--cw-text2)' }}>
              Synopsis *
            </label>
            <textarea
              placeholder="Provide a compelling descriptive synopsis of this film..."
              value={formData.synopsis}
              onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
              className="w-full px-4 py-3 rounded-xl outline-none transition-all focus:ring-2 focus:ring-[var(--cw-button)]/30 text-sm h-24 resize-y"
              style={{ background: 'var(--cw-card)', color: 'var(--cw-text)', border: '1px solid color-mix(in srgb, var(--cw-text) 10%, transparent)' }}
              required
            />
          </div>

          {/* Cloudinary media pipelines */}
          <div className="border-t pt-4 space-y-4" style={{ borderColor: 'color-mix(in srgb, var(--cw-text) 10%, transparent)' }}>
            <h4 className="text-sm font-semibold" style={{ color: 'var(--cw-text)' }}>Cloudinary Media Uploads</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MediaUploader
                type="poster"
                label="Poster Image (portrait) *"
                previewUrl={formData.poster?.url}
                onUploadSuccess={(media) => setFormData({ ...formData, poster: media })}
              />
              <MediaUploader
                type="backdrop"
                label="Backdrop Image (landscape)"
                previewUrl={formData.backdrop?.url}
                onUploadSuccess={(media) => setFormData({ ...formData, backdrop: media })}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium" style={{ color: 'var(--cw-text2)' }}>YouTube Trailer ID</label>
              <input
                type="text"
                placeholder="e.g. dQw4w9WgXcQ"
                value={formData.youtubeId}
                onChange={(e) => setFormData({ ...formData, youtubeId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl outline-none text-sm transition-all focus:ring-2 focus:ring-[var(--cw-button)]/30"
                style={{ background: 'var(--cw-card)', color: 'var(--cw-text)', border: '1px solid color-mix(in srgb, var(--cw-text) 10%, transparent)' }}
              />
              <p className="text-[10px]" style={{ color: 'var(--cw-text2)' }}>
                Paste the YouTube video ID from the trailer URL (e.g. from youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>)
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'color-mix(in srgb, var(--cw-text) 10%, transparent)' }}>
            <Button
              type="button"
              variant="secondary"
              disabled={submittingMovie}
              onClick={() => setIsMovieModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submittingMovie}
            >
              {editingMovie ? 'Save Changes' : 'Publish Title'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        open={deleteConfirmOpen}
        onClose={() => !deleting && setDeleteConfirmOpen(false)}
        title="Are you sure?"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--cw-text2)' }}>
            {deleteTarget?.message}
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              disabled={deleting}
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={deleting}
              onClick={executeDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
