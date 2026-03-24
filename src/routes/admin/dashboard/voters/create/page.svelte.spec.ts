import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import Page from './+page.svelte';

describe('Create Voters Page', () => {
	const validJSON = JSON.stringify([
		{
			firstName: 'John',
			lastName: 'Doe',
			streetAddress: '123 Main St',
			city: 'Springfield',
			state: 'IL',
			zipCode: '62701'
		},
		{
			firstName: 'Jane',
			lastName: 'Smith',
			streetAddress: '456 Oak Ave',
			city: 'Springfield',
			state: 'IL',
			zipCode: '62702'
		}
	]);

	const invalidJSON = '{ invalid json }';

	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	it('should render page title and description', async () => {
		render(Page);

		const heading = page.getByRole('heading', { name: /Create Voters/i });
		const description = page.getByText(/Batch upload voters/i);

		await expect.element(heading).toBeInTheDocument();
		await expect.element(description).toBeInTheDocument();
	});

	it('should render JSON format example card', async () => {
		render(Page);

		const formatCard = page.getByText(/JSON Array Format/i);
		const example = page.getByText(/firstName.*John/i);

		await expect.element(formatCard).toBeInTheDocument();
		await expect.element(example).toBeInTheDocument();
	});

	it('should render form with textarea and buttons', async () => {
		render(Page);

		const textarea = page.getByPlaceholder(/Paste your JSON array/i);
		const submitButton = page.getByRole('button', { name: /Validate & Submit/i });
		const clearButton = page.getByRole('button', { name: /Clear/i });

		await expect.element(textarea).toBeInTheDocument();
		await expect.element(submitButton).toBeInTheDocument();
		await expect.element(clearButton).toBeInTheDocument();
	});

	it('should disable submit button when textarea is empty', async () => {
		render(Page);

		const submitButton = page.getByRole('button', { name: /Validate & Submit/i });
		await expect.element(submitButton).toBeDisabled();
	});

	it('should enable submit button when textarea has content', async () => {
		render(Page);

		const textarea = page.getByPlaceholder(/Paste your JSON array/i);
		await textarea.fill('test content');

		const submitButton = page.getByRole('button', { name: /Validate & Submit/i });
		await expect.element(submitButton).toBeEnabled();
	});

	it('should display error for invalid JSON', async () => {
		render(Page);

		const textarea = page.getByPlaceholder(/Paste your JSON array/i);
		const submitButton = page.getByRole('button', { name: /Validate & Submit/i });

		await textarea.fill(invalidJSON);
		await submitButton.click();

		const errorAlert = page.getByText(/Invalid JSON/i);
		await expect.element(errorAlert).toBeInTheDocument();
	});

	it('should clear form on clear button click', async () => {
		render(Page);

		const textarea = page.getByPlaceholder(/Paste your JSON array/i);
		const clearButton = page.getByRole('button', { name: /Clear/i });

		await textarea.fill(validJSON);
		await expect.element(textarea).toHaveValue(validJSON);

		await clearButton.click();
		await expect.element(textarea).toHaveValue('');
	});

	it('should display validation success message for valid JSON', async () => {
		vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

		render(Page);

		const textarea = page.getByPlaceholder(/Paste your JSON array/i);
		const submitButton = page.getByRole('button', { name: /Validate & Submit/i });

		await textarea.fill(validJSON);
		await submitButton.click();

		const successMessage = page.getByText(/Successfully validated/i);
		await expect.element(successMessage).toBeInTheDocument();
	});

	it('should disable textarea and buttons during submission', async () => {
		// Mock fetch to delay response
		vi.mocked(fetch).mockImplementation(
			() =>
				new Promise((resolve) =>
					setTimeout(() => resolve(new Response(JSON.stringify({}), { status: 200 })), 100)
				)
		);

		render(Page);

		const textarea = page.getByPlaceholder(/Paste your JSON array/i);
		const submitButton = page.getByRole('button', { name: /Validate & Submit/i });

		await textarea.fill(validJSON);
		await submitButton.click();

		// Check that submit button shows loading state
		const validatingButton = page.getByRole('button', { name: /Validating/i });
		await expect.element(validatingButton).toBeInTheDocument();
	});

	it('should render AdminNavToolbar with correct links', async () => {
		render(Page);

		const backLink = page.getByRole('link', { name: /Back to Admin Dashboard/i });
		const manageLink = page.getByRole('link', { name: /Manage Voters/i });

		await expect.element(backLink).toBeInTheDocument();
		await expect.element(manageLink).toBeInTheDocument();
	});

	it('should make POST request to /api/voters with valid data', async () => {
		vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

		render(Page);

		const textarea = page.getByPlaceholder(/Paste your JSON array/i);
		const submitButton = page.getByRole('button', { name: /Validate & Submit/i });

		await textarea.fill(validJSON);
		await submitButton.click();

		expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/voters', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: validJSON
		});
	});
});
