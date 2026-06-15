import { Container, Paper, Typography, Box } from '@mui/material';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';

function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-100 p-4">
      <Container maxWidth="sm">
        <Paper 
          elevation={4} 
          className="p-8 rounded-2xl bg-slate-800 border border-slate-700 text-center"
          sx={{ bgcolor: '#1e293b', color: '#f8fafc', borderRadius: '1rem', p: 4 }}
        >
          <Box className="flex justify-center mb-4 text-cyan-400">
            <SportsEsportsIcon sx={{ fontSize: 60 }} />
          </Box>
          <Typography variant="h4" component="h1" gutterBottom className="font-bold text-white tracking-tight">
            Steam Games Dashboard
          </Typography>
          <Typography variant="body1" className="text-slate-400 mb-6 leading-relaxed">
            Project initialized successfully. Tailwind CSS and Material UI are configured and ready.
          </Typography>
          <div className="flex justify-center gap-3">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Vite + React 19
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Tailwind CSS
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Material UI v6
            </span>
          </div>
        </Paper>
      </Container>
    </div>
  );
}

export default App;
