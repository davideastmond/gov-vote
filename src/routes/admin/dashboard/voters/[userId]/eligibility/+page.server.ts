import { db } from '$lib/server/db';
import {
	adminContestGroup,
	contest,
	contestGroup,
	contestGroupPollingStation,
	pollingStation,
	voterCard,
	voterEligibility
} from '$lib/server/db/schema';
import { requireAdminSession } from '$lib/server/utils/require-admin-session';
import { error, fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

type ContestGroupContestRow = {
	contestGroupId: string;
	contestGroupTitle: string;
	contestGroupDescription: string | null;
	contestGroupStatus: 'upcoming' | 'active' | 'closed';
	contestId: string;
	contestTitle: string;
	contestDescription: string | null;
	contestStatus: 'upcoming' | 'active' | 'closed';
	pollingStationId: string | null;
	pollingStationName: string | null;
};

function getString(formData: FormData, field: string) {
	return String(formData.get(field) ?? '').trim();
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const session = await requireAdminSession(locals);

	const voter = await db.query.user.findFirst({
		where: (u, { and, eq }) => and(eq(u.id, params.userId), eq(u.role, 'voter')),
		columns: {
			id: true,
			firstName: true,
			lastName: true,
			email: true
		}
	});

	if (!voter) {
		throw error(404, 'Voter not found');
	}

	let voterCardsQuery = db
		.select({
			id: voterCard.id,
			contestGroupId: voterCard.contestGroupId,
			contestGroupTitle: contestGroup.title,
			cardCode: voterCard.cardCode,
			cardStatus: voterCard.cardStatus,
			createdAt: voterCard.createdAt,
			updatedAt: voterCard.updatedAt
		})
		.from(voterCard)
		.innerJoin(contestGroup, eq(contestGroup.id, voterCard.contestGroupId))
		.where(eq(voterCard.userId, params.userId));

	if (session.user.role === 'admin') {
		(voterCardsQuery as any) = voterCardsQuery.innerJoin(
			adminContestGroup,
			eq(adminContestGroup.contestGroupId, voterCard.contestGroupId)
		);
	}

	const validVoterCards = (await voterCardsQuery).filter(
		(card) => card.cardStatus === 'active' || card.cardStatus === 'generated'
	);

	let contestGroupsQuery = db
		.select({
			contestGroupId: contestGroup.id,
			contestGroupTitle: contestGroup.title,
			contestGroupDescription: contestGroup.description,
			contestGroupStatus: contestGroup.contestGroupStatus,
			contestId: contest.id,
			contestTitle: contest.title,
			contestDescription: contest.description,
			contestStatus: contest.contestStatus,
			pollingStationId: contestGroupPollingStation.pollingStationId,
			pollingStationName: pollingStation.name
		})
		.from(contestGroup)
		.innerJoin(contest, eq(contest.contestGroupId, contestGroup.id))
		.leftJoin(
			contestGroupPollingStation,
			eq(contestGroupPollingStation.contestGroupId, contestGroup.id)
		)
		.leftJoin(pollingStation, eq(pollingStation.id, contestGroupPollingStation.pollingStationId));

	if (session.user.role === 'admin') {
		(contestGroupsQuery as any) = contestGroupsQuery
			.innerJoin(adminContestGroup, eq(adminContestGroup.contestGroupId, contestGroup.id))
			.where(eq(adminContestGroup.adminId, session.user.id as string));
	}

	const contestGroupRows = (await contestGroupsQuery) as ContestGroupContestRow[];

	const existingEligibilities = await db
		.select({
			contestGroupId: voterEligibility.contestGroupId,
			contestId: voterEligibility.contestId,
			isEligible: voterEligibility.isEligible
		})
		.from(voterEligibility)
		.where(eq(voterEligibility.userId, params.userId));

	const eligibleContestIdsByGroup = new Map<string, Set<string>>();
	for (const eligibility of existingEligibilities) {
		if (!eligibility.isEligible) continue;
		const existingSet = eligibleContestIdsByGroup.get(eligibility.contestGroupId);
		if (existingSet) {
			existingSet.add(eligibility.contestId);
			continue;
		}

		eligibleContestIdsByGroup.set(eligibility.contestGroupId, new Set([eligibility.contestId]));
	}

	const contestGroupsMap = new Map<
		string,
		{
			id: string;
			title: string;
			description: string | null;
			status: 'upcoming' | 'active' | 'closed';
			pollingStationId: string | null;
			pollingStationName: string | null;
			contests: Array<{
				id: string;
				title: string;
				description: string | null;
				status: 'upcoming' | 'active' | 'closed';
			}>;
			selectedContestIds: string[];
		}
	>();

	for (const row of contestGroupRows) {
		const existingGroup = contestGroupsMap.get(row.contestGroupId);
		if (!existingGroup) {
			const eligibleIds = Array.from(
				eligibleContestIdsByGroup.get(row.contestGroupId) ?? new Set<string>()
			);
			contestGroupsMap.set(row.contestGroupId, {
				id: row.contestGroupId,
				title: row.contestGroupTitle,
				description: row.contestGroupDescription,
				status: row.contestGroupStatus,
				pollingStationId: row.pollingStationId,
				pollingStationName: row.pollingStationName,
				contests: [
					{
						id: row.contestId,
						title: row.contestTitle,
						description: row.contestDescription,
						status: row.contestStatus
					}
				],
				selectedContestIds: eligibleIds
			});
			continue;
		}

		if (!existingGroup.pollingStationId && row.pollingStationId) {
			existingGroup.pollingStationId = row.pollingStationId;
			existingGroup.pollingStationName = row.pollingStationName;
		}

		if (!existingGroup.contests.some((contestRow) => contestRow.id === row.contestId)) {
			existingGroup.contests.push({
				id: row.contestId,
				title: row.contestTitle,
				description: row.contestDescription,
				status: row.contestStatus
			});
		}
	}

	return {
		voter,
		contestGroups: Array.from(contestGroupsMap.values()),
		validVoterCards
	};
};

export const actions: Actions = {
	updateEligibility: async ({ request, params, locals }) => {
		const session = await requireAdminSession(locals);

		const formData = await request.formData();
		const contestGroupId = getString(formData, 'contestGroupId');
		const pollingStationId = getString(formData, 'pollingStationId');
		const actionType = getString(formData, 'actionType');
		const selectedContestIds = formData
			.getAll('contestIds')
			.map((contestId) => String(contestId).trim())
			.filter(Boolean);

		if (!contestGroupId || !pollingStationId) {
			return fail(400, {
				action: 'updateEligibility',
				success: false,
				message: 'Contest group and polling station are required.'
			});
		}

		if (!['update', 'updateAndGenerateCard'].includes(actionType)) {
			return fail(400, {
				action: 'updateEligibility',
				success: false,
				message: 'Invalid action type.'
			});
		}

		const foundVoter = await db.query.user.findFirst({
			where: (u, { and, eq }) => and(eq(u.id, params.userId), eq(u.role, 'voter'))
		});

		if (!foundVoter) {
			throw error(404, 'Voter not found');
		}

		if (session.user.role === 'admin') {
			const adminAccess = await db.query.adminContestGroup.findFirst({
				where: (acg, { and, eq }) =>
					and(eq(acg.adminId, session.user.id as string), eq(acg.contestGroupId, contestGroupId))
			});

			if (!adminAccess) {
				throw error(403, 'Not authorized to manage this contest group');
			}
		}

		const contestGroupStation = await db.query.contestGroupPollingStation.findFirst({
			where: (cgps, { and, eq }) =>
				and(eq(cgps.contestGroupId, contestGroupId), eq(cgps.pollingStationId, pollingStationId))
		});

		if (!contestGroupStation) {
			return fail(400, {
				action: 'updateEligibility',
				success: false,
				message: 'Invalid polling station for this contest group.'
			});
		}

		const groupContests = await db
			.select({ id: contest.id })
			.from(contest)
			.where(eq(contest.contestGroupId, contestGroupId));

		if (!groupContests.length) {
			return fail(400, {
				action: 'updateEligibility',
				success: false,
				message: 'No contests found in selected contest group.'
			});
		}

		const selectedContestIdSet = new Set(selectedContestIds);

		// Reset all prior eligibilities for this voter in the selected contest group,
		// including contests that may no longer be part of the group.
		await db
			.update(voterEligibility)
			.set({
				isEligible: false,
				isComplete: false,
				updatedAt: new Date()
			})
			.where(
				and(
					eq(voterEligibility.userId, params.userId),
					eq(voterEligibility.contestGroupId, contestGroupId)
				)
			);

		for (const groupContest of groupContests) {
			const isEligible = selectedContestIdSet.has(groupContest.id);

			const existingEligibility = await db.query.voterEligibility.findFirst({
				where: (ve, { and, eq }) =>
					and(
						eq(ve.userId, params.userId),
						eq(ve.contestGroupId, contestGroupId),
						eq(ve.contestId, groupContest.id)
					)
			});

			if (existingEligibility) {
				await db
					.update(voterEligibility)
					.set({
						pollingStationId,
						isEligible,
						isComplete: false,
						updatedAt: new Date()
					})
					.where(eq(voterEligibility.id, existingEligibility.id));
			} else {
				await db.insert(voterEligibility).values({
					id: crypto.randomUUID(),
					userId: params.userId,
					pollingStationId,
					contestGroupId,
					contestId: groupContest.id,
					isEligible,
					isComplete: false
				});
			}
		}

		if (actionType === 'updateAndGenerateCard' && selectedContestIds.length > 0) {
			const existingVoterCard = await db.query.voterCard.findFirst({
				where: (vc, { and, eq }) =>
					and(eq(vc.userId, params.userId), eq(vc.contestGroupId, contestGroupId))
			});

			if (!existingVoterCard) {
				await db.insert(voterCard).values({
					id: crypto.randomUUID(),
					userId: params.userId,
					contestGroupId,
					cardCode: crypto.randomUUID(),
					cardStatus: 'active'
				});
			} else {
				await db
					.update(voterCard)
					.set({
						cardStatus: 'active',
						updatedAt: new Date()
					})
					.where(eq(voterCard.id, existingVoterCard.id));
			}
		}

		return {
			action: 'updateEligibility',
			success: true,
			message:
				actionType === 'updateAndGenerateCard'
					? 'Eligibilities updated and voter card processed.'
					: 'Eligibilities updated.'
		};
	}
};
