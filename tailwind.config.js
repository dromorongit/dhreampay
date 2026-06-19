/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dhreampay: {
          primary: '#0F172A',
          sidebar: '#1E293B',
          card: '#1E293B',
          gold: {
            DEFAULT: '#F59E0B',
            hover: '#D97706',
          },
          text: {
            primary: '#F8FAFC',
            secondary: '#94A3B8',
          },
          border: '#334155',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
      },
    },
  },
  plugins: [],
}