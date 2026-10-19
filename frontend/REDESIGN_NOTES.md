# AlphaCross frontend redesign - Obsidian & Emerald

Drop-in replacement for the `frontend/` folder. Backend untouched.
Same dependencies, same `REACT_APP_API_URL`, same `npm run build`.

Routing uses HashRouter (`/#/analysis/TCS`), so no server rewrite rules are needed.

## Structure
- `src/index.css` - design tokens (dark + light) as CSS variables; edit colours here.
- `src/components/ui` - Button, Badge, Input/Select, Skeleton, States, Segmented, DataTable
- `src/components/layout` - AppShell, Sidebar, Topbar, PageHeader, ThemeToggle, GlobalSearch, Logo
- `src/pages` - Overview, StockAnalysis, ScreeningResults, Backtesting, AIAssistant
- `src/hooks`, `src/lib` - data loading, caching, formatting, signal helpers
- `src/api/api.js` - unchanged except one added function, `explainChart` (same /explain-chart endpoint)

## Frontend-only fixes
- Chart read `ema20/ema50` but the API returns `ema_20/ema_50`: EMA lines and crossovers now render.
- Chat context sent `ema20/ema50` as null; now filled from prediction/quote data.
- Removed fabricated fallback summary text and the "Powered by GPT-4-Turbo" claim.
- Period labels now match the data (chart 6 months, single-stock backtest 1 year, universe backtest 6 months).
