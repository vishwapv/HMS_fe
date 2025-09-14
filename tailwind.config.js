/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'hospital-blue': {
          50: '#e8f2fc',
          500: '#1a6aaa',
          700: '#0d4d80',
          900: '#06355d',
        },
        'hospital-teal': {
          500: '#2a9d8f',
          700: '#1f7a6f',
        },
        'hospital-coral': '#e76f51',
      },
    },
  },
  plugins: [],
}