import { requireAdminSession } from '$lib/server/utils/require-admin-session';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async (event) => {
	const session = await requireAdminSession(event.locals);
	if (session.user.role !== 'super_admin') {
		return redirect(302, '/admin/login');
	}

	return {
		session
	};
};
