import type { Theme } from '$lib/definitions/enums';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createThemeStore } from './theme';

vi.mock('$app/environment', () => ({
	browser: true
}));

function setupBrowserMocks({
	storedTheme = null,
	prefersDark = false
}: {
	storedTheme?: Theme | null;
	prefersDark?: boolean;
} = {}) {
	const storage = new Map<string, string>();
	if (storedTheme) {
		storage.set('theme', storedTheme);
	}

	const localStorageMock = {
		getItem: vi.fn((key: string) => storage.get(key) ?? null),
		setItem: vi.fn((key: string, value: string) => {
			storage.set(key, value);
		}),
		removeItem: vi.fn((key: string) => {
			storage.delete(key);
		}),
		clear: vi.fn(() => {
			storage.clear();
		})
	};

	const toggleClass = vi.fn();
	const documentMock = {
		contentType: 'text/html',
		documentElement: {
			classList: {
				toggle: toggleClass
			},
			style: {
				colorScheme: 'light'
			}
		}
	};

	const matchMedia = vi.fn().mockReturnValue({ matches: prefersDark });

	vi.stubGlobal('localStorage', localStorageMock);
	vi.stubGlobal('window', { matchMedia });
	vi.stubGlobal('document', documentMock);

	return { localStorageMock, toggleClass, documentMock, matchMedia };
}

describe('theme store', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it('initializes from localStorage and applies the dark theme', () => {
		const { toggleClass, documentMock } = setupBrowserMocks({ storedTheme: 'dark' });
		const theme = createThemeStore();

		let currentValue: Theme | undefined;
		const unsubscribe = theme.subscribe((value) => {
			currentValue = value;
		});

		theme.init();

		expect(currentValue).toBe('dark');
		expect(toggleClass).toHaveBeenCalledWith('dark', true);
		expect(documentMock.documentElement.style.colorScheme).toBe('dark');

		unsubscribe();
	});

	it('falls back to the system preference when no theme is stored', () => {
		const { matchMedia } = setupBrowserMocks({ prefersDark: true });
		const theme = createThemeStore();

		let currentValue: Theme | undefined;
		const unsubscribe = theme.subscribe((value) => {
			currentValue = value;
		});

		theme.init();

		expect(matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
		expect(currentValue).toBe('dark');

		unsubscribe();
	});

	it('toggles and persists the theme selection', () => {
		const { localStorageMock, toggleClass, documentMock } = setupBrowserMocks({
			storedTheme: 'light'
		});
		const theme = createThemeStore();

		let currentValue: Theme | undefined;
		const unsubscribe = theme.subscribe((value) => {
			currentValue = value;
		});

		theme.toggle();

		expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
		expect(currentValue).toBe('dark');
		expect(toggleClass).toHaveBeenCalledWith('dark', true);
		expect(documentMock.documentElement.style.colorScheme).toBe('dark');

		theme.set('light');

		expect(localStorageMock.setItem).toHaveBeenLastCalledWith('theme', 'light');
		expect(currentValue).toBe('light');
		expect(toggleClass).toHaveBeenLastCalledWith('dark', false);
		expect(documentMock.documentElement.style.colorScheme).toBe('light');

		unsubscribe();
	});
});
