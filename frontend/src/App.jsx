import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import { forcedLogout } from './store/slices/authSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(forcedLogout());
    };

    // Listen for global unauthorized events from response interceptors
    window.addEventListener('auth-unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <AppRoutes />
    </div>
  );
}

export default App;
