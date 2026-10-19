import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bot,
  CandlestickChart,
  FlaskConical,
  LayoutGrid,
  ListFilter,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import Logo from './Logo';

export const LAST_SYMBOL_KEY = 'alphacross-last-symbol';
export const getLastSymbol = () => {
  try {
    return localStorage.getItem(LAST_SYMBOL_KEY) || 'INFY';
  } catch (e) {
    return 'INFY';
  }
};

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid, to: () => '/', match: (p) => p === '/' },
  {
    id: 'analysis',
    label: 'Stock analysis',
    icon: CandlestickChart,
    to: () => `/analysis/${getLastSymbol()}`,
    match: (p) => p.startsWith('/analysis'),
  },
  { id: 'screener', label: 'Screener', icon: ListFilter, to: () => '/screener', match: (p) => p.startsWith('/screener') },
  { id: 'backtesting', label: 'Backtesting', icon: FlaskConical, to: () => '/backtesting', match: (p) => p.startsWith('/backtesting') },
  {
    id: 'assistant',
    label: 'AI assistant',
    icon: Bot,
    to: () => `/assistant/${getLastSymbol()}`,
    match: (p) => p.startsWith('/assistant'),
  },
];

export const NAV_ITEMS = NAV;

const Sidebar = ({ collapsed, onToggleCollapsed, open, onClose }) => {
  const { pathname } = useLocation();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Escape closes the drawer.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const rail = collapsed;

  return (
    <>
      {/* backdrop (mobile drawer) */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        aria-label="Primary"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface transition-transform duration-200 lg:z-30 lg:translate-x-0 ${
          rail ? 'lg:w-16' : 'lg:w-60'
        } ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className={`flex h-14 items-center border-b border-line ${rail ? 'justify-center lg:px-0' : 'justify-between px-4'}`}>
          <Link to="/" aria-label="AlphaCross overview" className="rounded-md">
            <span className="lg:hidden">
              <Logo />
            </span>
            <span className="hidden lg:block">
              <Logo collapsed={rail} />
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-2 hover:bg-elevated hover:text-ink lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2.5" aria-label="Main">
          {NAV.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.to()}
                aria-current={active ? 'page' : undefined}
                title={rail ? item.label : undefined}
                className={`group flex items-center gap-3 rounded-md px-3 py-2 text-ui font-medium transition-colors ${
                  rail ? 'lg:justify-center lg:px-0' : ''
                } ${
                  active
                    ? 'bg-accent-soft text-ink'
                    : 'text-ink-2 hover:bg-elevated hover:text-ink'
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] flex-shrink-0 ${active ? 'text-accent-hi' : 'text-ink-3 group-hover:text-ink-2'}`}
                  aria-hidden="true"
                />
                <span className={rail ? 'lg:sr-only' : ''}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden border-t border-line p-2.5 lg:block">
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={rail ? 'Expand sidebar' : 'Collapse sidebar'}
            title={rail ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-ui text-ink-3 transition-colors hover:bg-elevated hover:text-ink ${
              rail ? 'justify-center px-0' : ''
            }`}
          >
            {rail ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
            {!rail && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
