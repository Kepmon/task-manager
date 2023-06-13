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
        blue: {
          40: 'hsl(216 15% 57% / .4)',
          80: 'hsl(219 63% 95% / .8)',
          100: 'hsl(219 63% 95%)',
          200: 'hsl(237 69% 97%)',
          300: 'hsl(219 69% 74%)',
          500: 'hsl(249 75% 70%)',
          600: 'hsl(193 75% 59%)',
        },
        gray: {
          200: 'hsl(0 0% 91%)',
          400: 'hsl(216 15% 57%)',
          500: 'hsl(237 16% 32%)',
          600: 'hsl(237 12% 27%)',
          680: 'hsl(237 12% 19% / .8)',
          700: 'hsl(237 12% 19%)',
          800: 'hsl(237 16% 15%)',
          880: 'hsl(0 0% 0% / .8)'
        },
        green: {
          400: 'hsl(155 75% 70%)'
        },
        purple: {
          320: 'hsl(242 48% 58% / .2)',
          330: 'hsl(242 48% 58% / .3)',
          400: 'hsl(242 48% 58%)',
          500: 'hsl(242 48% 52%)'
        },
        red: {
          200: 'hsl(0 100% 73%)',
          400: 'hsl(0 78% 63%)'
        }
      },
      fontSize: {
        xs: ['12px', '15px'],
        sm: ['13px', '16px'],
        base: ['15px', '19px'],
        baseFluid: 'clamp(0.81rem, calc(0.78rem + 0.21vw), 0.94rem)',
        lg: ['18px', '23px'],
        lgFluid: 'clamp(0.88rem, calc(0.80rem + 0.42vw), 1.13rem)',
        xl: ['24px', '30px'],
        xlFluid: 'clamp(1.25rem, calc(1.07rem + 1.04vw), 1.88rem)'
      },
      boxShadow: {
        xs: '0 0 2px -1px hsl(0 0% 59%)',
        sm: '0 0 8px -4px hsl(0 0% 59%)',
        column: '1px 1px 10px -8px hsl(198 7% 71%)',
        option: '0px 0px 1px hsl(216 15% 57%)'
      },
      content: {
        'checked': 'url("/img/icon-check.svg")'
      },
      animation: {
        'ping-once': 'ping 1s ease-in-out forwards'
      }
    },
    scrollbar: {
      visibleDark: {
        size: '8px',
        track: { background: 'transparent' },
        thumb: { background: 'hsl(237 100% 4% / .4)', borderRadius: '40px' },
        hover: { background: 'hsl(237 100% 4%)' }
      },
      visibleLight: {
        size: '8px',
        track: { background: 'transparent' },
        thumb: { background: 'hsl(0 0% 84%)', borderRadius: '40px' },
        hover: { background: 'hsl(0 0% 65%)' }
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