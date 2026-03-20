import { db } from '$lib/server/db';
import { address, pollingStation } from '$lib/server/db/schema';
import { createAuthenticatedApiHandler } from '$lib/server/utils/create-authenticated-api-handler';
import { findAddressByComponents } from '$lib/server/utils/find-address-by-components';
import {
	batchCreatePollingStationValidator,
	type PollingStationEntry
} from '$lib/validators/create-polling-station.validator';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = createAuthenticatedApiHandler({
	requireAuth: true,
	validator: batchCreatePollingStationValidator,
	handler: async (data: unknown, event) => {
		// Normalize payload to array format
		const validatedEntries = Array.isArray(data) ? data : [data];
		const insertedPollingStationIds: string[] = [];
		const insertedAddressIds: string[] = [];
		const skippedPollingStationIds: string[] = [];

		for (const entry of validatedEntries as PollingStationEntry[]) {
			const foundAddress = await findAddressByComponents({
				streetAddress: entry.streetAddress,
				city: entry.city,
				state: entry.state,
				zipCode: entry.zipCode
			});

			const addressId = foundAddress?.id ?? crypto.randomUUID();

			if (!foundAddress) {
				await db.insert(address).values({
					id: addressId,
					streetAddress: entry.streetAddress,
					city: entry.city,
					state: entry.state,
					zipCode: entry.zipCode
				});
				insertedAddressIds.push(addressId);
			}

			const foundPollingStation = await db.query.pollingStation.findFirst({
				where: (ps, { and, eq }) => and(eq(ps.addressId, addressId), eq(ps.name, entry.name))
			});

			if (foundPollingStation) {
				skippedPollingStationIds.push(foundPollingStation.id);
				continue;
			}

			const pollingStationId = crypto.randomUUID();
			await db.insert(pollingStation).values({
				id: pollingStationId,
				name: entry.name,
				addressId
			});

			insertedPollingStationIds.push(pollingStationId);
		}

		return json(
			{
				success: true,
				data: {
					insertedPollingStationIds,
					insertedAddressIds,
					skippedPollingStationIds
				}
			},
			{ status: 201 }
		);
	}
});
