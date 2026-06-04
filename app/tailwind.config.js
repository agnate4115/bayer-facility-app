/** @type {import('tailwindcss').Config} */

// ── Compact Mode (80%) ──
// Scale all Tailwind spacing and font tokens to 80% of their defaults.
// This ensures the entire UI renders 20% smaller at the layout level,
// without CSS zoom/transform hacks that break fixed elements & charts.
const SCALE = 0.80;

// Tailwind's default spacing scale (in rem), scaled to 80%
const defaultSpacing = {
  px: '1px',
  0: '0px',
  0.5: `${0.125 * SCALE}rem`,
  1: `${0.25 * SCALE}rem`,
  1.5: `${0.375 * SCALE}rem`,
  2: `${0.5 * SCALE}rem`,
  2.5: `${0.625 * SCALE}rem`,
  3: `${0.75 * SCALE}rem`,
  3.5: `${0.875 * SCALE}rem`,
  4: `${1 * SCALE}rem`,
  5: `${1.25 * SCALE}rem`,
  6: `${1.5 * SCALE}rem`,
  7: `${1.75 * SCALE}rem`,
  8: `${2 * SCALE}rem`,
  9: `${2.25 * SCALE}rem`,
  10: `${2.5 * SCALE}rem`,
  11: `${2.75 * SCALE}rem`,
  12: `${3 * SCALE}rem`,
  14: `${3.5 * SCALE}rem`,
  16: `${4 * SCALE}rem`,
  20: `${5 * SCALE}rem`,
  24: `${6 * SCALE}rem`,
  28: `${7 * SCALE}rem`,
  32: `${8 * SCALE}rem`,
  36: `${9 * SCALE}rem`,
  40: `${10 * SCALE}rem`,
  44: `${11 * SCALE}rem`,
  48: `${12 * SCALE}rem`,
  52: `${13 * SCALE}rem`,
  56: `${14 * SCALE}rem`,
  60: `${15 * SCALE}rem`,
  64: `${16 * SCALE}rem`,
  72: `${18 * SCALE}rem`,
  80: `${20 * SCALE}rem`,
  96: `${24 * SCALE}rem`,
};

// Tailwind's default font sizes scaled to 80%
const defaultFontSize = {
  xs: [`${0.75 * SCALE}rem`, { lineHeight: `${1 * SCALE}rem` }],
  sm: [`${0.875 * SCALE}rem`, { lineHeight: `${1.25 * SCALE}rem` }],
  base: [`${1 * SCALE}rem`, { lineHeight: `${1.5 * SCALE}rem` }],
  lg: [`${1.125 * SCALE}rem`, { lineHeight: `${1.75 * SCALE}rem` }],
  xl: [`${1.25 * SCALE}rem`, { lineHeight: `${1.75 * SCALE}rem` }],
  '2xl': [`${1.5 * SCALE}rem`, { lineHeight: `${2 * SCALE}rem` }],
  '3xl': [`${1.875 * SCALE}rem`, { lineHeight: `${2.25 * SCALE}rem` }],
  '4xl': [`${2.25 * SCALE}rem`, { lineHeight: `${2.5 * SCALE}rem` }],
  '5xl': [`${3 * SCALE}rem`, { lineHeight: '1' }],
  '6xl': [`${3.75 * SCALE}rem`, { lineHeight: '1' }],
  '7xl': [`${4.5 * SCALE}rem`, { lineHeight: '1' }],
  '8xl': [`${6 * SCALE}rem`, { lineHeight: '1' }],
  '9xl': [`${8 * SCALE}rem`, { lineHeight: '1' }],
};

module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    spacing: defaultSpacing,
    fontSize: defaultFontSize,
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}