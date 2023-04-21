/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue, js, ts}'],
  plugins: [
    require('@gradin/tailwindcss-scrollbar')
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans]
      },
      colors: {
        'main-purple': '#635FC7',
        'semitransparent-purple': '#635FC740',
        'white-purple': '#635FC71A',
        'main-purple-hover': '#A8A4FF',
        'regular-black': '#000112',
        'very-dark-grey': '#20212C',
        'dark-grey': '#2B2C37',
        'lines-dark': '#3E3F4E',
        'medium-grey': '#828FA3',
        'lines-light': '#E4EBFA',
        'light-grey': '#F4F7FD',
        'regular-red': '#EA5555',
        'red-hover': '#FF9898',
        'first-column': '#49C4E5',
        'second-column': '#8471F2',
        'third-column': '#67E2AE',
        'light-column-start': '#E9EFFA',
        'light-column-end': '#E9EFFA80',
        'dark-column-start': '#2B2C37',
        'dark-column-end': '#2B2C3780',
        'semitransparent-black': '#00000077',
        'input-border': '#828FA340',
        'input-border-focus': '#828FA380'
      },
      fontSize: {
        sm: ['12px', '15px'],
        s: ['13px', '16px'],
        base: ['15px', '19px'],
        lg: ['18px', '23px'],
        xl: ['24px', '30px'],
      },
      boxShadow: {
        xs: '0 0 2px -1px #979797',
        sm: '0 0 8px -4px #979797',
        column: '1px 1px 10px -8px #AFB6B9',
        option: '0px 0px 1px #828FA3'
      },
      content: {
        'down-arrow': 'url("/img/icon-chevron-down.svg")',
        'checked': 'url("/img/icon-check.svg")'
      },
    },
    scrollbar: {
      visibleDark: {
        size: '8px',
        track: { background: 'transparent' },
        thumb: { background: '#00011255', borderRadius: '40px' },
        hover: { background: '#000112' }
      },
      visibleLight: {
        size: '8px',
        track: { background: 'transparent' },
        thumb: { background: '#D5D5D5', borderRadius: '40px' },
        hover: { background: '#A5A5A5' }
      },
      invisible: {
        size: '0px',
        track: { background: 'transparent' },
        thumb: { background: 'transparent' },
        hover: { background: 'transparent' }
      }
    }
  }
}