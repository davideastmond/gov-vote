import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

// Mock the admin fetching to avoid async issues
vi.mock('$lib/remotes/get-admins.remote', () => ({
	getAdmins: vi.fn().mockResolvedValue([])
}));

import Page from './+page.svelte';

describe('Create Contest Group Page - Validation Messages', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render the contest group creation wizard', async () => {
		render(Page);

		// Wait for component to initialize
		const heading = page.getByRole('heading', { name: /Create Contest Group/i });
		await expect.element(heading).toBeInTheDocument();
	});

	it('should have step indicator showing step 1', async () => {
		render(Page);
		const stepIndicator = page.getByText(/Step 1 of 5/i);
		await expect.element(stepIndicator).toBeInTheDocument();
	});

	it('should have title input field', async () => {
		render(Page);
		const titleInput = page.getByPlaceholder(/2024 General Election/i);
		await expect.element(titleInput).toBeInTheDocument();
	});

	it('should have Next button disabled initially', async () => {
		render(Page);
		const nextButton = page.getByRole('button', { name: /^Next$/i }).first();
		await expect.element(nextButton).toBeDisabled();
	});

	it('should enable Next button when title has text', async () => {
		render(Page);
		const titleInput = page.getByPlaceholder(/2024 General Election/i);
		await titleInput.fill('Test Election');
		const nextButton = page.getByRole('button', { name: /^Next$/i }).first();
		await expect.element(nextButton).toBeEnabled();
	});
});
