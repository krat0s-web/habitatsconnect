import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8f9fa',
          100: '#f0f1f3',
          200: '#e1e3e8',
          300: '#c5c8d0',
          400: '#a0a5b2',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        secondary: {
          50: '#f8f8f8',
          100: '#f0f0f0',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#b8b8b8',
          500: '#888888',
          600: '#666666',
          700: '#444444',
          800: '#2a2a2a',
          900: '#1a1a1a',
        },
        accent: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#c0c0c0',
          500: '#808080',
          600: '#606060',
          700: '#404040',
          800: '#202020',
          900: '#0a0a0a',
        },
      },
      backgroundImage: {
        'gradient-fluid': 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slide-in 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-in',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(31, 41, 55, 0.7)' },
          '50%': { opacity: '.8', boxShadow: '0 0 30px rgba(31, 41, 55, 0.9)' },
        },
        'slide-in': {
          'from': { transform: 'translateX(-100%)' },
          'to': { transform: 'translateX(0)' },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
