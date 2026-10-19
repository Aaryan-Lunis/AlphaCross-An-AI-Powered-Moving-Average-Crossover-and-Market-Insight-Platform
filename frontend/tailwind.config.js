/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        canvas: token('canvas'),
        surface: token('surface'),
        card: token('card'),
        elevated: token('elevated'),
        line: token('line'),
        ink: {
          DEFAULT: token('ink'),
          2: token('ink-2'),
          3: token('ink-3'),
        },
        accent: {
          DEFAULT: token('accent'),
          hi: token('accent-hi'),
          soft: token('accent-soft'),
        },
        'on-accent': token('on-accent'),
        pos: token('pos'),
        neg: token('neg'),
        warn: token('warn'),
        info: token('info'),
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },
      fontSize: {
        meta: ['12px', { lineHeight: '16px' }],
        table: ['13px', { lineHeight: '18px' }],
        ui: ['14px', { lineHeight: '20px' }],
        body: ['15px', { lineHeight: '22px' }],
        section: ['20px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        title: ['28px', { lineHeight: '34px', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        md: '8px',
        lg: '10px',
        xl: '12px',
      },
      boxShadow: {
        card: '0 1px 2px rgb(0 0 0 / 0.12)',
        pop: '0 12px 32px -8px rgb(0 0 0 / 0.45)',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
    },
  },
  plugins: [],
};
