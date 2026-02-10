
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./App.tsx",
        "./index.tsx",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'wp-primary': '#128C7E',
                'wp-secondary': '#075E54',
                'wp-accent': '#25D366',
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', '"IBM Plex Sans Arabic"', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
