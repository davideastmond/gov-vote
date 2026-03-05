import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import Page from './+page.svelte';

describe('/admin/dashboard/+page.svelte', () => {
	it('renders dashboard heading and admin options section', async () => {
		render(Page, {
			data: {
				session: {
					user: {
						role: 'admin'
					}
				}
			} as any
		});

		const heading = page.getByRole('heading', { name: 'Admin Dashboard', level: 1 });
		const adminOptionsHeading = page.getByText('Admin Options');

		await expect.element(heading).toBeInTheDocument();
		await expect.element(adminOptionsHeading).toBeInTheDocument();
	});

	it('hides super-admin-only action for admin role', async () => {
		render(Page, {
			data: {
				session: {
					user: {
						role: 'admin'
					}
				}
			} as any
		});

		const manageAdminsLink = page.getByRole('link', { name: 'Manage Admins' });

		await expect.element(manageAdminsLink).not.toBeInTheDocument();
	});

	it('shows super-admin-only action for super_admin role', async () => {
		render(Page, {
			data: {
				session: {
					user: {
						role: 'super_admin'
					}
				}
			} as any
		});

		const manageAdminsLink = page.getByRole('link', { name: 'Manage Admins' });

		await expect.element(manageAdminsLink).toBeInTheDocument();
		await expect
			.element(manageAdminsLink)
			.toHaveAttribute('href', '/admin/dashboard/admins/manage');
	});

	it('falls back to admin role when session data is missing', async () => {
		render(Page, { data: undefined } as any);

		const createVotersLink = page.getByRole('link', { name: 'Create Voters' });
		const manageAdminsLink = page.getByRole('link', { name: 'Manage Admins' });

		await expect.element(createVotersLink).toBeInTheDocument();
		await expect.element(manageAdminsLink).not.toBeInTheDocument();
	});
});
