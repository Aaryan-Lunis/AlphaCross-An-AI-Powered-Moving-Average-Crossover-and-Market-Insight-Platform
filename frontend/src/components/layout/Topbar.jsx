import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import GlobalSearch from './GlobalSearch';
import Button from '../ui/Button';
import { NAV_ITEMS } from './Sidebar';

const Topbar = ({ onMenu }) => {
  const { pathname } = useLocation();
  const current = NAV_ITEMS.find((n) => n.match(pathname));
  const sym = pathname.split('/')[2];

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-canvas/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </Button>

      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 text-ui md:flex">
        <span className="text-ink-3">AlphaCross</span>
        <span className="text-ink-3" aria-hidden="true">/</span>
        <span className="truncate font-medium text-ink">{current?.label || 'Overview'}</span>
        {sym && (current?.id === 'analysis' || current?.id === 'assistant') && (
          <>
            <span className="text-ink-3" aria-hidden="true">/</span>
            <span className="num font-medium text-accent-hi">{sym.toUpperCase()}</span>
          </>
        )}
      </nav>

      <div className="flex flex-1 justify-end">
        <GlobalSearch />
      </div>

      <ThemeToggle />
    </header>
  );
};

export default Topbar;
