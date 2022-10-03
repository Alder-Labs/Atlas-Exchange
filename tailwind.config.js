const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

const primaryLight = {
  10: '#FDF4F2',
  20: '#FCECE8',
  30: '#FEDED6',
  40: '#FDB7A5',
  50: '#FC9378',
  60: '#FB5930',
  70: '#DB2F04',
  80: '#B22603',
  90: '#861D03',
  100: '#5F1402',
  110: '#3F0E01',
  120: '#280901',
};

const primaryDark = {
  10: '#280901',
  20: '#3F0E01',
  30: '#5F1402',
  40: '#861D03',
  50: '#B22603',
  60: '#DB2F04',
  70: '#FB5930',
  80: '#FC9378',
  90: '#FDB7A5',
  100: '#FEDED6',
  110: '#FCECE8',
  120: '#FDF4F2',
};

const secondaryLight = {
  10: '#F3F5FE',
  20: '#ECEFFD',
  30: '#DDE4FB',
  40: '#BAC7F7',
  50: '#99ADF3',
  60: '#708BEE',
  70: '#4165E9',
  80: '#204AE3',
  90: '#1838AC',
  100: '#112779',
  110: '#0B1A4F',
  120: '#0B1A4F',
};

const secondaryDark = {
  10: '#071032',
  20: '#0B1A4F',
  30: '#112779',
  40: '#1838AC',
  50: '#204AE3',
  60: '#4D5CFD',
  70: '#708BEE',
  80: '#99ADF3',
  90: '#BAC7F7',
  100: '#DDE4FB',
  110: '#ECEFFD',
  120: '#F3F5FE',
};

// Turquoise
const brand = {
  50: '#FEE5DF',
  100: '#FED5CB',
  200: '#FDB5A3',
  300: '#FD957B',
  400: '#FC7453',
  500: '#FB542B',
  600: '#E93204',
  700: '#B22603',
  800: '#7B1A02',
  900: '#440E01',
};

const grayLight = {
  10: '#F4F6F8',
  20: '#EEEFF1',
  30: '#E2E3E7',
  40: '#C6C8D0',
  50: '#ACAFBB',
  60: '#8C90A1',
  70: '#6B7084',
  80: '#585C6D',
  90: '#424552',
  100: '#2E3039',
  110: '#1D1F25',
  120: '#121316',
};

const grayDark = {
  10: '#101010',
  20: '#171717',
  30: '#191A1E',
  40: '#262626',
  50: '#404040',
  60: '#525252',
  70: '#737373',
  80: '#A3A3A3',
  90: '#D4D4D4',
  100: '#E5E5E5',
  110: '#F5F5F5',
  120: '#FAFAFA',
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  mode: 'jit',

  theme: {
    fontFamily: {
      sans: ['Poppins', ...defaultTheme.fontFamily.sans],
      fancy: ['Montserrat', ...defaultTheme.fontFamily.sans],
      mono: ['Roboto Mono', ...defaultTheme.fontFamily.sans],
    },
    colors: {
      transparent: 'transparent',
      primaryLight,
      primaryDark,
      secondaryLight,
      secondaryDark,
      grayLight,
      grayDark,
      greenLight: '#248434',
      greenDark: '#2DA541',
      redLight: '#E01D3D',
      redDark: '#EB637A',
      brand,
      bg: {
        primary: '#191919',
      },
      white: colors.white,
      black: colors.black,
      textPrimary: colors.white,
      textAccent: brand[500],
      error: '#FF7246',
      errorDark: '#FF7246',
      success: colors.green[600],
      successDark: '#16c784',
      warning: colors.yellow[600],
      warningDark: colors.yellow[400],
      info: '#4468EA',
      infoDark: '#6F8BEF',
    },
    fontSize: {
      xs: '0.6875rem',
      sm: '0.75rem',
      md: '0.875rem',
      lg: '1rem',
      xl: '1.125rem',
      ['2xl']: '1.25rem',
      ['3xl']: '1.5rem',
      ['4xl']: '1.875rem',
      ['5xl']: '2.25rem',
      ['6xl']: '2.5rem',
      label: '0.875rem',
      title: '1.25rem',
      normal: '14px',
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
    },
    extend: {
      spacing: {
        120: '30rem',
        160: '40rem',
      },
      animation: {
        enter: 'enter 200ms ease-out forwards',
        leave: 'leave 150ms ease-in forwards',
      },
      keyframes: {
        enter: {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        leave: {
          '0%': { transform: 'scale(1)', opacity: 1 },
          '100%': { transform: 'scale(0.9)', opacity: 0 },
        },
      },
    },
  },

  plugins: [require('@tailwindcss/line-clamp')],
};
