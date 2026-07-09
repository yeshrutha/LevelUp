/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary-color)",
          light: "var(--primary-light)",
          dark: "var(--primary-dark)"
        },
        accent: {
          DEFAULT: "var(--accent-color)",
          light: "var(--accent-light)",
          dark: "var(--accent-dark)"
        },
        secondaryAccent: {
          DEFAULT: "var(--secondary-accent)",
          light: "var(--secondary-light)",
          dark: "var(--secondary-dark)"
        },
        darkbg: {
          DEFAULT: "var(--bg-color)",
          lighter: "var(--sidebar-bg)",
          deep: "var(--bg-color)"
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Outfit", "sans-serif"],
        futuristic: ["Outfit", "sans-serif"]
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(99, 102, 241, 0.3)',
        'glow-accent': '0 0 15px rgba(0, 229, 255, 0.4)',
        'glow-success': '0 0 15px rgba(34, 197, 94, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 229, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 229, 255, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
