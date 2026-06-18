import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export const MainLayout = ({ theme, onThemeToggle }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMobileNavToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onMobileNavToggle={handleMobileNavToggle}
          currentTheme={theme}
          onThemeToggle={onThemeToggle}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 bg-slate-950 text-slate-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
