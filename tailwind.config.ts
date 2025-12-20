import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#7c3aed', // Violet 600
                secondary: '#22d3ee', // Cyan 400
                accent: '#f472b6', // Pink 400
                dark: '#050505', // Almost Black
                card: '#121212',
            },
            boxShadow: {
                'neon-purple': '0 0 10px rgba(124, 58, 237, 0.5), 0 0 20px rgba(124, 58, 237, 0.3)',
                'neon-cyan': '0 0 10px rgba(34, 211, 238, 0.5), 0 0 20px rgba(34, 211, 238, 0.3)',
            },
            fontFamily: {
                orbitron: ['var(--font-orbitron)', 'sans-serif'],
                rajdhani: ['var(--font-rajdhani)', 'sans-serif'],
                inter: ['var(--font-inter)', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
export default config;
