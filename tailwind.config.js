/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f5f4f0',
          100: '#e8e6df',
          200: '#c9c5b8',
          300: '#a8a396',
          400: '#857f72',
          500: '#5e5a50',
          600: '#3d3a33',
          700: '#2a2820',
          800: '#1a1915',
          900: '#0f0e0c',
        },
        sage: {
          50: '#f0f5ee',
          100: '#d4e8cc',
          200: '#a8d09b',
          300: '#72b163',
          400: '#4a9137',
          500: '#2d6e1f',
          600: '#1a4f12',
        },
        amber: {
          50: '#fdf6e3',
          100: '#fae4a8',
          200: '#f5c842',
          300: '#d4a017',
          400: '#a87a0c',
          500: '#7a5608',
        },
        coral: {
          50: '#fdf0ee',
          100: '#f8cdc6',
          200: '#f19f91',
          300: '#e5604d',
          400: '#c73d29',
          500: '#9a2d1c',
        },
      },
    },
  },
  plugins: [],
}
