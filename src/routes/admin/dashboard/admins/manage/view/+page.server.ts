import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { requireAdminSession } from '$lib/server/utils/require-admin-session';
import { redirect } from '@sveltejs/kit';
import { and, eq, ilike, or } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

const ITEMS_PER_PAGE = 10;

export const load: PageServerLoad = async (event) => {
	const session = await requireAdminSession(event.locals);
	if (session.user.role !== 'super_admin') {
		return redirect(302, '/admin/login');
	}

	const searchQuery = event.url.searchParams.get('q') ?? '';
	const pageParam = event.url.searchParams.get('page') ?? '1';
	const page = Math.max(1, parseInt(pageParam, 10) || 1);

	// Build search filter
	let admins = await db
		.select({
			id: user.id,
			username: user.username,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			role: user.role,
			createdAt: user.createdAt
		})
		.from(user)
		.where(
			and(
				searchQuery
					? or(
							ilike(user.username, `%${searchQuery}%`),
							ilike(user.firstName, `%${searchQuery}%`),
							ilike(user.lastName, `%${searchQuery}%`),
							ilike(user.email, `%${searchQuery}%`)
						)
					: undefined,
				eq(user.role, 'admin')
			)
		);

	// Get total count for pagination
	const totalCount = admins.length;
	const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
	const validatedPage = Math.min(page, Math.max(1, totalPages));

	// Apply pagination
	admins = admins.slice((validatedPage - 1) * ITEMS_PER_PAGE, validatedPage * ITEMS_PER_PAGE);

	return {
		session,
		admins,
		searchQuery,
		currentPage: validatedPage,
		totalPages,
		totalCount
	};
};
