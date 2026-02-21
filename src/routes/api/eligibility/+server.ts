import { db } from '$lib/server/db';
import { voterCard, voterEligibility } from '$lib/server/db/schema';
import { adminAuthorizationGuard } from '$lib/server/utils/admin-authorization-guard';
import {
	eligibilityValidator,
	type EligibilityEntry
} from '$lib/validators/create-eligibility.validator';
import { json } from '@sveltejs/kit';
import { z } from 'zod';
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

	// Validate the request body
	const requestBody: Array<EligibilityEntry> = await event.request.json();
	try {
		eligibilityValidator.parse(requestBody);
	} catch (err) {
		if (err instanceof z.ZodError) {
			const errors = err.issues.map((issue) => {
				const path = issue.path.join('.');
				return `${path || 'Root'}: ${issue.message}`;
			});
			return json(
				{
					success: false,
					error: 'Bad Request',
					message: 'Invalid request data',
					details: errors
				},
				{ status: 400 }
			);
		}
	}
	try {
		const { encounteredUserIds, encounteredPollingStationIds, encounteredContestGroupIds } =
			await processEligibilityEntries(requestBody);
		await createVoterCardFromEligibility(encounteredUserIds, encounteredContestGroupIds);

		return json({
			success: true,
			message: 'Eligibility entries processed successfully.',
			details: {
				processedEntries: requestBody.length,
				uniqueUsers: encounteredUserIds.size,
				uniquePollingStations: encounteredPollingStationIds.size,
				uniqueContestGroups: encounteredContestGroupIds.size
			}
		});
	} catch (err) {
		return json(
			{
				success: false,
				error: 'Internal Server Error',
				message: 'An error occurred while processing the eligibility entries.',
				details: err instanceof Error ? err.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};

async function processEligibilityEntries(entries: EligibilityEntry[]): Promise<{
	encounteredUserIds: Set<string>;
	encounteredPollingStationIds: Set<string>;
	encounteredContestGroupIds: Set<string>;
	encounteredContestIds: Set<string>;
}> {
	const encounteredUserIds = new Set<string>();
	const encounteredPollingStationIds = new Set<string>();
	const encounteredContestGroupIds = new Set<string>();
	const encounteredContestIds = new Set<string>();

	for await (const et of entries) {
		if (!encounteredUserIds.has(et.userId)) {
			const fndUser = await db.query.user.findFirst({
				where: (user, { eq }) => eq(user.id, et.userId)
			});
			if (!fndUser) {
				throw new Error(`User with ID ${et.userId} does not exist.`);
			}
			encounteredUserIds.add(et.userId);
		}
		if (!encounteredPollingStationIds.has(et.pollingStationId)) {
			const fndPollingStation = await db.query.pollingStation.findFirst({
				where: (ps, { eq }) => eq(ps.id, et.pollingStationId)
			});
			if (!fndPollingStation) {
				throw new Error(`Polling station with ID ${et.pollingStationId} does not exist.`);
			}
			encounteredPollingStationIds.add(et.pollingStationId);
		}
		if (!encounteredContestGroupIds.has(et.contestGroupId)) {
			const fndContestGroup = await db.query.contestGroup.findFirst({
				where: (cg, { eq }) => eq(cg.id, et.contestGroupId)
			});
			if (!fndContestGroup) {
				throw new Error(`Contest group with ID ${et.contestGroupId} does not exist.`);
			}
			encounteredContestGroupIds.add(et.contestGroupId);
		}
		if (!encounteredContestIds.has(et.contestId)) {
			const fndContest = await db.query.contest.findFirst({
				where: (c, { eq }) => eq(c.id, et.contestId)
			});
			if (!fndContest) {
				throw new Error(`Contest with ID ${et.contestId} does not exist.`);
			}
			encounteredContestIds.add(et.contestId);
		}

		// Only insert if we don't have a matching eligibility entry
		const existingEligibility = await db.query.voterEligibility.findFirst({
			where: (ve, { and, eq }) =>
				and(
					eq(ve.userId, et.userId),
					eq(ve.pollingStationId, et.pollingStationId),
					eq(ve.contestGroupId, et.contestGroupId),
					eq(ve.contestId, et.contestId)
				)
		});
		if (!existingEligibility) {
			await db.insert(voterEligibility).values({
				id: crypto.randomUUID(),
				userId: et.userId,
				pollingStationId: et.pollingStationId,
				contestGroupId: et.contestGroupId,
				contestId: et.contestId,
				isEligible: et.isEligible
			});
		}
	}
	return {
		encounteredUserIds,
		encounteredPollingStationIds,
		encounteredContestGroupIds,
		encounteredContestIds
	};
}

async function createVoterCardFromEligibility(userIds: Set<string>, contestGroupIds: Set<string>) {
	for await (const userId of userIds) {
		const eligibilities = await db.query.voterEligibility.findMany({
			where: (ve, { and, eq, inArray }) =>
				and(
					eq(ve.userId, userId),
					eq(ve.isEligible, true),
					inArray(ve.contestGroupId, Array.from(contestGroupIds))
				)
		});

		const uniqueContestGroupIds = new Set(eligibilities.map((e) => e.contestGroupId));

		for await (const contestGroupId of uniqueContestGroupIds) {
			const existingVoterCard = await db.query.voterCard.findFirst({
				where: (vc, { and, eq }) =>
					and(eq(vc.userId, userId), eq(vc.contestGroupId, contestGroupId))
			});
			if (!existingVoterCard) {
				await db.insert(voterCard).values({
					id: crypto.randomUUID(),
					userId,
					contestGroupId,
					cardStatus: 'generated',
					cardCode: crypto.randomUUID()
				});
			}
		}
	}
}
