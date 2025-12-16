module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#3182F6',
        background: '#F2F4F6',
        surface: '#FFFFFF',
        text: {
          900: '#191F28',
          500: '#8B95A1',
          300: '#E5E8EB',
        },
      },
    },
  },
  plugins: [],
};
