import { useSelector } from 'react-redux';
import { 
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="fixed top-0 right-0 z-10 flex h-16 w-[calc(100%-16rem)] items-center justify-between border-b border-slate-800 bg-slate-900 px-8 text-slate-100 transition-all duration-300">
      {/* Title/Greeting */}
      <div>
        <h2 className="text-sm font-medium text-slate-400">Welcome,</h2>
        <h1 className="text-lg font-bold text-white tracking-tight">
          {user ? user.username : 'Administrator'}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-6">
        {/* Search Input Bar Placeholder */}
        <div className="relative hidden md:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <SearchIcon sx={{ fontSize: 20 }} />
          </span>
          <input
            type="text"
            placeholder="Search game catalog..."
            className="w-64 rounded-xl border border-slate-800 bg-slate-950 py-2 pl-10 pr-4 text-xs font-semibold text-slate-100 placeholder-slate-500 transition-colors focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Notifications Button */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors">
          <NotificationsIcon sx={{ fontSize: 20 }} />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-cyan-500"></span>
        </button>

        {/* Profile Avatar Dropdown wrapper */}
        <div className="flex items-center gap-3 border-l border-slate-800 pl-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-600/10 text-cyan-400 border border-cyan-500/20">
            <AccountIcon />
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-bold text-white">{user ? user.username : 'Admin User'}</p>
            <p className="text-[10px] font-semibold text-slate-500 capitalize">{user ? user.role || 'Admin' : 'Role'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
