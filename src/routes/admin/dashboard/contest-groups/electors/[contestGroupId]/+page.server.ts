import { db } from '$lib/server/db';
import { contest, contestItem, user, voterChoice, voterIdPhoto } from '$lib/server/db/schema';
import { requireAdminSession } from '$lib/server/utils/require-admin-session';
import { error } from '@sveltejs/kit';
import { and, asc, countDistinct, desc, eq, inArray, max } from 'drizzle-orm';
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

	// Step 1: Count distinct voters who have submitted choices in this contest group
	const [{ totalElectors }] = await db
		.select({ totalElectors: countDistinct(voterChoice.userId) })
		.from(voterChoice)
		.innerJoin(
			contest,
			and(eq(contest.id, voterChoice.contestId), eq(contest.contestGroupId, contestGroupId))
		);

	const totalPages = Math.max(1, Math.ceil(totalElectors / PAGE_SIZE));
	const safeCurrentPage = Math.min(currentPage, totalPages);
	const offset = (safeCurrentPage - 1) * PAGE_SIZE;

	// Step 2: Fetch one page of distinct electors ordered by name, with their latest vote timestamp
	const pagedElectors = await db
		.select({
			userId: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			username: user.username,
			lastVotedAt: max(voterChoice.createdAt)
		})
		.from(voterChoice)
		.innerJoin(user, eq(user.id, voterChoice.userId))
		.innerJoin(
			contest,
			and(eq(contest.id, voterChoice.contestId), eq(contest.contestGroupId, contestGroupId))
		)
		.groupBy(user.id, user.firstName, user.lastName, user.username)
		.orderBy(asc(user.lastName), asc(user.firstName))
		.limit(PAGE_SIZE)
		.offset(offset);

	const pagedUserIds = pagedElectors.map((e) => e.userId);
	const electorsMap = new Map<string, ElectorSummary>(
		pagedElectors.map((e) => [
			e.userId,
			{
				userId: e.userId,
				firstName: e.firstName,
				lastName: e.lastName,
				username: e.username,
				// MAX(createdAt) is non-null for any user with at least one voterChoice row,
				// which is guaranteed by the JOIN condition used to build this page.
				lastVotedAt: e.lastVotedAt as Date,
				contests: [],
				voterIdPhoto: null
			}
		])
	);

	if (pagedUserIds.length > 0) {
		// Step 3: Fetch contest selections for the paged electors only
		const selectionRows = await db
			.select({
				userId: voterChoice.userId,
				contestId: contest.id,
				contestTitle: contest.title,
				contestItemTitle: contestItem.title
			})
			.from(voterChoice)
			.innerJoin(
				contest,
				and(eq(contest.id, voterChoice.contestId), eq(contest.contestGroupId, contestGroupId))
			)
			.innerJoin(contestItem, eq(contestItem.id, voterChoice.contestItemId))
			.where(inArray(voterChoice.userId, pagedUserIds))
			.orderBy(asc(contest.title), asc(contestItem.title));

		for (const row of selectionRows) {
			const elector = electorsMap.get(row.userId);
			if (!elector) continue;

			let contestSummary = elector.contests.find((entry) => entry.contestId === row.contestId);
			if (!contestSummary) {
				contestSummary = { contestId: row.contestId, contestTitle: row.contestTitle, selections: [] };
				elector.contests.push(contestSummary);
			}
			contestSummary.selections.push(row.contestItemTitle);
		}

		// Step 4: Fetch the latest voter ID photo for each paged elector
		const voterIdPhotos = await db
			.select({
				id: voterIdPhoto.id,
				userId: voterIdPhoto.userId,
				uploadedAt: voterIdPhoto.updatedAt
			})
			.from(voterIdPhoto)
			.where(
				and(eq(voterIdPhoto.contestGroupId, contestGroupId), inArray(voterIdPhoto.userId, pagedUserIds))
			)
			.orderBy(desc(voterIdPhoto.updatedAt));

		const latestPhotoByUserId = new Map<string, (typeof voterIdPhotos)[number]>();
		for (const photo of voterIdPhotos) {
			if (!latestPhotoByUserId.has(photo.userId)) {
				latestPhotoByUserId.set(photo.userId, photo);
			}
		}

		for (const elector of electorsMap.values()) {
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

	return {
		contestGroup: {
			id: contestGroupRecord.id,
			title: contestGroupRecord.title,
			description: contestGroupRecord.description,
			status: contestGroupRecord.contestGroupStatus
		},
		electors: Array.from(electorsMap.values()),
		pagination: {
			pageSize: PAGE_SIZE,
			currentPage: safeCurrentPage,
			totalPages,
			totalElectors
		}
	};
}) satisfies PageServerLoad;
