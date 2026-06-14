import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { Edit, Archive, Unarchive, Delete, Star, KeyboardBackspace, AddComment } from '@mui/icons-material';
import {
  fetchGameDetails,
  updateGame,
  deleteGame,
  archiveGame,
  restoreGame,
  fetchReviews,
  addReview,
  deleteReview,
  clearSelectedGame
} from '../store/slices/gameSlice';
import api from '../services/api';
import { useToast } from '../components/ToastNotification';
import SEO from '../components/SEO';

export const GameDetails = () => {
  const { appid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const showToast = useToast();

  const { selectedGame, reviews, loading } = useSelector((state) => state.games);
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(0);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openReviewModal, setOpenReviewModal] = useState(false);

  // Subresource states
  const [subresources, setSubresources] = useState({
    screenshots: [],
    trailers: [],
    requirements: null,
    dlc: [],
    achievements: null,
    leaderboards: [],
    updates: [],
    news: [],
    related: [],
    history: []
  });

  const loadSubresources = async () => {
    try {
      const [ssRes, trRes, reqRes, dlcRes, achRes, ldRes, upRes, nwRes, relRes, histRes] = await Promise.all([
        api.get(`/games/${appid}/screenshots`),
        api.get(`/games/${appid}/trailers`),
        api.get(`/games/${appid}/system-requirements`),
        api.get(`/games/${appid}/dlc`),
        api.get(`/games/${appid}/achievements`),
        api.get(`/games/${appid}/leaderboards`),
        api.get(`/games/${appid}/updates`),
        api.get(`/games/${appid}/news`),
        api.get(`/games/${appid}/related`),
        api.get(`/games/${appid}/history`)
      ]);

      setSubresources({
        screenshots: ssRes.data || [],
        trailers: trRes.data || [],
        requirements: reqRes.data || null,
        dlc: dlcRes.data || [],
        achievements: achRes.data || null,
        leaderboards: ldRes.data || [],
        updates: upRes.data || [],
        news: nwRes.data || [],
        related: relRes.data || [],
        history: histRes.data || []
      });
    } catch (err) {
      console.error('Failed to load subresources:', err);
    }
  };

  useEffect(() => {
    dispatch(fetchGameDetails(appid));
    dispatch(fetchReviews(appid));
    loadSubresources();

    return () => {
      dispatch(clearSelectedGame());
    };
  }, [appid, dispatch]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Archive (Soft delete)
  const handleArchive = () => {
    dispatch(archiveGame(appid))
      .unwrap()
      .then(() => {
        showToast('Game archived successfully!', 'success');
        dispatch(fetchGameDetails(appid));
      });
  };

  // Restore
  const handleRestore = () => {
    dispatch(restoreGame(appid))
      .unwrap()
      .then(() => {
        showToast('Game restored successfully!', 'success');
        dispatch(fetchGameDetails(appid));
      });
  };

  // Delete permanently
  const handleDelete = () => {
    if (window.confirm('Are you absolutely sure you want to permanently delete this game? This action is irreversible.')) {
      dispatch(deleteGame(appid))
        .unwrap()
        .then(() => {
          showToast('Game permanently deleted successfully!', 'success');
          navigate('/games');
        })
        .catch((err) => {
          showToast(err || 'Failed to delete game.', 'error');
        });
    }
  };

  // Formik for details update
  const editFormik = useFormik({
    initialValues: {
      name: selectedGame?.name || '',
      price: selectedGame?.price || '0.00',
      genres: selectedGame?.genres || '',
      categories: selectedGame?.categories || '',
      developer: selectedGame?.developer || '',
      publisher: selectedGame?.publisher || '',
      release_date: selectedGame?.release_date || '',
      recommendations: selectedGame?.recommendations || '0',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required('Game title name is required'),
      price: Yup.number().typeError('Must be a number').min(0).required('Required'),
      recommendations: Yup.number().typeError('Must be integer').integer().min(0)
    }),
    onSubmit: (values) => {
      dispatch(updateGame({ appid, gameData: values }))
        .unwrap()
        .then(() => {
          showToast('Game details updated successfully!', 'success');
          setOpenEditModal(false);
          dispatch(fetchGameDetails(appid));
          loadSubresources(); // reload history updates list
        })
        .catch((err) => {
          showToast(err || 'Failed to update details.', 'error');
        });
    },
  });

  // Formik for review creation
  const reviewFormik = useFormik({
    initialValues: {
      rating: 5,
      reviewText: '',
      userId: user?.id || ''
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      rating: Yup.number().required('Rating is required').min(1).max(10),
      reviewText: Yup.string().required('Review text feedback is required').min(10, 'Must be at least 10 characters')
    }),
    onSubmit: (values, { resetForm }) => {
      dispatch(addReview({ appid, reviewData: values }))
        .unwrap()
        .then(() => {
          showToast('Review submitted successfully!', 'success');
          setOpenReviewModal(false);
          resetForm();
          dispatch(fetchReviews(appid));
        })
        .catch((err) => {
          showToast(err || 'Failed to add review.', 'error');
        });
    },
  });

  const handleDeleteReview = (reviewId) => {
    if (window.confirm('Delete this review feedback?')) {
      dispatch(deleteReview({ appid, reviewId }))
        .unwrap()
        .then(() => {
          showToast('Review deleted successfully!', 'success');
        });
    }
  };

  if (loading || !selectedGame) {
    return (
      <div className="flex h-96 items-center justify-center">
        <CircularProgress color="primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SEO title={selectedGame.name} description={`View system requirements, gameplay screenshots, updates changelog, and review feedback for ${selectedGame.name}`} />

      {/* Back button */}
      <Button
        component={Link}
        to="/games"
        startIcon={<KeyboardBackspace />}
        className="text-slate-400 hover:text-white"
        style={{ textTransform: 'none', color: '#94a3b8' }}
      >
        Back to Catalog
      </Button>

      {/* Game Header Panel */}
      <Paper
        elevation={12}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8"
        style={{ backgroundColor: '#1e293b' }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-cyan-400 font-mono text-sm font-bold bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/10">
                APPID: {selectedGame.appid}
              </span>
              {selectedGame.isDeleted && (
                <span className="text-red-400 font-bold text-xs bg-red-950/40 px-3 py-1 rounded-full border border-red-500/10">
                  Archived / Soft-Deleted
                </span>
              )}
            </div>
            <Typography variant="h3" className="text-white font-extrabold mt-3 tracking-tight">
              {selectedGame.name}
            </Typography>
            <Typography className="text-slate-400 mt-2 font-medium">
              Developed by <span className="text-slate-200">{selectedGame.developer || 'N/A'}</span> | Published by <span className="text-slate-200">{selectedGame.publisher || 'N/A'}</span>
            </Typography>
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedGame.genres?.split(';').map((genre) => (
                <span key={genre} className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-full font-medium">
                  {genre}
                </span>
              ))}
            </div>
          </Grid>

          <Grid item xs={12} md={4} className="flex flex-col justify-end space-y-4 md:items-end">
            <Typography className="text-cyan-300 font-black text-3xl">
              {parseFloat(selectedGame.price) === 0 ? 'Free to Play' : `$${selectedGame.price}`}
            </Typography>
            <Typography variant="body2" className="text-slate-500">
              Recommendations: <strong className="text-slate-300">{selectedGame.recommendations || '0'}</strong>
            </Typography>
            
            {/* CRUD Management Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setOpenEditModal(true)}
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 rounded-xl"
                style={{ color: '#06b6d4', borderColor: '#06b6d4', textTransform: 'none' }}
              >
                Edit Details
              </Button>
              {selectedGame.isDeleted ? (
                <Button
                  variant="outlined"
                  startIcon={<Unarchive />}
                  onClick={handleRestore}
                  className="border-emerald-400 text-emerald-400 hover:bg-emerald-400/10 rounded-xl"
                  style={{ color: '#10b981', borderColor: '#10b981', textTransform: 'none' }}
                >
                  Restore
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<Archive />}
                  onClick={handleArchive}
                  className="border-amber-400 text-amber-400 hover:bg-amber-400/10 rounded-xl"
                  style={{ color: '#f59e0b', borderColor: '#f59e0b', textTransform: 'none' }}
                >
                  Archive
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<Delete />}
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-500 rounded-xl font-bold"
                style={{ backgroundColor: '#dc2626', color: '#ffffff', textTransform: 'none' }}
              >
                Delete
              </Button>
            </div>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs Panel */}
      <Paper
        elevation={6}
        className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden"
        style={{ backgroundColor: '#1e293b' }}
      >
        <Box className="border-b border-slate-800 bg-slate-950">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': { backgroundColor: '#06b6d4' },
              '& .MuiTab-root': { color: '#94a3b8', fontSize: '0.875rem', fontFamily: 'Inter', textTransform: 'none' },
              '& .Mui-selected': { color: '#06b6d4 !important', fontWeight: 'bold' },
            }}
          >
            <Tab label="Media & Specs" />
            <Tab label={`DLC Content (${subresources.dlc.length})`} />
            <Tab label="Achievements" />
            <Tab label="Leaderboards" />
            <Tab label="News & Updates" />
            <Tab label={`Reviews (${reviews.length})`} />
            <Tab label="Related Games" />
            <Tab label="Audit History" />
          </Tabs>
        </Box>

        <Box className="p-6 text-slate-300">
          {/* Tab 0: Media & Specs */}
          {activeTab === 0 && (
            <div className="space-y-6">
              {subresources.screenshots.length > 0 && (
                <div>
                  <Typography variant="h6" className="text-white font-bold mb-3">Screenshots</Typography>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {subresources.screenshots.map((ss) => (
                      <div key={ss.id} className="rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-700 transition">
                        <img src={ss.url} alt="Screenshot" className="w-full h-40 object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {subresources.trailers.length > 0 && (
                <div>
                  <Typography variant="h6" className="text-white font-bold mb-3">Trailers & Videos</Typography>
                  {subresources.trailers.map((trailer) => (
                    <div key={trailer.id} className="max-w-2xl rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-2">
                      <video controls className="w-full h-80 object-contain" poster={trailer.thumbnail}>
                        <source src={trailer.video_mp4} type="video/mp4" />
                        Your browser does not support video playback.
                      </video>
                      <Typography className="text-slate-300 font-bold p-3 text-sm">{trailer.title}</Typography>
                    </div>
                  ))}
                </div>
              )}

              {subresources.requirements && (
                <div>
                  <Typography variant="h6" className="text-white font-bold mb-3">System Requirements</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 h-full">
                        <Typography className="text-cyan-400 font-bold text-sm mb-2">Minimum Specifications</Typography>
                        <ul className="space-y-1.5 text-xs text-slate-400">
                          <li><strong>OS:</strong> {subresources.requirements.minimum.os}</li>
                          <li><strong>Processor:</strong> {subresources.requirements.minimum.processor}</li>
                          <li><strong>Memory:</strong> {subresources.requirements.minimum.memory}</li>
                          <li><strong>Graphics:</strong> {subresources.requirements.minimum.graphics}</li>
                          <li><strong>DirectX:</strong> {subresources.requirements.minimum.directx}</li>
                          <li><strong>Storage:</strong> {subresources.requirements.minimum.storage}</li>
                        </ul>
                      </div>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 h-full">
                        <Typography className="text-indigo-400 font-bold text-sm mb-2">Recommended Specifications</Typography>
                        <ul className="space-y-1.5 text-xs text-slate-400">
                          <li><strong>OS:</strong> {subresources.requirements.recommended.os}</li>
                          <li><strong>Processor:</strong> {subresources.requirements.recommended.processor}</li>
                          <li><strong>Memory:</strong> {subresources.requirements.recommended.memory}</li>
                          <li><strong>Graphics:</strong> {subresources.requirements.recommended.graphics}</li>
                          <li><strong>DirectX:</strong> {subresources.requirements.recommended.directx}</li>
                          <li><strong>Storage:</strong> {subresources.requirements.recommended.storage}</li>
                        </ul>
                      </div>
                    </Grid>
                  </Grid>
                </div>
              )}
            </div>
          )}

          {/* Tab 1: DLC */}
          {activeTab === 1 && (
            <div className="space-y-4">
              <Typography variant="h6" className="text-white font-bold mb-3">Downloadable Content (DLC)</Typography>
              {subresources.dlc.length === 0 ? (
                <Typography className="text-slate-500">No DLC available for this game.</Typography>
              ) : (
                <div className="divide-y divide-slate-800 bg-slate-950 rounded-2xl border border-slate-805">
                  {subresources.dlc.map((item) => (
                    <div key={item.dlc_appid} className="flex justify-between items-center p-4">
                      <div>
                        <Typography className="text-slate-200 font-semibold">{item.name}</Typography>
                        <Typography variant="caption" className="text-slate-500 font-mono">AppID: {item.dlc_appid}</Typography>
                      </div>
                      <Typography className="text-cyan-400 font-bold">${item.price}</Typography>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Achievements */}
          {activeTab === 2 && (
            <div>
              <Typography variant="h6" className="text-white font-bold mb-4">Game Achievements</Typography>
              {subresources.achievements?.highlighted ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {subresources.achievements.highlighted.map((ach) => (
                    <div key={ach.name} className="flex items-center space-x-4 bg-slate-950 p-4 rounded-2xl border border-slate-805">
                      <div className="bg-slate-800 h-12 w-12 rounded-xl flex items-center justify-center text-cyan-400 font-bold font-mono">
                        {ach.name[0]}
                      </div>
                      <div>
                        <Typography className="text-slate-200 font-bold text-sm">{ach.name}</Typography>
                        <Typography className="text-slate-400 text-xs mt-0.5">{ach.description}</Typography>
                        <span className="text-[0.65rem] text-indigo-400 font-bold uppercase mt-1 inline-block bg-indigo-950/30 px-2 py-0.5 rounded-full">
                          +{ach.xp} XP
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Typography className="text-slate-500">No achievements recorded.</Typography>
              )}
            </div>
          )}

          {/* Tab 3: Leaderboards */}
          {activeTab === 3 && (
            <div>
              <Typography variant="h6" className="text-white font-bold mb-4">Leaderboard Rankings</Typography>
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                <Table>
                  <TableHead className="bg-slate-900/60">
                    <TableRow>
                      <TableCell className="text-slate-400 font-bold border-none">Rank</TableCell>
                      <TableCell className="text-slate-400 font-bold border-none">Username</TableCell>
                      <TableCell className="text-slate-400 font-bold border-none">Score</TableCell>
                      <TableCell className="text-slate-400 font-bold border-none">Time Record</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody className="divide-y divide-slate-800/40">
                    {subresources.leaderboards.map((ld) => (
                      <TableRow key={ld.rank} className="hover:bg-slate-900/20 transition">
                        <TableCell className="text-slate-200 border-none font-bold">#{ld.rank}</TableCell>
                        <TableCell className="text-slate-200 border-none font-semibold">{ld.username}</TableCell>
                        <TableCell className="text-cyan-400 border-none font-mono font-semibold">{ld.score.toLocaleString()}</TableCell>
                        <TableCell className="text-slate-400 border-none font-mono">{ld.time_seconds}s</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Tab 4: News & Updates */}
          {activeTab === 4 && (
            <div className="space-y-6">
              <div>
                <Typography variant="h6" className="text-white font-bold mb-3">Latest Game News</Typography>
                <div className="space-y-4">
                  {subresources.news.map((item) => (
                    <div key={item.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-805">
                      <Typography className="text-slate-200 font-bold">{item.title}</Typography>
                      <div className="flex space-x-2 text-[0.7rem] text-slate-500 mt-1">
                        <span>By {item.author}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                      <Typography className="text-slate-400 text-sm mt-2">{item.summary}</Typography>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Typography variant="h6" className="text-white font-bold mb-3">Version Changelogs</Typography>
                <div className="space-y-4">
                  {subresources.updates.map((update) => (
                    <div key={update.version} className="bg-slate-950 p-4 rounded-2xl border border-slate-805">
                      <div className="flex justify-between items-start">
                        <Typography className="text-slate-200 font-bold text-sm">v{update.version} - {update.title}</Typography>
                        <Typography variant="caption" className="text-slate-500 font-mono">{update.date}</Typography>
                      </div>
                      <Typography className="text-slate-400 text-xs mt-2 leading-relaxed">{update.details}</Typography>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Reviews */}
          {activeTab === 5 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <Typography variant="h6" className="text-white font-bold">User Feedback Reviews</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddComment />}
                  onClick={() => setOpenReviewModal(true)}
                  className="bg-cyan-600 hover:bg-cyan-500 rounded-xl"
                  style={{ backgroundColor: '#0891b2', color: '#ffffff', textTransform: 'none', fontWeight: 'bold' }}
                >
                  Write Review
                </Button>
              </div>

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <Typography className="text-slate-500 text-center py-6">No user reviews submitted yet. Be the first to share your thoughts!</Typography>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.reviewId} className="bg-slate-950 p-4 rounded-2xl border border-slate-805 relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-200 font-bold text-sm">{rev.userId?.username || 'Gamer'}</span>
                            <span className="text-slate-500 text-xs">({rev.userId?.email || 'N/A'})</span>
                          </div>
                          <div className="flex items-center space-x-1 mt-1 text-amber-400">
                            {Array.from({ length: Math.round(rev.rating) }).map((_, idx) => (
                              <Star key={idx} sx={{ fontSize: 16 }} />
                            ))}
                            <span className="text-xs text-slate-400 font-bold ml-1 font-mono">{rev.rating}/10 Rating</span>
                          </div>
                        </div>
                        {user && (user.id === rev.userId || user.id === rev.userId?._id || user.role === 'admin') && (
                          <Button
                            size="small"
                            onClick={() => handleDeleteReview(rev.reviewId)}
                            className="text-red-400 hover:text-red-300"
                            style={{ textTransform: 'none' }}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                      <Typography className="text-slate-300 text-sm mt-3 leading-relaxed">{rev.reviewText}</Typography>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 6: Related Games */}
          {activeTab === 6 && (
            <div>
              <Typography variant="h6" className="text-white font-bold mb-4">Related Recommendation Matches</Typography>
              {subresources.related.length === 0 ? (
                <Typography className="text-slate-500">No related recommendation matches found.</Typography>
              ) : (
                <Grid container spacing={3}>
                  {subresources.related.map((game) => (
                    <Grid item xs={12} sm={4} key={game.appid}>
                      <Card className="bg-slate-950 border border-slate-805 rounded-2xl hover:border-slate-700 transition" style={{ backgroundColor: '#0f172a' }}>
                        <CardContent className="p-4">
                          <Typography variant="caption" className="text-cyan-400 font-mono text-xs">APPID: {game.appid}</Typography>
                          <Typography className="text-white font-bold mt-1 line-clamp-1 text-sm">{game.name}</Typography>
                          <Typography className="text-slate-400 text-xs mt-1">Price: {parseFloat(game.price) === 0 ? 'Free' : `$${game.price}`}</Typography>
                          <Button
                            component={Link}
                            to={`/games/${game.appid}`}
                            variant="text"
                            size="small"
                            className="text-cyan-400 mt-2 px-0 hover:underline"
                            style={{ textTransform: 'none', color: '#06b6d4', padding: 0 }}
                          >
                            Inspect Game
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </div>
          )}

          {/* Tab 7: Audit History */}
          {activeTab === 7 && (
            <div className="space-y-4">
              <Typography variant="h6" className="text-white font-bold mb-3">Database Alteration History Audit Log</Typography>
              {subresources.history.length === 0 ? (
                <Typography className="text-slate-500">No field alteration edits recorded for this game entry.</Typography>
              ) : (
                <div className="space-y-3">
                  {subresources.history.map((log, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-805 flex flex-col sm:flex-row justify-between sm:items-center">
                      <div>
                        <Typography className="text-slate-200 font-bold text-sm capitalize">{log.action}</Typography>
                        <span className="text-[0.65rem] text-slate-500 font-mono mt-0.5 inline-block">{new Date(log.updatedAt).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-2 sm:mt-0 max-w-md font-mono">
                        {log.changes ? (
                          Object.entries(log.changes).map(([field, val]) => (
                            <div key={field}>
                              {field}: <span className="text-cyan-400">{val}</span>
                            </div>
                          ))
                        ) : (
                          'No fields modified'
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Box>
      </Paper>

      {/* Edit Game Modal Dialog */}
      <Dialog
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
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
        <DialogTitle className="text-white font-black text-xl">Edit Game Record details</DialogTitle>
        <form onSubmit={editFormik.handleSubmit}>
          <DialogContent className="space-y-4">
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Game Title Name"
              value={editFormik.values.name}
              onChange={editFormik.handleChange}
              onBlur={editFormik.handleBlur}
              error={editFormik.touched.name && Boolean(editFormik.errors.name)}
              helperText={editFormik.touched.name && editFormik.errors.name}
              variant="outlined"
              size="small"
              InputLabelProps={{ style: { color: '#94a3b8' } }}
              inputProps={{ style: { color: '#f8fafc' } }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  id="price"
                  name="price"
                  label="Standard Price"
                  value={editFormik.values.price}
                  onChange={editFormik.handleChange}
                  onBlur={editFormik.handleBlur}
                  error={editFormik.touched.price && Boolean(editFormik.errors.price)}
                  helperText={editFormik.touched.price && editFormik.errors.price}
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
                  value={editFormik.values.recommendations}
                  onChange={editFormik.handleChange}
                  onBlur={editFormik.handleBlur}
                  error={editFormik.touched.recommendations && Boolean(editFormik.errors.recommendations)}
                  helperText={editFormik.touched.recommendations && editFormik.errors.recommendations}
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
                  value={editFormik.values.developer}
                  onChange={editFormik.handleChange}
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
                  value={editFormik.values.publisher}
                  onChange={editFormik.handleChange}
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
                  value={editFormik.values.release_date}
                  onChange={editFormik.handleChange}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ style: { color: '#94a3b8' } }}
                  inputProps={{ style: { color: '#f8fafc' } }}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              id="genres"
              name="genres"
              label="Genres (semicolon separated)"
              value={editFormik.values.genres}
              onChange={editFormik.handleChange}
              variant="outlined"
              size="small"
              InputLabelProps={{ style: { color: '#94a3b8' } }}
              inputProps={{ style: { color: '#f8fafc' } }}
            />
            <TextField
              fullWidth
              id="categories"
              name="categories"
              label="Categories (semicolon separated)"
              value={editFormik.values.categories}
              onChange={editFormik.handleChange}
              variant="outlined"
              size="small"
              InputLabelProps={{ style: { color: '#94a3b8' } }}
              inputProps={{ style: { color: '#f8fafc' } }}
            />
          </DialogContent>
          <DialogActions className="px-6 pb-6">
            <Button
              onClick={() => setOpenEditModal(false)}
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
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Write Review Modal Dialog */}
      <Dialog
        open={openReviewModal}
        onClose={() => setOpenReviewModal(false)}
        maxWidth="xs"
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
        <DialogTitle className="text-white font-black text-xl">Write a Game Review</DialogTitle>
        <form onSubmit={reviewFormik.handleSubmit}>
          <DialogContent className="space-y-4">
            <div>
              <Typography variant="body2" className="text-slate-400 mb-2">Rating Score (1-10)</Typography>
              <Slider
                id="rating"
                name="rating"
                value={reviewFormik.values.rating}
                onChange={(e, val) => reviewFormik.setFieldValue('rating', val)}
                min={1}
                max={10}
                step={1}
                valueLabelDisplay="auto"
                sx={{ color: '#06b6d4' }}
              />
            </div>
            <TextField
              fullWidth
              id="reviewText"
              name="reviewText"
              label="Review Feedback Text"
              multiline
              rows={4}
              value={reviewFormik.values.reviewText}
              onChange={reviewFormik.handleChange}
              onBlur={reviewFormik.handleBlur}
              error={reviewFormik.touched.reviewText && Boolean(reviewFormik.errors.reviewText)}
              helperText={reviewFormik.touched.reviewText && reviewFormik.errors.reviewText}
              variant="outlined"
              InputLabelProps={{ style: { color: '#94a3b8' } }}
              inputProps={{ style: { color: '#f8fafc' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#475569' },
                  '&:hover fieldset': { borderColor: '#06b6d4' },
                  '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
                },
              }}
            />
          </DialogContent>
          <DialogActions className="px-6 pb-6">
            <Button
              onClick={() => setOpenReviewModal(false)}
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
              Submit Review
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default GameDetails;
