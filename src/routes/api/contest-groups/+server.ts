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
import { apiInternalError } from '$lib/server/utils/api-response-helpers';
import { createAuthenticatedApiHandler } from '$lib/server/utils/create-authenticated-api-handler';
import { createContestGroupBatchValidator } from '$lib/validators/create-contest-group-batch.validator';
import { json } from '@sveltejs/kit';
import z from 'zod';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = createAuthenticatedApiHandler({
	requireAuth: true,
	validator: createContestGroupBatchValidator,
	handler: async (validatedPayload: unknown, event) => {
		const payload = validatedPayload as z.infer<typeof createContestGroupBatchValidator>;
		const createdContestGroupIds: string[] = [];
		const failedContestGroups: Array<{ index: number; title: string; error: string }> = [];

		for (const [index, group] of payload.contestGroups.entries()) {
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
			return apiInternalError(
				'Failed to create any contest groups.',
				JSON.stringify(failedContestGroups)
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
	}
});
