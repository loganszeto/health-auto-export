import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1f1f28',
        secondary: '#2a2a37',
        accent: '#e6c384',
        'gray-custom': '#7c7c7c',
        'text-primary': '#c8c093',
      },
      backgroundColor: {
        'page': '#1f1f28',
      },
      textColor: {
        'default': '#c8c093',
        'muted': '#7c7c7c',
        'accent': '#e6c384',
      },
      fontFamily: {
        sans: ['Cascadia Code', 'monospace'],
        mono: ['Cascadia Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;

