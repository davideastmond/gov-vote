import { db } from '$lib/server/db';
import { address, pollingStation } from '$lib/server/db/schema';
import { adminAuthorizationGuard } from '$lib/server/utils/admin-authorization-guard';
import { extractValidationErrors } from '$lib/server/utils/extract-validation-errors';
import {
	batchCreatePollingStationValidator,
	type PollingStationEntry
} from '$lib/validators/create-polling-station.validator';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	try {
		await adminAuthorizationGuard(event);
	} catch (error) {
		return json(
			{
				success: false,
				error: 'Unauthorized',
				message:
					'You must be an authenticated admin user or provide valid authentication credentials to access this endpoint.',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 400 }
		);
	}

	let parsedBody: unknown;
	try {
		parsedBody = await event.request.json();
	} catch {
		return json(
			{
				success: false,
				error: 'Bad Request',
				message: 'Request body must be valid JSON.'
			},
			{ status: 400 }
		);
	}

	const normalizedPayload = Array.isArray(parsedBody) ? parsedBody : [parsedBody];

	let validatedEntries: PollingStationEntry[];
	try {
		validatedEntries = batchCreatePollingStationValidator.parse(normalizedPayload);
	} catch (err) {
		return json(extractValidationErrors(err), { status: 400 });
	}

	try {
		const insertedPollingStationIds: string[] = [];
		const insertedAddressIds: string[] = [];
		const skippedPollingStationIds: string[] = [];

		for (const entry of validatedEntries) {
			const foundAddress = await db.query.address.findFirst({
				where: (addr, { and, eq }) =>
					and(
						eq(addr.streetAddress, entry.streetAddress),
						eq(addr.city, entry.city),
						eq(addr.state, entry.state),
						eq(addr.zipCode, entry.zipCode)
					)
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
	} catch (error) {
		console.error('Error creating polling stations:', error);
		return json(
			{
				success: false,
				error: 'Internal Server Error',
				message: 'An error occurred while creating polling stations.',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
