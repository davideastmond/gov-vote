import { db } from '$lib/server/db';
import { address, pollingStation } from '$lib/server/db/schema';
import { requireAdminSession } from '$lib/server/utils/require-admin-session';
import { fail } from '@sveltejs/kit';
import { eq, ilike, or } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

const PAGE_SIZE = 12;

export const load: PageServerLoad = async (event) => {
	await requireAdminSession(event.locals);

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

function getString(formData: FormData, field: string) {
	return String(formData.get(field) ?? '').trim();
}

export const actions: Actions = {
	updatePollingStation: async ({ request, locals }) => {
		await requireAdminSession(locals);

		const formData = await request.formData();
		const pollingStationId = getString(formData, 'pollingStationId');
		const name = getString(formData, 'name');
		const streetAddress = getString(formData, 'streetAddress');
		const city = getString(formData, 'city');
		const state = getString(formData, 'state');
		const zipCode = getString(formData, 'zipCode');

		if (!pollingStationId || !streetAddress || !city || !state || !zipCode) {
			return fail(400, {
				action: 'updatePollingStation',
				success: false,
				message: 'Polling station id and full address are required.'
			});
		}

		const foundPollingStation = await db.query.pollingStation.findFirst({
			where: (ps, { eq }) => eq(ps.id, pollingStationId)
		});

		if (!foundPollingStation) {
			return fail(404, {
				action: 'updatePollingStation',
				success: false,
				message: 'Polling station not found.'
			});
		}

		await db
			.update(pollingStation)
			.set({
				name,
				updatedAt: new Date()
			})
			.where(eq(pollingStation.id, pollingStationId));

		await db
			.update(address)
			.set({
				streetAddress,
				city,
				state,
				zipCode,
				updatedAt: new Date()
			})
			.where(eq(address.id, foundPollingStation.addressId));

		return {
			action: 'updatePollingStation',
			success: true,
			message: 'Polling station updated.'
		};
	}
};
