module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF4081',
          light: '#FF80AB',
          dark: '#C51162'
        },
        secondary: {
          DEFAULT: '#9146FF',
          light: '#B985FF',
          dark: '#6441A4'
        },
        background: {
          dark: '#121212',
          card: '#1E1E1E',
          lighter: '#2D2D2D',
        },
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FFA000',
        info: '#2196F3',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
