import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import Page from './+page.svelte';

describe('Create Contest Group Page - Validation Messages', () => {
	it('should render the contest group creation wizard with initial state', async () => {
		render(Page);

		const heading = page.getByRole('heading', { name: /Create Contest Group/i });
		const stepIndicator = page.getByText(/Step 1 of 5/i);
		const titleInput = page.getByPlaceholder(/2024 General Election/i);

		await expect.element(heading).toBeInTheDocument();
		await expect.element(stepIndicator).toBeInTheDocument();
		await expect.element(titleInput).toBeInTheDocument();
	});

	it('should disable Next button when title is empty', async () => {
		render(Page);
		const nextButton = page.getByRole('button', { name: /^Next$/i }).first();
		await expect.element(nextButton).toBeDisabled();
	});

	it('should enable Next button when title is filled', async () => {
		render(Page);
		const titleInput = page.getByPlaceholder(/2024 General Election/i);
		await titleInput.fill('Test Election 2024');
		const nextButton = page.getByRole('button', { name: /^Next$/i }).first();
		await expect.element(nextButton).toBeEnabled();
	});

	it('should display description textarea', async () => {
		render(Page);
		const descriptionTextarea = page.getByPlaceholder(
			/Add a short description about this contest group/i
		);
		await expect.element(descriptionTextarea).toBeInTheDocument();
	});

	it('should display back button disabled on step 1', async () => {
		render(Page);
		const backButton = page.getByRole('button', { name: /^Back$/i });
		await expect.element(backButton).toBeDisabled();
	});
});
