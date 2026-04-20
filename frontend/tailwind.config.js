/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        bg:      '#0a0f1e',
        surface: '#111827',
        's2':    '#1a2235',
        accent:  '#10d98a',
        border:  'rgba(255,255,255,0.07)',
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-up': 'fadeUp 0.35s ease-out both',
        'fade-in': 'fadeIn 0.25s ease-out both',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeUp:  { from: { opacity:'0', transform:'translateY(16px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        fadeIn:  { from: { opacity:'0' }, to: { opacity:'1' } },
      },
    },
  },
  plugins: [],
}
