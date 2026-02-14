import { browser } from '$app/environment';
import { writable } from 'svelte/store';

type Theme = 'light' | 'dark';

function createThemeStore() {
	// Get initial theme from localStorage or system preference
	const getInitialTheme = (): Theme => {
		if (!browser) return 'light';

		const stored = localStorage.getItem('theme') as Theme | null;
		if (stored) return stored;

		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	};

	const { subscribe, set } = writable<Theme>(getInitialTheme());

	return {
		subscribe,
		toggle: () => {
			if (!browser) return;

			const currentTheme = (localStorage.getItem('theme') as Theme | null) || 'light';
			const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';

			localStorage.setItem('theme', newTheme);
			document.documentElement.classList.toggle('dark', newTheme === 'dark');
			set(newTheme);
		},
		set: (theme: Theme) => {
			if (!browser) return;

			localStorage.setItem('theme', theme);
			document.documentElement.classList.toggle('dark', theme === 'dark');
			set(theme);
		},
		init: () => {
			if (!browser) return;

			const theme = getInitialTheme();
			document.documentElement.classList.toggle('dark', theme === 'dark');
			set(theme);
		}
	};
}

export const theme = createThemeStore();
