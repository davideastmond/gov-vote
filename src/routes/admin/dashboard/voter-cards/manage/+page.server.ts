import {
	VOTER_CARD_STATUS_FILTER_VALUES,
	type VoterCardStatusFilter
} from '$lib/definitions/enums';
import { db } from '$lib/server/db';
import {
	address,
	adminContestGroup,
	contestGroup,
	user,
	userAddress,
	voterCard
} from '$lib/server/db/schema';
import { requireAdminSession } from '$lib/server/utils/require-admin-session';
import { normalizeVoterCardListRows, type VoterCardListRow } from '$lib/server/utils/voter-card';
import { and, desc, eq, ilike, or } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 12;

function isStatusFilter(value: string): value is VoterCardStatusFilter {
	return VOTER_CARD_STATUS_FILTER_VALUES.includes(value as VoterCardStatusFilter);
}

export const load: PageServerLoad = async (event) => {
	const session = await requireAdminSession(event.locals);

	const searchQuery = event.url.searchParams.get('q')?.trim() ?? '';
	const selectedStatusParam = event.url.searchParams.get('status') ?? 'all';
	const selectedStatus: VoterCardStatusFilter = isStatusFilter(selectedStatusParam)
		? selectedStatusParam
		: 'all';
	const pageParam = event.url.searchParams.get('page') ?? '1';
	const page = Math.max(1, parseInt(pageParam, 10) || 1);

	const allRows = await db
		.select({
			id: voterCard.id,
			cardNumber: voterCard.cardCode,
			status: voterCard.cardStatus,
			firstName: user.firstName,
			lastName: user.lastName,
			streetAddress: address.streetAddress,
			city: address.city,
			state: address.state,
			zipCode: address.zipCode,
			contestGroupName: contestGroup.title,
			createdAt: voterCard.createdAt
		})
		.from(voterCard)
		.innerJoin(user, eq(user.id, voterCard.userId))
		.innerJoin(contestGroup, eq(contestGroup.id, voterCard.contestGroupId))
		.leftJoin(userAddress, eq(userAddress.userId, user.id))
		.leftJoin(address, eq(address.id, userAddress.addressId))
		.leftJoin(
			adminContestGroup,
			and(
				eq(adminContestGroup.contestGroupId, contestGroup.id),
				eq(adminContestGroup.adminId, session.user.id as string)
			)
		)
		.where(
			and(
				selectedStatus !== 'all' ? eq(voterCard.cardStatus, selectedStatus) : undefined,
				searchQuery
					? or(
							ilike(user.firstName, `%${searchQuery}%`),
							ilike(user.lastName, `%${searchQuery}%`),
							ilike(address.streetAddress, `%${searchQuery}%`),
							ilike(address.city, `%${searchQuery}%`),
							ilike(address.state, `%${searchQuery}%`),
							ilike(address.zipCode, `%${searchQuery}%`),
							ilike(voterCard.cardCode, `%${searchQuery}%`),
							ilike(contestGroup.title, `%${searchQuery}%`)
						)
					: undefined,
				session.user.role === 'admin'
					? eq(adminContestGroup.adminId, session.user.id as string)
					: undefined
			)
		)
		.orderBy(desc(voterCard.createdAt));

	const allVoterCards = normalizeVoterCardListRows(allRows as VoterCardListRow[]);
	const totalCount = allVoterCards.length;
	const totalPages = Math.ceil(totalCount / PAGE_SIZE);
	const validatedPage = Math.min(page, Math.max(1, totalPages));
	const voterCards = allVoterCards.slice(
		(validatedPage - 1) * PAGE_SIZE,
		validatedPage * PAGE_SIZE
	);

	return {
		voterCards,
		searchQuery,
		selectedStatus,
		statusFilters: VOTER_CARD_STATUS_FILTER_VALUES,
		currentPage: validatedPage,
		totalPages,
		totalCount
	};
};
