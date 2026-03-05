import { requireAdminSession } from '$lib/server/utils/require-admin-session';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async (event) => {
	const session = await requireAdminSession(event.locals);

	return {
		session
	};
};
