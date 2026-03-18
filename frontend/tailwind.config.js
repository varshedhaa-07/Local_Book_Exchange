/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#132238',
        mist: '#f4efe6',
        coral: '#ea6d4e',
        spruce: '#20615b',
        sand: '#d9c2a2',
      },
      boxShadow: {
        soft: '0 20px 45px rgba(19, 34, 56, 0.12)',
      },
      backgroundImage: {
        mesh: 'radial-gradient(circle at top left, rgba(234, 109, 78, 0.18), transparent 35%), radial-gradient(circle at top right, rgba(32, 97, 91, 0.18), transparent 32%), linear-gradient(135deg, #fffdf7 0%, #f5efe6 100%)',
      },
      fontFamily: {
        sans: ['"Trebuchet MS"', '"Segoe UI"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
