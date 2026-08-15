import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          soft: 'var(--primary-soft)',
          foreground: 'var(--primary-foreground)',
          dim: 'var(--primary-dim)',
        },
        surface: 'var(--surface)',
        card: 'var(--card)',
        borderline: 'var(--border)',
        content: {
          DEFAULT: 'var(--text)',
          muted: 'var(--text-muted)',
          faint: 'var(--text-faint)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        sidebar: {
          DEFAULT: 'var(--sidebar-bg)',
          text: 'var(--sidebar-text)',
          muted: 'var(--sidebar-text-muted)',
        },
        zinc: {
          50: 'rgb(var(--zinc-50-rgb) / <alpha-value>)',
          100: 'rgb(var(--zinc-100-rgb) / <alpha-value>)',
          200: 'rgb(var(--zinc-200-rgb) / <alpha-value>)',
          300: 'rgb(var(--zinc-300-rgb) / <alpha-value>)',
          400: 'rgb(var(--zinc-400-rgb) / <alpha-value>)',
          500: 'rgb(var(--zinc-500-rgb) / <alpha-value>)',
          600: 'rgb(var(--zinc-600-rgb) / <alpha-value>)',
          700: 'rgb(var(--zinc-700-rgb) / <alpha-value>)',
          800: 'rgb(var(--zinc-800-rgb) / <alpha-value>)',
          900: 'rgb(var(--zinc-900-rgb) / <alpha-value>)',
          950: 'rgb(var(--zinc-950-rgb) / <alpha-value>)',
        },
        indigo: {
          50: 'rgb(var(--indigo-50-rgb) / <alpha-value>)',
          300: 'rgb(var(--indigo-300-rgb) / <alpha-value>)',
          400: 'rgb(var(--indigo-400-rgb) / <alpha-value>)',
          500: 'rgb(var(--indigo-500-rgb) / <alpha-value>)',
          600: 'rgb(var(--indigo-600-rgb) / <alpha-value>)',
          700: 'rgb(var(--indigo-700-rgb) / <alpha-value>)',
          800: 'rgb(var(--indigo-800-rgb) / <alpha-value>)',
        },
        violet: {
          50: 'rgb(var(--violet-50-rgb) / <alpha-value>)',
          500: 'rgb(var(--violet-500-rgb) / <alpha-value>)',
          600: 'rgb(var(--violet-600-rgb) / <alpha-value>)',
        },
        emerald: {
          50: 'rgb(var(--emerald-50-rgb) / <alpha-value>)',
          400: 'rgb(var(--emerald-400-rgb) / <alpha-value>)',
          500: 'rgb(var(--emerald-500-rgb) / <alpha-value>)',
          600: 'rgb(var(--emerald-600-rgb) / <alpha-value>)',
          700: 'rgb(var(--emerald-700-rgb) / <alpha-value>)',
        },
        amber: {
          50: 'rgb(var(--amber-50-rgb) / <alpha-value>)',
          200: 'rgb(var(--amber-200-rgb) / <alpha-value>)',
          700: 'rgb(var(--amber-700-rgb) / <alpha-value>)',
        },
        red: {
          50: 'rgb(var(--red-50-rgb) / <alpha-value>)',
          100: 'rgb(var(--red-100-rgb) / <alpha-value>)',
          200: 'rgb(var(--red-200-rgb) / <alpha-value>)',
          500: 'rgb(var(--red-500-rgb) / <alpha-value>)',
          600: 'rgb(var(--red-600-rgb) / <alpha-value>)',
          700: 'rgb(var(--red-700-rgb) / <alpha-value>)',
        },
        sky: {
          50: 'rgb(var(--sky-50-rgb) / <alpha-value>)',
          600: 'rgb(var(--sky-600-rgb) / <alpha-value>)',
          700: 'rgb(var(--sky-700-rgb) / <alpha-value>)',
        },
        blue: {
          50: 'rgb(var(--blue-50-rgb) / <alpha-value>)',
          600: 'rgb(var(--blue-600-rgb) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 1px rgb(0 0 0 / 0.04)',
        float: '0 8px 30px rgb(0 0 0 / 0.12)',
        popover: '0 4px 20px rgb(15 23 42 / 0.1)',
        glow: '0 4px 20px rgb(79 70 229 / 0.25)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};

export default config;
