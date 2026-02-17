import { db } from '$lib/server/db';
import { contestGroup } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!session || !['admin', 'super_admin'].includes(session.user?.role)) {
		return redirect(302, '/admin/login');
	}

	const contestGroups = await db
		.select({
			contestGroupId: contestGroup.id,
			contestGroupTitle: contestGroup.title,
			contestGroupDescription: contestGroup.description
		})
		.from(contestGroup);
	return {
		session,
		contestGroups: contestGroups
	};
};
