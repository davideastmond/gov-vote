import { db } from '$lib/server/db';
import {
	address,
	adminContestGroup,
	contest,
	contestGroup,
	contestGroupPollingStation,
	contestItem,
	pollingStation
} from '$lib/server/db/schema';
import { adminAuthorizationGuard } from '$lib/server/utils/admin-authorization-guard';
import { extractValidationErrors } from '$lib/server/utils/extract-validation-errors';
import { createContestGroupBatchValidator } from '$lib/validators/create-contest-group-batch.validator';
import { json } from '@sveltejs/kit';
import z from 'zod';
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
	} catch (error) {
		console.log('Error parsing JSON:', (error as Error).message);
		return json(
			{
				success: false,
				error: 'Bad Request',
				message: 'Request body must be valid JSON.'
			},
			{ status: 400 }
		);
	}

	let validatedPayload: z.infer<typeof createContestGroupBatchValidator>;
	try {
		validatedPayload = createContestGroupBatchValidator.parse(parsedBody);
	} catch (error) {
		return json(extractValidationErrors(error), { status: 400 });
	}

	const createdContestGroupIds: string[] = [];
	const failedContestGroups: Array<{ index: number; title: string; error: string }> = [];

	for (const [index, group] of validatedPayload.contestGroups.entries()) {
		try {
			const contestGroupId = crypto.randomUUID();

			await db.insert(contestGroup).values({
				id: contestGroupId,
				title: group.title,
				description: group.description
			});

			if (group.adminIds && group.adminIds.length > 0) {
				await db.insert(adminContestGroup).values(
					group.adminIds.map((adminId) => ({
						id: crypto.randomUUID(),
						adminId,
						contestGroupId
					}))
				);
			}

			const contestsWithIds = group.contests.map((entry) => ({
				id: crypto.randomUUID(),
				contestGroupId,
				title: entry.title,
				description: entry.description,
				contestStatus: entry.contestStatus,
				items: entry.items
			}));

			await db.insert(contest).values(
				contestsWithIds.map((entry) => ({
					id: entry.id,
					contestGroupId: entry.contestGroupId,
					title: entry.title,
					description: entry.description,
					contestStatus: entry.contestStatus
				}))
			);

			const contestItemRows = contestsWithIds.flatMap((entry) =>
				entry.items.map((item) => ({
					id: crypto.randomUUID(),
					contestId: entry.id,
					title: item.title,
					auxiliaryText: item.auxiliaryText,
					contestItemType: item.contestItemType
				}))
			);

			await db.insert(contestItem).values(contestItemRows);

			for (const stationAddress of group.pollingStationAddresses) {
				const addressId = crypto.randomUUID();
				await db.insert(address).values({
					id: addressId,
					streetAddress: stationAddress.streetAddress,
					city: stationAddress.city,
					state: stationAddress.state,
					zipCode: stationAddress.zipCode
				});

				const pollingStationId = crypto.randomUUID();
				await db.insert(pollingStation).values({
					id: pollingStationId,
					name: stationAddress.name,
					addressId
				});

				await db.insert(contestGroupPollingStation).values({
					id: crypto.randomUUID(),
					contestGroupId,
					pollingStationId
				});
			}

			createdContestGroupIds.push(contestGroupId);
		} catch (error) {
			failedContestGroups.push({
				index,
				title: group.title,
				error: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	if (createdContestGroupIds.length === 0) {
		return json(
			{
				success: false,
				error: 'Internal Server Error',
				message: 'Failed to create any contest groups.',
				details: failedContestGroups
			},
			{ status: 500 }
		);
	}

	if (failedContestGroups.length > 0) {
		return json(
			{
				success: false,
				message: 'Batch completed with partial failures.',
				data: {
					createdContestGroupIds,
					failedContestGroups
				}
			},
			{ status: 207 }
		);
	}

	return json(
		{
			success: true,
			data: {
				createdContestGroupIds
			}
		},
		{ status: 201 }
	);
};
