import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import api from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import SEO from '../components/SEO';

const COLORS = ['#06b6d4', '#4f46e5', '#10b981', '#f59e0b', '#ec4899'];

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGames: 0,
    avgPrice: 0,
    freeCount: 0,
    multiplayerCount: 0,
    genres: [],
    platforms: [],
    monthlyReleases: []
  });

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const [countRes, priceRes, freeRes, multiRes, genreRes, platformRes, monthlyRes] = await Promise.all([
        api.get('/stats/games/count'),
        api.get('/stats/games/average-price'),
        api.get('/stats/games/free-to-play-count'),
        api.get('/stats/games/multiplayer-count'),
        api.get('/stats/games/genre-count'),
        api.get('/stats/games/platform-count'),
        api.get('/stats/games/monthly-releases')
      ]);

      setStats({
        totalGames: countRes.count || 0,
        avgPrice: priceRes.averagePrice || 0,
        freeCount: freeRes.count || 0,
        multiplayerCount: multiRes.count || 0,
        genres: (genreRes.data || []).slice(0, 5).map(g => ({ name: g._id, count: g.count })),
        platforms: (platformRes.data || []).map(p => ({ name: p.platform, value: p.count })),
        monthlyReleases: (monthlyRes.data || []).reverse().map(m => ({ month: m._id, count: m.count }))
      });
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Typography variant="h4" className="text-white font-extrabold">System Dashboard</Typography>
        <SkeletonLoader type="stats" count={4} />
        <div className="h-20"></div>
        <SkeletonLoader type="detail" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SEO title="Dashboard" description="Visualize catalog distributions, games release trends, and platform statistics." />

      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          System Dashboard
        </h1>
        <p className="text-sm text-slate-400">
          General metrics, catalog volumes, and system statistics
        </p>
      </div>

      {/* KPI Cards Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="bg-slate-900 border border-slate-800 rounded-3xl p-6" style={{ backgroundColor: '#1e293b' }}>
            <Typography variant="subtitle2" className="text-slate-400 font-bold uppercase tracking-wider">
              Total Games
            </Typography>
            <Typography variant="h3" className="text-cyan-400 font-black mt-2">
              {stats.totalGames.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="bg-slate-900 border border-slate-800 rounded-3xl p-6" style={{ backgroundColor: '#1e293b' }}>
            <Typography variant="subtitle2" className="text-slate-400 font-bold uppercase tracking-wider">
              Average Price
            </Typography>
            <Typography variant="h3" className="text-indigo-400 font-black mt-2">
              ${stats.avgPrice.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="bg-slate-900 border border-slate-800 rounded-3xl p-6" style={{ backgroundColor: '#1e293b' }}>
            <Typography variant="subtitle2" className="text-slate-400 font-bold uppercase tracking-wider">
              Free-to-Play
            </Typography>
            <Typography variant="h3" className="text-emerald-400 font-black mt-2">
              {stats.freeCount.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="bg-slate-900 border border-slate-800 rounded-3xl p-6" style={{ backgroundColor: '#1e293b' }}>
            <Typography variant="subtitle2" className="text-slate-400 font-bold uppercase tracking-wider">
              Multiplayer Games
            </Typography>
            <Typography variant="h3" className="text-amber-400 font-black mt-2">
              {stats.multiplayerCount.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Visual Analytics Graphs */}
      <Grid container spacing={4}>
        {/* Genre Distribution (BarChart) */}
        <Grid item xs={12} md={6}>
          <Paper className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-[400px] flex flex-col" style={{ backgroundColor: '#1e293b' }}>
            <Typography variant="h6" className="text-white font-bold mb-4">
              Top Catalog Genres
            </Typography>
            <Box className="flex-1 w-full h-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.genres}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Platform Distribution (PieChart) */}
        <Grid item xs={12} md={6}>
          <Paper className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-[400px] flex flex-col" style={{ backgroundColor: '#1e293b' }}>
            <Typography variant="h6" className="text-white font-bold mb-2">
              Platform Configurations
            </Typography>
            <Box className="flex-1 w-full h-full min-h-[250px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.platforms}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.platforms.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Monthly Release Trends (LineChart) */}
        <Grid item xs={12}>
          <Paper className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-[400px] flex flex-col" style={{ backgroundColor: '#1e293b' }}>
            <Typography variant="h6" className="text-white font-bold mb-4">
              Monthly Release Schedule Trends
            </Typography>
            <Box className="flex-1 w-full h-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthlyReleases}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
