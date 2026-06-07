
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/**
	* Earthlight theme — wires the brand palette (sampled from earthlight.app)
	* into Tailwind. Semantic shadcn tokens (background/foreground/primary/…) are
	* sourced from CSS variables in globals.css so they stay swap-able for the
	* dark theme. The `earthlight.*` palette exposes the raw brand colors for
	* cases where you need the literal sun amber/orange (logo mark, dividers,
	* gradient backdrops).
	*/
export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '1.5rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				display: ['var(--font-display)', 'Georgia', 'Times New Roman', 'serif'],
				sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Brand palette — sampled directly from earthlight.app
				earthlight: {
					paper:       'hsl(var(--el-paper))',
					'paper-deep':'hsl(var(--el-paper-deep))',
					'paper-soft':'hsl(var(--el-paper-soft))',
					ink:         'hsl(var(--el-ink))',
					'ink-soft':  'hsl(var(--el-ink-soft))',
					graphite:    'hsl(var(--el-graphite))',
					slate:       'hsl(var(--el-slate))',
					hairline:    'hsl(var(--el-hairline))',
					sun: {
						amber:  'hsl(var(--el-sun-amber))',   // #FFC107
						DEFAULT:'hsl(var(--el-sun-orange))',  // #FF6A0A
						orange: 'hsl(var(--el-sun-orange))',
						deep:   'hsl(var(--el-sun-deep))',    // #CC3702
					},
				},
				/* Backwards-compatibility alias.
					Earlier code used `lumify-*` (violet/amber); each shade is now mapped
					to the closest Earthlight token so untouched call-sites still render
					in-brand while we migrate them deliberately. */
				lumify: {
					blue: {
						light:   'hsl(var(--el-paper-deep))',
						DEFAULT: 'hsl(var(--el-ink))',
						dark:    'hsl(var(--el-ink))',
					},
					amber: {
						light:   'hsl(var(--el-sun-amber) / 0.18)',
						DEFAULT: 'hsl(var(--el-sun-amber))',
						dark:    'hsl(var(--el-sun-orange))',
					},
					neutral: {
						lighter: 'hsl(var(--el-paper-soft))',
						light:   'hsl(var(--el-hairline))',
						DEFAULT: 'hsl(var(--el-slate))',
						dark:    'hsl(var(--el-graphite))',
						darker:  'hsl(var(--el-ink))',
					},
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to:   { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to:   { height: '0' }
				},
				'pulse-gentle': {
					'0%, 100%': { opacity: '1' },
					'50%':      { opacity: '0.7' }
				},
				/* Brand-mark sun rotation. ~80s — slow enough that motion-sensitive
					users perceive it as ambient, not animation. */
				'sun-drift': {
					'0%, 100%': { transform: 'rotate(0deg)' },
					'50%':      { transform: 'rotate(180deg)' }
				},
				'rise': {
					'0%':   { opacity: '0', transform: 'translateY(12px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up':   'accordion-up 0.2s ease-out',
				'pulse-gentle':   'pulse-gentle 3s ease-in-out infinite',
				'sun-drift':      'sun-drift 80s linear infinite',
				'rise':           'rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
			},
		},
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
