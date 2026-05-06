import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{vue,ts,tsx}',
    './.storybook/**/*.{ts,tsx,js}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe6ff',
          200: '#b9ceff',
          300: '#8baeff',
          400: '#5683ff',
          500: '#2f5dff',
          600: '#1d40e6',
          700: '#1830b8',
          800: '#172a92',
          900: '#172873',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
