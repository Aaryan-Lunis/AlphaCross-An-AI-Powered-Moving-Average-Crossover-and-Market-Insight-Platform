/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          850: '#1a202e',
          950: '#0d1117',
        },
      },
      animation: {
        'bounce': 'bounce 1s infinite',
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
  safelist: [
    'text-green-400',
    'text-red-400',
    'text-blue-400',
    'text-purple-400',
    'text-orange-400',
    'border-green-500',
    'border-red-500',
    'border-blue-500',
    'bg-green-500',
    'bg-red-500',
    'bg-blue-500',
    'from-green-600',
    'to-green-400',
    'from-red-600',
    'to-red-400',
  ]
}