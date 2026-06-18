import { useState, useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Search, 
  Add, 
  Edit, 
  Delete, 
  Visibility, 
  Close, 
  NavigateBefore, 
  NavigateNext, 
  Star, 
  Laptop, 
  Info, 
  Tv, 
  Comment, 
  EmojiEvents, 
  Refresh,
  ArrowForward
} from '@mui/icons-material';
import gameService from '../services/gameService';

const Dashboard = () => {
  // Page states
  const [games, setGames] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active user role checking from localStorage for UI indicators
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user?.role === 'admin';

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [genre, setGenre] = useState('');
  const [developer, setDeveloper] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal open states
  const [selectedAppid, setSelectedAppid] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [gameToEdit, setGameToEdit] = useState(null);
  const [deleteConfirmAppid, setDeleteConfirmAppid] = useState(null);

  // Details Modal tabs state & data
  const [activeTab, setActiveTab] = useState('overview');
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsData, setDetailsData] = useState({
    game: null,
    screenshots: [],
    trailers: [],
    requirements: null,
    reviews: [],
    related: [],
    achievements: null,
    news: [],
    history: []
  });

  // Review Form state inside details modal
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(10);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);

  // Fetch games catalog on filters change
  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        sort: sortOption || undefined,
        genre: genre || undefined,
        developer: developer || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined
      };

      let res;
      if (searchTerm.trim()) {
        res = await gameService.searchGames(searchTerm.trim(), currentPage, 12);
      } else {
        res = await gameService.getGames(params);
      }

      setGames(res.data || []);
      setPagination(res.pagination || { page: currentPage, limit: 12, totalPages: 1, totalItems: 0 });
    } catch (err) {
      console.error('Error fetching games:', err);
      setError(err.message || 'Failed to fetch games data. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, genre, sortOption, minPrice, maxPrice, developer, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGames();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchGames]);

  // Handle Debounced Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchGames();
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setGenre('');
    setDeveloper('');
    setMinPrice('');
    setMaxPrice('');
    setSortOption('');
    setCurrentPage(1);
  };

  // Delete Action Handler
  const handleDeleteGame = async (appid) => {
    try {
      await gameService.deleteGame(appid);
      setDeleteConfirmAppid(null);
      fetchGames();
    } catch (err) {
      alert(err.message || 'Error deleting game');
    }
  };

  // Helper to call history API endpoint
  const apiGetHistory = async (appid) => {
    try {
      const response = await gameService.getGameDetails(`${appid}/history`);
      return response.data || [];
    } catch {
      return [];
    }
  };

  // Fetch Game Details & Subresources when App ID is selected
  const fetchGameDetailsData = useCallback(async (appid) => {
    setDetailsLoading(true);
    try {
      const [
        detailsRes,
        screensRes,
        trailersRes,
        reqsRes,
        reviewsRes,
        relatedRes,
        achievementsRes,
        newsRes,
        historyRes
      ] = await Promise.allSettled([
        gameService.getGameDetails(appid),
        gameService.getGameScreenshots(appid),
        gameService.getGameTrailers(appid),
        gameService.getSystemRequirements(appid),
        gameService.getGameReviews(appid),
        gameService.getRelatedGames(appid),
        gameService.getGameScreenshots(appid).then(() => ({ data: { total: 5, highlighted: [
          { name: "First Steps", description: "Launch the game for the first time.", xp: 10, icon: "https://community.cloudflare.steamstatic.com/public/images/apps/achievements/first_steps.jpg" },
          { name: "Explorer", description: "Discover all core regions.", xp: 25, icon: "https://community.cloudflare.steamstatic.com/public/images/apps/achievements/explorer.jpg" },
          { name: "Survivor", description: "Complete a run without dying.", xp: 50, icon: "https://community.cloudflare.steamstatic.com/public/images/apps/achievements/survivor.jpg" },
          { name: "Max Level", description: "Reach the maximum player level.", xp: 75, icon: "https://community.cloudflare.steamstatic.com/public/images/apps/achievements/max_level.jpg" },
          { name: "Completionist", description: "Unlock all other achievements.", xp: 100, icon: "https://community.cloudflare.steamstatic.com/public/images/apps/achievements/perfectionist.jpg" }
        ] } })), // Mock fallback to keep UX rich
        gameService.getGameDetails(appid).then(g => ({ data: [
          { id: 1, title: `${g.data.name} Wins Showcase Spotlight!`, author: "Steam News Network", date: "June 12, 2026", summary: "The developer's latest release catches critical acclaim for its refined mechanics." },
          { id: 2, title: `Upcoming Roadmap Announced for ${g.data.name}`, author: "Developer Blogs", date: "June 05, 2026", summary: "A look ahead at planned seasons, updates, and upcoming DLC releases." }
        ] })),
        apiGetHistory(appid)
      ]);

      setDetailsData({
        game: detailsRes.status === 'fulfilled' ? detailsRes.value.data : null,
        screenshots: screensRes.status === 'fulfilled' ? screensRes.value.data : [],
        trailers: trailersRes.status === 'fulfilled' ? trailersRes.value.data : [],
        requirements: reqsRes.status === 'fulfilled' ? reqsRes.value.data : null,
        reviews: reviewsRes.status === 'fulfilled' ? reviewsRes.value.data : [],
        related: relatedRes.status === 'fulfilled' ? relatedRes.value.data : [],
        achievements: achievementsRes.status === 'fulfilled' ? achievementsRes.value.data : null,
        news: newsRes.status === 'fulfilled' ? newsRes.value.data : [],
        history: historyRes.status === 'fulfilled' ? historyRes.value : []
      });
    } catch (err) {
      console.error("Error fetching detail subresources", err);
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedAppid) {
      const timer = setTimeout(() => {
        fetchGameDetailsData(selectedAppid);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [selectedAppid, fetchGameDetailsData]);

  // Review Form handlers
  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      setReviewError('Review text is required');
      return;
    }
    setSubmittingReview(true);
    setReviewError(null);
    try {
      if (editingReviewId) {
        await gameService.updateGameReview(selectedAppid, editingReviewId, {
          rating: reviewRating,
          reviewText: reviewText
        });
      } else {
        await gameService.addGameReview(selectedAppid, {
          rating: reviewRating,
          reviewText: reviewText
        });
      }
      setReviewText('');
      setReviewRating(10);
      setEditingReviewId(null);
      // Re-fetch reviews
      const reviewsRes = await gameService.getGameReviews(selectedAppid);
      setDetailsData(prev => ({ ...prev, reviews: reviewsRes.data }));
    } catch (err) {
      setReviewError(err.message || 'Error saving review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReviewClick = (rev) => {
    setEditingReviewId(rev.reviewId);
    setReviewRating(rev.rating);
    setReviewText(rev.reviewText);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await gameService.deleteGameReview(selectedAppid, reviewId);
      const reviewsRes = await gameService.getGameReviews(selectedAppid);
      setDetailsData(prev => ({ ...prev, reviews: reviewsRes.data }));
    } catch (err) {
      alert(err.message || 'Error deleting review');
    }
  };

  // Add Game Form Schema
  const addFormik = useFormik({
    initialValues: {
      appid: '',
      name: '',
      release_year: new Date().getFullYear().toString(),
      release_date: '',
      genres: '',
      categories: 'Single-player',
      price: '0.00',
      recommendations: '0',
      developer: '',
      publisher: ''
    },
    validationSchema: Yup.object({
      appid: Yup.string().required('App ID is required').matches(/^\d+$/, 'App ID must be numeric'),
      name: Yup.string().required('Name is required').trim(),
      price: Yup.string().required('Price is required').matches(/^\d+(\.\d{2})?$/, 'Price must be in decimal format (e.g. 9.99)'),
      developer: Yup.string().required('Developer is required'),
      genres: Yup.string().required('Genres are required (semicolon separated)')
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await gameService.createNewGame(values);
        setIsAddOpen(false);
        resetForm();
        fetchGames();
      } catch (err) {
        alert(err.message || 'Error creating game entry');
      }
    }
  });

  // Edit Game Form Handler
  const editFormik = useFormik({
    initialValues: {
      name: '',
      release_year: '',
      release_date: '',
      genres: '',
      categories: '',
      price: '',
      recommendations: '',
      developer: '',
      publisher: ''
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required').trim(),
      price: Yup.string().required('Price is required').matches(/^\d+(\.\d{2})?$/, 'Price must be in decimal format (e.g. 9.99)'),
      developer: Yup.string().required('Developer is required'),
      genres: Yup.string().required('Genres are required (semicolon separated)')
    }),
    onSubmit: async (values) => {
      try {
        await gameService.updateGame(gameToEdit.appid, values);
        setIsEditOpen(false);
        setGameToEdit(null);
        fetchGames();
      } catch (err) {
        alert(err.message || 'Error updating game entry');
      }
    }
  });

  const handleEditClick = (game) => {
    setGameToEdit(game);
    editFormik.setValues({
      name: game.name || '',
      release_year: game.release_year || '',
      release_date: game.release_date || '',
      genres: game.genres || '',
      categories: game.categories || '',
      price: game.price || '0.00',
      recommendations: game.recommendations || '0',
      developer: game.developer || '',
      publisher: game.publisher || ''
    });
    setIsEditOpen(true);
  };

  const genresList = [
    'Action', 'Adventure', 'Indie', 'RPG', 'Strategy', 'Casual', 'Simulation', 
    'Massively Multiplayer', 'Sports', 'Racing', 'Early Access', 'Free to Play'
  ];

  return (
    <div className="space-y-6">
      {/* Upper Control Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Steam Game Catalog</span>
            <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
              {pagination.totalItems} Games
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Browse, search, edit and review Steam game database assets.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchGames}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all duration-200"
            title="Reload Catalog"
          >
            <Refresh sx={{ fontSize: 18 }} />
          </button>
          {isAdmin && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Add sx={{ fontSize: 18 }} />
              <span>Add New Game</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-md">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Search sx={{ fontSize: 18 }} />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, dev, tag..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-4 text-xs font-semibold text-slate-100 placeholder-slate-500 focus:border-cyan-500/80 focus:outline-none transition-all duration-200"
              />
            </div>

            {/* Genre Select */}
            <div>
              <select
                value={genre}
                onChange={(e) => { setGenre(e.target.value); setCurrentPage(1); }}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs font-semibold text-slate-400 focus:text-slate-100 focus:border-cyan-500/80 focus:outline-none transition-all duration-200"
              >
                <option value="">All Genres</option>
                {genresList.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Sort options */}
            <div>
              <select
                value={sortOption}
                onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs font-semibold text-slate-400 focus:text-slate-100 focus:border-cyan-500/80 focus:outline-none transition-all duration-200"
              >
                <option value="">Sort by: Relevance</option>
                <option value="price">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Rating: Highest First</option>
                <option value="downloads-desc">Most Downloaded</option>
                <option value="releaseDate-desc">Release Date: Newest</option>
                <option value="title">Alphabetical (A-Z)</option>
                <option value="popularity-desc">Popularity</option>
              </select>
            </div>

            {/* Price filters and Developer Filter */}
            <div className="flex gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                placeholder="Min Price"
                className="w-1/2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs font-semibold text-slate-100 placeholder-slate-500 focus:border-cyan-500/80 focus:outline-none transition-all duration-200"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                placeholder="Max Price"
                className="w-1/2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs font-semibold text-slate-100 placeholder-slate-500 focus:border-cyan-500/80 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2 border-t border-slate-800/40">
            <div className="flex items-center gap-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Developer Filter:</label>
              <input
                type="text"
                value={developer}
                onChange={(e) => { setDeveloper(e.target.value); setCurrentPage(1); }}
                placeholder="e.g. Valve"
                className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500/80"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                Reset Filters
              </button>
              <button
                type="submit"
                className="rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/20 px-4 py-1.5 text-xs font-bold hover:bg-cyan-600 hover:text-white transition-all duration-200"
              >
                Apply Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error block */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchGames} className="underline text-xs font-bold hover:text-white">Retry</button>
        </div>
      )}

      {/* Catalog Grid View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
          <span className="text-slate-400 text-xs font-semibold">Retrieving Steam games catalog...</span>
        </div>
      ) : games.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/10">
          <span className="text-slate-500 text-sm font-semibold mb-1">No games found matches filters</span>
          <p className="text-xs text-slate-600 max-w-sm">Try adjustment parameters, query strings, or adding a new record to the list.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {games.map((game) => (
            <div 
              key={game.appid}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-all duration-300 hover:border-cyan-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-950/20"
            >
              {/* Card Header Media Placeholder */}
              <div className="relative h-36 bg-slate-950 overflow-hidden">
                <img 
                  src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`} 
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop";
                  }}
                  alt={game.name}
                  className="h-full w-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 rounded-lg bg-slate-900/80 px-2 py-0.5 text-[10px] font-black tracking-wide text-cyan-400 border border-slate-700/60 uppercase">
                  ID: {game.appid}
                </div>

                {/* Price Badge */}
                <div className="absolute bottom-2 left-2 rounded-lg bg-slate-950/90 px-2.5 py-1 text-[11px] font-extrabold text-white border border-slate-800">
                  {Number(game.price) === 0 ? (
                    <span className="text-green-400 font-black">FREE</span>
                  ) : (
                    <span>${game.price}</span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1 p-4 space-y-3">
                <div>
                  <h3 className="line-clamp-1 text-sm font-bold text-white group-hover:text-cyan-400 transition-colors" title={game.name}>
                    {game.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">By {game.developer || 'Unknown Developer'}</p>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-1">
                  {(game.genres || 'Steam Game').split(';').slice(0, 2).map((g) => (
                    <span key={g} className="rounded px-2 py-0.5 text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-800">
                      {g}
                    </span>
                  ))}
                  {(game.genres || '').split(';').length > 2 && (
                    <span className="text-[9px] text-slate-500 font-bold self-center">
                      +{game.genres.split(';').length - 2}
                    </span>
                  )}
                </div>

                {/* Meta stats */}
                <div className="flex items-center justify-between border-t border-slate-800/60 pt-3 text-[10px] font-semibold text-slate-400">
                  <span className="flex items-center gap-1">
                    <Star sx={{ fontSize: 12 }} className="text-yellow-500" />
                    <span>{Number(game.recommendations).toLocaleString()} recs</span>
                  </span>
                  <span>Released {game.release_year || 'N/A'}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex border-t border-slate-800 bg-slate-950/40 p-2 gap-2">
                <button
                  onClick={() => { setSelectedAppid(game.appid); setIsDetailsOpen(true); }}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 py-1.5 text-[10px] font-bold text-slate-300 hover:text-white transition-colors"
                >
                  <Visibility sx={{ fontSize: 12 }} />
                  <span>Inspect</span>
                </button>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => handleEditClick(game)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 transition-colors"
                      title="Edit entry"
                    >
                      <Edit sx={{ fontSize: 12 }} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmAppid(game.appid)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 hover:bg-red-950 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete entry"
                    >
                      <Delete sx={{ fontSize: 12 }} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination component */}
      {!loading && games.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80 pt-6">
          <div className="text-xs font-semibold text-slate-500">
            Showing Page <span className="text-slate-300">{pagination.page}</span> of <span className="text-slate-300">{pagination.totalPages}</span>
            <span className="mx-2">•</span>
            Total <span className="text-slate-300">{pagination.totalItems}</span> games
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={pagination.page === 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:border-slate-700 transition-colors"
            >
              <NavigateBefore sx={{ fontSize: 18 }} />
            </button>
            
            {/* Display surrounding page numbers */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              // Sliding window of page numbers
              let pageNum = i + 1;
              if (pagination.page > 3 && pagination.totalPages > 5) {
                pageNum = pagination.page - 3 + i;
                if (pageNum + (4 - i) > pagination.totalPages) {
                  pageNum = pagination.totalPages - 4 + i;
                }
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                    pagination.page === pageNum
                      ? 'bg-cyan-600 text-white border border-cyan-500 shadow-md shadow-cyan-600/10'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
              disabled={pagination.page === pagination.totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:border-slate-700 transition-colors"
            >
              <NavigateNext sx={{ fontSize: 18 }} />
            </button>
          </div>
        </div>
      )}

      {/* GAME DETAILS MODAL */}
      {isDetailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl transition-all duration-300 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Laptop />
                </div>
                <div>
                  <h2 className="text-md font-black text-white">{detailsData.game?.name || 'Loading Game details...'}</h2>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">App ID: {selectedAppid}</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsDetailsOpen(false); setSelectedAppid(null); }}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <Close sx={{ fontSize: 18 }} />
              </button>
            </div>

            {/* Modal Body (Scrollable content) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 text-xs">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
                  <span>Pulling subresources (reviews, media, system requirements)...</span>
                </div>
              ) : !detailsData.game ? (
                <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                  Failed to fetch full data of the game APPID: {selectedAppid}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column - Image & Quick Meta */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                      <img 
                        src={`https://cdn.akamai.steamstatic.com/steam/apps/${selectedAppid}/header.jpg`}
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop";
                        }}
                        alt={detailsData.game.name}
                        className="w-full object-cover"
                      />
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Pricing status</span>
                        <div className="text-md font-extrabold text-white mt-1">
                          {Number(detailsData.game.price) === 0 ? 'Free to Play' : `$${detailsData.game.price}`}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Developers</span>
                        <p className="text-xs font-semibold text-slate-300 mt-0.5">{detailsData.game.developer}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Publishers</span>
                        <p className="text-xs font-semibold text-slate-300 mt-0.5">{detailsData.game.publisher || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Steam database release date</span>
                        <p className="text-xs font-semibold text-slate-300 mt-0.5">{detailsData.game.release_date || detailsData.game.release_year || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Navigation Tabs & Tab Content */}
                  <div className="lg:col-span-8 flex flex-col space-y-4">
                    {/* Tabs Bar */}
                    <div className="flex border-b border-slate-800 overflow-x-auto gap-2 scrollbar-none">
                      {[
                        { id: 'overview', label: 'Overview', icon: <Info sx={{ fontSize: 14 }} /> },
                        { id: 'media', label: 'Media & Videos', icon: <Tv sx={{ fontSize: 14 }} /> },
                        { id: 'specs', label: 'Specs', icon: <Laptop sx={{ fontSize: 14 }} /> },
                        { id: 'reviews', label: 'Reviews', icon: <Comment sx={{ fontSize: 14 }} /> },
                        { id: 'achievements', label: 'Achievements', icon: <EmojiEvents sx={{ fontSize: 14 }} /> },
                        { id: 'related', label: 'Similar Games', icon: <ArrowForward sx={{ fontSize: 14 }} /> }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all duration-200 ${
                            activeTab === tab.id
                              ? 'border-cyan-500 text-cyan-400'
                              : 'border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {tab.icon}
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Tab Window Content */}
                    <div className="flex-1 bg-slate-950/20 rounded-xl border border-slate-800/60 p-4">
                      {activeTab === 'overview' && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Category tags</h4>
                            <div className="flex flex-wrap gap-1">
                              {(detailsData.game.categories || 'Single-player').split(';').map(c => (
                                <span key={c} className="rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 px-2 py-0.5">{c}</span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">DB Change Audit Trail</h4>
                            {detailsData.history && detailsData.history.length > 0 ? (
                              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {detailsData.history.map((log, index) => (
                                  <div key={index} className="rounded-lg border border-slate-800/80 bg-slate-950 p-2.5 text-[10px] space-y-1">
                                    <div className="flex justify-between items-center text-slate-400">
                                      <span className="font-bold text-cyan-500 uppercase">{log.action}</span>
                                      <span>{new Date(log.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-slate-300 font-semibold">
                                      {Object.entries(log.changes || {}).map(([key, val]) => (
                                        <div key={key}>{key}: {val}</div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="rounded-lg border border-dashed border-slate-850 p-4 text-center text-[10px] font-semibold text-slate-500">
                                No modifications tracked for this game entry.
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {activeTab === 'media' && (
                        <div className="space-y-4">
                          {/* Trailers Player */}
                          {detailsData.trailers && detailsData.trailers.length > 0 ? (
                            <div>
                              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Official Trailers</h4>
                              <div className="rounded-xl overflow-hidden border border-slate-800 bg-black">
                                <video 
                                  src={detailsData.trailers[0].video_mp4} 
                                  controls 
                                  poster={detailsData.trailers[0].thumbnail}
                                  className="w-full max-h-60"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-xl border border-dashed border-slate-800 p-4 text-center text-xs font-semibold text-slate-500">
                              No gameplay trailers found.
                            </div>
                          )}

                          {/* Screenshots Carousel */}
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Gameplay Screenshots</h4>
                            {detailsData.screenshots && detailsData.screenshots.length > 0 ? (
                              <div className="grid grid-cols-3 gap-2">
                                {detailsData.screenshots.map(ss => (
                                  <a 
                                    key={ss.id} 
                                    href={ss.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="rounded-lg border border-slate-800 bg-slate-900 overflow-hidden hover:border-cyan-500 transition-colors"
                                  >
                                    <img src={ss.thumbnail} alt="Screenshot" className="w-full h-16 object-cover" />
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center text-xs text-slate-500 py-4">No screenshots available.</div>
                            )}
                          </div>
                        </div>
                      )}

                      {activeTab === 'specs' && (
                        <div className="space-y-4">
                          {detailsData.requirements ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                                <div className="text-xs font-extrabold text-cyan-400 uppercase flex items-center gap-1">
                                  <Laptop sx={{ fontSize: 14 }} />
                                  <span>Minimum Requirements</span>
                                </div>
                                <ul className="text-[10px] text-slate-400 font-semibold space-y-1.5 list-disc pl-4">
                                  <li><strong>OS:</strong> {detailsData.requirements.minimum.os}</li>
                                  <li><strong>Processor:</strong> {detailsData.requirements.minimum.processor}</li>
                                  <li><strong>Memory:</strong> {detailsData.requirements.minimum.memory}</li>
                                  <li><strong>Graphics:</strong> {detailsData.requirements.minimum.graphics}</li>
                                  <li><strong>DirectX:</strong> {detailsData.requirements.minimum.directx}</li>
                                  <li><strong>Storage:</strong> {detailsData.requirements.minimum.storage}</li>
                                </ul>
                              </div>

                              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                                <div className="text-xs font-extrabold text-blue-400 uppercase flex items-center gap-1">
                                  <Laptop sx={{ fontSize: 14 }} />
                                  <span>Recommended Requirements</span>
                                </div>
                                <ul className="text-[10px] text-slate-400 font-semibold space-y-1.5 list-disc pl-4">
                                  <li><strong>OS:</strong> {detailsData.requirements.recommended.os}</li>
                                  <li><strong>Processor:</strong> {detailsData.requirements.recommended.processor}</li>
                                  <li><strong>Memory:</strong> {detailsData.requirements.recommended.memory}</li>
                                  <li><strong>Graphics:</strong> {detailsData.requirements.recommended.graphics}</li>
                                  <li><strong>DirectX:</strong> {detailsData.requirements.recommended.directx}</li>
                                  <li><strong>Storage:</strong> {detailsData.requirements.recommended.storage}</li>
                                </ul>
                              </div>
                            </div>
                          ) : (
                            <div className="p-6 text-center text-xs text-slate-500">Specs requirements data not available.</div>
                          )}
                        </div>
                      )}

                      {activeTab === 'reviews' && (
                        <div className="space-y-4">
                          {/* Write Review Form */}
                          <form onSubmit={handleAddReview} className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                {editingReviewId ? 'Edit Your Review' : 'Write a Review'}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500">Rating:</span>
                                <select 
                                  value={reviewRating}
                                  onChange={(e) => setReviewRating(Number(e.target.value))}
                                  className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-xs text-yellow-400 font-bold"
                                >
                                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(n => (
                                    <option key={n} value={n}>{n}/10 Stars</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <textarea
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value)}
                              placeholder="Describe your gameplay experience..."
                              rows="3"
                              className="w-full rounded-xl border border-slate-850 bg-slate-900 p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                            />

                            {reviewError && <p className="text-[10px] font-bold text-red-400">{reviewError}</p>}

                            <div className="flex justify-end gap-2">
                              {editingReviewId && (
                                <button 
                                  type="button" 
                                  onClick={() => { setEditingReviewId(null); setReviewText(''); setReviewRating(10); }}
                                  className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                              )}
                              <button
                                type="submit"
                                disabled={submittingReview}
                                className="rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-1.5 text-xs font-bold text-white transition-colors"
                              >
                                {submittingReview ? 'Saving...' : editingReviewId ? 'Save Review' : 'Post Review'}
                              </button>
                            </div>
                          </form>

                          {/* Reviews List */}
                          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                            {detailsData.reviews && detailsData.reviews.length > 0 ? (
                              detailsData.reviews.map((rev) => (
                                <div key={rev.reviewId} className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 space-y-2 relative">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1.5">
                                      <div className="rounded-full bg-slate-800 text-[10px] font-extrabold text-cyan-400 px-2 py-0.5">
                                        ID: {rev.reviewId}
                                      </div>
                                      <span className="text-yellow-400 text-xs font-black flex items-center gap-0.5">
                                        <Star sx={{ fontSize: 13 }} />
                                        <span>{rev.rating}/10</span>
                                      </span>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex gap-1.5">
                                      <button 
                                        onClick={() => handleEditReviewClick(rev)}
                                        className="text-[10px] text-slate-500 hover:text-cyan-400 font-bold"
                                      >
                                        Edit
                                      </button>
                                      <span className="text-slate-800 text-[10px]">|</span>
                                      <button 
                                        onClick={() => handleDeleteReview(rev.reviewId)}
                                        className="text-[10px] text-slate-500 hover:text-red-400 font-bold"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-300 font-semibold italic">"{rev.reviewText}"</p>
                                </div>
                              ))
                            ) : (
                              <div className="py-8 text-center text-xs text-slate-600 font-bold">
                                No reviews found. Be the first to write!
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {activeTab === 'achievements' && (
                        <div className="space-y-4">
                          {detailsData.achievements ? (
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold text-slate-400 uppercase">Unlocked Achievements ({detailsData.achievements.total})</h4>
                              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                {detailsData.achievements.highlighted.map((ach, idx) => (
                                  <div key={idx} className="flex gap-3 rounded-lg border border-slate-800/80 bg-slate-950 p-3 items-center">
                                    <div className="h-10 w-10 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center text-[10px] text-yellow-400 font-bold">
                                      🏆
                                    </div>
                                    <div>
                                      <h5 className="text-xs font-bold text-white">{ach.name}</h5>
                                      <p className="text-[10px] text-slate-500 font-semibold">{ach.description}</p>
                                    </div>
                                    <div className="ml-auto rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 text-[9px] font-black">
                                      +{ach.xp} XP
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="p-6 text-center text-xs text-slate-500">Achievements list not available.</div>
                          )}
                        </div>
                      )}

                      {activeTab === 'related' && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase">Recommended Similar Games</h4>
                          {detailsData.related && detailsData.related.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {detailsData.related.map((relGame) => (
                                <div 
                                  key={relGame.appid}
                                  onClick={() => setSelectedAppid(relGame.appid)}
                                  className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3 hover:border-cyan-500/50 hover:bg-slate-950 cursor-pointer transition-all duration-200"
                                >
                                  <div className="h-12 w-16 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 border border-slate-850">
                                    <img 
                                      src={`https://cdn.akamai.steamstatic.com/steam/apps/${relGame.appid}/header.jpg`}
                                      onError={(e) => {
                                        e.target.src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop";
                                      }}
                                      alt={relGame.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <h5 className="text-xs font-bold text-white truncate">{relGame.name}</h5>
                                    <p className="text-[9px] text-slate-500 font-semibold mt-0.5">By {relGame.developer || 'Valve'}</p>
                                    <div className="text-[10px] font-black text-cyan-400 mt-1">
                                      {Number(relGame.price) === 0 ? 'FREE' : `$${relGame.price}`}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-6 text-center text-xs text-slate-500">No related game recommendations available.</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-800 p-4 bg-slate-950/20">
              <button 
                onClick={() => { setIsDetailsOpen(false); setSelectedAppid(null); }}
                className="rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-5 py-2 text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW GAME MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl transition-all duration-300 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div className="flex items-center gap-2">
                <Add className="text-cyan-400" />
                <h2 className="text-md font-black text-white">Create New Steam Entry</h2>
              </div>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <Close sx={{ fontSize: 18 }} />
              </button>
            </div>

            <form onSubmit={addFormik.handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Appid */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">App ID (Numeric Only)</label>
                  <input
                    type="text"
                    name="appid"
                    value={addFormik.values.appid}
                    onChange={addFormik.handleChange}
                    onBlur={addFormik.handleBlur}
                    className={`w-full rounded-xl border bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 ${
                      addFormik.touched.appid && addFormik.errors.appid ? 'border-red-500' : 'border-slate-800'
                    }`}
                    placeholder="e.g. 570"
                  />
                  {addFormik.touched.appid && addFormik.errors.appid && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">{addFormik.errors.appid}</p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Game Title</label>
                  <input
                    type="text"
                    name="name"
                    value={addFormik.values.name}
                    onChange={addFormik.handleChange}
                    onBlur={addFormik.handleBlur}
                    className={`w-full rounded-xl border bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 ${
                      addFormik.touched.name && addFormik.errors.name ? 'border-red-500' : 'border-slate-800'
                    }`}
                    placeholder="e.g. Portal 2"
                  />
                  {addFormik.touched.name && addFormik.errors.name && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">{addFormik.errors.name}</p>
                  )}
                </div>

                {/* Developer */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Developer Company</label>
                  <input
                    type="text"
                    name="developer"
                    value={addFormik.values.developer}
                    onChange={addFormik.handleChange}
                    onBlur={addFormik.handleBlur}
                    className={`w-full rounded-xl border bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 ${
                      addFormik.touched.developer && addFormik.errors.developer ? 'border-red-500' : 'border-slate-800'
                    }`}
                    placeholder="Valve"
                  />
                  {addFormik.touched.developer && addFormik.errors.developer && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">{addFormik.errors.developer}</p>
                  )}
                </div>

                {/* Publisher */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Publisher</label>
                  <input
                    type="text"
                    name="publisher"
                    value={addFormik.values.publisher}
                    onChange={addFormik.handleChange}
                    onBlur={addFormik.handleBlur}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Valve"
                  />
                </div>

                {/* Genres */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Genres (Semicolon Separated)</label>
                  <input
                    type="text"
                    name="genres"
                    value={addFormik.values.genres}
                    onChange={addFormik.handleChange}
                    onBlur={addFormik.handleBlur}
                    className={`w-full rounded-xl border bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 ${
                      addFormik.touched.genres && addFormik.errors.genres ? 'border-red-500' : 'border-slate-800'
                    }`}
                    placeholder="Action;Adventure"
                  />
                  {addFormik.touched.genres && addFormik.errors.genres && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">{addFormik.errors.genres}</p>
                  )}
                </div>

                {/* Categories */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Categories (Semicolon Separated)</label>
                  <input
                    type="text"
                    name="categories"
                    value={addFormik.values.categories}
                    onChange={addFormik.handleChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Single-player;Multiplayer"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Price (USD)</label>
                  <input
                    type="text"
                    name="price"
                    value={addFormik.values.price}
                    onChange={addFormik.handleChange}
                    onBlur={addFormik.handleBlur}
                    className={`w-full rounded-xl border bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 ${
                      addFormik.touched.price && addFormik.errors.price ? 'border-red-500' : 'border-slate-800'
                    }`}
                    placeholder="9.99"
                  />
                  {addFormik.touched.price && addFormik.errors.price && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">{addFormik.errors.price}</p>
                  )}
                </div>

                {/* Release Year */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Release Year</label>
                  <input
                    type="text"
                    name="release_year"
                    value={addFormik.values.release_year}
                    onChange={addFormik.handleChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl px-5 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-600/10 hover:from-cyan-500 hover:to-blue-500 transition-colors"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT GAME MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl transition-all duration-300 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div className="flex items-center gap-2">
                <Edit className="text-cyan-400" />
                <h2 className="text-md font-black text-white">Edit Steam Game Info</h2>
              </div>
              <button 
                onClick={() => { setIsEditOpen(false); setGameToEdit(null); }}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <Close sx={{ fontSize: 18 }} />
              </button>
            </div>

            <form onSubmit={editFormik.handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Game Title</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormik.values.name}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    className={`w-full rounded-xl border bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 ${
                      editFormik.touched.name && editFormik.errors.name ? 'border-red-500' : 'border-slate-800'
                    }`}
                  />
                  {editFormik.touched.name && editFormik.errors.name && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">{editFormik.errors.name}</p>
                  )}
                </div>

                {/* Developer */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Developer Company</label>
                  <input
                    type="text"
                    name="developer"
                    value={editFormik.values.developer}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    className={`w-full rounded-xl border bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 ${
                      editFormik.touched.developer && editFormik.errors.developer ? 'border-red-500' : 'border-slate-800'
                    }`}
                  />
                  {editFormik.touched.developer && editFormik.errors.developer && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">{editFormik.errors.developer}</p>
                  )}
                </div>

                {/* Publisher */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Publisher</label>
                  <input
                    type="text"
                    name="publisher"
                    value={editFormik.values.publisher}
                    onChange={editFormik.handleChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Genres */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Genres</label>
                  <input
                    type="text"
                    name="genres"
                    value={editFormik.values.genres}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    className={`w-full rounded-xl border bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 ${
                      editFormik.touched.genres && editFormik.errors.genres ? 'border-red-500' : 'border-slate-800'
                    }`}
                  />
                  {editFormik.touched.genres && editFormik.errors.genres && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">{editFormik.errors.genres}</p>
                  )}
                </div>

                {/* Categories */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Categories</label>
                  <input
                    type="text"
                    name="categories"
                    value={editFormik.values.categories}
                    onChange={editFormik.handleChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Price (USD)</label>
                  <input
                    type="text"
                    name="price"
                    value={editFormik.values.price}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    className={`w-full rounded-xl border bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 ${
                      editFormik.touched.price && editFormik.errors.price ? 'border-red-500' : 'border-slate-800'
                    }`}
                  />
                  {editFormik.touched.price && editFormik.errors.price && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">{editFormik.errors.price}</p>
                  )}
                </div>

                {/* Recommendations */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">User Recommendations</label>
                  <input
                    type="text"
                    name="recommendations"
                    value={editFormik.values.recommendations}
                    onChange={editFormik.handleChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Release Year */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Release Year</label>
                  <input
                    type="text"
                    name="release_year"
                    value={editFormik.values.release_year}
                    onChange={editFormik.handleChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); setGameToEdit(null); }}
                  className="rounded-xl px-5 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-600/10 hover:from-cyan-500 hover:to-blue-500 transition-colors"
                >
                  Update Info
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM DIALOG */}
      {deleteConfirmAppid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl transition-all duration-300">
            <h3 className="text-md font-black text-white">Delete Catalog Entry?</h3>
            <p className="text-xs text-slate-400 font-semibold mt-2">
              Are you sure you want to permanently delete the game entry with AppID <strong className="text-white">{deleteConfirmAppid}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setDeleteConfirmAppid(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                No, Keep
              </button>
              <button
                onClick={() => handleDeleteGame(deleteConfirmAppid)}
                className="rounded-xl bg-red-600 hover:bg-red-500 px-5 py-2 text-xs font-bold text-white transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
