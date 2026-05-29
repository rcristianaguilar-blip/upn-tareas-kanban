/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        upn: {
          yellow: '#ffbf00',
          gold: '#f5a800',
          black: '#101010',
          ink: '#222222',
          soft: '#fff8db',
        },
      },
      boxShadow: {
        card: '0 16px 36px -24px rgba(16, 16, 16, 0.45)',
        column: '0 18px 48px -34px rgba(16, 16, 16, 0.35)',
      },
    },
  },
  plugins: [],
};
