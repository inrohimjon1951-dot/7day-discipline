import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-space)', 'sans-serif'],
        orbitron: ['var(--font-orbitron)', 'monospace'],
      },
      colors: {
        bg: {
          primary:   '#0a0a0f',
          secondary: '#0f0f1a',
          tertiary:  '#141420',
          card:      '#1a1a28',
        },
        border: '#1e1e30',
        cyan: {
          DEFAULT: '#00f5ff',
          dim:     '#00c4cc',
          muted:   'rgba(0,245,255,0.15)',
        },
        nred: {
          DEFAULT: '#ff3366',
          dim:     '#cc2952',
          muted:   'rgba(255,51,102,0.15)',
        },
        text: {
          primary:   '#e8e8f0',
          secondary: '#8888aa',
          tertiary:  '#555570',
        },
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(0,245,255,0.4), 0 0 40px rgba(0,245,255,0.15)',
        'red-glow':  '0 0 20px rgba(255,51,102,0.4), 0 0 40px rgba(255,51,102,0.15)',
        'cyan-sm':   '0 0 10px rgba(0,245,255,0.3)',
        'red-sm':    '0 0 10px rgba(255,51,102,0.3)',
      },
      animation: {
        'pulse-cyan': 'pulseCyan 1.5s ease-in-out infinite',
        'pulse-red':  'pulseRed 1.5s ease-in-out infinite',
        'glow-in':    'glowIn 0.3s ease',
        'slide-down': 'slideDown 0.2s ease',
      },
      keyframes: {
        pulseCyan: {
          '0%,100%': { boxShadow: '0 0 4px rgba(0,245,255,0.3)' },
          '50%':     { boxShadow: '0 0 14px rgba(0,245,255,0.7)' },
        },
        pulseRed: {
          '0%,100%': { boxShadow: '0 0 4px rgba(255,51,102,0.3)' },
          '50%':     { boxShadow: '0 0 14px rgba(255,51,102,0.7)' },
        },
        glowIn: {
          '0%':   { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(-6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
