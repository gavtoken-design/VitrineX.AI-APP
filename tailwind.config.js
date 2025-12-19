/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
					foreground: '#ffffff'
				},
				secondary: {
					DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
					foreground: '#ffffff'
				},
				background: 'rgb(var(--color-background) / <alpha-value>)',
				surface: 'rgb(var(--color-surface) / <alpha-value>)',
				title: 'rgb(var(--color-text-title) / <alpha-value>)',
				body: 'rgb(var(--color-text-body) / <alpha-value>)',
				muted: {
					DEFAULT: 'rgb(var(--color-text-muted) / <alpha-value>)',
					foreground: 'rgb(var(--color-text-body) / <alpha-value>)'
				},
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
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}
