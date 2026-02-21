import { db } from '$lib/server/db';
import { address, pollingStation } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { eq, ilike, or } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 12;

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!session || !['admin', 'super_admin'].includes(session.user?.role)) {
		return redirect(302, '/admin/login');
	}

	const searchQuery = event.url.searchParams.get('q') ?? '';
	const pageParam = event.url.searchParams.get('page') ?? '1';
	const page = Math.max(1, parseInt(pageParam, 10) || 1);

	let pollingStationsQuery = db
		.select({
			id: pollingStation.id,
			name: pollingStation.name,
			streetAddress: address.streetAddress,
			city: address.city,
			state: address.state,
			zipCode: address.zipCode,
			createdAt: pollingStation.createdAt
		})
		.from(pollingStation)
		.innerJoin(address, eq(pollingStation.addressId, address.id));

	if (searchQuery.trim()) {
		(pollingStationsQuery as any) = pollingStationsQuery.where(
			or(
				ilike(address.streetAddress, `%${searchQuery}%`),
				ilike(address.city, `%${searchQuery}%`),
				ilike(address.state, `%${searchQuery}%`),
				ilike(address.zipCode, `%${searchQuery}%`)
			)
		);
	}

	const allPollingStations = await pollingStationsQuery;
	const totalCount = allPollingStations.length;
	const totalPages = Math.ceil(totalCount / PAGE_SIZE);
	const validatedPage = Math.min(page, Math.max(1, totalPages));

	const pollingStations = allPollingStations.slice(
		(validatedPage - 1) * PAGE_SIZE,
		validatedPage * PAGE_SIZE
	);

	return {
		pollingStations,
		searchQuery,
		currentPage: validatedPage,
		totalPages,
		totalCount
	};
};
