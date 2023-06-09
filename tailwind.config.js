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
        'transparent-purple': '#635FC71A',
        'semitransparent-purple': ' #635FC740',
        'white-purple': '#635FC71A',
        'white-hover': '#E8E8E8',
        'main-purple-hover': '#A8A4FF',
        'regular-black': '#000112',
        'very-dark-grey': '#20212C',
        'very-dark-grey-hover': '#45475F',
        'dark-grey': '#2B2C37',
        'lines-dark': '#3E3F4E',
        'medium-grey': '#828FA3',
        'lines-light': '#E4EBFA',
        'light-grey': '#F4F7FD',
        'regular-red': '#EA5555',
        'red-hover': '#FF9898',
        blue: { 400: "#49C4E5"},
        purple: { 400: '#8471F2' },
        green: { 400: '#67E2AE' },
        lightBlue: {
          80: '#E9EFFA80',
          100: '#E9EFFA'
        },
        darkBlue: {
          80: '#2B2C3780',
          100: '#2B2C37'
        },
        'semitransparent-black': '#00000077',
        grayAccent: {
          40: '#828FA340'
        }
      },
      fontSize: {
        xs: ['12px', '15px'],
        sm: ['13px', '16px'],
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
        'checked': 'url("/img/icon-check.svg")'
      }
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