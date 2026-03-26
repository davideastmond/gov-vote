import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import Page from './+page.svelte';

describe('Create Contest Group Page - Validation Messages', () => {
	beforeEach(() => {
		// Clear any previous test state
	});

	describe('Form Rendering', () => {
		it('should render the contest group creation wizard', async () => {
			render(Page);

			const heading = page.getByRole('heading', { name: /Create Contest Group/i });
			await expect.element(heading).toBeInTheDocument();
		});

		it('should display step 1 initially', async () => {
			render(Page);
			const stepIndicator = page.getByText(/Step 1 of 5/i);
			await expect.element(stepIndicator).toBeInTheDocument();
		});

		it('should not have error border initially', async () => {
			render(Page);
			const destructiveCard = page.locator('.border-destructive').first();
			// No errors initially
			await expect.element(destructiveCard).not.toBeInTheDocument();
		});
	});

	describe('Step 1 - Contest Group Details', () => {
		it('should display title input field', async () => {
			render(Page);

			const titleInput = page.getByPlaceholder(/2024 General Election/i);
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
			await titleInput.fill('Test Election');

			const nextButton = page.getByRole('button', { name: /^Next$/i }).first();
			await expect.element(nextButton).toBeEnabled();
		});
	});

	describe('Wizard Navigation', () => {
		it('should navigate to next step when Next button is clicked', async () => {
			render(Page);

			// Fill title to enable Next
			const titleInput = page.getByPlaceholder(/2024 General Election/i);
			await titleInput.fill('Test Election');

			// Click Next
			const nextButton = page.getByRole('button', { name: /^Next$/i }).first();
			await nextButton.click();

			// Should be on step 2
			const stepIndicator = page.getByText(/Step 2 of 5/i);
			await expect.element(stepIndicator).toBeInTheDocument();
		});

		it('should show Back button after navigating past step 1', async () => {
			render(Page);

			// Fill title and click Next
			const titleInput = page.getByPlaceholder(/2024 General Election/i);
			await titleInput.fill('Test Election');

			const nextButton = page.getByRole('button', { name: /^Next$/i }).first();
			await nextButton.click();

			// Back button should be enabled
			const backButton = page.getByRole('button', { name: /^Back$/i });
			await expect.element(backButton).toBeEnabled();
		});
	});

	describe('Contests and Items', () => {
		it('should display "No contests added" alert on step 3', async () => {
			render(Page);

			// Navigate to step 3
			const titleInput = page.getByPlaceholder(/2024 General Election/i);
			await titleInput.fill('Test Election');

			const nextButtons = page.getByRole('button', { name: /^Next$/i });
			await nextButtons.nth(0).click(); // Step 2
			await nextButtons.nth(0).click(); // Step 3

			const noContestsAlert = page.getByText(/No contests added/i);
			await expect.element(noContestsAlert).toBeInTheDocument();
		});

		it('should allow adding a contest', async () => {
			render(Page);

			// Navigate to step 3
			const titleInput = page.getByPlaceholder(/2024 General Election/i);
			await titleInput.fill('Test Election');

			const nextButtons = page.getByRole('button', { name: /^Next$/i });
			await nextButtons.nth(0).click(); // Step 2
			await nextButtons.nth(0).click(); // Step 3

			const addContestButton = page.getByRole('button', { name: /^Add Contest$/i });
			await addContestButton.click();

			// Should now see contest form
			const contestTitleInput = page.getByPlaceholder(/Mayor of Springfield/i);
			await expect.element(contestTitleInput).toBeInTheDocument();
		});
	});

	describe('Polling Stations', () => {
		it('should display "No addresses added" on step 4', async () => {
			render(Page);

			// Navigate to step 4
			const titleInput = page.getByPlaceholder(/2024 General Election/i);
			await titleInput.fill('Test Election');

			const nextButtons = page.getByRole('button', { name: /^Next$/i });
			await nextButtons.nth(0).click(); // Step 2
			await nextButtons.nth(0).click(); // Step 3
			await nextButtons.nth(0).click(); // Step 4

			const noAddressesAlert = page.getByText(/No addresses added/i);
			await expect.element(noAddressesAlert).toBeInTheDocument();
		});
	});

	describe('Validation Error Display', () => {
		it('should show validation error text on review step when data is invalid', async () => {
			render(Page);

			// Try to navigate to review with empty title
			const nextButtons = page.getByRole('button', { name: /^Next$/i });
			// Can't proceed - title is required for step 1

			// Fill title and navigate
			const titleInput = page.getByPlaceholder(/2024 General Election/i);
			await titleInput.fill('Test Election');

			await nextButtons.nth(0).click(); // Step 2
			await nextButtons.nth(0).click(); // Step 3
			await nextButtons.nth(0).click(); // Step 4
			await nextButtons.nth(0).click(); // Step 5

			// On review we should see validation error alert
			const validationErrorSection = page.getByText(/Fix validation errors before submitting/i);
			await expect.element(validationErrorSection).toBeInTheDocument();
		});
	});

	describe('Review Step Validation Summary', () => {
		it('should display validation error message on review step', async () => {
			render(Page);

			// Navigate to review with minimal data
			const titleInput = page.getByPlaceholder(/2024 General Election/i);
			await titleInput.fill('Test Election');

			const nextButtons = page.getByRole('button', { name: /^Next$/i });
			await nextButtons.nth(0).click(); // Step 2
			await nextButtons.nth(0).click(); // Step 3
			await nextButtons.nth(0).click(); // Step 4
			await nextButtons.nth(0).click(); // Step 5

			// Should show validation error summary
			const fixErrorsAlert = page.getByText(/Fix validation errors before submitting/i);
			await expect.element(fixErrorsAlert).toBeInTheDocument();
		});
	});
});
