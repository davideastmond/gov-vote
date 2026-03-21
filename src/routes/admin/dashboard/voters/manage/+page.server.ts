import type { NullableAddressInput } from '$lib/definitions/address';
import { db } from '$lib/server/db';
import { address, user, userAddress } from '$lib/server/db/schema';
import { requireAdminSession } from '$lib/server/utils/require-admin-session';
import { and, eq, ilike, or } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	await requireAdminSession(event.locals);

	const searchQuery = event.url.searchParams.get('q')?.trim() ?? '';
	const hasSearched = searchQuery.length > 0;

	let voters: Array<
		NullableAddressInput & {
			id: string;
			firstName: string;
			lastName: string;
			username: string;
			email: string;
			createdAt: Date;
		}
	> = [];

	if (hasSearched) {
		const rows = await db
			.select({
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				username: user.username,
				email: user.email,
				streetAddress: address.streetAddress,
				city: address.city,
				state: address.state,
				zipCode: address.zipCode,
				createdAt: user.createdAt
			})
			.from(user)
			.leftJoin(userAddress, eq(userAddress.userId, user.id))
			.leftJoin(address, eq(address.id, userAddress.addressId))
			.where(
				and(
					eq(user.role, 'voter'),
					or(
						ilike(user.firstName, `%${searchQuery}%`),
						ilike(user.lastName, `%${searchQuery}%`),
						ilike(user.id, `%${searchQuery}%`)
					)
				)
			);

		const votersById = new Map<string, (typeof rows)[number]>();
		for (const row of rows) {
			const existing = votersById.get(row.id);
			if (!existing) {
				votersById.set(row.id, row);
				continue;
			}

			if (!existing.streetAddress && row.streetAddress) {
				votersById.set(row.id, row);
			}
		}

		voters = Array.from(votersById.values());
	}

	return {
		searchQuery,
		hasSearched,
		voters,
		totalCount: voters.length
	};
};
