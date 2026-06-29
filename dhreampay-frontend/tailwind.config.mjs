/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          DEFAULT: '#1e3a5f',
          light: '#2d5a9e',
        },
        gold: {
          DEFAULT: '#d4a017',
          light: '#f0c040',
        },
      },
    },
  },
  plugins: [],
};
export default config;