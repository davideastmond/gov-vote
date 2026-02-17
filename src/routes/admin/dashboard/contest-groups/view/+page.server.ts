import { db } from '$lib/server/db';
import { contestGroup } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { like, or } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 12;

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!session || !['admin', 'super_admin'].includes(session.user?.role)) {
		return redirect(302, '/admin/login');
	}

	const searchQuery = event.url.searchParams.get('q') || '';
	const page = Math.max(1, parseInt(event.url.searchParams.get('page') || '1'));

	let query = db
		.select({
			id: contestGroup.id,
			title: contestGroup.title,
			description: contestGroup.description
		})
		.from(contestGroup);

	if (searchQuery.trim()) {
		(query as any) = query.where(
			or(
				like(contestGroup.id, `%${searchQuery}%`),
				like(contestGroup.title, `%${searchQuery}%`),
				like(contestGroup.description, `%${searchQuery}%`)
			)
		);
	}

	// Get total count
	const countResult = await query;
	const totalCount = countResult.length;
	const totalPages = Math.ceil(totalCount / PAGE_SIZE);

	// Get paginated results
	const contestGroups = countResult.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	return {
		contestGroups,
		searchQuery,
		currentPage: page,
		totalPages,
		totalCount
	};
};
