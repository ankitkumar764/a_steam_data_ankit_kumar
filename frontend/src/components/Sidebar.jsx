import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Dashboard as DashboardIcon, 
  People as PeopleIcon, 
  AccountBox as ProfileIcon, 
  Settings as SettingsIcon, 
  BarChart as AnalyticsIcon, 
  Logout as LogoutIcon,
  SportsEsports as EsportsIcon
} from '@mui/icons-material';
import { ROUTES } from '../constants/routes';
import { logoutUser } from '../store/slices/authSlice';

const Sidebar = () => {
  const dispatch = useDispatch();

  const menuItems = [
    { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: <DashboardIcon /> },
    { name: 'User Management', path: ROUTES.USERS, icon: <PeopleIcon /> },
    { name: 'Analytics', path: ROUTES.ANALYTICS, icon: <AnalyticsIcon /> },
    { name: 'Profile', path: ROUTES.PROFILE, icon: <ProfileIcon /> },
    { name: 'Settings', path: ROUTES.SETTINGS, icon: <SettingsIcon /> },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-slate-800 bg-slate-900 text-slate-100 transition-all duration-300">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <EsportsIcon />
        </div>
        <span className="text-lg font-bold tracking-wider text-white">Steam Admin</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/15'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span className="flex items-center text-[20px]">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Footer Section */}
      <div className="border-t border-slate-800 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogoutIcon />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
