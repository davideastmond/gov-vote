import { describe, expect, it } from 'vitest';

import { load } from './+page.server';

describe('/admin/dashboard/+page.server.ts', () => {
	it('redirects to admin login when session is not present', async () => {
		await expect(
			load({
				locals: {
					auth: async () => null
				}
			} as never)
		).rejects.toMatchObject({
			status: 302,
			location: '/admin/login'
		});
	});
});
