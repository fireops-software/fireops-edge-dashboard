import daisyui from 'daisyui';
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [
    daisyui,
  ],
  daisyui: {
    themes: [
      {
        fireops: {
           'primary' : '#e51d1d',
           'primary-focus' : '#c62a2a',
           'primary-content' : '#ffffff',

           'secondary' : '#454545',
           'secondary-focus' : '#757575',
           'secondary-content' : '#ffffff',

           'accent' : '#adcd37',
           'accent-focus' : '#88a12b',
           'accent-content' : '#ffffff',

           'neutral' : '#3b424e',
           'neutral-focus' : '#2a2e37',
           'neutral-content' : '#ffffff',

           'base-100' : '#fcfcfc',
           'base-200' : '#dbdbdb',
           'base-300' : '#bbbbbb',
           'base-content' : '#161616',

           'info' : '#1c92f2',
           'success' : '#009485',
           'warning' : '#ff9900',
           'error' : '#ff5724',       
        },
      },
      "dark",
      "cupcake",
    ],
  }
}

