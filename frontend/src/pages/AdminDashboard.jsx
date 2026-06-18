import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, Table, TableHead, TableRow, TableCell, TableBody, Chip, Button, CircularProgress } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import api from '../services/api';
import { useToast } from '../components/ToastNotification';
import SEO from '../components/SEO';

export const AdminDashboard = () => {
  const showToast = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    metrics: null,
    reports: [],
    games: [],
  });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, reportsRes, gamesRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/reports'),
        api.get('/admin/games'),
      ]);

      setData({
        metrics: analyticsRes.data || null,
        reports: reportsRes.reports || [],
        games: gamesRes.games || [],
      });
    } catch (err) {
      showToast(err.message || 'Failed to fetch administrator console data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <CircularProgress color="primary" />
      </div>
    );
  }

  const { metrics, reports, games } = data;

  const chartData = [
    { name: 'Active Session Users', count: metrics?.activeUsers || 0 },
    { name: 'Total Registrations', count: (metrics?.totalUsers || 0) / 10 }, // scaled down for side-by-side comparison
  ];

  return (
    <div className="space-y-6">
      <SEO title="Admin Console" description="Security audit logs, system report summaries, and database backup configurations." />

      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Admin Dashboard
        </h1>
        <p className="text-sm text-slate-400">
          Global analytics, reports registry, and system diagnostics
        </p>
      </div>

      {/* Admin KPI Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="bg-slate-900 border border-slate-800 rounded-3xl p-6" style={{ backgroundColor: '#1e293b' }}>
            <Typography variant="subtitle2" className="text-slate-400 font-bold uppercase tracking-wider">
              Total Database Users
            </Typography>
            <Typography variant="h3" className="text-cyan-400 font-black mt-2">
              {metrics?.totalUsers?.toLocaleString() || '0'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="bg-slate-900 border border-slate-800 rounded-3xl p-6" style={{ backgroundColor: '#1e293b' }}>
            <Typography variant="subtitle2" className="text-slate-400 font-bold uppercase tracking-wider">
              Active User Sessions
            </Typography>
            <Typography variant="h3" className="text-indigo-400 font-black mt-2">
              {metrics?.activeUsers?.toLocaleString() || '0'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="bg-slate-900 border border-slate-800 rounded-3xl p-6" style={{ backgroundColor: '#1e293b' }}>
            <Typography variant="subtitle2" className="text-slate-400 font-bold uppercase tracking-wider">
              System CPU Load
            </Typography>
            <Typography variant="h3" className="text-amber-400 font-black mt-2">
              {metrics?.systemLoad || '0%'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="bg-slate-900 border border-slate-800 rounded-3xl p-6" style={{ backgroundColor: '#1e293b' }}>
            <Typography variant="subtitle2" className="text-slate-400 font-bold uppercase tracking-wider">
              DB Connection State
            </Typography>
            <Typography variant="h3" className="text-emerald-400 font-black mt-2">
              {metrics?.databaseStatus || 'Healthy'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Reports Registry List */}
        <Grid item xs={12} md={5}>
          <Paper className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-full flex flex-col" style={{ backgroundColor: '#1e293b' }}>
            <Typography variant="h6" className="text-white font-bold mb-4">
              Generated System Reports
            </Typography>
            <Box className="flex-1 space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div>
                    <Typography className="text-slate-200 text-sm font-semibold">{report.name}</Typography>
                    <Typography className="text-slate-500 font-mono text-xs mt-0.5">{report.id}</Typography>
                  </div>
                  <Chip
                    label={report.status}
                    size="small"
                    className={
                      report.status === 'Generated'
                        ? 'bg-emerald-500/10 text-emerald-400 font-bold text-xs'
                        : report.status === 'Pending Review'
                        ? 'bg-amber-500/10 text-amber-400 font-bold text-xs'
                        : 'bg-slate-500/10 text-slate-400 font-bold text-xs'
                    }
                  />
                </div>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Scaled Users Metrics Chart */}
        <Grid item xs={12} md={7}>
          <Paper className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-full flex flex-col" style={{ backgroundColor: '#1e293b' }}>
            <Typography variant="h6" className="text-white font-bold mb-4">
              Registered Users Metrics
            </Typography>
            <Box className="flex-1 w-full min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Database Audit Log (First 5 Games) */}
        <Grid item xs={12}>
          <Paper className="bg-slate-900 border border-slate-800 rounded-3xl p-6" style={{ backgroundColor: '#1e293b' }}>
            <Typography variant="h6" className="text-white font-bold mb-4">
              Administrative Games Audit Log (First 5 Records)
            </Typography>
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
              <Table>
                <TableHead>
                  <TableRow className="border-b border-slate-800 bg-slate-900/50">
                    <TableCell className="text-slate-400 font-bold border-none">App ID</TableCell>
                    <TableCell className="text-slate-400 font-bold border-none">Game Name</TableCell>
                    <TableCell className="text-slate-400 font-bold border-none">Developer</TableCell>
                    <TableCell className="text-slate-400 font-bold border-none">Price</TableCell>
                    <TableCell className="text-slate-400 font-bold border-none">Soft-deleted State</TableCell>
                    <TableCell className="text-slate-400 font-bold border-none">History Changes Log</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody className="divide-y divide-slate-800/40">
                  {games.map((game) => (
                    <TableRow key={game.appid} className="hover:bg-slate-900/30 transition">
                      <TableCell className="text-slate-200 border-none font-mono text-sm">{game.appid}</TableCell>
                      <TableCell className="text-slate-200 border-none font-semibold">{game.name}</TableCell>
                      <TableCell className="text-slate-400 border-none">{game.developer || 'N/A'}</TableCell>
                      <TableCell className="text-slate-400 border-none">${game.price || '0.00'}</TableCell>
                      <TableCell className="border-none">
                        <Chip
                          label={game.isDeleted ? 'Soft Deleted' : 'Active'}
                          size="small"
                          className={
                            game.isDeleted
                              ? 'bg-red-500/10 text-red-400 font-bold text-xs'
                              : 'bg-emerald-500/10 text-emerald-400 font-bold text-xs'
                          }
                        />
                      </TableCell>
                      <TableCell className="text-slate-400 border-none text-xs">
                        {game.history && game.history.length > 0 ? (
                          <span className="font-semibold text-cyan-400">
                            {game.history.length} audit entry logs
                          </span>
                        ) : (
                          'No edits recorded'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default AdminDashboard;
