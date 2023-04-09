/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue, js, ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans]
      },
      colors: {
        'main-purple': '#635FC7',
        'main-purple-hover': '#A8A4FF',
        'regular-black': '#000112',
        'very-dark-grey': '#20212C',
        'dark-grey': '#2B2C37',
        'lines-dark': '#3E3F4E',
        'medium-grey': '#828FA3',
        'lines-light': '#E4EBFA',
        'light-grey': '#F4F7FD',
        'regular-red': '#EA5555',
        'red-hover': '#FF9898'
      },
      fontSize: {
        sm: ['12px', '15px'],
        base: ['15px', '19px'],
        lg: ['18px', '23px'],
        xl: ['24px', '30px'],
      },
      boxShadow: {
        'xs': '0 0 1px 0 #979797',
        'sm': '0 0 8px -4px #979797'
      }
    }
  }
}