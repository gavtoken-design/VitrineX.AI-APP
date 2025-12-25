/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace'],
			},
			colors: {
				// Semantic Colors mapped to CSS Variables
				primary: {
					DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
					foreground: '#ffffff'
				},
				secondary: {
					DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
					foreground: '#ffffff'
				},
				surface: 'rgb(var(--color-surface) / <alpha-value>)',
				background: 'rgb(var(--color-background) / <alpha-value>)',

				// Text hierarchy
				title: 'rgb(var(--color-text-title) / <alpha-value>)',
				body: 'rgb(var(--color-text-body) / <alpha-value>)',
				muted: {
					DEFAULT: 'rgb(var(--color-text-muted) / <alpha-value>)',
					foreground: 'rgb(var(--color-text-body) / <alpha-value>)'
				},

				// Status colors
				success: '#10B981',
				warning: '#F59E0B',
				error: '#EF4444',
				info: '#3B82F6',

				// Helpers
				border: 'rgb(var(--color-border) / <alpha-value>)',
				foreground: 'rgb(var(--color-text-body) / <alpha-value>)',
				card: {
					DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
					foreground: 'rgb(var(--color-text-title) / <alpha-value>)'
				},
				popover: {
					DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
					foreground: 'rgb(var(--color-text-title) / <alpha-value>)'
				},
				accent: {
					DEFAULT: 'rgb(139 92 246 / <alpha-value>)', // Violet-500
					foreground: '#ffffff'
				},
				destructive: {
					DEFAULT: '#EF4444',
					foreground: '#ffffff'
				},
				input: 'rgb(var(--color-border) / <alpha-value>)',
				ring: 'rgb(var(--color-primary) / <alpha-value>)',
				chart: {
					'1': 'rgb(var(--color-primary) / <alpha-value>)',
					'2': 'rgb(var(--color-secondary) / <alpha-value>)',
					'3': 'rgb(16 185 129 / <alpha-value>)', // Emerald
					'4': 'rgb(245 158 11 / <alpha-value>)', // Amber
					'5': 'rgb(239 68 68 / <alpha-value>)' // Red
				}
			},
			boxShadow: {
				'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
				'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
				'glow': '0 0 15px rgba(var(--color-primary), 0.3)',
				'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
				'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'xl': '0.75rem',
				'2xl': '1rem',
				'3xl': '1.5rem',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
				'fade-out': { from: { opacity: '1' }, to: { opacity: '0' } },
				'slide-in-from-top': { from: { transform: 'translateY(-100%)' }, to: { transform: 'translateY(0)' } },
				'slide-in-from-bottom': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
				'slide-in-from-left': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
				'slide-in-from-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
				'slide-out-to-top': { from: { transform: 'translateY(0)' }, to: { transform: 'translateY(-100%)' } },
				'slide-out-to-bottom': { from: { transform: 'translateY(0)' }, to: { transform: 'translateY(100%)' } },
				'slide-out-to-left': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-100%)' } },
				'slide-out-to-right': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(100%)' } },
				'zoom-in': { from: { transform: 'scale(0.95)' }, to: { transform: 'scale(1)' } },
				'zoom-out': { from: { transform: 'scale(1)' }, to: { transform: 'scale(0.95)' } },
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in var(--animation-duration, 400ms) ease-in-out',
				'fade-out': 'fade-out var(--animation-duration, 400ms) ease-in-out',
				'slide-in-from-top': 'slide-in-from-top var(--animation-duration, 400ms) ease-in-out',
				'slide-in-from-bottom': 'slide-in-from-bottom var(--animation-duration, 400ms) ease-in-out',
				'slide-in-from-left': 'slide-in-from-left var(--animation-duration, 400ms) ease-in-out',
				'slide-in-from-right': 'slide-in-from-right var(--animation-duration, 400ms) ease-in-out',
				'slide-out-to-top': 'slide-out-to-top var(--animation-duration, 400ms) ease-in-out',
				'slide-out-to-bottom': 'slide-out-to-bottom var(--animation-duration, 400ms) ease-in-out',
				'slide-out-to-left': 'slide-out-to-left var(--animation-duration, 400ms) ease-in-out',
				'slide-out-to-right': 'slide-out-to-right var(--animation-duration, 400ms) ease-in-out',
				'zoom-in': 'zoom-in var(--animation-duration, 400ms) ease-in-out',
				'zoom-out': 'zoom-out var(--animation-duration, 400ms) ease-in-out',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
}
