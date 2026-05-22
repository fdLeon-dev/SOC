/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // SOC dark theme palette
        soc: {
          bg:       '#0a0e1a',
          surface:  '#0f1629',
          card:     '#141d35',
          border:   '#1e2d4a',
          accent:   '#00d4ff',
          green:    '#00ff88',
          yellow:   '#ffd700',
          red:      '#ff4757',
          orange:   '#ff6b35',
          text:     '#c8d6f0',
          muted:    '#6b7f9e',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
}
