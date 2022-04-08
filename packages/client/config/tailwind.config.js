// const { readFileSync } = require('fs');
// const { join } = require('path');
// const file = readFileSync(join(__dirname, './tailwindConfig.ts'), 'utf8');
// console.log(file);
// import tailwindcssConfig from './tailwindConfig';
// const tailwindcssConfig = require('./tailwindConfig.ts');
// console.log(tailwindcssConfig);
module.exports = {
  content: [
    // "./index.html",
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'codezone-black': '#1E1F1E',

        'dao-gray': '1E1F1E',

        'dao-icon-color': '#0487D9',

        'dao-primary': '#0468BF',

        'dao-secondary': '#0487D9',

        'dao-light': '#73B2D9',

        'dao-white': '#F2F2F2',

        'dao-light-green': '#222728',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
