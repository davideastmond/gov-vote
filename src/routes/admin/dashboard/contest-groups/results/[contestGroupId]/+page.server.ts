import type { ContestItemType, ContestStatus } from '$lib/definitions/enums';
import { db } from '$lib/server/db';
import { contest, contestItem, voterChoice } from '$lib/server/db/schema';
import { requireAdminSession } from '$lib/server/utils/require-admin-session';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

type ItemResult = {
	contestItemId: string;
	contestItemTitle: string;
	contestItemType: ContestItemType;
	voteCount: number;
	voteShare: number;
};

type ContestResult = {
	contestId: string;
	contestTitle: string;
	contestStatus: ContestStatus;
	totalVotes: number;
	items: ItemResult[];
};

export const load: PageServerLoad = async ({ params, locals }) => {
	const { contestGroupId } = params;
	const session = await requireAdminSession(locals);

	const contestGroupRecord = await db.query.contestGroup.findFirst({
		where: (row, { eq }) => eq(row.id, contestGroupId)
	});

	if (!contestGroupRecord) {
		throw error(404, 'Contest group not found');
	}

	if (session.user.role === 'admin') {
		const hasAccess = await db.query.adminContestGroup.findFirst({
			where: (row, { and, eq }) =>
				and(eq(row.contestGroupId, contestGroupId), eq(row.adminId, session.user.id as string))
		});

		if (!hasAccess) {
			throw error(403, 'Not authorized to view this contest group');
		}
	}

	if (contestGroupRecord.contestGroupStatus !== 'closed') {
		throw error(400, 'Results are only available for closed contest groups');
	}

	const voteRows = await db
		.select({
			contestId: contest.id,
			contestTitle: contest.title,
			contestStatus: contest.contestStatus,
			contestItemId: contestItem.id,
			contestItemTitle: contestItem.title,
			contestItemType: contestItem.contestItemType,
			voterChoiceId: voterChoice.id
		})
		.from(contest)
		.where(eq(contest.contestGroupId, contestGroupId))
		.innerJoin(contestItem, eq(contestItem.contestId, contest.id))
		.leftJoin(
			voterChoice,
			and(eq(voterChoice.contestItemId, contestItem.id), eq(voterChoice.contestId, contest.id))
		);

	const resultsMap = new Map<string, ContestResult>();

	for (const row of voteRows) {
		let contestResult = resultsMap.get(row.contestId);
		if (!contestResult) {
			contestResult = {
				contestId: row.contestId,
				contestTitle: row.contestTitle,
				contestStatus: row.contestStatus,
				totalVotes: 0,
				items: []
			};
			resultsMap.set(row.contestId, contestResult);
		}

		let itemResult = contestResult.items.find((item) => item.contestItemId === row.contestItemId);
		if (!itemResult) {
			itemResult = {
				contestItemId: row.contestItemId,
				contestItemTitle: row.contestItemTitle,
				contestItemType: row.contestItemType,
				voteCount: 0,
				voteShare: 0
			};
			contestResult.items.push(itemResult);
		}

		if (row.voterChoiceId) {
			itemResult.voteCount += 1;
			contestResult.totalVotes += 1;
		}
	}

	const contestResults = Array.from(resultsMap.values()).map((contestResult) => {
		const totalVotes = contestResult.totalVotes;
		const items = contestResult.items
			.map((item) => ({
				...item,
				voteShare: totalVotes > 0 ? Number(((item.voteCount / totalVotes) * 100).toFixed(1)) : 0
			}))
			.sort((a, b) => b.voteCount - a.voteCount);

		return {
			...contestResult,
			items
		};
	});

	return {
		contestGroup: {
			id: contestGroupRecord.id,
			title: contestGroupRecord.title,
			description: contestGroupRecord.description,
			status: contestGroupRecord.contestGroupStatus
		},
		contestResults,
		generatedAt: new Date().toISOString()
	};
};
