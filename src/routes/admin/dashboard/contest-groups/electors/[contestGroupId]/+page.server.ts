import { db } from '$lib/server/db';
import { contest, contestItem, user, voterChoice, voterIdPhoto } from '$lib/server/db/schema';
import { requireAdminSession } from '$lib/server/utils/require-admin-session';
import { error } from '@sveltejs/kit';
import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 10;

type ElectorSummary = {
	userId: string;
	firstName: string;
	lastName: string;
	username: string;
	lastVotedAt: Date;
	contests: Array<{
		contestId: string;
		contestTitle: string;
		selections: string[];
	}>;
	voterIdPhoto: {
		id: string;
		uploadedAt: Date;
		photoProxyUrl: string;
	} | null;
};

export const load = (async ({ params, locals, url }) => {
	const { contestGroupId } = params;
	const session = await requireAdminSession(locals);
	const rawPage = Number(url.searchParams.get('page') ?? '1');
	const currentPage = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

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
		throw error(400, 'Electors are only available for closed contest groups');
	}

	const voteRows = await db
		.select({
			userId: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			username: user.username,
			contestId: contest.id,
			contestTitle: contest.title,
			contestItemTitle: contestItem.title,
			createdAt: voterChoice.createdAt
		})
		.from(voterChoice)
		.innerJoin(user, eq(user.id, voterChoice.userId))
		.innerJoin(
			contest,
			and(eq(contest.id, voterChoice.contestId), eq(contest.contestGroupId, contestGroupId))
		)
		.innerJoin(contestItem, eq(contestItem.id, voterChoice.contestItemId))
		.orderBy(asc(user.lastName), asc(user.firstName), asc(contest.title), asc(contestItem.title));

	const electorsMap = new Map<string, ElectorSummary>();

	for (const row of voteRows) {
		let elector = electorsMap.get(row.userId);
		if (!elector) {
			elector = {
				userId: row.userId,
				firstName: row.firstName,
				lastName: row.lastName,
				username: row.username,
				lastVotedAt: row.createdAt,
				contests: [],
				voterIdPhoto: null
			};
			electorsMap.set(row.userId, elector);
		}

		if (row.createdAt > elector.lastVotedAt) {
			elector.lastVotedAt = row.createdAt;
		}

		let contestSummary = elector.contests.find((entry) => entry.contestId === row.contestId);
		if (!contestSummary) {
			contestSummary = {
				contestId: row.contestId,
				contestTitle: row.contestTitle,
				selections: []
			};
			elector.contests.push(contestSummary);
		}

		contestSummary.selections.push(row.contestItemTitle);
	}

	const allElectors = Array.from(electorsMap.values());
	const userIds = allElectors.map((elector) => elector.userId);

	if (userIds.length > 0) {
		const voterIdPhotos = await db
			.select({
				id: voterIdPhoto.id,
				userId: voterIdPhoto.userId,
				uploadedAt: voterIdPhoto.updatedAt
			})
			.from(voterIdPhoto)
			.where(
				and(eq(voterIdPhoto.contestGroupId, contestGroupId), inArray(voterIdPhoto.userId, userIds))
			)
			.orderBy(desc(voterIdPhoto.updatedAt));

		const latestPhotoByUserId = new Map<string, (typeof voterIdPhotos)[number]>();
		for (const photo of voterIdPhotos) {
			if (!latestPhotoByUserId.has(photo.userId)) {
				latestPhotoByUserId.set(photo.userId, photo);
			}
		}

		for (const elector of allElectors) {
			const photo = latestPhotoByUserId.get(elector.userId);
			if (photo) {
				elector.voterIdPhoto = {
					id: photo.id,
					uploadedAt: photo.uploadedAt,
					photoProxyUrl: `/api/admin/voter-id-photo/${photo.id}`
				};
			}
		}
	}

	const totalElectors = allElectors.length;
	const totalPages = Math.max(1, Math.ceil(totalElectors / PAGE_SIZE));
	const safeCurrentPage = Math.min(currentPage, totalPages);
	const pageStart = (safeCurrentPage - 1) * PAGE_SIZE;
	const electors = allElectors.slice(pageStart, pageStart + PAGE_SIZE);

	return {
		contestGroup: {
			id: contestGroupRecord.id,
			title: contestGroupRecord.title,
			description: contestGroupRecord.description,
			status: contestGroupRecord.contestGroupStatus
		},
		electors,
		pagination: {
			pageSize: PAGE_SIZE,
			currentPage: safeCurrentPage,
			totalPages,
			totalElectors
		}
	};
}) satisfies PageServerLoad;
