/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            animation: {
                'bounce': 'bounce 1s infinite',
                'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                bounce: {
                    '0%, 20%, 50%, 80%, 100%': {
                        transform: 'translateY(0)',
                    },
                    '40%': {
                        transform: 'translateY(-10px)',
                    },
                    '60%': {
                        transform: 'translateY(-5px)',
                    },
                },
            },
        },
    },
    plugins: [],
}
