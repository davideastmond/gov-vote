import { browser } from '$app/environment';
import type { Theme } from '$lib/definitions/enums';
import { writable } from 'svelte/store';

export function createThemeStore() {
	const applyTheme = (theme: Theme) => {
		if (typeof document === 'undefined') return;

		document.documentElement.classList.toggle('dark', theme === 'dark');
		document.documentElement.style.colorScheme = theme;
	};

	// Get initial theme from localStorage or system preference
	const getInitialTheme = (): Theme => {
		if (!browser) return 'light';

		if (typeof localStorage !== 'undefined') {
			const stored = localStorage.getItem('theme') as Theme | null;
			if (stored === 'light' || stored === 'dark') return stored;
		}

		if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
			return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}

		return 'light';
	};

	let currentTheme: Theme = getInitialTheme();
	const { subscribe, set } = writable<Theme>(currentTheme);

	return {
		subscribe,
		toggle: () => {
			if (!browser) return;

			const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';

			localStorage.setItem('theme', newTheme);
			currentTheme = newTheme;
			applyTheme(newTheme);
			set(newTheme);
		},
		set: (theme: Theme) => {
			if (!browser) return;

			localStorage.setItem('theme', theme);
			currentTheme = theme;
			applyTheme(theme);
			set(theme);
		},
		init: () => {
			if (!browser) return;

			const theme = getInitialTheme();
			currentTheme = theme;
			applyTheme(theme);
			set(theme);
		}
	};
}

export const theme = createThemeStore();
