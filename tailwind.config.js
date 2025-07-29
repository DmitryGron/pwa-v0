/** @type {import('tailwindcss').Config} */
export const content = [
  './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
];
export const theme = {
  extend: {
    colors: {
      // Core palette
      primary: '#BB1919', // red
      red: '#BB1919', // red
      black: '#000000', // black
      white: '#FFFFFF', // white
      
      // Dark greys
      grey100: '#141414', // Dark grey 1
      grey200: '#2E2E2E', // Dark grey 2
      grey300: '#404040', // Dark grey 3
      
      // Light greys
      grey400: '#979797', // Light grey 1
      grey500: '#BABABA', // Light grey 2
      grey600: '#DFDFDF', // Light grey 3
      
      // Sport
      sport: '#FFDF43', // Sport yellow
      sportAlt: '#FFD230', // Sport secondary
      
      // Category colors
      news: '#BB1919',
      iplayer: '#EF2525',
      sport: '#FFD230',
      sounds: '#FF4900',
      weather: '#0098DB',
      cbbc: '#41BDBC',
      cbeebies: '#71BF44',
      
      // System colors
      background: 'var(--background)',
      foreground: 'var(--foreground)',
    },
    fontFamily: {
      sans: ['var(--font-sans)', 'Arial', 'sans-serif'],
      mono: ['var(--font-mono)', 'monospace'],
    },
  },
};
export const plugins = [];
