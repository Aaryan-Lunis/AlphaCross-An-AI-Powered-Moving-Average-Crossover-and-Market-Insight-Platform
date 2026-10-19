import React, { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const KEY = 'alphacross-sidebar';

const AppShell = () => {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(KEY) === 'collapsed';
    } catch (e) {
      return false;
    }
  });
  const [drawer, setDrawer] = useState(false);
  const { pathname } = useLocation();

  const toggleCollapsed = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem(KEY, c ? 'expanded' : 'collapsed');
      } catch (e) {
        /* ignore */
      }
      return !c;
    });

  const closeDrawer = useCallback(() => setDrawer(false), []);

  // New page -> start at the top.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-on-accent"
      >
        Skip to content
      </a>
      <Sidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} open={drawer} onClose={closeDrawer} />
      <div className={`transition-[padding] duration-200 ${collapsed ? 'lg:pl-16' : 'lg:pl-60'}`}>
        <Topbar onMenu={() => setDrawer(true)} />
        <main id="main" className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
