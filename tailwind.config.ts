import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

// Tokens aligned with Outway mobile design system.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', md: '2rem' },
      screens: { '2xl': '1440px' },
    },
    extend: {
      colors: {
        primary: { DEFAULT: '#20B26B', active: '#0B7D4F', soft: '#EAF7EF', disabled: '#CBEFDC' },
        ink: '#222222',
        body: '#3f3f3f',
        muted: '#6a6a6a',
        'muted-soft': '#929292',
        hairline: '#dddddd',
        'hairline-soft': '#ebebeb',
        'border-strong': '#B9D8C7',
        canvas: '#ffffff',
        'surface-soft': '#F6FBF7',
        'surface-strong': '#F0F7F2',
        'legal-link': '#357A5A',
        'error-text': '#c13515',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '20px',
        xl: '32px',
        full: '9999px',
      },
      fontSize: {
        'display-xl': ['28px', { lineHeight: '1.43', fontWeight: '700' }],
        'display-lg': ['22px', { lineHeight: '1.18', fontWeight: '500', letterSpacing: '-0.44px' }],
        'display-md': ['21px', { lineHeight: '1.43', fontWeight: '700' }],
        'display-sm': ['20px', { lineHeight: '1.20', fontWeight: '600', letterSpacing: '-0.18px' }],
        'title-md': ['16px', { lineHeight: '1.25', fontWeight: '600' }],
        'title-sm': ['16px', { lineHeight: '1.25', fontWeight: '500' }],
        'rating-display': ['64px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-1px' }],
        'body-md': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.43', fontWeight: '400' }],
        'caption': ['14px', { lineHeight: '1.29', fontWeight: '500' }],
        'caption-sm': ['13px', { lineHeight: '1.23', fontWeight: '400' }],
        'badge': ['11px', { lineHeight: '1.18', fontWeight: '600' }],
        'micro-label': ['12px', { lineHeight: '1.33', fontWeight: '700' }],
      },
      boxShadow: {
        airbnb:
          'rgba(34,34,34,0.10) 0 2px 8px 0',
      },
    },
  },
  plugins: [animate],
};

export default config;
