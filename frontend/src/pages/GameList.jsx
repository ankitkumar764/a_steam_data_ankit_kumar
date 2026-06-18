import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardActions,
  Pagination,
  Box,
  Chip,
} from '@mui/material';
import { Add, Search, FilterAltOff } from '@mui/icons-material';
import { fetchGames, createGame } from '../store/slices/gameSlice';
import SkeletonLoader from '../components/SkeletonLoader';
import { useToast } from '../components/ToastNotification';
import SEO from '../components/SEO';

export const GameList = () => {
  const dispatch = useDispatch();
  const showToast = useToast();
  const { games, pagination, loading, error } = useSelector((state) => state.games);
  const { user } = useSelector((state) => state.auth);

  // Filter and pagination local states
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [freeToPlay, setFreeToPlay] = useState(false);
  const [discount, setDiscount] = useState(false);
  const [multiplayer, setMultiplayer] = useState(false);
  const [page, setPage] = useState(1);
  const [openAddModal, setOpenAddModal] = useState(false);

  // Fetch games thunk triggers on state edits
  const loadGamesData = () => {
    const params = {
      page,
      limit: 9,
    };
    if (search.trim()) params.search = search;
    if (sort) params.sort = sort;
    if (freeToPlay) params.freeToPlay = true;
    if (discount) params.discount = true;
    if (multiplayer) params.multiplayer = true;

    dispatch(fetchGames(params));
  };

  useEffect(() => {
    loadGamesData();
  }, [page, sort, freeToPlay, discount, multiplayer]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadGamesData();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSort('');
    setFreeToPlay(false);
    setDiscount(false);
    setMultiplayer(false);
    setPage(1);
  };

  // Formik for new Game creation
  const addFormik = useFormik({
    initialValues: {
      appid: '',
      name: '',
      genres: '',
      categories: '',
      price: '0.00',
      developer: '',
      publisher: '',
      release_date: '',
      release_year: '',
      recommendations: '0',
    },
    validationSchema: Yup.object({
      appid: Yup.string().required('App ID is required').matches(/^\d+$/, 'App ID must be a numeric string'),
      name: Yup.string().required('Game name is required'),
      price: Yup.number().typeError('Price must be a number').min(0, 'Price cannot be negative').required('Required'),
      recommendations: Yup.number().typeError('Must be an integer').integer().min(0, 'Cannot be negative'),
      genres: Yup.string(),
      categories: Yup.string(),
      developer: Yup.string(),
      publisher: Yup.string(),
      release_date: Yup.string().placeholder = 'e.g. Jul 5, 2024',
      release_year: Yup.string().matches(/^\d{4}$/, 'Must be a 4-digit year').nullable(),
    }),
    onSubmit: (values, { resetForm }) => {
      dispatch(createGame(values))
        .unwrap()
        .then(() => {
          showToast('Game entry added successfully!', 'success');
          setOpenAddModal(false);
          resetForm();
          loadGamesData();
        })
        .catch((err) => {
          showToast(err || 'Failed to create game. Appid might already exist.', 'error');
        });
    },
  });

  return (
    <div className="space-y-6">
      <SEO title="Games Catalog" description="Browse, search, sort, and edit the comprehensive Steam games database records." />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Steam Games Catalog
          </h1>
          <p className="text-sm text-slate-400">
            Browse database records, evaluate developer releases, and write audits
          </p>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenAddModal(true)}
          className="bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold py-2.5 px-5"
          style={{ backgroundColor: '#0891b2', color: '#ffffff', textTransform: 'none', fontWeight: 'bold' }}
        >
          Add Game Entry
        </Button>
      </div>

      {/* Query Search and Filters Header */}
      <Paper
        elevation={6}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6"
        style={{ backgroundColor: '#1e293b' }}
      >
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextField
            fullWidth
            placeholder="Search games by title, developer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: <Search className="text-slate-400 mr-2" />,
              style: { color: '#f8fafc' },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#475569' },
                '&:hover fieldset': { borderColor: '#06b6d4' },
                '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
              },
            }}
          />

          <FormControl size="small" fullWidth>
            <InputLabel style={{ color: '#94a3b8' }}>Sort By</InputLabel>
            <Select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              label="Sort By"
              style={{ color: '#f8fafc' }}
              sx={{
                '& fieldset': { borderColor: '#475569' },
                '&:hover fieldset': { borderColor: '#06b6d4' },
                '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
                '& .MuiSvgIcon-root': { color: '#94a3b8' },
              }}
            >
              <MenuItem value="">Default</MenuItem>
              <MenuItem value="price">Lowest Price First</MenuItem>
              <MenuItem value="rating">Recommendations Rank</MenuItem>
              <MenuItem value="downloads">Estimated Downloads</MenuItem>
              <MenuItem value="releaseDate">Oldest Releases First</MenuItem>
              <MenuItem value="title">Alphabetical (A-Z)</MenuItem>
            </Select>
          </FormControl>

          <div className="flex space-x-2">
            <Button
              type="submit"
              variant="contained"
              fullWidth
              className="bg-cyan-600 hover:bg-cyan-500 rounded-xl"
              style={{ backgroundColor: '#0891b2', color: '#ffffff', textTransform: 'none' }}
            >
              Apply Search
            </Button>
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              className="text-slate-400 border-slate-700 hover:bg-slate-800 rounded-xl"
              style={{ color: '#94a3b8', borderColor: '#475569', textTransform: 'none' }}
            >
              <FilterAltOff />
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap gap-4 mt-4">
          <FormControlLabel
            control={
              <Checkbox
                checked={freeToPlay}
                onChange={(e) => {
                  setFreeToPlay(e.target.checked);
                  setPage(1);
                }}
                sx={{ color: '#475569', '&.Mui-checked': { color: '#06b6d4' } }}
              />
            }
            label={<Typography className="text-slate-300 text-sm">Free-to-Play</Typography>}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={discount}
                onChange={(e) => {
                  setDiscount(e.target.checked);
                  setPage(1);
                }}
                sx={{ color: '#475569', '&.Mui-checked': { color: '#06b6d4' } }}
              />
            }
            label={<Typography className="text-slate-300 text-sm">Discounted Deals</Typography>}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={multiplayer}
                onChange={(e) => {
                  setMultiplayer(e.target.checked);
                  setPage(1);
                }}
                sx={{ color: '#475569', '&.Mui-checked': { color: '#06b6d4' } }}
              />
            }
            label={<Typography className="text-slate-300 text-sm">Multiplayer Games</Typography>}
          />
        </div>
      </Paper>

      {/* Catalog Render Cards View */}
      {loading ? (
        <SkeletonLoader type="card" count={9} />
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <Typography className="text-red-400 font-semibold">{error}</Typography>
        </div>
      ) : games.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <Typography className="text-slate-400 font-medium">
            No games found matching the applied criteria filters.
          </Typography>
        </div>
      ) : (
        <>
          <Grid container spacing={3}>
            {games.map((game) => (
              <Grid item xs={12} sm={6} lg={4} key={game.appid}>
                <Card
                  className="bg-slate-900 border border-slate-800 rounded-3xl hover:shadow-xl hover:border-slate-700 transition duration-200 h-full flex flex-col justify-between"
                  style={{ backgroundColor: '#1e293b' }}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <Typography variant="caption" className="text-cyan-400 font-mono font-bold tracking-wider">
                        APPID: {game.appid}
                      </Typography>
                      {game.isDeleted && (
                        <Chip label="Archived" size="small" className="bg-red-500/20 text-red-400 text-xs font-bold" />
                      )}
                    </div>
                    <Typography variant="h6" className="text-white font-bold mt-2 line-clamp-1">
                      {game.name}
                    </Typography>
                    <Typography variant="body2" className="text-slate-400 mt-1 line-clamp-1">
                      Developer: {game.developer || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" className="text-slate-400 line-clamp-1 text-xs">
                      Genres: {game.genres || 'N/A'}
                    </Typography>
                    <div className="flex justify-between items-center mt-4">
                      <Typography className="text-cyan-300 font-extrabold text-lg">
                        {parseFloat(game.price) === 0 ? 'Free' : `$${game.price}`}
                      </Typography>
                      <Typography className="text-slate-500 text-xs">
                        Recs: {game.recommendations || '0'}
                      </Typography>
                    </div>
                  </CardContent>
                  <CardActions className="px-6 pb-6 pt-0">
                    <Button
                      component={Link}
                      to={`/games/${game.appid}`}
                      variant="outlined"
                      size="small"
                      fullWidth
                      className="border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-400 rounded-xl"
                      style={{ color: '#cbd5e1', borderColor: '#475569', textTransform: 'none' }}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box className="flex justify-center mt-8">
            <Pagination
              count={pagination.pages}
              page={page}
              onChange={(e, value) => setPage(value)}
              sx={{
                '& .MuiPaginationItem-root': { color: '#94a3b8' },
                '& .Mui-selected': { backgroundColor: '#06b6d4', color: '#0f172a' },
              }}
            />
          </Box>
        </>
      )}

      {/* Add Game Modal Dialog */}
      <Dialog
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            borderRadius: '24px',
            padding: '12px',
          },
        }}
      >
        <DialogTitle className="text-white font-black text-xl">Add New Game Record</DialogTitle>
        <form onSubmit={addFormik.handleSubmit}>
          <DialogContent className="space-y-4">
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  id="appid"
                  name="appid"
                  label="Steam App ID"
                  value={addFormik.values.appid}
                  onChange={addFormik.handleChange}
                  onBlur={addFormik.handleBlur}
                  error={addFormik.touched.appid && Boolean(addFormik.errors.appid)}
                  helperText={addFormik.touched.appid && addFormik.errors.appid}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ style: { color: '#94a3b8' } }}
                  inputProps={{ style: { color: '#f8fafc' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Game Title Name"
                  value={addFormik.values.name}
                  onChange={addFormik.handleChange}
                  onBlur={addFormik.handleBlur}
                  error={addFormik.touched.name && Boolean(addFormik.errors.name)}
                  helperText={addFormik.touched.name && addFormik.errors.name}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ style: { color: '#94a3b8' } }}
                  inputProps={{ style: { color: '#f8fafc' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  id="price"
                  name="price"
                  label="Standard Price"
                  value={addFormik.values.price}
                  onChange={addFormik.handleChange}
                  onBlur={addFormik.handleBlur}
                  error={addFormik.touched.price && Boolean(addFormik.errors.price)}
                  helperText={addFormik.touched.price && addFormik.errors.price}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ style: { color: '#94a3b8' } }}
                  inputProps={{ style: { color: '#f8fafc' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  id="recommendations"
                  name="recommendations"
                  label="Recommendations Score"
                  value={addFormik.values.recommendations}
                  onChange={addFormik.handleChange}
                  onBlur={addFormik.handleBlur}
                  error={addFormik.touched.recommendations && Boolean(addFormik.errors.recommendations)}
                  helperText={addFormik.touched.recommendations && addFormik.errors.recommendations}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ style: { color: '#94a3b8' } }}
                  inputProps={{ style: { color: '#f8fafc' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  id="developer"
                  name="developer"
                  label="Developer Company"
                  value={addFormik.values.developer}
                  onChange={addFormik.handleChange}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ style: { color: '#94a3b8' } }}
                  inputProps={{ style: { color: '#f8fafc' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  id="publisher"
                  name="publisher"
                  label="Publisher Company"
                  value={addFormik.values.publisher}
                  onChange={addFormik.handleChange}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ style: { color: '#94a3b8' } }}
                  inputProps={{ style: { color: '#f8fafc' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  id="release_date"
                  name="release_date"
                  label="Release Date (e.g. Jul 5, 2024)"
                  value={addFormik.values.release_date}
                  onChange={addFormik.handleChange}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ style: { color: '#94a3b8' } }}
                  inputProps={{ style: { color: '#f8fafc' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  id="release_year"
                  name="release_year"
                  label="Release Year (e.g. 2024)"
                  value={addFormik.values.release_year}
                  onChange={addFormik.handleChange}
                  onBlur={addFormik.handleBlur}
                  error={addFormik.touched.release_year && Boolean(addFormik.errors.release_year)}
                  helperText={addFormik.touched.release_year && addFormik.errors.release_year}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ style: { color: '#94a3b8' } }}
                  inputProps={{ style: { color: '#f8fafc' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="genres"
                  name="genres"
                  label="Genres (semicolon separated)"
                  value={addFormik.values.genres}
                  onChange={addFormik.handleChange}
                  placeholder="Action;Adventure;Indie"
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ style: { color: '#94a3b8' } }}
                  inputProps={{ style: { color: '#f8fafc' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="categories"
                  name="categories"
                  label="Categories (semicolon separated)"
                  value={addFormik.values.categories}
                  onChange={addFormik.handleChange}
                  placeholder="Single-player;Multi-player;Steam Achievements"
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ style: { color: '#94a3b8' } }}
                  inputProps={{ style: { color: '#f8fafc' } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions className="px-6 pb-6">
            <Button
              onClick={() => setOpenAddModal(false)}
              className="text-slate-400 hover:text-white"
              style={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              className="bg-cyan-600 hover:bg-cyan-500 rounded-xl"
              style={{ backgroundColor: '#0891b2', color: '#ffffff', textTransform: 'none', fontWeight: 'bold' }}
            >
              Add Entry
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default GameList;
