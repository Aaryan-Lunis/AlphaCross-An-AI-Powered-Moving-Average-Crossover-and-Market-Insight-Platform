import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

const read = (cs, name) => cs.getPropertyValue(`--${name}`).trim().split(/\s+/).join(',');

// Chart.js draws on <canvas>, which can't use CSS variables directly.
// This reads the live token values so charts follow the active theme.
export function useChartTheme() {
  const { theme } = useTheme();
  return useMemo(() => {
    const cs = getComputedStyle(document.documentElement);
    const c = (name, a = 1) => `rgba(${read(cs, name)},${a})`;
    return {
      theme,
      c,
      ink: c('ink'),
      ink2: c('ink-2'),
      ink3: c('ink-3'),
      grid: c('line', 0.7),
      line: c('line'),
      card: c('card'),
      elevated: c('elevated'),
      accent: c('accent-hi'),
      accentDeep: c('accent'),
      pos: c('pos'),
      neg: c('neg'),
      warn: c('warn'),
      info: c('info'),
      series2: c('series-2'),
      font: 'Inter, ui-sans-serif, system-ui, sans-serif',
      mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    };
  }, [theme]);
}
