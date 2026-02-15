import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!session || !['super_admin'].includes(session.user?.role)) {
		return redirect(302, '/admin/login');
	}

	return {
		session
	};
};
