/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss/nesting'),
    require('tailwindcss')(path.join(__dirname, './tailwind.config.js')),
    require('autoprefixer'),
  ],
};

// (require('postcss-nesting'))
