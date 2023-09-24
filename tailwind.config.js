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
      minHeight: {
        screen: ['100vh', '100dvh'],
      },
      screens: {
        'xs': '350px',
        's': '512px',
        'lg': '896px'
      },
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
          300: 'hsl(0 0% 85%)',
          350: 'hsl(0 0% 73%)',
          400: 'hsl(216 15% 57%)',
          500: 'hsl(237 16% 32%)',
          600: 'hsl(237 12% 27%)',
          680: 'hsl(237 12% 19% / .8)',
          700: 'hsl(237 12% 19%)',
          800: 'hsl(237 16% 15%)',
          880: 'hsl(0 0% 0% / .8)',
          900: 'hsl(237 16% 10%)'
        },
        green: {
          400: 'hsl(155 75% 70%)',
          600: 'hsl(88, 60%, 50%)'
        },
        purple: {
          310: 'hsl(242 48% 58% / .1)',
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
        baseFluid: 'clamp(0.81rem, calc(0.78rem + 0.21vw), 0.94rem)',
        lg: ['18px', '23px'],
        lgFluid: 'clamp(0.88rem, calc(0.80rem + 0.42vw), 1.13rem)',
        xl: ['24px', '30px'],
        xlFluid: 'clamp(1.25rem, calc(1.07rem + 1.04vw), 1.88rem)',
        xxlFluid: 'clamp(1.63rem, calc(1.22rem + 2.29vw), 3.00rem)'
      },
      outlineWidth: {
        default: 'var(--room-for-outline)',
      },
      boxShadow: {
        xs: '0 0 2px -1px hsl(0 0% 59%)',
        column: '1px 1px 10px -8px hsl(198 7% 71%)',
        option: '0px 0px 1px hsl(216 15% 57%)'
      },
      content: {
        'checked': 'url("/img/icon-check.svg")'
      },
      animation: {
        'ping-once': 'ping 1s ease-in-out forwards',
        'lds-roller-1': 'lds-roller 1.2s -0.036s cubic-bezier(0.5, 0, 0.5, 1) infinite',
        'lds-roller-2': 'lds-roller 1.2s -0.072s cubic-bezier(0.5, 0, 0.5, 1) infinite',
        'lds-roller-3': 'lds-roller 1.2s -0.108s cubic-bezier(0.5, 0, 0.5, 1) infinite',
        'lds-roller-4': 'lds-roller 1.2s -0.144s cubic-bezier(0.5, 0, 0.5, 1) infinite',
        'lds-roller-5': 'lds-roller 1.2s -0.180s cubic-bezier(0.5, 0, 0.5, 1) infinite',
        'lds-roller-6': 'lds-roller 1.2s -0.216s cubic-bezier(0.5, 0, 0.5, 1) infinite',
        'lds-roller-7': 'lds-roller 1.2s -0.252s cubic-bezier(0.5, 0, 0.5, 1) infinite',
        'lds-roller-8': 'lds-roller 1.2s -0.288s cubic-bezier(0.5, 0, 0.5, 1) infinite'
      },
      keyframes: {
        'lds-roller': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      transformOrigin: {
        40: '40px 40px',
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