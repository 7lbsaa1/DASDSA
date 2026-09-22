/** @type {import('tailwindcss').Config} */

export default {

  content: [

    "./index.html",

    "./src/**/*.{js,ts,jsx,tsx}",

  ],

  theme: {

    extend: {

      colors: {

        primary: '#e74c3c',

        primaryDark: '#c0392b',

        secondary: '#ff6b6b',

        dark: {

          900: '#0a0a0f',

          800: '#12121a',

          700: '#1a1a25',

          600: '#252535',

          500: '#303045',

        },

        glass: 'rgba(255, 255, 255, 0.05)',

        glassBorder: 'rgba(255, 255, 255, 0.1)',

      },

      fontFamily: {

        cairo: ['Cairo', 'sans-serif'],

      },

      backdropBlur: {

        xs: '2px',

      },

      animation: {

        'like-pop': 'likePop 0.3s ease-out',

        'bookmark-save': 'bookmarkSave 0.4s ease-out',

        'slide-up': 'slideUp 0.3s ease-out',

        'fade-in': 'fadeIn 0.2s ease-out',

      },

      keyframes: {

        likePop: {

          '0%': { transform: 'scale(1)' },

          '50%': { transform: 'scale(1.3)' },

          '100%': { transform: 'scale(1)' },

        },

        bookmarkSave: {

          '0%': { transform: 'scale(1) rotate(0deg)' },

          '50%': { transform: 'scale(1.2) rotate(-10deg)' },

          '100%': { transform: 'scale(1) rotate(0deg)' },

        },

        slideUp: {

          '0%': { transform: 'translateY(20px)', opacity: '0' },

          '100%': { transform: 'translateY(0)', opacity: '1' },

        },

        fadeIn: {

          '0%': { opacity: '0' },

          '100%': { opacity: '1' },

        },

      },

    },

  },

  plugins: [],

}

