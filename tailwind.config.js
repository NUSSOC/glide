const {
  default: flattenColorPalette,
} = require('tailwindcss/lib/util/flattenColorPalette');
const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          'bg-fade-to-t': (value) => ({
            background: `linear-gradient(180deg, transparent 0%, ${value} 50%)`,
          }),
        },
        { values: flattenColorPalette(theme('colors')), type: 'color' },
      );
    }),
  ],
};
